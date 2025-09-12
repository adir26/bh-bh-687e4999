import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface WebhookPayload {
  provider: string;
  external_id: string;
  status: 'completed' | 'failed' | 'cancelled';
  amount?: number;
  currency?: string;
  metadata?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();
    console.log('Payment webhook received:', payload);

    // Validate required fields
    if (!payload.provider || !payload.external_id || !payload.status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the payment link by external_id
    const { data: paymentLink, error: fetchError } = await supabase
      .from('payment_links')
      .select('*')
      .eq('external_id', payload.external_id)
      .single();

    if (fetchError) {
      console.error('Error fetching payment link:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Payment link not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update payment link status
    const updates: any = {
      status: payload.status,
      updated_at: new Date().toISOString()
    };

    if (payload.status === 'completed') {
      updates.paid_at = new Date().toISOString();
      
      // Update order paid amount
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          paid_amount: supabase.sql`COALESCE(paid_amount, 0) + ${paymentLink.amount}`
        })
        .eq('id', paymentLink.order_id);

      if (orderError) {
        console.error('Error updating order:', orderError);
      }
    }

    const { error: updateError } = await supabase
      .from('payment_links')
      .update(updates)
      .eq('id', paymentLink.id);

    if (updateError) {
      console.error('Error updating payment link:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create order event
    const { error: eventError } = await supabase.rpc('create_order_event', {
      p_order_id: paymentLink.order_id,
      p_event_type: 'payment_status_update',
      p_meta: {
        payment_id: paymentLink.id,
        provider: payload.provider,
        status: payload.status,
        amount: paymentLink.amount,
        external_id: payload.external_id
      }
    });

    if (eventError) {
      console.error('Error creating order event:', eventError);
    }

    // Send notification (optional)
    if (payload.status === 'completed') {
      // You can add notification logic here
      console.log(`Payment completed for order ${paymentLink.order_id}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment status updated successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});