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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { amount, currency, walletAddress, network } = await req.json();

    // Validation
    if (!amount || !currency || !walletAddress) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ success: false, error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get withdrawal limits
    const { data: limitsData } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'withdrawal_limits')
      .single();

    const limits = limitsData?.value as { min?: number; max?: number } || { min: 10, max: 1000 };
    const minAmount = Number(limits.min || 10);
    const maxAmount = Number(limits.max || 1000);

    // Validate amount
    if (amount < minAmount) {
      return new Response(
        JSON.stringify({ success: false, error: `الحد الأدنى للسحب هو $${minAmount}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (amount > maxAmount) {
      return new Response(
        JSON.stringify({ success: false, error: `الحد الأقصى للسحب هو $${maxAmount}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check balance
    if (Number(profile.balance) < amount) {
      return new Response(
        JSON.stringify({ success: false, error: 'رصيدك غير كافٍ' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check 24-hour withdrawal limit
    if (profile.last_withdrawal_at) {
      const lastWithdrawal = new Date(profile.last_withdrawal_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastWithdrawal.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        const remaining = 24 - hoursDiff;
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `يجب الانتظار ${Math.ceil(remaining)} ساعة قبل السحب مرة أخرى` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate wallet address (basic validation)
    if (walletAddress.length < 20 || walletAddress.length > 100) {
      return new Response(
        JSON.stringify({ success: false, error: 'عنوان المحفظة غير صحيح' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auto payout threshold
    const { data: thresholdData } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'auto_payout_threshold')
      .single();

    const autoPayoutThreshold = Number((thresholdData?.value as any)?.amount || 10);
    const isAutoPayout = amount <= autoPayoutThreshold;

    // Deduct from user balance
    const newBalance = Number(profile.balance) - amount;
    await supabase
      .from('profiles')
      .update({ 
        balance: newBalance,
        last_withdrawal_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Create withdrawal record
    const { data: withdrawal, error: insertError } = await supabase
      .from('crypto_withdrawals')
      .insert({
        user_id: user.id,
        amount_usd: amount,
        currency: currency.toUpperCase(),
        network: network || 'TRC20',
        wallet_address: walletAddress,
        status: 'pending',
        payout_type: isAutoPayout ? 'auto' : 'manual'
      })
      .select()
      .single();

    if (insertError) {
      // Refund balance on error
      await supabase
        .from('profiles')
        .update({ balance: profile.balance })
        .eq('id', user.id);

      throw insertError;
    }

    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'withdrawal',
      amount: -amount,
      description: `سحب ${currency.toUpperCase()} إلى ${walletAddress.substring(0, 10)}...`,
      status: 'pending'
    });

    // Process auto payout if applicable
    if (isAutoPayout && nowpaymentsApiKey) {
      console.log(`Auto payout triggered for withdrawal ${withdrawal.id}: $${amount}`);

      try {
        const payoutResponse = await fetch(`${NOWPAYMENTS_API_URL}/payout`, {
          method: 'POST',
          headers: {
            'x-api-key': nowpaymentsApiKey,
            'Authorization': `Bearer ${nowpaymentsApiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            address: walletAddress,
            currency: currency.toLowerCase(),
            amount: amount,
            ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`
          })
        });

        const payoutResult = await payoutResponse.json();
        console.log('Auto payout result:', payoutResult);

        if (payoutResponse.ok && payoutResult.id) {
          // Update withdrawal as completed
          await supabase
            .from('crypto_withdrawals')
            .update({
              status: 'completed',
              processed_at: new Date().toISOString(),
              withdrawal_id: payoutResult.id?.toString() || null,
              tx_hash: payoutResult.hash || null
            })
            .eq('id', withdrawal.id);

          await supabase
            .from('transactions')
            .update({ status: 'completed' })
            .eq('user_id', user.id)
            .eq('type', 'withdrawal')
            .eq('status', 'pending');

          // Log auto payout
          await supabase.from('activity_logs').insert({
            admin_id: null,
            action: 'AUTO_PAYOUT_SUCCESS',
            target_id: withdrawal.id,
            details: { amount, payout_id: payoutResult.id }
          });

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'تم إرسال طلب السحب ومعالجته تلقائياً',
              withdrawal: { ...withdrawal, status: 'completed' },
              auto_processed: true
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Auto payout failed, keep as pending for manual review
          const errorMsg = payoutResult.message || payoutResult.error || 'Auto payout failed';
          
          await supabase
            .from('crypto_withdrawals')
            .update({
              payout_type: 'manual',
              withdrawal_id: `AUTO_FAILED: ${errorMsg}`
            })
            .eq('id', withdrawal.id);

          await supabase.from('activity_logs').insert({
            admin_id: null,
            action: 'AUTO_PAYOUT_FAILED',
            target_id: withdrawal.id,
            details: { amount, error: errorMsg }
          });

          console.error('Auto payout failed:', errorMsg);
        }
      } catch (autoError) {
        console.error('Auto payout error:', autoError);
        
        // Mark as manual for admin review
        await supabase
          .from('crypto_withdrawals')
          .update({
            payout_type: 'manual',
            withdrawal_id: `AUTO_ERROR: ${autoError instanceof Error ? autoError.message : 'Unknown error'}`
          })
          .eq('id', withdrawal.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: isAutoPayout 
          ? 'تم إرسال طلب السحب للمعالجة التلقائية' 
          : 'تم إرسال طلب السحب للمراجعة',
        withdrawal,
        auto_processed: false
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create withdrawal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء طلب السحب'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
