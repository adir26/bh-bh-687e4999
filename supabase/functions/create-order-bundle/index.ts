import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrderBundlePayload {
  supplier_id: string;
  lead: {
    mode: 'select' | 'create';
    lead_id?: string;
    new?: {
      full_name: string;
      email?: string | null;
      phone?: string | null;
    };
  };
  project: {
    mode: 'select' | 'create';
    project_id?: string;
    new?: {
      title: string;
      address: {
        street?: string;
        city?: string;
        zip?: string;
        notes?: string;
      };
    };
  };
  order: {
    title: string;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    address: {
      street?: string;
      city?: string;
      zip?: string;
      notes?: string;
    };
    items: Array<{
      product_id?: string | null;
      name: string;
      description?: string | null;
      qty: number;
      unit_price: number;
    }>;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create authenticated client (for most operations)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Create admin client (for creating profiles, bypassing RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[create-order-bundle] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: CreateOrderBundlePayload = await req.json();
    console.log('[create-order-bundle] Received payload:', JSON.stringify(payload, null, 2));

    // Validate supplier_id matches authenticated user
    if (payload.supplier_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Supplier ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate items
    if (!payload.order.items || payload.order.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one order item is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    for (const item of payload.order.items) {
      if (!item.name || item.qty <= 0 || item.unit_price < 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid item data: name required, qty > 0, unit_price >= 0' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate dates
    if (payload.order.start_date && payload.order.end_date) {
      const start = new Date(payload.order.start_date);
      const end = new Date(payload.order.end_date);
      if (end < start) {
        return new Response(
          JSON.stringify({ error: 'End date must be >= start date' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ========================================================================
    // STEP 1: Resolve Lead
    // ========================================================================
    let lead_id: string;
    let client_id: string;

    if (payload.lead.mode === 'create') {
      console.log('[create-order-bundle] Creating new lead and client...');
      
      if (!payload.lead.new?.full_name) {
        return new Response(
          JSON.stringify({ error: 'full_name is required for new lead' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create client (profile) using admin client to bypass RLS
      const { data: newClient, error: clientError } = await supabaseAdmin
        .from('profiles')
        .insert({
          full_name: payload.lead.new.full_name,
          email: payload.lead.new.email?.toLowerCase() || null,
          phone: payload.lead.new.phone || null,
          role: 'client',
        })
        .select('id')
        .single();

      if (clientError || !newClient) {
        console.error('[create-order-bundle] Client creation failed:', clientError);
        return new Response(
          JSON.stringify({ error: 'Failed to create client', details: clientError?.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      client_id = newClient.id;
      console.log('[create-order-bundle] Client created:', client_id);

      // Create lead with status='project_in_process'
      const { data: newLead, error: leadError } = await supabase
        .from('leads')
        .insert({
          supplier_id: payload.supplier_id,
          client_id: client_id,
          name: payload.lead.new.full_name,
          contact_email: payload.lead.new.email?.toLowerCase() || null,
          contact_phone: payload.lead.new.phone || null,
          status: 'project_in_process',
          source_key: 'orders',
          priority_key: 'medium',
          notes: 'Auto-created from Create Order Bundle',
        })
        .select('id')
        .single();

      if (leadError || !newLead) {
        console.error('[create-order-bundle] Lead creation failed:', leadError);
        return new Response(
          JSON.stringify({ error: 'Failed to create lead', details: leadError?.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      lead_id = newLead.id;
      console.log('[create-order-bundle] Lead created:', lead_id);

    } else {
      // Select existing lead
      if (!payload.lead.lead_id) {
        return new Response(
          JSON.stringify({ error: 'lead_id is required when mode=select' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: existingLead, error: leadError } = await supabase
        .from('leads')
        .select('id, client_id, supplier_id')
        .eq('id', payload.lead.lead_id)
        .eq('supplier_id', payload.supplier_id)
        .single();

      if (leadError || !existingLead) {
        console.error('[create-order-bundle] Lead not found or not owned by supplier:', leadError);
        return new Response(
          JSON.stringify({ error: 'Lead not found or access denied' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!existingLead.client_id) {
        return new Response(
          JSON.stringify({ error: 'Selected lead has no linked client' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      lead_id = existingLead.id;
      client_id = existingLead.client_id;
      console.log('[create-order-bundle] Using existing lead:', lead_id, 'client:', client_id);

      // Update lead status to project_in_process
      const { error: updateError } = await supabase
        .from('leads')
        .update({ status: 'project_in_process' })
        .eq('id', lead_id);

      if (updateError) {
        console.error('[create-order-bundle] Failed to update lead status:', updateError);
      }
    }

    // ========================================================================
    // STEP 2: Resolve Project
    // ========================================================================
    let project_id: string;

    if (payload.project.mode === 'create') {
      console.log('[create-order-bundle] Creating new project...');
      
      if (!payload.project.new?.title) {
        return new Response(
          JSON.stringify({ error: 'title is required for new project' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          client_id: client_id,
          created_by: payload.supplier_id,
          title: payload.project.new.title,
          detailed_status: 'in_progress_preparation',
          address_json: payload.project.new.address || {},
        })
        .select('id')
        .single();

      if (projectError || !newProject) {
        console.error('[create-order-bundle] Project creation failed:', projectError);
        return new Response(
          JSON.stringify({ error: 'Failed to create project', details: projectError?.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      project_id = newProject.id;
      console.log('[create-order-bundle] Project created:', project_id);

      // Add supplier as participant
      const { error: participantError } = await supabase
        .from('project_participants')
        .insert({
          project_id: project_id,
          user_id: payload.supplier_id,
          role: 'editor',
        });

      if (participantError) {
        console.error('[create-order-bundle] Failed to add project participant:', participantError);
        // Non-fatal, continue
      }

    } else {
      // Select existing project
      if (!payload.project.project_id) {
        return new Response(
          JSON.stringify({ error: 'project_id is required when mode=select' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify project belongs to client or supplier is participant
      const { data: existingProject, error: projectError } = await supabase
        .from('projects')
        .select('id, client_id')
        .eq('id', payload.project.project_id)
        .single();

      if (projectError || !existingProject) {
        console.error('[create-order-bundle] Project not found:', projectError);
        return new Response(
          JSON.stringify({ error: 'Project not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify project belongs to the same client
      if (existingProject.client_id !== client_id) {
        return new Response(
          JSON.stringify({ error: 'Project does not belong to the selected client' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      project_id = existingProject.id;
      console.log('[create-order-bundle] Using existing project:', project_id);
    }

    // ========================================================================
    // STEP 3: Create Order
    // ========================================================================
    console.log('[create-order-bundle] Creating order...');

    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        supplier_id: payload.supplier_id,
        client_id: client_id,
        lead_id: lead_id,
        project_id: project_id,
        title: payload.order.title,
        description: payload.order.description || null,
        start_date: payload.order.start_date || null,
        end_date: payload.order.end_date || null,
        address_json: payload.order.address || {},
        status: 'pending',
      })
      .select('id')
      .single();

    if (orderError || !newOrder) {
      console.error('[create-order-bundle] Order creation failed:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order', details: orderError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const order_id = newOrder.id;
    console.log('[create-order-bundle] Order created:', order_id);

    // ========================================================================
    // STEP 4: Create Order Items
    // ========================================================================
    console.log('[create-order-bundle] Creating order items...');

    const itemsToInsert = payload.order.items.map(item => ({
      order_id: order_id,
      product_id: item.product_id || null,
      name: item.name,
      description: item.description || null,
      quantity: item.qty,
      unit_price: item.unit_price,
      // line_total will be auto-calculated by trigger
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('[create-order-bundle] Order items creation failed:', itemsError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order items', details: itemsError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[create-order-bundle] Order items created');

    // ========================================================================
    // STEP 5: Fetch final order total (computed by trigger)
    // ========================================================================
    const { data: finalOrder, error: fetchError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('id', order_id)
      .single();

    const total_amount = finalOrder?.total_amount || 0;

    console.log('[create-order-bundle] Order bundle created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        order_id,
        lead_id,
        project_id,
        client_id,
        total_amount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[create-order-bundle] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
