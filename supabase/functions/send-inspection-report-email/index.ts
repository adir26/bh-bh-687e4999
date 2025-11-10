import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  reportId: string;
  to: string;
  subject?: string;
  message?: string;
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { reportId, to, subject, message }: EmailRequest = await req.json();

    if (!reportId || !to) {
      return new Response(JSON.stringify({ error: 'reportId and to are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if PDF already exists
    const { data: report } = await supabase
      .from('inspection_reports')
      .select('final_pdf_path')
      .eq('id', reportId)
      .single();

    let pdfPath = report?.final_pdf_path;

    // Generate PDF if it doesn't exist
    if (!pdfPath) {
      const genResponse = await fetch(
        `${supabaseUrl}/functions/v1/generate-inspection-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ reportId, upload: true }),
        }
      );

      const genData = await genResponse.json();
      if (!genData.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Extract path from URL or get it from database
      const { data: updatedReport } = await supabase
        .from('inspection_reports')
        .select('final_pdf_path')
        .eq('id', reportId)
        .single();
      
      pdfPath = updatedReport?.final_pdf_path;
    }

    if (!pdfPath) {
      throw new Error('PDF path not found');
    }

    // Download PDF from storage
    const { data: pdfData, error: downloadError } = await supabase.storage
      .from('inspection-reports')
      .download(pdfPath);

    if (downloadError || !pdfData) {
      throw new Error('Failed to download PDF from storage');
    }

    // Convert to base64
    const bytes = new Uint8Array(await pdfData.arrayBuffer());
    const base64 = btoa(String.fromCharCode(...bytes));

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bonimpo Reports <reports@bonimpo.app>',
        to: [to],
        subject: subject || 'דוח בדק בית - Inspection Report',
        html: message || '<p>נא למצוא בקובץ המצורף את דוח הבדיקה המלא.</p><p>Please find attached your inspection report.</p>',
        attachments: [
          {
            filename: `inspection-${reportId}.pdf`,
            content: base64,
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    // Log analytics event
    await supabase.from('pdf_events').insert({
      report_id: reportId,
      context: 'inspection',
      event_type: 'email_sent',
      meta: { to }
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending inspection report email:', error);
    
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

serve(handler);
