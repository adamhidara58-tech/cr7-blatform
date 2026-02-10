import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
      return new Response(JSON.stringify({
        success: false,
        error: 'Authorization required'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid token'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { amount, currency, walletAddress, network } = body;

    // Validate input
    if (!amount || !currency || !walletAddress) {
      return new Response(JSON.stringify({
        success: false,
        error: 'المبلغ والعملة وعنوان المحفظة مطلوبة'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate wallet address
    if (walletAddress.length < 20 || walletAddress.length > 100) {
      return new Response(JSON.stringify({
        success: false,
        error: 'عنوان المحفظة غير صحيح'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get settings
    const { data: settingsData } = await supabaseAdmin
      .from('admin_settings')
      .select('key, value');

    const settings: Record<string, any> = {};
    settingsData?.forEach((s: { key: string; value: any }) => {
      settings[s.key] = s.value;
    });

    const minWithdrawal = 2; 
    const maxWithdrawal = Number(settings.max_withdrawal) || 1000;
    const cooldownHours = Number(settings.withdrawal_cooldown_hours) || 24;
    const withdrawalsEnabled = settings.withdrawals_enabled !== false && settings.withdrawals_enabled !== 'false';

    if (!withdrawalsEnabled) {
      return new Response(JSON.stringify({
        success: false,
        error: 'السحب معطل حالياً'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (amount < minWithdrawal) {
      return new Response(JSON.stringify({
        success: false,
        error: `الحد الأدنى للسحب هو $${minWithdrawal}`
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (amount > maxWithdrawal) {
      return new Response(JSON.stringify({
        success: false,
        error: `الحد الأقصى للسحب هو $${maxWithdrawal}`
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('balance, total_earned, last_withdrawal_at, username, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({
        success: false,
        error: 'لم يتم العثور على الملف الشخصي'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check balance and earnings
    const withdrawableBalance = Number(profile.total_earned || 0);
    if (withdrawableBalance < amount) {
      return new Response(JSON.stringify({
        success: false,
        error: 'لا يمكنك سحب مبالغ الإيداع، يمكنك سحب الأرباح فقط'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (Number(profile.balance) < amount) {
      return new Response(JSON.stringify({
        success: false,
        error: 'رصيد إجمالي غير كافٍ'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check cooldown
    if (profile.last_withdrawal_at) {
      const lastWithdrawal = new Date(profile.last_withdrawal_at);
      const cooldownEnd = new Date(lastWithdrawal.getTime() + cooldownHours * 60 * 60 * 1000);
      
      if (new Date() < cooldownEnd) {
        const remainingHours = Math.ceil((cooldownEnd.getTime() - Date.now()) / (1000 * 60 * 60));
        return new Response(JSON.stringify({
          success: false,
          error: `يجب الانتظار ${remainingHours} ساعة قبل السحب التالي`
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Check for pending withdrawals
    const { data: pendingWithdrawals } = await supabaseAdmin
      .from('crypto_withdrawals')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing']);

    if (pendingWithdrawals && pendingWithdrawals.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'لديك طلب سحب معلق بالفعل'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // All withdrawals are manual now as per user request
    const payoutType = 'manual';

    // Deduct balance and total_earned
    const newBalance = Number(profile.balance) - amount;
    const newTotalEarned = Number(profile.total_earned) - amount;
    const { error: balanceError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        balance: newBalance,
        total_earned: Math.max(0, newTotalEarned),
        last_withdrawal_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (balanceError) {
      console.error('Balance deduction error:', balanceError);
      return new Response(JSON.stringify({
        success: false,
        error: 'فشل في خصم الرصيد'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Create withdrawal record
    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from('crypto_withdrawals')
      .insert({
        user_id: user.id,
        amount_usd: amount,
        currency: currency.toUpperCase(),
        network: network || 'TRC20',
        wallet_address: walletAddress,
        status: 'pending',
        payout_type: payoutType
      })
      .select()
      .single();

    if (withdrawalError) {
      // Refund balance on error
      await supabaseAdmin
        .from('profiles')
        .update({ 
          balance: profile.balance,
          total_earned: profile.total_earned,
          last_withdrawal_at: profile.last_withdrawal_at
        })
        .eq('id', user.id);

      console.error('Withdrawal creation error:', withdrawalError);
      return new Response(JSON.stringify({
        success: false,
        error: 'فشل في إنشاء طلب السحب'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Create transaction record
    await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      type: 'withdrawal',
      amount: -amount,
      description: `سحب ${currency.toUpperCase()} إلى ${walletAddress.substring(0, 10)}...`,
      status: 'pending'
    });

    // Send Telegram Notification
    try {
      const botToken = "8328507661:AAH7PJMpCDLbf7TsnjkhjU0jCWoE3ksSVwU";
      const chatId = "8508057441";
      
      const message = `🔔 *طلب سحب جديد بانتظار المراجعة*\n\n` +
        `👤 المستخدم: ${profile.username || 'غير معروف'}\n` +
        `📧 البريد: ${profile.email}\n` +
        `💰 المبلغ: $${amount}\n` +
        `🪙 العملة: ${currency.toUpperCase()}\n` +
        `🌐 الشبكة: ${network || 'TRC20'}\n` +
        `🏦 المحفظة: \`${walletAddress}\`\n` +
        `📊 الحالة: ⏳ بانتظار الموافقة اليدوية\n\n` +
        `🔗 [لوحة التحكم](https://cr7-blatform.vercel.app/admin/withdrawals)`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    } catch (tgErr) {
      console.error('Telegram notification error:', tgErr);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'تم إرسال طلب السحب بنجاح وهو قيد المراجعة حالياً.',
      withdrawal: withdrawal,
      auto_processed: false
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'حدث خطأ غير متوقع'
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
