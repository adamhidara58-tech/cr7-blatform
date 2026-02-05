import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header for logging
    const authHeader = req.headers.get('Authorization');
    let adminUserId: string | null = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      adminUserId = user?.id || null;
    }

    const body = await req.json();
    const { action, withdrawalId, withdrawalIds } = body;

    // Helper: Log activity
    const logActivity = async (actionType: string, targetId: string | null, details: object) => {
      await supabase.from('activity_logs').insert({
        admin_id: adminUserId,
        action: actionType,
        target_id: targetId,
        details
      });
    };

    // Helper: Process single payout via NOWPayments
    const processPayout = async (withdrawal: any): Promise<{ success: boolean; error?: string; data?: any }> => {
      try {
        console.log(`Processing payout for withdrawal ${withdrawal.id}: $${withdrawal.amount_usd} to ${withdrawal.wallet_address}`);

        const payoutResponse = await fetch(`${NOWPAYMENTS_API_URL}/payout`, {
          method: 'POST',
          headers: {
            'x-api-key': nowpaymentsApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address: withdrawal.wallet_address,
            currency: withdrawal.currency.toLowerCase(),
            amount: withdrawal.amount_crypto || withdrawal.amount_usd,
            ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`
          })
        });

        const payoutResult = await payoutResponse.json();
        console.log('NOWPayments payout response:', payoutResult);

        if (payoutResponse.ok && payoutResult.id) {
          return { success: true, data: payoutResult };
        } else {
          return { 
            success: false, 
            error: payoutResult.message || payoutResult.error || 'Unknown API error' 
          };
        }
      } catch (error) {
        console.error('Payout API error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'API connection failed' };
      }
    };

    // ACTION: approve - Approve single withdrawal
    if (action === 'approve' && withdrawalId) {
      const { data: withdrawal, error: fetchError } = await supabase
        .from('crypto_withdrawals')
        .select('*')
        .eq('id', withdrawalId)
        .single();

      if (fetchError || !withdrawal) {
        return new Response(
          JSON.stringify({ success: false, error: 'Withdrawal not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (withdrawal.status !== 'pending') {
        return new Response(
          JSON.stringify({ success: false, error: 'Withdrawal is already processed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await processPayout(withdrawal);

      if (result.success) {
        await supabase
          .from('crypto_withdrawals')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            withdrawal_id: result.data.id?.toString() || null,
            tx_hash: result.data.hash || null
          })
          .eq('id', withdrawalId);

        await supabase
          .from('transactions')
          .update({ status: 'completed' })
          .eq('user_id', withdrawal.user_id)
          .eq('type', 'withdrawal')
          .eq('status', 'pending');

        await logActivity('WITHDRAWAL_APPROVED', withdrawalId, { 
          amount: withdrawal.amount_usd,
          payout_id: result.data.id 
        });

        return new Response(
          JSON.stringify({ success: true, message: 'تمت الموافقة وإرسال الدفع بنجاح', data: result.data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        await supabase
          .from('crypto_withdrawals')
          .update({
            status: 'error',
            processed_at: new Date().toISOString(),
            withdrawal_id: `ERROR: ${result.error}`
          })
          .eq('id', withdrawalId);

        await logActivity('WITHDRAWAL_ERROR', withdrawalId, { 
          amount: withdrawal.amount_usd,
          error: result.error 
        });

        return new Response(
          JSON.stringify({ success: false, error: result.error }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ACTION: reject - Reject withdrawal and refund
    if (action === 'reject' && withdrawalId) {
      const { data: withdrawal, error: fetchError } = await supabase
        .from('crypto_withdrawals')
        .select('*, profiles(balance)')
        .eq('id', withdrawalId)
        .single();

      if (fetchError || !withdrawal) {
        return new Response(
          JSON.stringify({ success: false, error: 'Withdrawal not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (withdrawal.status !== 'pending') {
        return new Response(
          JSON.stringify({ success: false, error: 'Withdrawal is already processed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update withdrawal status
      await supabase
        .from('crypto_withdrawals')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawalId);

      // Refund user balance
      const currentBalance = Number(withdrawal.profiles?.balance || 0);
      const newBalance = currentBalance + Number(withdrawal.amount_usd);

      await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', withdrawal.user_id);

      // Create refund transaction
      await supabase.from('transactions').insert({
        user_id: withdrawal.user_id,
        type: 'deposit',
        amount: withdrawal.amount_usd,
        description: 'استرداد مبلغ سحب مرفوض',
        status: 'completed'
      });

      await logActivity('WITHDRAWAL_REJECTED', withdrawalId, { 
        amount: withdrawal.amount_usd,
        refunded: true 
      });

      return new Response(
        JSON.stringify({ success: true, message: 'تم رفض الطلب واسترداد الرصيد' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: retry - Retry failed withdrawal
    if (action === 'retry' && withdrawalId) {
      const { data: withdrawal, error: fetchError } = await supabase
        .from('crypto_withdrawals')
        .select('*')
        .eq('id', withdrawalId)
        .single();

      if (fetchError || !withdrawal) {
        return new Response(
          JSON.stringify({ success: false, error: 'Withdrawal not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (withdrawal.status !== 'error') {
        return new Response(
          JSON.stringify({ success: false, error: 'Only failed withdrawals can be retried' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Reset to pending and try again
      await supabase
        .from('crypto_withdrawals')
        .update({
          status: 'pending',
          withdrawal_id: null
        })
        .eq('id', withdrawalId);

      const result = await processPayout(withdrawal);

      if (result.success) {
        await supabase
          .from('crypto_withdrawals')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            withdrawal_id: result.data.id?.toString() || null,
            tx_hash: result.data.hash || null
          })
          .eq('id', withdrawalId);

        await logActivity('WITHDRAWAL_RETRY_SUCCESS', withdrawalId, { 
          amount: withdrawal.amount_usd 
        });

        return new Response(
          JSON.stringify({ success: true, message: 'تمت إعادة المحاولة بنجاح' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        await supabase
          .from('crypto_withdrawals')
          .update({
            status: 'error',
            withdrawal_id: `ERROR: ${result.error}`
          })
          .eq('id', withdrawalId);

        await logActivity('WITHDRAWAL_RETRY_FAILED', withdrawalId, { 
          error: result.error 
        });

        return new Response(
          JSON.stringify({ success: false, error: result.error }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ACTION: mass_payout - Process multiple withdrawals
    if (action === 'mass_payout' && withdrawalIds && Array.isArray(withdrawalIds)) {
      const results: { id: string; success: boolean; error?: string }[] = [];

      for (const id of withdrawalIds) {
        const { data: withdrawal, error: fetchError } = await supabase
          .from('crypto_withdrawals')
          .select('*')
          .eq('id', id)
          .eq('status', 'pending')
          .single();

        if (fetchError || !withdrawal) {
          results.push({ id, success: false, error: 'Not found or not pending' });
          continue;
        }

        const result = await processPayout(withdrawal);

        if (result.success) {
          await supabase
            .from('crypto_withdrawals')
            .update({
              status: 'completed',
              processed_at: new Date().toISOString(),
              withdrawal_id: result.data.id?.toString() || null,
              tx_hash: result.data.hash || null
            })
            .eq('id', id);

          await supabase
            .from('transactions')
            .update({ status: 'completed' })
            .eq('user_id', withdrawal.user_id)
            .eq('type', 'withdrawal')
            .eq('status', 'pending');

          results.push({ id, success: true });
        } else {
          await supabase
            .from('crypto_withdrawals')
            .update({
              status: 'error',
              processed_at: new Date().toISOString(),
              withdrawal_id: `ERROR: ${result.error}`
            })
            .eq('id', id);

          results.push({ id, success: false, error: result.error });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      await logActivity('MASS_PAYOUT', null, { 
        total: withdrawalIds.length,
        success: successCount,
        failed: failCount 
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `تمت معالجة ${successCount} من ${withdrawalIds.length} طلبات`,
          results 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
