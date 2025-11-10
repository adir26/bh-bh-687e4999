import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { PDFDocument, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratePDFRequest {
  proposalId: string;
  upload?: boolean;
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { proposalId, upload = false }: GeneratePDFRequest = await req.json();

    if (!proposalId) {
      return new Response(JSON.stringify({ error: 'proposalId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch proposal data with quote and company info
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        *,
        quotes (
          *,
          companies (
            name,
            logo_url,
            phone,
            email
          )
        )
      `)
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

    // Embed Hebrew-supporting fonts
    const regularFontBytes = await Deno.readFile(new URL('./NotoSansHebrew-Regular.ttf', import.meta.url));
    const boldFontBytes = await Deno.readFile(new URL('./NotoSansHebrew-Bold.ttf', import.meta.url));
    const font = await pdfDoc.embedFont(regularFontBytes, { subset: true });
    const boldFont = await pdfDoc.embedFont(boldFontBytes, { subset: true });

    const primaryColor = [0.2, 0.4, 0.8] as [number, number, number];
    let yPosition = 800;

    // Company logo (left side)
    const company = (proposal as any).quotes?.companies;
    if (company?.logo_url) {
      try {
        const logoResponse = await fetch(company.logo_url);
        const logoBytes = await logoResponse.arrayBuffer();
        const contentType = logoResponse.headers.get('content-type') || '';
        
        let logoImage;
        if (contentType.includes('png')) {
          logoImage = await pdfDoc.embedPng(logoBytes);
        } else if (contentType.includes('jpg') || contentType.includes('jpeg')) {
          logoImage = await pdfDoc.embedJpg(logoBytes);
        }

        if (logoImage) {
          const logoDims = logoImage.scale(0.15);
          page.drawImage(logoImage, {
            x: 50,
            y: yPosition - 60,
            width: Math.min(logoDims.width, 80),
            height: Math.min(logoDims.height, 80),
          });
        }
      } catch (error) {
        console.error('Failed to embed logo:', error);
      }
    }

    // Company details (left side)
    if (company) {
      let companyY = yPosition - 80;
      if (company.name) {
        page.drawText(String(company.name), {
          x: 50,
          y: companyY,
          size: 10,
          font: boldFont,
          color: rgb(...primaryColor),
        });
        companyY -= 15;
      }
      if (company.phone) {
        page.drawText(`טלפון: ${String(company.phone)}`, {
          x: 50,
          y: companyY,
          size: 8,
          font,
        });
        companyY -= 12;
      }
      if (company.email) {
        page.drawText(String(company.email), {
          x: 50,
          y: companyY,
          size: 8,
          font,
        });
      }
    }

    // Title (right side - Hebrew)
    page.drawText('הצעת מחיר', {
      x: 450,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(...primaryColor),
    });
    yPosition -= 40;

    // Quote number
    if ((proposal as any).quotes) {
      const quoteNum = (proposal as any).quotes.quote_number || (proposal as any).quotes.id;
      page.drawText(`מספר הצעה: ${String(quoteNum)}`, {
        x: 450,
        y: yPosition,
        size: 12,
        font,
      });
      yPosition -= 20;
    }

    // Date
    const date = new Date((proposal as any).created_at).toLocaleDateString('he-IL');
    page.drawText(`תאריך: ${date}`, {
      x: 450,
      y: yPosition,
      size: 10,
      font,
    });
    yPosition -= 40;

    // Content section
    page.drawText('תוכן ההצעה', {
      x: 450,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(...primaryColor),
    });
    yPosition -= 20;

    // Content from HTML (basic text extraction)
    if ((proposal as any).html_content) {
      const textContent = String((proposal as any).html_content)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 800);

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
    page.drawText(`סטטוס: ${String((proposal as any).status)}`, {
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

    // Upload to storage if requested
    if (upload) {
      const fileName = `proposal-${proposalId}-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('proposals')
        .upload(fileName, pdfBytes, { contentType: 'application/pdf' });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('proposals')
          .getPublicUrl(fileName);

        // Log analytics event
        await supabase.from('pdf_events').insert({
          context: 'proposal',
          event_type: 'generate',
          meta: { proposal_id: proposalId, upload: true, path: fileName }
        });

        return new Response(JSON.stringify({ ok: true, url: urlData.publicUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Log PDF generation event
    await supabase.from('pdf_events').insert({
      context: 'proposal',
      event_type: 'generate',
      meta: { proposal_id: proposalId, upload: false }
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
    
    // Log error event
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('pdf_events').insert({
        context: 'proposal',
        event_type: 'error',
        meta: { message: String((error as Error).message || error) }
      });
    } catch {}
    
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

serve(handler);
