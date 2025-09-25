import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MeetingNotificationRequest {
  type: 'booking_requested' | 'booking_confirmed' | 'booking_rejected' | 'booking_cancelled';
  booking: {
    id: string;
    starts_at: string;
    ends_at: string;
    notes?: string;
    supplier: {
      name: string;
      email: string;
    };
    client: {
      name: string;
      email: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, booking }: MeetingNotificationRequest = await req.json();
    
    const meetingDate = new Date(booking.starts_at).toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const meetingTime = new Date(booking.starts_at).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const endTime = new Date(booking.ends_at).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let emailResponse;

    switch (type) {
      case 'booking_requested': {
        // Notify supplier about new booking request
        emailResponse = await resend.emails.send({
          from: "פגישות <meetings@resend.dev>",
          to: [booking.supplier.email],
          subject: `בקשת פגישה חדשה מ${booking.client.name}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f2937;">בקשת פגישה חדשה</h2>
              
              <p>שלום ${booking.supplier.name},</p>
              
              <p>קיבלת בקשת פגישה חדשה:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151;">פרטי הפגישה</h3>
                <p><strong>לקוח:</strong> ${booking.client.name}</p>
                <p><strong>תאריך:</strong> ${meetingDate}</p>
                <p><strong>שעה:</strong> ${meetingTime} - ${endTime}</p>
                ${booking.notes ? `<p><strong>הערות:</strong> ${booking.notes}</p>` : ''}
              </div>
              
              <p>אנא אשר או דחה את הפגישה דרך האפליקציה.</p>
              
              <p>בברכה,<br>צוות הפלטפורמה</p>
            </div>
          `,
        });
        break;
      }
      
      case 'booking_confirmed': {
        // Notify client about confirmed booking
        emailResponse = await resend.emails.send({
          from: "פגישות <meetings@resend.dev>",
          to: [booking.client.email],
          subject: `פגישה אושרה עם ${booking.supplier.name}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">הפגישה אושרה!</h2>
              
              <p>שלום ${booking.client.name},</p>
              
              <p>הפגישה שלך אושרה:</p>
              
              <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #059669;">
                <h3 style="margin-top: 0; color: #374151;">פרטי הפגישה</h3>
                <p><strong>ספק:</strong> ${booking.supplier.name}</p>
                <p><strong>תאריך:</strong> ${meetingDate}</p>
                <p><strong>שעה:</strong> ${meetingTime} - ${endTime}</p>
                ${booking.notes ? `<p><strong>הערות:</strong> ${booking.notes}</p>` : ''}
              </div>
              
              <p>נתראה בפגישה!</p>
              
              <p>בברכה,<br>צוות הפלטפורמה</p>
            </div>
          `,
        });
        
        // Generate .ics file content
        const icsContent = generateICSFile(booking, meetingDate, meetingTime, endTime);
        
        // Send calendar invite to both participants
        await resend.emails.send({
          from: "פגישות <meetings@resend.dev>",
          to: [booking.client.email, booking.supplier.email],
          subject: `הזמנה ליומן: פגישה ${booking.client.name} - ${booking.supplier.name}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif;">
              <h3>הוספת פגישה ליומן</h3>
              <p>תאריך: ${meetingDate}</p>
              <p>שעה: ${meetingTime} - ${endTime}</p>
            </div>
          `,
          attachments: [{
            filename: 'meeting.ics',
            content: new TextEncoder().encode(icsContent),
            contentType: 'text/calendar',
          }]
        });
        break;
      }
      
      case 'booking_rejected': {
        // Notify client about rejected booking
        emailResponse = await resend.emails.send({
          from: "פגישות <meetings@resend.dev>",
          to: [booking.client.email],
          subject: `פגישה נדחתה עם ${booking.supplier.name}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">פגישה נדחתה</h2>
              
              <p>שלום ${booking.client.name},</p>
              
              <p>לצערנו, הפגישה שביקשת נדחתה:</p>
              
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #dc2626;">
                <h3 style="margin-top: 0; color: #374151;">פרטי הפגישה</h3>
                <p><strong>ספק:</strong> ${booking.supplier.name}</p>
                <p><strong>תאריך:</strong> ${meetingDate}</p>
                <p><strong>שעה:</strong> ${meetingTime} - ${endTime}</p>
              </div>
              
              <p>אנא נסה לקבוע פגישה בזמן אחר או צור קשר עם הספק ישירות.</p>
              
              <p>בברכה,<br>צוות הפלטפורמה</p>
            </div>
          `,
        });
        break;
      }
      
      case 'booking_cancelled': {
        // Notify supplier about cancelled booking
        emailResponse = await resend.emails.send({
          from: "פגישות <meetings@resend.dev>",
          to: [booking.supplier.email],
          subject: `פגישה בוטלה על ידי ${booking.client.name}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d97706;">פגישה בוטלה</h2>
              
              <p>שלום ${booking.supplier.name},</p>
              
              <p>הפגישה הבאה בוטלה על ידי הלקוח:</p>
              
              <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #d97706;">
                <h3 style="margin-top: 0; color: #374151;">פרטי הפגישה</h3>
                <p><strong>לקוח:</strong> ${booking.client.name}</p>
                <p><strong>תאריך:</strong> ${meetingDate}</p>
                <p><strong>שעה:</strong> ${meetingTime} - ${endTime}</p>
              </div>
              
              <p>השעה חזרה להיות פנויה בלוח הזמנים שלך.</p>
              
              <p>בברכה,<br>צוות הפלטפורמה</p>
            </div>
          `,
        });
        break;
      }
    }

    console.log("Meeting notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error sending meeting notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateICSFile(booking: any, meetingDate: string, meetingTime: string, endTime: string): string {
  const startDate = new Date(booking.starts_at);
  const endDate = new Date(booking.ends_at);
  
  // Format dates for ICS (YYYYMMDDTHHMMSSZ)
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Meeting Platform//Meeting Scheduler//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${booking.id}@meetingplatform.com
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:פגישה: ${booking.client.name} - ${booking.supplier.name}
DESCRIPTION:${booking.notes || 'פגישה עסקית'}
ORGANIZER:mailto:${booking.supplier.email}
ATTENDEE:mailto:${booking.client.email}
ATTENDEE:mailto:${booking.supplier.email}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

serve(handler);