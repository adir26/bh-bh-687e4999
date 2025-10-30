import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("Starting backfill of lead scores...");

    // Get all leads
    const { data: allLeads, error: leadsError } = await supabase
      .from("leads")
      .select("id");

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch leads", details: leadsError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!allLeads || allLeads.length === 0) {
      console.log("No leads found");
      return new Response(
        JSON.stringify({ message: "No leads found", processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing scores
    const { data: existingScores, error: scoresError } = await supabase
      .from("lead_scores")
      .select("lead_id");

    if (scoresError) {
      console.error("Error fetching scores:", scoresError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch scores", details: scoresError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const existingLeadIds = new Set((existingScores || []).map(s => s.lead_id));
    const leadsWithoutScores = allLeads.filter(lead => !existingLeadIds.has(lead.id));

    if (leadsWithoutScores.length === 0) {
      console.log("All leads already have scores");
      return new Response(
        JSON.stringify({ message: "All leads already have scores", processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${leadsWithoutScores.length} leads without scores`);

    // Compute score for each lead
    const results = await Promise.allSettled(
      leadsWithoutScores.map(async (lead) => {
        const { data, error } = await supabase.functions.invoke('compute-lead-score', {
          body: { leadId: lead.id },
        });

        if (error) {
          console.error(`Failed to compute score for lead ${lead.id}:`, error);
          throw error;
        }

        return { leadId: lead.id, score: data?.score };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Backfill complete: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({
        message: "Backfill complete",
        total: leadsWithoutScores.length,
        successful,
        failed,
        results: results.map((r, i) => ({
          leadId: leadsWithoutScores[i].id,
          status: r.status,
          score: r.status === 'fulfilled' ? (r.value as any)?.score : null,
          error: r.status === 'rejected' ? r.reason : null,
        }))
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
