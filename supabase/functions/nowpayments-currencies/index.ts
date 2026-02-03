import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Only the currencies the user has connected their wallet to
const SUPPORTED_CURRENCIES = [
  {
    currency: 'usdttrc20',
    name: 'Tether',
    network: 'TRC20',
    minAmount: 1,
    isPopular: true,
  },
  {
    currency: 'bnbbsc',
    name: 'BNB',
    network: 'BEP20 (BSC)',
    minAmount: 0.001,
    isPopular: true,
  },
  {
    currency: 'usdtbsc',
    name: 'Tether',
    network: 'BEP20 (BSC)',
    minAmount: 1,
    isPopular: true,
  },
  {
    currency: 'btc',
    name: 'Bitcoin',
    network: 'Bitcoin',
    minAmount: 0.0001,
    isPopular: true,
  },
  {
    currency: 'usdtmatic',
    name: 'Tether',
    network: 'Polygon',
    minAmount: 1,
    isPopular: true,
  },
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Return the hardcoded list of supported currencies
    console.log('Returning supported currencies:', SUPPORTED_CURRENCIES.length);
    
    return new Response(
      JSON.stringify({
        success: true,
        currencies: SUPPORTED_CURRENCIES,
        minimumDepositUsd: 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
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
