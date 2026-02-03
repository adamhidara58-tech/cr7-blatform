import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nowpayments-sig',
};

function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce((result: Record<string, unknown>, key) => {
      result[key] = obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])
        ? sortObject(obj[key] as Record<string, unknown>)
        : obj[key];
      return result;
    }, {});
}

async function createHmacSha512(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hexBytes = hexEncode(new Uint8Array(signature));
  return new TextDecoder().decode(hexBytes);
}

serve(async (req) => {
  console.log(`Webhook received: ${req.method}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    console.log(`Invalid method: ${req.method}`);
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const ipnSecret = Deno.env.get('NOWPAYMENTS_IPN_SECRET');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing');
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the signature from headers
    const signature = req.headers.get('x-nowpayments-sig');
    console.log(`Signature present: ${!!signature}`);

    // Parse request body
    let body: string;
    let payload: Record<string, unknown>;
    
    try {
      body = await req.text();
      console.log(`Raw body: ${body}`);
      payload = JSON.parse(body);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Webhook payload:', JSON.stringify(payload));

    // Verify signature if IPN secret is configured
    if (ipnSecret && signature) {
      const sortedPayload = sortObject(payload);
      const calculatedSignature = await createHmacSha512(ipnSecret, JSON.stringify(sortedPayload));

      console.log(`Expected signature: ${calculatedSignature.substring(0, 20)}...`);
      console.log(`Received signature: ${signature.substring(0, 20)}...`);

      if (calculatedSignature !== signature) {
        console.error('Invalid webhook signature - signatures do not match');
        // Return 200 to prevent NOWPayments from retrying, but log the error
        return new Response(
          JSON.stringify({ success: true, message: 'Signature validation failed but acknowledged' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Signature verified successfully');
    } else {
      console.log('No IPN secret configured or no signature provided - skipping verification');
    }

    const {
      payment_id,
      payment_status,
      order_id,
      pay_amount,
      actually_paid,
      pay_currency,
      outcome_amount,
    } = payload as {
      payment_id?: number | string;
      payment_status?: string;
      order_id?: string;
      pay_amount?: number;
      actually_paid?: number;
      pay_currency?: string;
      outcome_amount?: number;
    };

    console.log(`Processing: payment_id=${payment_id}, status=${payment_status}, order_id=${order_id}`);

    // Validate required fields
    if (!order_id) {
      console.error('Missing order_id in webhook payload');
      return new Response(
        JSON.stringify({ success: true, message: 'Missing order_id - acknowledged' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the deposit by order_id
    const { data: deposit, error: findError } = await supabase
      .from('crypto_deposits')
      .select('*')
      .eq('order_id', order_id)
      .maybeSingle();

    if (findError) {
      console.error('Database error finding deposit:', findError);
      // Return 200 to prevent retry loops
      return new Response(
        JSON.stringify({ success: true, message: 'Database error - acknowledged' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!deposit) {
      console.log(`Deposit not found for order: ${order_id}`);
      // Return 200 to prevent NOWPayments from retrying
      return new Response(
        JSON.stringify({ success: true, message: 'Deposit not found - acknowledged' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found deposit: ${deposit.id} for user ${deposit.user_id}`);

    // Check if already processed (prevent duplicate processing)
    if (deposit.payment_status === 'finished' || deposit.payment_status === 'confirmed') {
      console.log('Deposit already processed, skipping');
      return new Response(
        JSON.stringify({ success: true, message: 'Already processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update deposit status
    const updateData: Record<string, unknown> = {
      payment_status: payment_status || deposit.payment_status,
    };

    if (payment_id) {
      updateData.payment_id = payment_id.toString();
    }
    if (actually_paid || pay_amount) {
      updateData.amount_crypto = actually_paid || pay_amount;
    }
    if (payment_status === 'finished' || payment_status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    }

    console.log('Updating deposit with:', JSON.stringify(updateData));

    const { error: updateError } = await supabase
      .from('crypto_deposits')
      .update(updateData)
      .eq('id', deposit.id);

    if (updateError) {
      console.error('Error updating deposit:', updateError);
      // Return 200 to prevent retry loops
      return new Response(
        JSON.stringify({ success: true, message: 'Update error - acknowledged' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Deposit status updated successfully');

    // If payment is confirmed, credit user's balance
    if (payment_status === 'finished' || payment_status === 'confirmed') {
      const creditAmount = outcome_amount || deposit.amount_usd;
      console.log(`Crediting $${creditAmount} to user ${deposit.user_id}`);

      // Get current balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', deposit.user_id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profile) {
        const newBalance = Number(profile.balance) + Number(creditAmount);
        console.log(`Current balance: ${profile.balance}, New balance: ${newBalance}`);

        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ 
            balance: newBalance, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', deposit.user_id);

        if (balanceError) {
          console.error('Error updating balance:', balanceError);
        } else {
          console.log('Balance updated successfully');
        }
      }

      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: deposit.user_id,
          type: 'deposit',
          amount: creditAmount,
          description: `إيداع ${pay_currency?.toUpperCase() || deposit.currency} - ${order_id}`,
          status: 'completed',
        });

      if (txError) {
        console.error('Error creating transaction:', txError);
      } else {
        console.log('Transaction record created');
      }

      console.log(`Successfully credited $${creditAmount} to user ${deposit.user_id}`);
    }

    console.log('Webhook processed successfully');
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    // Always return 200 to prevent NOWPayments from retrying
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Error acknowledged',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
