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
      console.log('Authorization header missing');
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Create supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });

    // Verify user using the token
    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- FIXED AMOUNT LOGIC ---
    // Ensure amount is a fixed number with 2 decimals
    const rawAmount = parseFloat(body.amount);
    const amount = parseFloat(rawAmount.toFixed(2));
    const currency = body.currency;

    // Validate minimum deposit
    if (!amount || amount < MINIMUM_DEPOSIT_USD) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `الحد الأدنى للإيداع هو $${MINIMUM_DEPOSIT_USD}`,
          minimumDeposit: MINIMUM_DEPOSIT_USD 
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

    // Generate unique order ID
    const orderId = `DEP-${user.id.slice(0, 8)}-${Date.now()}`;

    // Create payment directly via NOWPayments
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
        order_description: `Deposit $${amount.toFixed(2)} to CR7 Platform`,
        ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`,
      }),
    });

    const paymentResponseText = await paymentResponse.text();

    if (!paymentResponse.ok) {
      throw new Error(`NOWPayments API error: ${paymentResponse.status}`);
    }

    let paymentData = JSON.parse(paymentResponseText);

    // Ensure pay_amount is also fixed to 2 decimals if it's USDT/Stablecoin
    // For other cryptos, we keep the precision but for display we will handle it in frontend
    let payAmount = paymentData.pay_amount;
    if (currency.toLowerCase().includes('usdt') || currency.toLowerCase().includes('usdc')) {
      payAmount = parseFloat(parseFloat(payAmount).toFixed(2));
    }

    // Save deposit record to database
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

    // Generate QR code URL
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
          payAmount: payAmount,
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
