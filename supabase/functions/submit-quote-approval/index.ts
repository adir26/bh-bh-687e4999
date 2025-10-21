import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Normalize IP address to valid INET format
function normalizeIp(ip: string): string {
  if (!ip || ip === 'unknown') {
    return '0.0.0.0';
  }
  
  // Basic IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts.every(part => part >= 0 && part <= 255)) {
      return ip;
    }
  }
  
  // Basic IPv6 validation (simplified)
  if (ip.includes(':')) {
    return ip; // Let PostgreSQL validate it
  }
  
  return '0.0.0.0';
}

interface ApprovalRequest {
  token: string;
  clientName: string;
  clientIdNumber: string;
  clientPhone: string;
  clientEmail?: string;
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
    const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                  req.headers.get('cf-connecting-ip') || 
                  'unknown';
    const ip = normalizeIp(rawIp);
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    console.log('[submit-quote-approval] Request received:', { ip: rawIp, normalizedIp: ip });
    
    const body: ApprovalRequest = await req.json();
    const { token, clientName, clientIdNumber, clientPhone, clientEmail, 
            signatureDataUrl, status, rejectionReason, consentAccepted } = body;

    // Check if this is a quick reject (skip validations)
    const isQuickReject = clientName === 'Anonymous Rejection' && status === 'rejected';

    // Validation (skip for quick reject)
    if (!isQuickReject) {
      if (!token || !clientName || !clientIdNumber || !clientPhone || !status) {
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
    } else {
      // For quick reject, ensure basic token validation only
      if (!token || !status) {
        return new Response(JSON.stringify({ error: 'חסרים שדות חובה' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
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

    console.log('[submit-quote-approval] Validating token:', token);

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
      console.error('[submit-quote-approval] Quote not found:', quoteError);
      return new Response(JSON.stringify({ error: 'הצעת מחיר לא נמצאה' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('[submit-quote-approval] Quote validated:', { quoteId: quote.id, status: quote.status });

    if (quote.status !== 'sent') {
      console.log('[submit-quote-approval] Quote not in sent status - rejecting approval attempt');
      return new Response(JSON.stringify({ 
        error: 'ההצעה אינה במצב נשלחה (sent). אם ההצעה כבר אושרה/נדחתה – יש לשלוח אותה מחדש כדי לאפשר פעולה נוספת.',
        currentStatus: quote.status
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Upload signature to private storage
    let signaturePath = null;
    let signatureHash = null;
    
    if (status === 'approved' && signatureDataUrl) {
      console.log('[submit-quote-approval] Processing signature upload');

      const base64Data = signatureDataUrl.split(',')[1];
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      const hashBuffer = await crypto.subtle.digest('SHA-256', binaryData);
      signatureHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const approvalId = crypto.randomUUID();
      const fileName = `${approvalId}/signature.png`;

      // Create Blob for upload
      const signatureBlob = new Blob([binaryData], { type: 'image/png' });

      try {
        const { error: uploadError } = await supabase.storage
          .from('quote-signatures')
          .upload(fileName, signatureBlob, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }
      } catch (uploadError) {
        console.error('[submit-quote-approval] Signature upload failed', {
          quoteId: quote.id,
          supplierId: quote.supplier_id,
          fileName,
          error: uploadError
        });

        return new Response(JSON.stringify({
          error: 'לא הצלחנו לשמור את החתימה. אנא נסו שוב או פנו לצוות התמיכה שלנו.'
        }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      console.log('[submit-quote-approval] Signature uploaded successfully:', fileName);
      signaturePath = fileName;
    }

    // Insert approval record
    const consentText = status === 'approved' 
      ? `אני מאשר/ת את הצעת המחיר ומסכים/ה לתנאי השירות. חתימה דיגיטלית בוצעה בתאריך ${new Date().toLocaleString('he-IL')}`
      : `אני מבקש/ת לדחות את הצעת המחיר. ${rejectionReason || ''}`;

    console.log('[submit-quote-approval] Creating approval record:', { 
      quoteId: quote.id, 
      status, 
      hasSignature: !!signaturePath,
      ip 
    });

    const { data: approval, error: insertError } = await supabase
      .from('quote_approvals')
      .insert({
        quote_id: quote.id,
        supplier_id: quote.supplier_id,
        share_token: token,
        client_name: clientName,
        client_id_number: clientIdNumber,
        client_phone: clientPhone,
        client_email: clientEmail || null,
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
      console.error('[submit-quote-approval] Insert error:', insertError);
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

    console.log('[submit-quote-approval] Quote approval recorded successfully:', { 
      approvalId: approval.id, 
      status,
      quoteId: quote.id 
    });

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
