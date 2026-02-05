import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    // Verify Admin JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || authHeader === 'Bearer undefined') {
      return new Response(JSON.stringify({ success: false, error: 'Authorization header is empty (Bearer JWTtoken is required)' }), { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create a client with the user's token to verify it
    const userClient = createClient(supabaseUrl, supabaseAnonKey || '', {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid Token: ' + (authError?.message || 'User not found') }), { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return new Response(JSON.stringify({ success: false, error: 'Key and Value are required' }), { status: 400, headers: corsHeaders });
    }

    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, message: 'Settings updated successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 200, // Returning 200 to handle error gracefully in frontend if needed
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
