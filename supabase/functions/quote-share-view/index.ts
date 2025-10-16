import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShareViewRequest {
  token: string;
}

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
      console.warn('[quote-share-view] Failed to parse appearance JSON', error);
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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token }: ShareViewRequest = await req.json();
    
    if (!token) {
      throw new Error('Missing required field: token');
    }

    console.log('[quote-share-view] Processing token:', token.substring(0, 8) + '...');

    // Initialize Supabase client with service role for public access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch share link
    const { data: shareLink, error: linkError } = await supabase
      .from('quote_share_links')
      .select('*')
      .eq('token', token)
      .single();

    if (linkError || !shareLink) {
      console.error('[quote-share-view] Share link not found:', linkError);
      return new Response(JSON.stringify({ error: 'קישור לא נמצא או פג תוקף' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check expiration
    const expiresAt = new Date(shareLink.expires_at);
    if (expiresAt < new Date()) {
      console.error('[quote-share-view] Link expired:', expiresAt);
      return new Response(JSON.stringify({ error: 'תוקף הקישור פג' }), {
        status: 410,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Fetch quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', shareLink.quote_id)
      .single();

    if (quoteError || !quote) {
      console.error('[quote-share-view] Quote not found:', quoteError);
      throw new Error('הצעת מחיר לא נמצאה');
    }

    // Fetch quote items
    const { data: items, error: itemsError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quote.id)
      .order('sort_order', { ascending: true });

    if (itemsError) {
      console.error('[quote-share-view] Error fetching items:', itemsError);
      throw new Error('שגיאה בטעינת פריטי הצעת המחיר');
    }

    // Fetch supplier profile for branding details
    const { data: supplierProfile } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('id', quote.supplier_id)
      .maybeSingle();

    // Fetch company details for extended branding
    const { data: company } = await supabase
      .from('companies')
      .select('id, name, logo_url, banner_url, tagline, description, phone, email, website, city, area, services')
      .eq('owner_id', quote.supplier_id)
      .maybeSingle();

    const appearance = buildAppearance(quote, company);

    // Update accessed_at
    await supabase
      .from('quote_share_links')
      .update({ accessed_at: new Date().toISOString() })
      .eq('id', shareLink.id);

    console.log('[quote-share-view] Successfully fetched quote:', quote.id);

    return new Response(JSON.stringify({
      success: true,
      quote,
      items: items || [],
      supplier: supplierProfile
        ? {
            id: supplierProfile.id,
            name: supplierProfile.full_name,
            email: supplierProfile.email,
            avatar_url: supplierProfile.avatar_url,
          }
        : null,
      company: company
        ? {
            id: company.id,
            name: company.name,
            logo_url: company.logo_url,
            banner_url: company.banner_url,
            tagline: company.tagline,
            description: company.description,
            phone: company.phone,
            email: company.email,
            website: company.website,
            city: company.city,
            area: company.area,
            services: company.services,
          }
        : null,
      appearance,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('[quote-share-view] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'שגיאה בטעינת הצעת המחיר' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
