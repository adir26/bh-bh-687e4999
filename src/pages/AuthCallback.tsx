import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { getRoute } = useAuth();

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
          navigate('/auth');
          return;
        }

        if (data.session?.user) {
          console.log('[AUTH_CALLBACK] User authenticated:', {
            userId: data.session.user.id,
            email: data.session.user.email
          });
          
          // Wait for auth context to update and fetch profile
          setTimeout(() => {
            const route = getRoute(true); // Mark as new user from callback
            console.log('[AUTH_CALLBACK] Navigating to:', route);
            navigate(route);
          }, 1500); // Increased wait time for profile fetch
        } else {
          console.log('[AUTH_CALLBACK] No session found, redirecting to auth');
          navigate('/auth');
        }
      } catch (error) {
        console.error('[AUTH_CALLBACK] Unexpected error:', error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, getRoute]);

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