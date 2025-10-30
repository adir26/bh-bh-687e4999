import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadData {
  id: string;
  budget_range: string | null;
  start_date: string | null;
  end_date: string | null;
  address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  category_id: string | null;
  notes: string | null;
  project_size: string | null;
}

interface ScoreBreakdown {
  budget: number;
  urgency: number;
  category: number;
  completeness: number;
  intent: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { leadId } = await req.json();

    if (!leadId) {
      return new Response(
        JSON.stringify({ error: "leadId is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch lead data
    const { data: lead, error } = await supabase
      .from("leads")
      .select("id, budget_range, start_date, end_date, address, contact_phone, contact_email, category_id, notes, project_size")
      .eq("id", leadId)
      .single();

    if (error || !lead) {
      console.error("Error fetching lead:", error);
      return new Response(
        JSON.stringify({ error: "Lead not found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ---- Scoring logic ----
    const breakdown: ScoreBreakdown = {
      budget: 0,
      urgency: 0,
      category: 0,
      completeness: 0,
      intent: 0,
    };

    // Budget scoring (0-25 points)
    const budgetMap: Record<string, number> = {
      "עד 50,000 ₪": 10,
      "50,000–150,000 ₪": 15,
      "150,000–350,000 ₪": 20,
      "מעל 350,000 ₪": 25,
    };
    breakdown.budget = budgetMap[lead.budget_range || ""] || 0;

    // Urgency scoring (0-25 points)
    if (lead.start_date) {
      const today = new Date();
      const startDate = new Date(lead.start_date);
      const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 30) {
        breakdown.urgency = 25;
      } else if (diffDays <= 60) {
        breakdown.urgency = 20;
      } else if (diffDays <= 90) {
        breakdown.urgency = 15;
      } else if (diffDays <= 180) {
        breakdown.urgency = 10;
      } else {
        breakdown.urgency = 5;
      }
    }

    // Category scoring (0-15 points)
    breakdown.category = lead.category_id ? 15 : 0;

    // Completeness scoring (0-25 points)
    let completenessPoints = 0;
    if (lead.contact_phone) completenessPoints += 8;
    if (lead.contact_email) completenessPoints += 7;
    if (lead.address) completenessPoints += 5;
    if (lead.project_size) completenessPoints += 5;
    breakdown.completeness = completenessPoints;

    // Intent scoring (0-10 points) - based on notes content
    const intentKeywords = [
      'תקציב', 'דחוף', 'מוכן', 'מיידי', 'מחר', 'השבוע',
      'רציני', 'חתום', 'אישור', 'התחלה', 'מתחיל'
    ];
    const notes = (lead.notes || "").toLowerCase();
    const keywordMatches = intentKeywords.filter(keyword => notes.includes(keyword)).length;
    breakdown.intent = Math.min(10, keywordMatches * 3);

    // Calculate total score (0-100)
    const totalScore = Math.max(
      0,
      Math.min(
        100,
        breakdown.budget + breakdown.urgency + breakdown.category + breakdown.completeness + breakdown.intent
      )
    );

    // Upsert score to database
    const { error: upsertError } = await supabase
      .from("lead_scores")
      .upsert({
        lead_id: lead.id,
        score: totalScore,
        breakdown,
        updated_at: new Date().toISOString(),
      }, { onConflict: "lead_id" });

    if (upsertError) {
      console.error("Error upserting score:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to save score" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Lead ${leadId} scored: ${totalScore}`, breakdown);

    return new Response(
      JSON.stringify({ score: totalScore, breakdown }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
