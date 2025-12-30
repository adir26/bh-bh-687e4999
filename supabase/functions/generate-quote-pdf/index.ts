import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface GeneratePDFRequest {
  quoteId?: string;
  token?: string;
  template?: string;
}

async function loadHebrewFonts(pdfDoc: any) {
  try {
    const regUrl = Deno.env.get('PDF_FONT_HE_REGULAR_URL');
    const boldUrl = Deno.env.get('PDF_FONT_HE_BOLD_URL');
    if (!regUrl || !boldUrl) {
      throw new Error('PDF fonts env vars not set');
    }
    const [regResp, boldResp] = await Promise.all([
      fetch(regUrl),
      fetch(boldUrl),
    ]);
    if (!regResp.ok || !boldResp.ok) {
      throw new Error(`Failed to fetch fonts: ${regResp.status}, ${boldResp.status}`);
    }
    const [regBuffer, boldBuffer] = await Promise.all([
      regResp.arrayBuffer(),
      boldResp.arrayBuffer(),
    ]);
    const regFont = await pdfDoc.embedFont(regBuffer);
    const boldFont = await pdfDoc.embedFont(boldBuffer);
    console.log('[generate-quote-pdf] Hebrew fonts loaded successfully');
    return { font: regFont, boldFont };
  } catch (err) {
    console.warn('[generate-quote-pdf] Failed to load Hebrew fonts, falling back to Helvetica:', err);
    return {
      font: await pdfDoc.embedFont(StandardFonts.Helvetica),
      boldFont: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Defensive request body parsing
    let requestBody: GeneratePDFRequest = { template: 'premium' };
    
    try {
      const rawBody = await req.text();
      console.log('[generate-quote-pdf] Raw request body length:', rawBody?.length || 0);
      
      if (!rawBody || !rawBody.trim()) {
        console.error('[generate-quote-pdf] Empty request body received');
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      
      requestBody = JSON.parse(rawBody);
    } catch (parseError: any) {
      console.error('[generate-quote-pdf] JSON parse error:', parseError.message);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON body', 
          details: parseError.message 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
    
    const { quoteId, token, template = 'premium' } = requestBody;
    
    // Validate required fields
    if (!quoteId && !token) {
      console.error('[generate-quote-pdf] Missing required field: quoteId or token');
      return new Response(
        JSON.stringify({ error: 'Missing required field: quoteId or token' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('[generate-quote-pdf] Processing request:', { 
      quoteId: quoteId?.substring(0, 8), 
      token: token?.substring(0, 8),
      template 
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    let quote: any;
    let items: any[];
    let supplier: any;
    let client: any = null;

    if (quoteId) {
      // Authenticated request - verify ownership
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'חסר אימות' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        global: { headers: { Authorization: authHeader } }
      });

      // Get user from auth header
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'אימות נכשל' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Fetch quote and verify ownership
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .eq('supplier_id', user.id)
        .single();

      if (quoteError || !quoteData) {
        console.error('[generate-quote-pdf] Quote not found or access denied:', quoteError);
        return new Response(
          JSON.stringify({ error: 'הצעת מחיר לא נמצאה או אין הרשאה' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      quote = quoteData;

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quoteId)
        .order('sort_order', { ascending: true });

      if (itemsError) {
        console.error('[generate-quote-pdf] Error fetching items:', itemsError);
        return new Response(
          JSON.stringify({ error: 'שגיאה בטעינת פריטי הצעת המחיר' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      items = itemsData || [];

      // Fetch supplier profile
      const { data: supplierData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      supplier = supplierData;

      // Fetch client if exists
      if (quote.client_id) {
        const { data: clientData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', quote.client_id)
          .single();
        client = clientData;
      }

    } else if (token) {
      // Public request via token
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      // Fetch share link
      const { data: shareLink, error: linkError } = await supabase
        .from('quote_share_links')
        .select('*')
        .eq('token', token)
        .single();

      if (linkError || !shareLink) {
        return new Response(
          JSON.stringify({ error: 'קישור לא נמצא או פג תוקף' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Check expiration
      const expiresAt = new Date(shareLink.expires_at);
      if (expiresAt < new Date()) {
        return new Response(
          JSON.stringify({ error: 'תוקף הקישור פג' }),
          {
            status: 410,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Fetch quote
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', shareLink.quote_id)
        .single();

      if (quoteError || !quoteData) {
        return new Response(
          JSON.stringify({ error: 'הצעת מחיר לא נמצאה' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      quote = quoteData;

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quote.id)
        .order('sort_order', { ascending: true });

      if (itemsError) {
        return new Response(
          JSON.stringify({ error: 'שגיאה בטעינת פריטי הצעת המחיר' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      items = itemsData || [];

      // Fetch supplier
      const { data: supplierData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', quote.supplier_id)
        .single();
      supplier = supplierData;

      // Fetch client if exists
      if (quote.client_id) {
        const { data: clientData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', quote.client_id)
          .single();
        client = clientData;
      }

      // Update accessed_at
      await supabase
        .from('quote_share_links')
        .update({ accessed_at: new Date().toISOString() })
        .eq('id', shareLink.id);
    }

    console.log('[generate-quote-pdf] Generating PDF for quote:', quote.id, 'with template:', template);

    // Template color schemes
    const templates: Record<string, { primary: [number, number, number]; secondary: [number, number, number] }> = {
      premium: { primary: [0.58, 0.27, 0.69], secondary: [0.95, 0.47, 0.67] },
      corporate: { primary: [0.3, 0.4, 0.5], secondary: [0.2, 0.3, 0.45] },
      modern: { primary: [0.08, 0.5, 0.75], secondary: [0, 0.7, 0.85] },
      minimal: { primary: [0, 0, 0], secondary: [0.3, 0.3, 0.3] },
      classic: { primary: [0.75, 0.5, 0], secondary: [0.85, 0.6, 0.2] }
    };

    const colors = templates[template] || templates.premium;

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { font, boldFont } = await loadHebrewFonts(pdfDoc);
    
    const { width, height } = page.getSize();
    let y = height - 50;

    // Title with template color
    page.drawText('Quote / Hatzaat Machir', {
      x: 50,
      y,
      size: 20,
      font: boldFont,
      color: rgb(colors.primary[0], colors.primary[1], colors.primary[2]),
    });
    y -= 30;

    // Quote number and date
    page.drawText(`Quote #: ${quote.quote_number || 'N/A'}`, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    
    const dateStr = new Date(quote.created_at).toLocaleDateString('he-IL');
    page.drawText(`Date: ${dateStr}`, {
      x: 50,
      y: y - 15,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 50;

    // Supplier info
    page.drawText('From:', {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 15;
    
    if (supplier) {
      page.drawText(supplier.full_name || 'Supplier', {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 15;
      
      if (supplier.email) {
        page.drawText(supplier.email, {
          x: 50,
          y,
          size: 10,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 15;
      }
    }
    y -= 20;

    // Client info
    if (client) {
      page.drawText('To:', {
        x: 50,
        y,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      y -= 15;
      
      page.drawText(client.full_name || 'Client', {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 15;
      
      if (client.email) {
        page.drawText(client.email, {
          x: 50,
          y,
          size: 10,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 15;
      }
      y -= 20;
    }

    // Items table header
    page.drawText('Item', {
      x: 50,
      y,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText('Qty', {
      x: 300,
      y,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText('Price', {
      x: 370,
      y,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText('Total', {
      x: 470,
      y,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 5;
    
    // Line under header
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    // Items
    for (const item of items) {
      if (y < 100) {
        // Add new page if needed
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        y = height - 50;
      }

      const itemName = item.name || item.description || 'Item';
      page.drawText(itemName.substring(0, 35), {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(String(item.quantity), {
        x: 300,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`₪${Number(item.unit_price).toFixed(2)}`, {
        x: 370,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`₪${Number(item.subtotal).toFixed(2)}`, {
        x: 470,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      
      y -= 20;
    }

    y -= 10;
    
    // Totals section
    page.drawLine({
      start: { x: 350, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    // Subtotal
    page.drawText('Subtotal:', {
      x: 370,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(`₪${Number(quote.subtotal || 0).toFixed(2)}`, {
      x: 470,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    // VAT
    const vatPercentage = quote.subtotal > 0 
      ? ((Number(quote.tax_amount || 0) / Number(quote.subtotal)) * 100).toFixed(0)
      : '0';
    
    page.drawText(`VAT (${vatPercentage}%):`, {
      x: 370,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(`₪${Number(quote.tax_amount || 0).toFixed(2)}`, {
      x: 470,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    // Total
    page.drawText('Total:', {
      x: 370,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(`₪${Number(quote.total_amount || 0).toFixed(2)}`, {
      x: 470,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    // Notes
    if (quote.notes) {
      page.drawText('Notes:', {
        x: 50,
        y,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      y -= 15;
      
      const notesLines = quote.notes.split('\n');
      for (const line of notesLines.slice(0, 5)) {
        if (y < 50) break;
        page.drawText(line.substring(0, 70), {
          x: 50,
          y,
          size: 9,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 12;
      }
    }

    // Terms & Conditions
    if (quote.terms_conditions) {
      y -= 15;
      if (y > 50) {
        page.drawText('Terms & Conditions:', {
          x: 50,
          y,
          size: 11,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        y -= 15;
        
        const termsLines = quote.terms_conditions.split('\n');
        for (const line of termsLines.slice(0, 5)) {
          if (y < 50) break;
          page.drawText(line.substring(0, 70), {
            x: 50,
            y,
            size: 8,
            font,
            color: rgb(0.4, 0.4, 0.4),
          });
          y -= 12;
        }
      }
    }

    // Status and validity
    y -= 20;
    if (y > 50) {
      page.drawText(`Status: ${quote.status || 'draft'}`, {
        x: 50,
        y,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      if (quote.valid_until) {
        const validUntil = new Date(quote.valid_until).toLocaleDateString('he-IL');
        page.drawText(`Valid until: ${validUntil}`, {
          x: 50,
          y: y - 12,
          size: 9,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    }

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    console.log('[generate-quote-pdf] PDF generated successfully, size:', pdfBytes.length);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quote.quote_number || quote.id}.pdf"`,
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('[generate-quote-pdf] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'שגיאה ביצירת PDF' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
