import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShareViewRequest {
  token: string;
}

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

    // Update accessed_at
    await supabase
      .from('quote_share_links')
      .update({ accessed_at: new Date().toISOString() })
      .eq('id', shareLink.id);

    console.log('[quote-share-view] Successfully fetched quote:', quote.id);

    return new Response(JSON.stringify({
      success: true,
      quote,
      items: items || []
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
