import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { PDFDocument, rgb, PDFFont, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

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
    const { width, height } = page.getSize();

    // Load Hebrew fonts from Storage URLs
    let font: PDFFont;
    let boldFont: PDFFont;
    
    try {
      const REG_URL = Deno.env.get('PDF_FONT_HE_REGULAR_URL');
      const BOLD_URL = Deno.env.get('PDF_FONT_HE_BOLD_URL');

      if (REG_URL && BOLD_URL) {
        console.log('Loading Hebrew fonts from URLs...');
        const [regRes, boldRes] = await Promise.all([fetch(REG_URL), fetch(BOLD_URL)]);
        
        if (regRes.ok && boldRes.ok) {
          const regBytes = new Uint8Array(await regRes.arrayBuffer());
          const boldBytes = new Uint8Array(await boldRes.arrayBuffer());
          font = await pdfDoc.embedFont(regBytes);
          boldFont = await pdfDoc.embedFont(boldBytes);
          console.log('Hebrew fonts loaded successfully');
        } else {
          throw new Error(`Failed to fetch fonts: ${regRes.status}, ${boldRes.status}`);
        }
      } else {
        throw new Error('PDF_FONT_HE_REGULAR_URL or PDF_FONT_HE_BOLD_URL not set');
      }
    } catch (fontError) {
      console.warn('Failed to load Hebrew fonts, falling back to Helvetica:', fontError);
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      await supabase.from('pdf_events').insert({
        context: 'proposal',
        event_type: 'font_load_error',
        meta: { error: String(fontError), proposal_id: proposalId }
      }).catch(console.error);
    }

    // Helper for right-aligned Hebrew text
    const drawRightAligned = (text: string, y: number, size: number, useFont: PDFFont = font, color = rgb(0, 0, 0)) => {
      const textWidth = useFont.widthOfTextAtSize(text, size);
      page.drawText(text, {
        x: width - textWidth - 24,
        y,
        size,
        font: useFont,
        color,
      });
    };

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

    // Title (right side - Hebrew) with proper alignment
    drawRightAligned('הצעת מחיר', yPosition, 24, boldFont, rgb(...primaryColor));
    yPosition -= 40;

    // Quote number
    if ((proposal as any).quotes) {
      const quoteNum = (proposal as any).quotes.quote_number || (proposal as any).quotes.id;
      drawRightAligned(`מספר הצעה: ${String(quoteNum)}`, yPosition, 12);
      yPosition -= 20;
    }

    // Date
    const date = new Date((proposal as any).created_at).toLocaleDateString('he-IL');
    drawRightAligned(`תאריך: ${date}`, yPosition, 10);
    yPosition -= 40;

    // Content section
    drawRightAligned('תוכן ההצעה', yPosition, 14, boldFont, rgb(...primaryColor));
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
    drawRightAligned(`סטטוס: ${String((proposal as any).status)}`, yPosition, 10, font, rgb(0.5, 0.5, 0.5));

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
