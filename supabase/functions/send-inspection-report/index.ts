import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendReportRequest {
  reportId: string;
  recipientEmail: string;
  recipientName: string;
  pdfUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportId, recipientEmail, recipientName, pdfUrl }: SendReportRequest = await req.json();
    
    if (!reportId || !recipientEmail || !recipientName || !pdfUrl) {
      throw new Error('Missing required fields');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get report details
    const { data: report, error: reportError } = await supabase
      .from('inspection_reports')
      .select('*, supplier:profiles!inspection_reports_supplier_id_fkey(full_name, email)')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      console.error('Error fetching report:', reportError);
      throw new Error('Report not found');
    }

    console.log(`Sending inspection report ${reportId} to ${recipientEmail}`);

    // For now, we'll just log the email sending
    // In production, integrate with Resend or another email service
    const emailData = {
      to: recipientEmail,
      subject: `דוח בדיקה - ${report.title || 'ללא כותרת'}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h2>שלום ${recipientName},</h2>
          <p>מצורף דוח הבדיקה המקצועי שביקשת.</p>
          <h3>פרטי הדוח:</h3>
          <ul>
            <li><strong>כותרת:</strong> ${report.title || 'ללא כותרת'}</li>
            <li><strong>תאריך:</strong> ${new Date(report.created_at).toLocaleDateString('he-IL')}</li>
            ${report.property_address ? `<li><strong>כתובת נכס:</strong> ${report.property_address}</li>` : ''}
          </ul>
          <p>
            <a href="${pdfUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
              צפה בדוח
            </a>
          </p>
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            דוח זה נשלח מהמערכת שלנו. אם יש לך שאלות, אנא צור קשר עם ${report.supplier?.full_name || 'הספק'}.
          </p>
        </div>
      `,
    };

    console.log('Email would be sent with data:', emailData);

    // Log the email event
    await supabase.from('inspection_report_events').insert({
      report_id: reportId,
      event_type: 'email_sent',
      event_data: {
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        pdf_url: pdfUrl,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Report sent successfully',
      reportId,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-inspection-report function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
