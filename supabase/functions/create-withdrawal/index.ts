import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    if (!nowpaymentsApiKey) {
      throw new Error('NOWPAYMENTS_API_KEY not configured');
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

    const settings: Record<string, number | boolean | string> = {};
    settingsData?.forEach((s: { key: string; value: number | boolean | string }) => {
      settings[s.key] = s.value;
    });

    const minWithdrawal = 2; // Forced minimum withdrawal to 2$ as per new rule
    const maxWithdrawal = Number(settings.max_withdrawal) || 1000;
    const autoPayoutThreshold = Number(settings.auto_payout_threshold) || 10;
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
      .select('balance, total_earned, last_withdrawal_at')
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

    // Determine payout type
    const isAutoPayout = amount <= autoPayoutThreshold;
    const payoutType = isAutoPayout ? 'auto' : 'manual';

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
        .update({ balance: profile.balance })
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

    let autoProcessed = false;
    let autoMessage = '';
    let finalWithdrawal = withdrawal;

    // If auto payout, process immediately
    if (isAutoPayout) {
      try {
        console.log('Processing auto payout for withdrawal:', withdrawal.id);
        
        const payoutResponse = await fetch(`${NOWPAYMENTS_API_URL}/payout`, {
          method: 'POST',
          headers: {
            'x-api-key': nowpaymentsApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address: walletAddress,
            currency: currency.toLowerCase(),
            amount: amount,
            ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`
          })
        });

        const payoutResult = await payoutResponse.json();
        console.log('NOWPayments payout response:', payoutResult);

        if (payoutResponse.ok && payoutResult.id) {
          autoProcessed = true;
          autoMessage = 'تم إرسال السحب تلقائياً بنجاح! 🎉';
          
          // Update withdrawal as completed
          const { data: updatedWithdrawal } = await supabaseAdmin
            .from('crypto_withdrawals')
            .update({
              status: 'completed',
              processed_at: new Date().toISOString(),
              withdrawal_id: payoutResult.id?.toString(),
              tx_hash: payoutResult.hash || null
            })
            .eq('id', withdrawal.id)
            .select()
            .single();

          if (updatedWithdrawal) finalWithdrawal = updatedWithdrawal;

          // Update transaction
          await supabaseAdmin
            .from('transactions')
            .update({ status: 'completed' })
            .eq('user_id', user.id)
            .eq('type', 'withdrawal')
            .eq('status', 'pending');

          // Log activity
          await supabaseAdmin.from('activity_logs').insert({
            action: 'AUTO_WITHDRAWAL_SUCCESS',
            target_id: withdrawal.id,
            details: { amount, currency, payout_id: payoutResult.id }
          });
        } else {
          const errorMsg = payoutResult.message || payoutResult.error || 'Unknown error';
          autoMessage = 'تم إنشاء الطلب، لكن فشل الدفع التلقائي. سيتم المراجعة يدوياً.';
          
          await supabaseAdmin
            .from('crypto_withdrawals')
            .update({
              status: 'error',
              withdrawal_id: `AUTO_ERROR: ${errorMsg}`
            })
            .eq('id', withdrawal.id);

          await supabaseAdmin.from('activity_logs').insert({
            action: 'AUTO_WITHDRAWAL_FAILED',
            target_id: withdrawal.id,
            details: { amount, currency, error: errorMsg }
          });
        }
      } catch (payoutError: unknown) {
        console.error('Auto payout error:', payoutError);
        const errorMessage = payoutError instanceof Error ? payoutError.message : 'Unknown error';
        autoMessage = 'تم إنشاء الطلب، سيتم المراجعة يدوياً.';
        
        await supabaseAdmin
          .from('crypto_withdrawals')
          .update({
            status: 'error',
            withdrawal_id: `AUTO_FAILED: ${errorMessage}`
          })
          .eq('id', withdrawal.id);
      }
    }

    // Send Telegram Notification
    try {
      const botToken = String(settings.telegram_bot_token || '').replace(/"/g, '').trim();
      const chatId = String(settings.telegram_chat_id || '').replace(/"/g, '').trim();

      console.log('Telegram Config Check:', { 
        hasToken: !!botToken, 
        tokenLength: botToken.length,
        hasChatId: !!chatId,
        chatIdValue: chatId
      });

      if (botToken && chatId && botToken !== 'null' && chatId !== 'null') {
        const siteUrl = Deno.env.get('SITE_URL') || 'https://cr7-blatform.vercel.app';
        const statusEmoji = autoProcessed ? '⚡ (تلقائي)' : '⏳ (يدوي)';
        
        const message = `🔔 *طلب سحب جديد ${statusEmoji}*\n\n` +
          `👤 المستخدم: ${user.email}\n` +
          `💰 المبلغ: $${amount}\n` +
          `🪙 العملة: ${currency.toUpperCase()}\n` +
          `🌐 الشبكة: ${network || 'TRC20'}\n` +
          `🏦 المحفظة: \`${walletAddress}\`\n` +
          `📊 الحالة: ${autoProcessed ? '✅ تم الدفع تلقائياً' : '⏳ بانتظار الموافقة'}\n\n` +
          `🔗 [إدارة السحوبات في لوحة التحكم](${siteUrl}/admin/withdrawals)`;

        console.log(`Sending Telegram notification to ${chatId}...`);
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
          }),
        });
        
        if (!tgRes.ok) {
          const errorText = await tgRes.text();
          console.error('Telegram API error:', errorText);
        } else {
          console.log('Telegram notification sent successfully');
        }
      } else {
        console.log('Telegram configuration missing or invalid');
      }
    } catch (tgError) {
      console.error('Telegram notification error:', tgError);
    }

    return new Response(JSON.stringify({
      success: true,
      auto_processed: autoProcessed,
      message: autoProcessed ? autoMessage : 'تم إنشاء طلب السحب بنجاح. يتطلب موافقة المسؤول.',
      withdrawal: finalWithdrawal
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});