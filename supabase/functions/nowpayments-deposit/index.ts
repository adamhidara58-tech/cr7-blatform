import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';
const MINIMUM_DEPOSIT_USD = 4;

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
    console.log('Token received, length:', token.length);

    // Create supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });

    // Verify user using the token
    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    
    if (authError) {
      console.log('Auth error:', authError.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authorization: ' + authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      console.log('No user found for token');
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} (${user.email}) requesting deposit`);

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { amount, currency } = body;
    console.log(`Deposit request: amount=${amount}, currency=${currency}`);

    // Validate minimum deposit
    if (!amount || amount < MINIMUM_DEPOSIT_USD) {
      console.log(`Invalid amount: ${amount}, minimum is ${MINIMUM_DEPOSIT_USD}`);
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
      console.log('Currency is missing');
      return new Response(
        JSON.stringify({ success: false, error: 'Currency is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique order ID
    const orderId = `DEP-${user.id.slice(0, 8)}-${Date.now()}`;
    console.log(`Generated order ID: ${orderId}`);

    // Create payment directly via NOWPayments
    console.log('Creating payment with NOWPayments...');
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
    console.log(`NOWPayments response status: ${paymentResponse.status}`);
    console.log(`NOWPayments response: ${paymentResponseText}`);

    if (!paymentResponse.ok) {
      console.error('NOWPayments API error:', paymentResponseText);
      throw new Error(`NOWPayments API error: ${paymentResponse.status} - ${paymentResponseText}`);
    }

    let paymentData;
    try {
      paymentData = JSON.parse(paymentResponseText);
    } catch (e) {
      console.error('Failed to parse NOWPayments response:', e);
      throw new Error('Invalid response from payment provider');
    }

    console.log('Payment created successfully:', JSON.stringify(paymentData));

    // Save deposit record to database
    const depositRecord = {
      user_id: user.id,
      invoice_id: paymentData.payment_id?.toString() || orderId,
      order_id: orderId,
      payment_id: paymentData.payment_id?.toString(),
      amount_usd: amount,
      amount_crypto: paymentData.pay_amount,
      currency: currency.toUpperCase(),
      network: paymentData.network || currency.toUpperCase(),
      wallet_address: paymentData.pay_address,
      payment_status: paymentData.payment_status || 'waiting',
      expires_at: paymentData.expiration_estimate_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    console.log('Saving deposit record:', JSON.stringify(depositRecord));

    const { error: insertError } = await supabase
      .from('crypto_deposits')
      .insert(depositRecord);

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to save deposit record: ${insertError.message}`);
    }

    console.log('Deposit record saved successfully');

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
          payAmount: paymentData.pay_amount,
          payCurrency: paymentData.pay_currency?.toUpperCase() || currency.toUpperCase(),
          network: paymentData.network,
          expiresAt: paymentData.expiration_estimate_date,
          qrCode,
        },
        message: 'يرجى إرسال المبلغ المطلوب بالإضافة إلى رسوم الشبكة لإتمام المعاملة',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Deposit error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
