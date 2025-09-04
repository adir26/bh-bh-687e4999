import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, getPostAuthRoute } from '@/utils/authRouting';
import { toast } from 'sonner';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { profile, loading } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('[AUTH_CALLBACK] Starting callback process:', {
          url: window.location.href,
          hash: window.location.hash,
          search: window.location.search
        });

        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AUTH_CALLBACK] Session error:', error);
          toast.error('שגיאה באימות החשבון');
          navigate('/auth');
          return;
        }

        if (data.session?.user) {
          const user = data.session.user;
          console.log('[AUTH_CALLBACK] User authenticated:', {
            userId: user.id,
            email: user.email,
            provider: user.app_metadata?.provider
          });

          // Handle profile upsert for Google OAuth users
          await handleProfileUpsert(user);
          
          // Wait for profile to be loaded by AuthContext
          const waitForProfile = () => {
            if (loading) {
              // Still loading, wait a bit more
              setTimeout(waitForProfile, 100);
              return;
            }
            
            if (profile) {
              const route = getPostAuthRoute({
                role: (profile.role as UserRole) || 'client',
                onboarding_completed: !!profile.onboarding_completed,
                onboarding_step: profile.onboarding_step || null,
                fromPath: null, // New user from callback, no previous path
              });
              console.log('[AUTH_CALLBACK] Navigating to:', route);
              navigate(route, { replace: true });
            } else {
              console.error('[AUTH_CALLBACK] No profile found after loading');
              toast.error('שגיאה בטעינת פרופיל המשתמש');
              navigate('/auth');
            }
          };
          
          waitForProfile();
        } else {
          console.log('[AUTH_CALLBACK] No session found, redirecting to auth');
          navigate('/auth');
        }
      } catch (error) {
        console.error('[AUTH_CALLBACK] Unexpected error:', error);
        toast.error('שגיאה בלתי צפויה באימות');
        navigate('/auth');
      }
    };

    const handleProfileUpsert = async (user: any) => {
      try {
        // Check if this is a Google OAuth user
        const isGoogleOAuth = user.app_metadata?.provider === 'google';
        
        if (!isGoogleOAuth) {
          console.log('[AUTH_CALLBACK] Not a Google OAuth user, skipping profile upsert');
          return;
        }

        console.log('[AUTH_CALLBACK] Processing Google OAuth user profile:', {
          userId: user.id,
          email: user.email,
          metadata: user.user_metadata
        });

        // Extract data from Google metadata
        const googleData = {
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          email: user.email
        };

        // Check if profile already exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id, role, onboarding_completed, full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingProfile) {
          // Update existing profile with Google data
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              full_name: googleData.full_name || existingProfile.full_name,
              avatar_url: googleData.avatar_url || existingProfile.avatar_url,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (updateError) throw updateError;
          
          console.log('[AUTH_CALLBACK] Updated existing profile with Google data');
        } else {
          // Create new profile for Google OAuth user
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: googleData.email,
              full_name: googleData.full_name,
              avatar_url: googleData.avatar_url,
              role: 'client', // Set default role, will be updated in role picker
              onboarding_completed: false,
              onboarding_status: 'not_started',
              onboarding_step: 0, // Step 0 indicates they need role picker
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) throw insertError;
          
          console.log('[AUTH_CALLBACK] Created new profile for Google OAuth user');
        }

        toast.success('התחברת בהצלחה עם Google!');
      } catch (error) {
        console.error('[AUTH_CALLBACK] Error upserting profile:', error);
        toast.error('שגיאה בעדכון פרופיל המשתמש');
      }
    };

    handleAuthCallback();
  }, [navigate, profile, loading]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">מאמת את החשבון...</p>
      </div>
    </div>
  );
};

export default AuthCallback;