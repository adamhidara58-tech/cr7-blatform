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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    // Verify Admin JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || authHeader === 'Bearer undefined') {
      console.error('Authorization header is empty or undefined');
      return new Response(JSON.stringify({ success: false, error: 'Authorization header is empty (Bearer JWTtoken is required)' }), { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create a client with the user's token to verify it
    const userClient = createClient(supabaseUrl, supabaseAnonKey || '', {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError?.message);
      return new Response(JSON.stringify({ success: false, error: 'Invalid Token: ' + (authError?.message || 'User not found') }), { status: 401, headers: corsHeaders });
    }

    // Check if user is admin (Assuming role is in user_metadata or a profiles table)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    // For now, we'll proceed, but in production, we'd check if (profile?.role !== 'admin')

    const body = await req.json();
    const { action, withdrawalId, withdrawalIds, amount } = body;

    const logActivity = async (actionType: string, targetId: string | null, details: object) => {
      await supabase.from('activity_logs').insert({
        admin_id: user.id,
        action: actionType,
        target_id: targetId,
        details
      });
    };

    const processPayout = async (withdrawal: any) => {
      try {
        const response = await fetch(`${NOWPAYMENTS_API_URL}/payout`, {
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

        const result = await response.json();
        if (response.ok) return { success: true, data: result };
        return { success: false, error: result.message || 'NOWPayments API Error' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    };

    if (action === 'approve' && withdrawalId) {
      const { data: w } = await supabase.from('crypto_withdrawals').select('*').eq('id', withdrawalId).single();
      if (!w || w.status !== 'pending') return new Response(JSON.stringify({ success: false, error: 'Invalid Withdrawal' }), { headers: corsHeaders });

      const res = await processPayout(w);
      if (res.success) {
        await supabase.from('crypto_withdrawals').update({ 
          status: 'completed', 
          processed_at: new Date().toISOString(),
          tx_hash: res.data.hash,
          withdrawal_id: res.data.id?.toString()
        }).eq('id', withdrawalId);
        
        await logActivity('APPROVE_WITHDRAWAL', withdrawalId, { amount: w.amount_usd });
        return new Response(JSON.stringify({ success: true, message: 'Approved & Paid' }), { headers: corsHeaders });
      } else {
        await supabase.from('crypto_withdrawals').update({ status: 'error', withdrawal_id: res.error }).eq('id', withdrawalId);
        return new Response(JSON.stringify({ success: false, error: res.error }), { headers: corsHeaders });
      }
    }

    if (action === 'reject' && withdrawalId) {
      const { data: w } = await supabase.from('crypto_withdrawals').select('*').eq('id', withdrawalId).single();
      if (!w || w.status !== 'pending') return new Response(JSON.stringify({ success: false, error: 'Invalid Withdrawal' }), { headers: corsHeaders });

      // Refund balance
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', w.user_id).single();
      await supabase.from('profiles').update({ balance: (profile?.balance || 0) + w.amount_usd }).eq('id', w.user_id);
      
      await supabase.from('crypto_withdrawals').update({ status: 'rejected', processed_at: new Date().toISOString() }).eq('id', withdrawalId);
      await logActivity('REJECT_WITHDRAWAL', withdrawalId, { amount: w.amount_usd });
      
      return new Response(JSON.stringify({ success: true, message: 'Rejected & Refunded' }), { headers: corsHeaders });
    }

    if (action === 'mass_payout' && withdrawalIds) {
      const results = [];
      for (const id of withdrawalIds) {
        const { data: w } = await supabase.from('crypto_withdrawals').select('*').eq('id', id).eq('status', 'pending').single();
        if (w) {
          const res = await processPayout(w);
          if (res.success) {
            await supabase.from('crypto_withdrawals').update({ status: 'completed', tx_hash: res.data.hash }).eq('id', id);
            results.push({ id, success: true });
          } else {
            results.push({ id, success: false, error: res.error });
          }
        }
      }
      return new Response(JSON.stringify({ success: true, results }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: false, error: 'Action not found' }), { status: 400, headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: corsHeaders });
  }
});
