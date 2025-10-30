import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FacebookLeadPayload {
  full_name?: string;
  email?: string;
  phone?: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_name?: string;
  ad_name?: string;
  form_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Extract supplier_id from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const supplierIdIndex = pathParts.indexOf('facebook-webhook') + 1;
    const supplierId = pathParts[supplierIdIndex];

    // Get token from query params
    const token = url.searchParams.get('token');

    if (!supplierId || !token) {
      console.error('Missing supplier_id or token');
      return new Response(
        JSON.stringify({ error: 'Invalid webhook URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate token against database
    const { data: webhookData, error: webhookError } = await supabase
      .from('supplier_webhooks')
      .select('id, supplier_id, is_active')
      .eq('supplier_id', supplierId)
      .eq('secret_token', token)
      .single();

    if (webhookError || !webhookData) {
      console.error('Invalid token or webhook not found:', webhookError);
      
      // Log failed attempt
      await supabase.from('webhook_logs').insert({
        supplier_id: supplierId,
        request_ip: req.headers.get('x-forwarded-for') || 'unknown',
        request_payload: {},
        response_status: 403,
        response_message: 'Unauthorized',
        error_message: 'Invalid token'
      });

      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!webhookData.is_active) {
      console.error('Webhook is inactive');
      return new Response(
        JSON.stringify({ error: 'Webhook is inactive' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const payload: FacebookLeadPayload = await req.json();
    console.log('Received Facebook lead:', payload);

    // Insert lead into database
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert({
        supplier_id: supplierId,
        source: 'facebook',
        name: payload.full_name || 'Unknown',
        contact_email: payload.email,
        contact_phone: payload.phone,
        status: 'new',
        priority: 'high',
        metadata: {
          campaign_id: payload.campaign_id,
          campaign_name: payload.campaign_name,
          adset_name: payload.adset_name,
          ad_name: payload.ad_name,
          form_id: payload.form_id,
          source: 'facebook_lead_ads'
        }
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error inserting lead:', leadError);
      
      // Log error
      await supabase.from('webhook_logs').insert({
        supplier_id: supplierId,
        webhook_id: webhookData.id,
        request_ip: req.headers.get('x-forwarded-for') || 'unknown',
        request_payload: payload,
        response_status: 500,
        response_message: 'Error',
        error_message: leadError.message
      });

      return new Response(
        JSON.stringify({ error: 'Failed to create lead', details: leadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update webhook last_used_at
    await supabase
      .from('supplier_webhooks')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', webhookData.id);

    // Log successful request
    await supabase.from('webhook_logs').insert({
      supplier_id: supplierId,
      webhook_id: webhookData.id,
      request_ip: req.headers.get('x-forwarded-for') || 'unknown',
      request_payload: payload,
      response_status: 200,
      response_message: 'Success'
    });

    console.log('Lead created successfully:', leadData);

    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Lead created successfully',
        lead_id: leadData.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
