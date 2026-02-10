import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Authorization required' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { amount, currency, walletAddress, network } = body;

    // Validate input
    if (!amount || !currency || !walletAddress) {
      return new Response(JSON.stringify({ success: false, error: 'جميع الحقول مطلوبة' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('balance, total_earned, last_withdrawal_at, username, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ success: false, error: 'لم يتم العثور على الملف الشخصي' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Business Logic: Cooldown check (24h)
    if (profile.last_withdrawal_at) {
      const lastWithdrawal = new Date(profile.last_withdrawal_at);
      const cooldownEnd = new Date(lastWithdrawal.getTime() + 24 * 60 * 60 * 1000);
      if (new Date() < cooldownEnd) {
        const remainingHours = Math.ceil((cooldownEnd.getTime() - Date.now()) / (1000 * 60 * 60));
        return new Response(JSON.stringify({ success: false, error: `يجب الانتظار ${remainingHours} ساعة قبل السحب التالي` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Check balance (only earned funds)
    const amountNum = parseFloat(amount);
    if (profile.total_earned < amountNum) {
      return new Response(JSON.stringify({ success: false, error: 'لا يمكنك سحب مبالغ الإيداع، يمكنك سحب الأرباح فقط' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (profile.balance < amountNum) {
      return new Response(JSON.stringify({ success: false, error: 'رصيد إجمالي غير كافٍ' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 1. Deduct balance first
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        balance: profile.balance - amountNum,
        total_earned: Math.max(0, profile.total_earned - amountNum),
        last_withdrawal_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) throw new Error('فشل في تحديث الرصيد');

    // 2. Create withdrawal record (Status: pending)
    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from('crypto_withdrawals')
      .insert({
        user_id: user.id,
        amount_usd: amountNum,
        currency: currency.toUpperCase(),
        network: network || 'TRC20',
        wallet_address: walletAddress,
        status: 'pending',
        payout_type: 'manual'
      })
      .select()
      .single();

    if (withdrawalError) {
      // Rollback balance if record creation fails
      await supabaseAdmin.from('profiles').update({ balance: profile.balance, total_earned: profile.total_earned, last_withdrawal_at: profile.last_withdrawal_at }).eq('id', user.id);
      throw new Error('فشل في تسجيل طلب السحب');
    }

    // 3. Create transaction log
    await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      type: 'withdrawal',
      amount: -amountNum,
      description: `سحب ${currency.toUpperCase()} إلى ${walletAddress.substring(0, 8)}...`,
      status: 'pending'
    });

    // 4. Send Telegram Notification
    try {
      const botToken = "8328507661:AAH7PJMpCDLbf7TsnjkhjU0jCWoE3ksSVwU";
      const chatId = "8508057441";
      const message = `🔔 *طلب سحب جديد بانتظار المراجعة*\n\n` +
        `👤 المستخدم: ${profile.username || 'غير معروف'}\n` +
        `📧 البريد: ${profile.email}\n` +
        `💰 المبلغ: $${amountNum}\n` +
        `🪙 العملة: ${currency.toUpperCase()}\n` +
        `🏦 المحفظة: \`${walletAddress}\`\n` +
        `📊 الحالة: ⏳ بانتظار الموافقة اليدوية\n\n` +
        `🔗 [لوحة التحكم](https://cr7-blatform.vercel.app/admin/withdrawals)`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
      });
    } catch (e) { console.error('TG Notify Error:', e); }

    return new Response(JSON.stringify({
      success: true,
      message: 'تم إرسال طلب السحب بنجاح وهو قيد المراجعة حالياً.',
      withdrawal
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'حدث خطأ غير متوقع' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
