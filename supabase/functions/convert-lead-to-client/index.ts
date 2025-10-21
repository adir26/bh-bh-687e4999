import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { leadId } = await req.json();

    if (!leadId) {
      throw new Error('Lead ID is required');
    }

    console.log(`Converting lead ${leadId} to client`);

    // 1. Fetch lead details
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      console.error('Lead fetch error:', leadError);
      throw new Error('Lead not found');
    }

    console.log('Lead details:', lead);

    // Check if lead already has a client_id
    if (lead.client_id) {
      console.log('Lead already has client_id:', lead.client_id);
      return new Response(
        JSON.stringify({ 
          success: true, 
          client_id: lead.client_id,
          message: 'Lead already converted'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!lead.contact_email) {
      throw new Error('Lead must have an email to convert to client');
    }

    // 2. Create auth user with admin API
    console.log('Creating auth user for:', lead.contact_email);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: lead.contact_email,
      email_confirm: true,
      user_metadata: {
        full_name: lead.name || 'ללא שם',
        phone: lead.contact_phone || '',
      }
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    const userId = authData.user.id;
    console.log('Created user with ID:', userId);

    // 3. Create profile entry
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        full_name: lead.name || 'ללא שם',
        email: lead.contact_email,
        phone: lead.contact_phone,
        user_type: 'customer',
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // If profile creation fails, we should still try to link the lead
      console.warn('Continuing despite profile error');
    }

    // 4. Update lead with client_id and status
    const { error: updateError } = await supabaseAdmin
      .from('leads')
      .update({ 
        client_id: userId,
        status: 'converted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('Lead update error:', updateError);
      throw new Error('Failed to update lead');
    }

    console.log('Successfully converted lead to client');

    return new Response(
      JSON.stringify({ 
        success: true, 
        client_id: userId,
        message: 'Lead successfully converted to client'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in convert-lead-to-client:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
