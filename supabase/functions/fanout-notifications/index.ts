import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  notification_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  payload: Record<string, any>;
  email_opt_in: boolean;
  push_opt_in: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notification: NotificationPayload = await req.json();
    console.log('Processing notification:', notification);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', notification.user_id)
      .single();

    if (!profile?.email) {
      console.log('No email found for user:', notification.user_id);
      return new Response(JSON.stringify({ success: true, message: 'No email to send to' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send email notification if user opted in
    if (notification.email_opt_in) {
      try {
        console.log('Sending email notification to:', profile.email);
        
        // For now, just log the email that would be sent
        // In production, you would integrate with Resend or another email service
        const emailContent = {
          to: profile.email,
          subject: notification.title,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                ${notification.title}
              </h2>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                ${notification.message}
              </p>
              <div style="margin-top: 20px; padding: 15px; background-color: #f7fafc; border-right: 4px solid #3182ce;">
                <p style="margin: 0; color: #2d3748; font-size: 14px;">
                  קיבלת התראה זו מכיוון שבחרת לקבל עדכונים. 
                  <a href="${supabaseUrl}/notification-preferences" style="color: #3182ce;">שנה העדפות התראות</a>
                </p>
              </div>
            </div>
          `
        };
        
        console.log('Email would be sent:', emailContent);
        
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }

    // Handle push notifications if user opted in
    if (notification.push_opt_in) {
      try {
        console.log('Push notification would be sent to user:', notification.user_id);
        
        // For now, just log the push notification that would be sent
        // In production, you would integrate with FCM or Expo push notifications
        const pushPayload = {
          title: notification.title,
          body: notification.message,
          data: notification.payload
        };
        
        console.log('Push notification payload:', pushPayload);
        
      } catch (pushError) {
        console.error('Failed to send push notification:', pushError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Notification processed successfully',
      email_sent: notification.email_opt_in,
      push_sent: notification.push_opt_in
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing notification:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});