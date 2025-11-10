import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratePDFRequest {
  proposalId: string;
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { proposalId }: GeneratePDFRequest = await req.json();

    if (!proposalId) {
      return new Response(JSON.stringify({ error: 'proposalId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch proposal data
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*, quotes(*)')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return new Response(JSON.stringify({ error: 'Proposal not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = 800;

    // Title
    page.drawText('הצעת מחיר', {
      x: 450,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.8),
    });
    yPosition -= 40;

    // Quote number
    if (proposal.quotes) {
      page.drawText(`מספר הצעה: ${proposal.quotes.quote_number || proposal.quotes.id}`, {
        x: 450,
        y: yPosition,
        size: 12,
        font,
      });
      yPosition -= 20;
    }

    // Date
    const date = new Date(proposal.created_at).toLocaleDateString('he-IL');
    page.drawText(`תאריך: ${date}`, {
      x: 450,
      y: yPosition,
      size: 10,
      font,
    });
    yPosition -= 40;

    // Content from HTML (basic text extraction)
    if (proposal.html_content) {
      const textContent = proposal.html_content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 500);

      const lines = textContent.match(/.{1,70}/g) || [];
      for (const line of lines) {
        if (yPosition < 100) break;
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 10,
          font,
        });
        yPosition -= 15;
      }
    }

    // Status
    yPosition -= 20;
    page.drawText(`סטטוס: ${proposal.status}`, {
      x: 450,
      y: yPosition,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Footer
    page.drawText(`נוצר באמצעות המערכת - ${new Date().toLocaleDateString('he-IL')}`, {
      x: 50,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    // Log PDF generation event
    await supabase.from('proposal_events').insert({
      proposal_id: proposalId,
      event_type: 'pdf_generated',
      actor_id: proposal.quotes?.supplier_id,
    });

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proposal-${proposalId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating proposal PDF:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

serve(handler);
