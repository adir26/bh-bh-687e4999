import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = resendKey ? new Resend(resendKey) : null;

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find confirmed bookings that need reminders
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'confirmed')
      .is('reminder_sent_at', null)
      .gte('starts_at', now.toISOString())
      .lte('starts_at', twentyFourHoursFromNow.toISOString());

    if (error) throw error;
    if (!bookings || bookings.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders to send', count: 0 }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let sentCount = 0;

    for (const booking of bookings) {
      const startsAt = new Date(booking.starts_at);
      const hoursUntil = (startsAt.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Send reminder if within 24 hours
      if (hoursUntil <= 24) {
        // Fetch profiles
        const { data: supplierProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', booking.supplier_id)
          .single();

        const { data: clientProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', booking.client_id)
          .single();

        if (!supplierProfile || !clientProfile) continue;

        const meetingDate = startsAt.toLocaleDateString('he-IL', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const meetingTime = startsAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
        const timeLabel = hoursUntil <= 2 ? 'בקרוב' : 'מחר';

        if (resend) {
          // Send to both participants
          const recipients = [clientProfile.email, supplierProfile.email].filter(Boolean);
          
          for (const email of recipients) {
            const isSupplier = email === supplierProfile.email;
            const otherName = isSupplier ? clientProfile.full_name : supplierProfile.full_name;

            await resend.emails.send({
              from: "תזכורת פגישה <meetings@resend.dev>",
              to: [email],
              subject: `תזכורת: פגישה ${timeLabel} עם ${otherName || 'משתמש'}`,
              html: `
                <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">🔔 תזכורת פגישה</h2>
                  <p>שלום,</p>
                  <p>תזכורת לפגישה שלך ${timeLabel}:</p>
                  <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #2563eb;">
                    <p><strong>עם:</strong> ${otherName || 'משתמש'}</p>
                    <p><strong>תאריך:</strong> ${meetingDate}</p>
                    <p><strong>שעה:</strong> ${meetingTime}</p>
                    ${booking.location ? `<p><strong>מיקום:</strong> ${booking.location}</p>` : ''}
                    ${booking.notes ? `<p><strong>הערות:</strong> ${booking.notes}</p>` : ''}
                  </div>
                  <p>בברכה,<br>צוות הפלטפורמה</p>
                </div>
              `,
            });
          }
        }

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ reminder_sent_at: now.toISOString() })
          .eq('id', booking.id);
        
        if (updateError) console.warn('Failed to update reminder_sent_at:', updateError);
        sentCount++;
      }
    }

    return new Response(JSON.stringify({ message: 'Reminders processed', count: sentCount }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("Error in send-meeting-reminders:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
