import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuoteAppearance {
  theme: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  bannerImage: string | null;
  showBanner: boolean;
}

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const normalizeColor = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && HEX_COLOR_REGEX.test(value.trim())) {
    return value.trim();
  }
  return fallback;
};

const parseAppearanceSource = (value: unknown): Record<string, any> | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, any>;
      }
    } catch (error) {
      console.warn('[generate-quote-pdf] Failed to parse appearance JSON', error);
      return null;
    }
  }

  if (typeof value === 'object') {
    return value as Record<string, any>;
  }

  return null;
};

const buildAppearance = (quote: any, company: any | null): QuoteAppearance => {
  const rawAppearance =
    parseAppearanceSource(quote?.appearance) ||
    parseAppearanceSource(quote?.design_settings) ||
    parseAppearanceSource(quote?.design) ||
    parseAppearanceSource(quote?.branding?.quote) ||
    parseAppearanceSource(quote?.public_settings?.quote_appearance) ||
    null;

  const theme =
    rawAppearance?.theme ||
    rawAppearance?.selectedTheme ||
    quote?.quote_theme ||
    quote?.theme ||
    'classic';

  const colors = rawAppearance?.colors || {};

  const primaryColor = normalizeColor(
    rawAppearance?.primaryColor || colors.primary || quote?.primary_color,
    '#2563EB'
  );

  const accentColor = normalizeColor(
    rawAppearance?.accentColor || colors.accent || rawAppearance?.secondaryColor,
    '#F97316'
  );

  const backgroundColor = normalizeColor(
    rawAppearance?.backgroundColor || colors.background,
    '#F8FAFC'
  );

  const textColor = normalizeColor(
    rawAppearance?.textColor || colors.text,
    '#0F172A'
  );

  const fontFamily =
    rawAppearance?.fontFamily || rawAppearance?.font || "'Heebo', 'Assistant', sans-serif";

  const bannerImage =
    rawAppearance?.bannerImage ||
    rawAppearance?.banner ||
    quote?.banner_url ||
    company?.banner_url ||
    null;

  const showBanner =
    typeof rawAppearance?.showBanner === 'boolean'
      ? rawAppearance.showBanner
      : true;

  return {
    theme,
    primaryColor,
    accentColor,
    backgroundColor,
    textColor,
    fontFamily,
    bannerImage,
    showBanner,
  };
};

const hexToRgb = (hex: string, fallback: [number, number, number]): [number, number, number] => {
  const sanitized = hex.replace('#', '');
  if (![3, 6].includes(sanitized.length)) {
    return fallback;
  }

  const normalized = sanitized.length === 3
    ? sanitized.split('').map((char) => char + char).join('')
    : sanitized;

  const bigint = parseInt(normalized, 16);
  if (Number.isNaN(bigint)) {
    return fallback;
  }

  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return [r, g, b];
};

interface GeneratePDFRequest {
  quoteId?: string;
  token?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quoteId, token }: GeneratePDFRequest = await req.json();
    
    if (!quoteId && !token) {
      throw new Error('Missing required field: quoteId or token');
    }

    console.log('[generate-quote-pdf] Processing request:', { quoteId: quoteId?.substring(0, 8), token: token?.substring(0, 8) });

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    let quote: any;
    let items: any[];
    let supplier: any;
    let client: any = null;
    let company: any = null;
    let supabaseClient = createClient(supabaseUrl, serviceRoleKey);

    if (quoteId) {
      // Authenticated request - verify ownership
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('חסר אימות');
      }

      supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
        global: { headers: { Authorization: authHeader } }
      });

      // Get user from auth header
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      if (userError || !user) {
        throw new Error('אימות נכשל');
      }

      // Fetch quote and verify ownership
      const { data: quoteData, error: quoteError } = await supabaseClient
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .eq('supplier_id', user.id)
        .single();

      if (quoteError || !quoteData) {
        console.error('[generate-quote-pdf] Quote not found or access denied:', quoteError);
        throw new Error('הצעת מחיר לא נמצאה או אין הרשאה');
      }

      quote = quoteData;

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabaseClient
        .from('quote_items')
        .select('*')
        .eq('quote_id', quoteId)
        .order('sort_order', { ascending: true });

      if (itemsError) {
        throw new Error('שגיאה בטעינת פריטי הצעת המחיר');
      }
      items = itemsData || [];

      // Fetch supplier profile
      const { data: supplierData } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      supplier = supplierData;

      // Fetch client if exists
      if (quote.client_id) {
        const { data: clientData } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', quote.client_id)
          .single();
        client = clientData;
      }

    } else if (token) {
      // Public request via token
      supabaseClient = createClient(supabaseUrl, serviceRoleKey);

      // Fetch share link
      const { data: shareLink, error: linkError } = await supabaseClient
        .from('quote_share_links')
        .select('*')
        .eq('token', token)
        .single();

      if (linkError || !shareLink) {
        throw new Error('קישור לא נמצא או פג תוקף');
      }

      // Check expiration
      const expiresAt = new Date(shareLink.expires_at);
      if (expiresAt < new Date()) {
        throw new Error('תוקף הקישור פג');
      }

      // Fetch quote
      const { data: quoteData, error: quoteError } = await supabaseClient
        .from('quotes')
        .select('*')
        .eq('id', shareLink.quote_id)
        .single();

      if (quoteError || !quoteData) {
        throw new Error('הצעת מחיר לא נמצאה');
      }
      quote = quoteData;

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabaseClient
        .from('quote_items')
        .select('*')
        .eq('quote_id', quote.id)
        .order('sort_order', { ascending: true });

      if (itemsError) {
        throw new Error('שגיאה בטעינת פריטי הצעת המחיר');
      }
      items = itemsData || [];

      // Fetch supplier
      const { data: supplierData } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', quote.supplier_id)
        .single();
      supplier = supplierData;

      // Fetch client if exists
      if (quote.client_id) {
        const { data: clientData } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', quote.client_id)
          .single();
        client = clientData;
      }

      // Update accessed_at
      await supabaseClient
        .from('quote_share_links')
        .update({ accessed_at: new Date().toISOString() })
        .eq('id', shareLink.id);
    }

    const { data: companyData } = await supabaseClient
      .from('companies')
      .select('id, name, logo_url, banner_url, tagline, description, phone, email, website, city, area, services')
      .eq('owner_id', quote.supplier_id)
      .maybeSingle();
    company = companyData;

    const appearance = buildAppearance(quote, company);
    const [primaryR, primaryG, primaryB] = hexToRgb(appearance.primaryColor, [0.231, 0.521, 0.988]);
    const [accentR, accentG, accentB] = hexToRgb(appearance.accentColor, [0.976, 0.451, 0.086]);
    const [textR, textG, textB] = hexToRgb(appearance.textColor, [0.058, 0.09, 0.165]);

    console.log('[generate-quote-pdf] Generating PDF for quote:', quote.id);

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    let y = height - 50;

    // Header accent background
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width,
      height: 120,
      color: rgb(primaryR, primaryG, primaryB),
      opacity: 0.08,
    });

    // Title
    page.drawText('Quote / Hatzaat Machir', {
      x: 50,
      y,
      size: 20,
      font: boldFont,
      color: rgb(primaryR, primaryG, primaryB),
    });
    y -= 30;

    // Quote number and date
    page.drawText(`Quote #: ${quote.quote_number || 'N/A'}`, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(textR, textG, textB),
    });

    const dateStr = new Date(quote.created_at).toLocaleDateString('he-IL');
    page.drawText(`Date: ${dateStr}`, {
      x: 50,
      y: y - 15,
      size: 12,
      font,
      color: rgb(textR, textG, textB),
    });
    y -= 50;

    // Supplier info
    page.drawText('From:', {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(textR, textG, textB),
    });
    y -= 15;

    if (supplier) {
      page.drawText(supplier.full_name || 'Supplier', {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(textR, textG, textB),
      });
      y -= 15;

      if (supplier.email) {
        page.drawText(supplier.email, {
          x: 50,
          y,
          size: 10,
          font,
          color: rgb(textR, textG, textB),
        });
        y -= 15;
      }
      if (company?.phone) {
        page.drawText(`Phone: ${company.phone}`, {
          x: 50,
          y,
          size: 10,
          font,
          color: rgb(textR, textG, textB),
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
        color: rgb(textR, textG, textB),
      });
      y -= 15;

      page.drawText(client.full_name || 'Client', {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(textR, textG, textB),
      });
      y -= 15;

      if (client.email) {
        page.drawText(client.email, {
          x: 50,
          y,
          size: 10,
          font,
          color: rgb(textR, textG, textB),
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
      color: rgb(primaryR, primaryG, primaryB),
    });
    page.drawText('Qty', {
      x: 300,
      y,
      size: 11,
      font: boldFont,
      color: rgb(primaryR, primaryG, primaryB),
    });
    page.drawText('Price', {
      x: 370,
      y,
      size: 11,
      font: boldFont,
      color: rgb(primaryR, primaryG, primaryB),
    });
    page.drawText('Total', {
      x: 470,
      y,
      size: 11,
      font: boldFont,
      color: rgb(primaryR, primaryG, primaryB),
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
        color: rgb(textR, textG, textB),
      });

      page.drawText(String(item.quantity), {
        x: 300,
        y,
        size: 10,
        font,
        color: rgb(textR, textG, textB),
      });

      page.drawText(`₪${Number(item.unit_price).toFixed(2)}`, {
        x: 370,
        y,
        size: 10,
        font,
        color: rgb(textR, textG, textB),
      });

      page.drawText(`₪${Number(item.subtotal).toFixed(2)}`, {
        x: 470,
        y,
        size: 10,
        font,
        color: rgb(textR, textG, textB),
      });
      
      y -= 20;
    }

    y -= 10;
    
    // Totals section
    page.drawLine({
      start: { x: 350, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(primaryR, primaryG, primaryB),
    });
    y -= 20;

    // Subtotal
    page.drawText('Subtotal:', {
      x: 370,
      y,
      size: 11,
      font,
      color: rgb(textR, textG, textB),
    });
    page.drawText(`₪${Number(quote.subtotal || 0).toFixed(2)}`, {
      x: 470,
      y,
      size: 11,
      font,
      color: rgb(textR, textG, textB),
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
      color: rgb(textR, textG, textB),
    });
    page.drawText(`₪${Number(quote.tax_amount || 0).toFixed(2)}`, {
      x: 470,
      y,
      size: 11,
      font,
      color: rgb(textR, textG, textB),
    });
    y -= 20;

    // Total
    page.drawText('Total:', {
      x: 370,
      y,
      size: 12,
      font: boldFont,
      color: rgb(primaryR, primaryG, primaryB),
    });
    page.drawText(`₪${Number(quote.total_amount || 0).toFixed(2)}`, {
      x: 470,
      y,
      size: 12,
      font: boldFont,
      color: rgb(primaryR, primaryG, primaryB),
    });
    y -= 30;

    // Notes
    if (quote.notes) {
      page.drawText('Notes:', {
        x: 50,
        y,
        size: 11,
        font: boldFont,
        color: rgb(textR, textG, textB),
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
          color: rgb(textR, textG, textB),
        });
        y -= 12;
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
        color: rgb(accentR, accentG, accentB),
      });

      if (quote.valid_until) {
        const validUntil = new Date(quote.valid_until).toLocaleDateString('he-IL');
        page.drawText(`Valid until: ${validUntil}`, {
          x: 50,
          y: y - 12,
          size: 9,
          font,
          color: rgb(textR, textG, textB),
        });
      }
    }

    page.drawText('Created with BonimPlus', {
      x: width / 2 - 70,
      y: 40,
      size: 10,
      font,
      color: rgb(accentR, accentG, accentB),
    });

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
