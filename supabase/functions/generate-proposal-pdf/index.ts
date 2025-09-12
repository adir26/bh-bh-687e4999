import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratePDFRequest {
  proposalId: string;
  htmlContent: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposalId, htmlContent }: GeneratePDFRequest = await req.json();
    
    if (!proposalId || !htmlContent) {
      throw new Error('Missing required fields: proposalId and htmlContent');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // For now, we'll store the HTML content and return a mock PDF URL
    // In a production environment, you would use a PDF generation service
    // like Puppeteer, jsPDF, or a service like PDFShift
    
    const pdfFileName = `proposal_${proposalId}_${Date.now()}.pdf`;
    const mockPdfUrl = `https://example.com/pdfs/${pdfFileName}`;
    
    // Update the proposal with the PDF URL
    const { data: proposal, error } = await supabase
      .from('proposals')
      .update({ 
        pdf_url: mockPdfUrl,
        html_content: htmlContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', proposalId)
      .select()
      .single();

    if (error) {
      console.error('Error updating proposal:', error);
      throw new Error(`Failed to update proposal: ${error.message}`);
    }

    // Log the PDF generation event
    await supabase
      .from('proposal_events')
      .insert({
        proposal_id: proposalId,
        event_type: 'pdf_generated',
        metadata: { pdf_url: mockPdfUrl }
      });

    console.log(`PDF generated for proposal ${proposalId}:`, mockPdfUrl);

    return new Response(JSON.stringify({
      success: true,
      proposal,
      pdfUrl: mockPdfUrl
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in generate-proposal-pdf function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);