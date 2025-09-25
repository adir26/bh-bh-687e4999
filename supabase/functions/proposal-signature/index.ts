import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignProposalRequest {
  token: string;
  action: 'accept' | 'reject';
  clientName?: string;
  clientEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action, clientName, clientEmail }: SignProposalRequest = await req.json();
    
    if (!token || !action) {
      throw new Error('Missing required fields: token and action');
    }

    if (!['accept', 'reject'].includes(action)) {
      throw new Error('Invalid action. Must be "accept" or "reject"');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call the sign_proposal function
    const { data, error } = await supabase.rpc('sign_proposal', {
      p_token: token,
      p_action: action,
      p_actor_id: null // Will be set in the function if user is authenticated
    });

    if (error) {
      console.error('Error signing proposal:', error);
      throw new Error(`Failed to sign proposal: ${error.message}`);
    }

    console.log(`Proposal signed via token:`, { token, action, result: data });

    // Get proposal details for notifications
    const { data: proposalData, error: proposalError } = await supabase
      .from('signature_links')
      .select(`
        proposal:proposals (
          id,
          quote:quotes (
            supplier_id,
            client_id,
            title
          )
        )
      `)
      .eq('token', token)
      .maybeSingle();

    if (!proposalError && proposalData?.proposal) {
      const proposal = proposalData.proposal as any;
      const quote = proposal.quote as any;
      
      // Send notification to supplier about the signature
      await supabase.functions.invoke('fanout-notifications', {
        body: {
          user_id: quote.supplier_id,
          type: `proposal_${action}`,
          title: action === 'accept' ? 'הצעה התקבלה!' : 'הצעה נדחתה',
          message: `הצעת המחיר "${quote.title}" ${action === 'accept' ? 'אושרה' : 'נדחתה'} על ידי הלקוח`,
          payload: {
            proposal_id: proposal.id,
            quote_id: quote.id,
            action,
            client_name: clientName,
            client_email: clientEmail
          }
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      action,
      proposalId: data.proposal_id,
      status: data.status
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in proposal-signature function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: error.message.includes('Invalid or expired') ? 400 : 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);