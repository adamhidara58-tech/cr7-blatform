import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed real spin outcomes: $0.2, $0.5, $0.9, $1.0
const REAL_OUTCOMES = [0.2, 0.5, 0.9, 1.0];
const REAL_WEIGHTS = [35, 30, 20, 15]; // Weighted toward smaller amounts

// Demo outcomes (all values on the wheel)
const DEMO_OUTCOMES = [0.2, 10, 0.9, 100, 0.5, 500, 1, 1000, 0.2, 20, 0.5, 0.9];
const DEMO_WEIGHTS = [40, 5, 25, 2, 40, 1, 25, 1, 40, 5, 40, 25];

function pickWeighted(outcomes: number[], weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return outcomes[i];
  }
  return outcomes[outcomes.length - 1];
}

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
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Authorization required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const isDemo = body.demo === true;

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('balance, available_spins, total_earned')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ success: false, error: 'Profile not found' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!isDemo && profile.available_spins <= 0) {
      return new Response(JSON.stringify({ success: false, error: 'No spins available' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Pick outcome server-side
    let wonAmount: number;
    if (isDemo) {
      wonAmount = pickWeighted(DEMO_OUTCOMES, DEMO_WEIGHTS);
    } else {
      wonAmount = pickWeighted(REAL_OUTCOMES, REAL_WEIGHTS);
    }

    // For real spins: update balance and deduct spin
    if (!isDemo) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          balance: profile.balance + wonAmount,
          total_earned: profile.total_earned + wonAmount,
          available_spins: Math.max(0, profile.available_spins - 1),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return new Response(JSON.stringify({ success: false, error: 'Failed to update balance' }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Log transaction
      await supabaseAdmin.from('transactions').insert({
        user_id: user.id,
        type: 'challenge',
        amount: wonAmount,
        description: `جائزة عجلة الحظ $${wonAmount}`,
        status: 'completed',
      });
    }

    return new Response(JSON.stringify({
      success: true,
      wonAmount,
      isDemo,
      remainingSpins: isDemo ? profile.available_spins : Math.max(0, profile.available_spins - 1),
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Spin error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
