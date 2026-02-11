import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';
const MINIMUM_DEPOSIT_USD = 0;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!apiKey) {
      console.error('NOWPAYMENTS_API_KEY is not configured');
      throw new Error('NOWPAYMENTS_API_KEY is not configured');
    }
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error('Supabase configuration missing');
      throw new Error('Supabase configuration missing');
    }

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- EXACT MATCH LOGIC ---
    // Use the exact amount provided by the user
    const amount = parseFloat(body.amount);
    const currency = body.currency;

    if (isNaN(amount) || amount < MINIMUM_DEPOSIT_USD) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `الحد الأدنى للإيداع هو $${MINIMUM_DEPOSIT_USD}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!currency) {
      return new Response(
        JSON.stringify({ success: false, error: 'Currency is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderId = `DEP-${user.id.slice(0, 8)}-${Date.now()}`;

    // Create payment via NOWPayments
    const paymentResponse = await fetch(`${NOWPAYMENTS_API_URL}/payment`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: currency.toLowerCase(),
        order_id: orderId,
        order_description: `Deposit $${amount} to CR7 Platform`,
        ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`,
      }),
    });

    const paymentResponseText = await paymentResponse.text();
    if (!paymentResponse.ok) {
      throw new Error(`NOWPayments API error: ${paymentResponse.status}`);
    }

    let paymentData = JSON.parse(paymentResponseText);

    // Use the pay_amount returned by NOWPayments as the source of truth
    // This ensures the user sees exactly what the gateway expects
    const payAmount = paymentData.pay_amount;

    // Save deposit record
    const depositRecord = {
      user_id: user.id,
      invoice_id: paymentData.payment_id?.toString() || orderId,
      order_id: orderId,
      payment_id: paymentData.payment_id?.toString(),
      amount_usd: amount,
      amount_crypto: payAmount,
      currency: currency.toUpperCase(),
      network: paymentData.network || currency.toUpperCase(),
      wallet_address: paymentData.pay_address,
      payment_status: paymentData.payment_status || 'waiting',
      expires_at: paymentData.expiration_estimate_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const { error: insertError } = await supabase
      .from('crypto_deposits')
      .insert(depositRecord);

    if (insertError) {
      throw new Error(`Failed to save deposit record: ${insertError.message}`);
    }

    const qrCode = paymentData.pay_address 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentData.pay_address)}`
      : null;

    return new Response(
      JSON.stringify({
        success: true,
        deposit: {
          orderId,
          invoiceId: paymentData.payment_id,
          invoiceUrl: paymentData.invoice_url || null,
          payAddress: paymentData.pay_address,
          payAmount: payAmount, // Return the exact amount from gateway
          payCurrency: paymentData.pay_currency?.toUpperCase() || currency.toUpperCase(),
          network: paymentData.network,
          expiresAt: paymentData.expiration_estimate_date,
          qrCode,
        },
        message: 'يرجى إرسال المبلغ المطلوب كاملاً لإتمام المعاملة',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Deposit error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
