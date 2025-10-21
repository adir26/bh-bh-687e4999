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

    // Call the atomic RPC function
    const { data, error } = await supabase.rpc('create_order_bundle', {
      payload: {
        lead: payload.lead,
        project: payload.project,
        order: payload.order,
      }
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
