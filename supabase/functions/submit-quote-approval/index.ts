import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApprovalRequest {
  token: string;
  clientName: string;
  clientIdNumber: string;
  clientPhone: string;
  clientEmail: string;
  signatureDataUrl?: string;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  consentAccepted: boolean;
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW = 10 * 60 * 1000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('cf-connecting-ip') || 
               'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    const body: ApprovalRequest = await req.json();
    const { token, clientName, clientIdNumber, clientPhone, clientEmail, 
            signatureDataUrl, status, rejectionReason, consentAccepted } = body;

    // Validation
    if (!token || !clientName || !clientIdNumber || !clientPhone || !clientEmail || !status) {
      return new Response(JSON.stringify({ error: 'חסרים שדות חובה' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (!consentAccepted) {
      return new Response(JSON.stringify({ error: 'יש לאשר את תנאי השימוש' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (status === 'approved' && !signatureDataUrl) {
      return new Response(JSON.stringify({ error: 'חתימה נדרשת לאישור' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Rate limiting
    const rateLimitKey = `${ip}:${token}`;
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(JSON.stringify({ error: 'יותר מדי ניסיונות. נסה שוב מאוחר יותר' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify token and get quote
    const { data: shareLink, error: tokenError } = await supabase
      .from('quote_share_links')
      .select('quote_id, expires_at')
      .eq('token', token)
      .single();

    if (tokenError || !shareLink) {
      return new Response(JSON.stringify({ error: 'קישור לא תקף' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (new Date(shareLink.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'תוקף הקישור פג' }), {
        status: 410,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('id, supplier_id, status')
      .eq('id', shareLink.quote_id)
      .single();

    if (quoteError || !quote) {
      return new Response(JSON.stringify({ error: 'הצעת מחיר לא נמצאה' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (quote.status !== 'sent') {
      return new Response(JSON.stringify({ 
        error: `לא ניתן לאשר הצעה במצב: ${quote.status}` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Upload signature to private storage
    let signaturePath = null;
    let signatureHash = null;
    
    if (status === 'approved' && signatureDataUrl) {
      const base64Data = signatureDataUrl.split(',')[1];
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', binaryData);
      signatureHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const approvalId = crypto.randomUUID();
      const fileName = `${approvalId}/signature.png`;
      
      const { error: uploadError } = await supabase.storage
        .from('quote-signatures')
        .upload(fileName, binaryData, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        console.error('Failed to upload signature:', uploadError);
        throw new Error('שגיאה בשמירת החתימה');
      }

      signaturePath = fileName;
    }

    // Insert approval record
    const consentText = status === 'approved' 
      ? `אני מאשר/ת את הצעת המחיר ומסכים/ה לתנאי השירות. חתימה דיגיטלית בוצעה בתאריך ${new Date().toLocaleString('he-IL')}`
      : `אני מבקש/ת לדחות את הצעת המחיר. ${rejectionReason || ''}`;

    const { data: approval, error: insertError } = await supabase
      .from('quote_approvals')
      .insert({
        quote_id: quote.id,
        supplier_id: quote.supplier_id,
        share_token: token,
        client_name: clientName,
        client_id_number: clientIdNumber,
        client_phone: clientPhone,
        client_email: clientEmail,
        approval_date: new Date().toISOString(),
        status,
        rejection_reason: rejectionReason,
        signature_storage_path: signaturePath,
        signature_hash: signatureHash,
        ip_address: ip,
        user_agent: userAgent,
        consent_text: consentText
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return new Response(JSON.stringify({ 
          error: 'כבר שלחת אישור להצעה זו' 
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      throw insertError;
    }

    console.log(`Quote approval recorded: ${approval.id} (${status})`);

    return new Response(JSON.stringify({
      success: true,
      approvalId: approval.id,
      status,
      message: status === 'approved' ? 'הצעת המחיר אושרה בהצלחה!' : 'דחיית ההצעה נרשמה'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('[submit-quote-approval] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'שגיאה בשרת' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);
