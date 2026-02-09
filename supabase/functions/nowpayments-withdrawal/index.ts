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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    if (!nowpaymentsApiKey) {
      throw new Error('NOWPAYMENTS_API_KEY not configured');
    }

    // Create service client for database operations (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify Admin JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || authHeader === 'Bearer undefined' || authHeader === 'Bearer null' || authHeader === 'Bearer') {
      console.error('Missing or invalid Authorization header:', authHeader);
      return new Response(JSON.stringify({
        success: false,
        error: 'Authorization header is missing or invalid. Please login again.'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create a client with the user's token to verify it
    const userClient = createClient(supabaseUrl, supabaseAnonKey || '', {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError?.message);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid Token: ' + (authError?.message || 'User not found') 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Check if user has admin role using service client
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error('Role check error:', roleError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Error checking admin role' 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (!roleData) {
      console.error('User is not admin:', user.id);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Access denied. Admin role required.' 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const body = await req.json();
    const { action, withdrawalId, withdrawalIds } = body;

    const logActivity = async (actionType: string, targetId: string | null, details: object) => {
      await supabaseAdmin.from('activity_logs').insert({
        admin_id: user.id,
        action: actionType,
        target_id: targetId,
        details
      });
    };

    const processPayout = async (withdrawal: any) => {
      try {
        console.log('Processing payout for withdrawal:', withdrawal.id);
        console.log('Payout details:', {
          address: withdrawal.wallet_address,
          currency: withdrawal.currency,
          amount: withdrawal.amount_crypto || withdrawal.amount_usd
        });

        const response = await fetch(`${NOWPAYMENTS_API_URL}/payout`, {
          method: 'POST',
          headers: {
            'x-api-key': nowpaymentsApiKey,
            'Authorization': `Bearer ${nowpaymentsApiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            address: withdrawal.wallet_address,
            currency: withdrawal.currency.toLowerCase(),
            amount: withdrawal.amount_crypto || withdrawal.amount_usd,
            ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`
          })
        });

        const result = await response.json();
        console.log('NOWPayments response:', result);

        if (response.ok && result.id) {
          return { success: true, data: result };
        }
        return { success: false, error: result.message || result.error || 'NOWPayments API Error' };
    } catch (error: unknown) {
      console.error('Payout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown payout error';
      return { success: false, error: errorMessage };
    }
  };

    // Action: Approve single withdrawal
    if (action === 'approve' && withdrawalId) {
      const { data: w, error: fetchError } = await supabaseAdmin
        .from('crypto_withdrawals')
        .select('*')
        .eq('id', withdrawalId)
        .single();

      if (fetchError || !w) {
        console.error('Withdrawal fetch error:', fetchError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Withdrawal not found' 
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      if (w.status !== 'pending') {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Withdrawal is not pending' 
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      const res = await processPayout(w);
      
      if (res.success) {
        await supabaseAdmin.from('crypto_withdrawals').update({ 
          status: 'completed', 
          processed_at: new Date().toISOString(),
          tx_hash: res.data.hash || null,
          withdrawal_id: res.data.id?.toString() || null
        }).eq('id', withdrawalId);
        
        await logActivity('APPROVE_WITHDRAWAL', withdrawalId, { 
          amount: w.amount_usd,
          currency: w.currency,
          wallet: w.wallet_address,
          payout_id: res.data.id
        });

        // Send Telegram Notification for approval
        try {
          const { data: settingsData } = await supabaseAdmin.from('admin_settings').select('key, value');
          const settings: any = {};
          settingsData?.forEach((s: any) => settings[s.key] = s.value);
          
          const botToken = String(settings.telegram_bot_token || '').replace(/"/g, '');
          const chatId = String(settings.telegram_chat_id || '').replace(/"/g, '');

          if (botToken && chatId && botToken !== 'null' && chatId !== 'null') {
            const message = `✅ *تمت الموافقة على السحب*\n\n` +
              `💰 المبلغ: $${w.amount_usd}\n` +
              `🪙 العملة: ${w.currency}\n` +
              `🏦 المحفظة: \`${w.wallet_address}\`\n` +
              `🔗 المعاملة: [عرض](https://tronscan.org/#/transaction/${res.data.hash || ''})`;

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
              }),
            });
          }
        } catch (tgError) {
          console.error('Telegram notification error:', tgError);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'تم الموافقة والدفع بنجاح' 
        }), { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } else {
        // Mark as error but don't complete
        await supabaseAdmin.from('crypto_withdrawals').update({ 
          status: 'error', 
          withdrawal_id: `ERROR: ${res.error}` 
        }).eq('id', withdrawalId);

        await logActivity('WITHDRAWAL_ERROR', withdrawalId, { 
          amount: w.amount_usd,
          error: res.error
        });

        return new Response(JSON.stringify({ 
          success: false, 
          error: res.error 
        }), { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    }

    // Action: Reject withdrawal
    if (action === 'reject' && withdrawalId) {
      const { data: w, error: fetchError } = await supabaseAdmin
        .from('crypto_withdrawals')
        .select('*')
        .eq('id', withdrawalId)
        .single();

      if (fetchError || !w) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Withdrawal not found' 
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      if (w.status !== 'pending' && w.status !== 'error') {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Cannot reject this withdrawal' 
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Refund balance
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('balance')
        .eq('id', w.user_id)
        .single();

      await supabaseAdmin.from('profiles').update({ 
        balance: (profile?.balance || 0) + w.amount_usd 
      }).eq('id', w.user_id);
      
      await supabaseAdmin.from('crypto_withdrawals').update({ 
        status: 'rejected', 
        processed_at: new Date().toISOString() 
      }).eq('id', withdrawalId);

      await logActivity('REJECT_WITHDRAWAL', withdrawalId, { 
        amount: w.amount_usd,
        refunded: true
      });
      
      // Send Telegram Notification for rejection
      try {
        const { data: settingsData } = await supabaseAdmin.from('admin_settings').select('key, value');
        const settings: any = {};
        settingsData?.forEach((s: any) => settings[s.key] = s.value);
        
        const botToken = String(settings.telegram_bot_token || '').replace(/"/g, '');
        const chatId = String(settings.telegram_chat_id || '').replace(/"/g, '');

        if (botToken && chatId && botToken !== 'null' && chatId !== 'null') {
          const message = `❌ *تم رفض طلب السحب*\n\n` +
            `💰 المبلغ: $${w.amount_usd}\n` +
            `🪙 العملة: ${w.currency}\n` +
            `🏦 المحفظة: \`${w.wallet_address}\`\n` +
            `تم إعادة الرصيد إلى حساب المستخدم.`;

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'Markdown',
            }),
          });
        }
      } catch (tgError) {
        console.error('Telegram notification error:', tgError);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'تم الرفض وإعادة الرصيد بنجاح' 
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Action: Retry failed withdrawal
    if (action === 'retry' && withdrawalId) {
      const { data: w } = await supabaseAdmin
        .from('crypto_withdrawals')
        .select('*')
        .eq('id', withdrawalId)
        .eq('status', 'error')
        .single();

      if (!w) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'No failed withdrawal found' 
        }), { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      const res = await processPayout(w);
      
      if (res.success) {
        await supabaseAdmin.from('crypto_withdrawals').update({ 
          status: 'completed', 
          processed_at: new Date().toISOString(),
          tx_hash: res.data.hash || null,
          withdrawal_id: res.data.id?.toString() || null
        }).eq('id', withdrawalId);
        
        await logActivity('RETRY_WITHDRAWAL_SUCCESS', withdrawalId, { amount: w.amount_usd });
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'تمت إعادة المحاولة بنجاح' 
        }), { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } else {
        await logActivity('RETRY_WITHDRAWAL_FAILED', withdrawalId, { error: res.error });
        return new Response(JSON.stringify({ 
          success: false, 
          error: res.error 
        }), { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    }

    // Action: Mass payout
    if (action === 'mass_payout' && withdrawalIds && Array.isArray(withdrawalIds)) {
      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const id of withdrawalIds) {
        const { data: w } = await supabaseAdmin
          .from('crypto_withdrawals')
          .select('*')
          .eq('id', id)
          .eq('status', 'pending')
          .single();

        if (w) {
          const res = await processPayout(w);
          
          if (res.success) {
            await supabaseAdmin.from('crypto_withdrawals').update({ 
              status: 'completed', 
              processed_at: new Date().toISOString(),
              tx_hash: res.data.hash || null,
              withdrawal_id: res.data.id?.toString() || null
            }).eq('id', id);
            
            results.push({ id, success: true });
            successCount++;
          } else {
            await supabaseAdmin.from('crypto_withdrawals').update({ 
              status: 'error', 
              withdrawal_id: `ERROR: ${res.error}` 
            }).eq('id', id);
            
            results.push({ id, success: false, error: res.error });
            failCount++;
          }
        }
      }

      await logActivity('MASS_PAYOUT', null, { 
        total: withdrawalIds.length,
        success: successCount,
        failed: failCount
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: `تم معالجة ${successCount} طلب بنجاح، ${failCount} فشل`,
        results 
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid action' 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
