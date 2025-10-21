import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrderBundlePayload {
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
      product_name?: string;
      name?: string;
      description?: string | null;
      quantity?: number;
      qty?: number;
      unit_price: number;
    }>;
  };
}

interface NormalizedOrderItem {
  product_id: string | null;
  product_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create authenticated client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
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

    console.log('[create-order-bundle] Authenticated user:', user.id);

    // Parse and validate payload
    const payload: CreateOrderBundlePayload = await req.json();
    console.log('[create-order-bundle] Payload received:', JSON.stringify(payload, null, 2));

    // Validate required fields
    if (!payload.lead || !payload.project || !payload.order) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: lead, project, order' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.order.items || payload.order.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order must have at least one item' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedItems: NormalizedOrderItem[] = [];

    for (const [index, item] of payload.order.items.entries()) {
      const productName = (item.product_name ?? item.name ?? '').trim();
      const quantityRaw = item.quantity ?? item.qty ?? 0;
      const unitPriceRaw = item.unit_price ?? 0;

      if (!productName) {
        return new Response(
          JSON.stringify({ error: `Order item ${index + 1} is missing product_name` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const quantity = Number(quantityRaw);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return new Response(
          JSON.stringify({ error: `Order item ${index + 1} has invalid quantity` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const unitPrice = Number(unitPriceRaw);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return new Response(
          JSON.stringify({ error: `Order item ${index + 1} has invalid unit_price` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      normalizedItems.push({
        product_id: item.product_id ?? null,
        product_name: productName,
        description: item.description ?? null,
        quantity,
        unit_price: unitPrice,
      });
    }

    // Create authenticated admin client for profile creation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    let resolvedLeadId: string | undefined;
    let resolvedClientId: string | undefined;

    // Handle client/lead creation if mode=create
    if (payload.lead.mode === 'create' && payload.lead.new) {
      const { full_name, email, phone } = payload.lead.new;
      
      // Create auth user + profile via admin client
      const tempPassword = crypto.randomUUID();
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email || `${crypto.randomUUID()}@temp.local`,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name,
          role: 'client',
        },
      });

      if (authError || !authData.user) {
        console.error('[create-order-bundle] Failed to create client auth user:', authError);
        return new Response(
          JSON.stringify({ error: 'Failed to create client user', details: authError?.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      resolvedClientId = authData.user.id;

      // Update profile with phone
      if (phone) {
        await supabaseAdmin
          .from('profiles')
          .update({ phone })
          .eq('id', resolvedClientId);
      }

      // Create lead
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert({
          supplier_id: user.id,
          client_id: resolvedClientId,
          name: full_name,
          contact_email: email,
          contact_phone: phone,
          status: 'project_in_process',
          source_key: 'orders',
          priority_key: 'medium',
          notes: 'Auto-created from Create Order Bundle',
        })
        .select('id')
        .single();

      if (leadError || !leadData) {
        console.error('[create-order-bundle] Failed to create lead:', leadError);
        return new Response(
          JSON.stringify({ error: 'Failed to create lead', details: leadError?.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      resolvedLeadId = leadData.id;

    } else if (payload.lead.mode === 'select' && payload.lead.lead_id) {
      // Use existing lead
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id, client_id')
        .eq('id', payload.lead.lead_id)
        .eq('supplier_id', user.id)
        .single();

      if (leadError || !leadData) {
        console.error('[create-order-bundle] Lead not found:', leadError);
        return new Response(
          JSON.stringify({ error: 'Lead not found or access denied' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      resolvedLeadId = leadData.id;
      resolvedClientId = leadData.client_id;

      // Update lead status
      await supabase
        .from('leads')
        .update({ status: 'project_in_process' })
        .eq('id', resolvedLeadId);
    }

    if (!resolvedLeadId || !resolvedClientId) {
      return new Response(
        JSON.stringify({ error: 'Failed to resolve lead and client' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Now call the RPC with resolved IDs
    const rpcPayload = {
      lead_id: resolvedLeadId,
      client_id: resolvedClientId,
      project: payload.project,
      order: {
        ...payload.order,
        items: normalizedItems,
      },
    };

    const { data, error } = await supabase.rpc('create_order_bundle', {
      payload: rpcPayload,
    });

    if (error) {
      console.error('[create-order-bundle] RPC error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create order', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[create-order-bundle] Success:', data);

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
