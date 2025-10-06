import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole, getPostAuthRoute, getRoleHomeRoute, routeAfterLogin } from '@/utils/authRouting';
import { InputSanitizer } from '@/utils/inputSanitizer';
import { useProfile } from '@/hooks/useProfile';
import { withTimeout } from '@/lib/withTimeout';
import { clearWelcomeState } from '@/hooks/useGuestMode';
import { clearAuthStorage, clearUserSpecificFlags } from '@/utils/authCleanup';
import { useAuthStore } from '@/stores/authStore';

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'client' | 'supplier' | 'admin';
  onboarding_completed?: boolean;
  onboarding_status?: 'not_started' | 'in_progress' | 'completed';
  onboarding_step?: number;
  onboarding_data?: any;
  onboarding_version?: number;
  onboarding_completed_at?: string;
  first_login_at?: string;
  last_login_at?: string;
  onboarding_context?: any;
  last_onboarding_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileError: any;
  refreshProfile: () => void;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any, data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any, data?: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  updateOnboardingStep: (step: number, data?: any) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Use useProfile hook instead of manual loading state
  const { data: profile, isLoading: loading, error: profileError, refetch: refreshProfile } = useProfile(user?.id);

  // Set up auth state listener and get initial session
  useEffect(() => {
    let mounted = true;

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;
        
        // If we're logging out, ignore all auth changes except SIGNED_OUT
        if (isLoggingOut && event !== 'SIGNED_OUT') {
          console.log('[AUTH] Ignoring auth change during logout:', event);
          return;
        }
        
        console.log('[AUTH] Auth state changed:', event, !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Reset logout flag when signed out
        if (event === 'SIGNED_OUT') {
          setIsLoggingOut(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Centralized post-auth redirect logic - Task 1
  useEffect(() => {
    // Don't redirect if we're logging out
    if (isLoggingOut) return;
    
    if (!user || !profile || loading) return;

    // Use Zustand store instead of sessionStorage
    const { guestMode: wasGuest, returnPath, pendingAction, setLoginTracked, setRedirected, loginTracked, redirected } = useAuthStore.getState();

    // Track login time once per session
    const trackLoginTime = async () => {
      try {
        await supabase
          .from('profiles')
          .update({
            last_login_at: new Date().toISOString(),
            first_login_at: (profile as Profile).first_login_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error tracking login time:', error);
      }
    };

    if (!loginTracked[user.id]) {
      trackLoginTime();
      setLoginTracked(user.id, true);
    }

    console.log('[AUTH] User and profile loaded:', {
      userId: user.id,
      role: (profile as Profile)?.role,
      onboarding_completed: (profile as Profile)?.onboarding_completed,
      onboarding_step: (profile as Profile)?.onboarding_step,
      onboarding_status: (profile as Profile)?.onboarding_status,
      currentPath: location.pathname
    });

    // Centralized post-auth redirect - single source of truth
    const handlePostAuthRedirect = () => {
      try {
        const currentPath = location.pathname;
        
        // Skip redirect logic for certain paths to avoid loops
        if (currentPath.startsWith('/onboarding') || 
            currentPath.startsWith('/admin') ||
            currentPath === '/auth/callback') {
          return;
        }

        // Handle guest-to-authenticated transition
        if (wasGuest) {
          console.log('[AUTH] Guest-to-authenticated transition detected');
          
          // Clear all guest and welcome state
          clearWelcomeState();
          
          // If there's a return path, go there without guest params
          if (returnPath && returnPath !== '/auth') {
            console.log('[AUTH] Returning to path after guest login:', returnPath);
            useAuthStore.getState().setReturnPath(null);
            useAuthStore.getState().setPendingAction(null);
            navigate(returnPath, { replace: true });
            return;
          }
        } else {
          // For normal logins/signups, also clear welcome state to prevent showing welcome again
          useAuthStore.getState().setHasSeenWelcome(false);
        }

        // Get the destination based on current auth state using routeAfterLogin
        const destination = routeAfterLogin(profile);

        console.log('[AUTH] Post-auth redirect decision:', {
          currentPath,
          destination,
          shouldRedirect: currentPath !== destination,
          wasGuest,
          returnPath,
          pendingAction
        });

        // Only navigate if we're not already at the correct destination
        if (currentPath !== destination && !redirected[user.id]) {
          console.log('[AUTH] Redirecting from', currentPath, 'to', destination);
          setRedirected(user.id, true);
          navigate(destination, { replace: true });
        }
      } catch (error) {
        console.error('[AUTH] Navigation error:', error);
        // Clear problematic flags on error
        if (user?.id) {
          clearUserSpecificFlags(user.id);
        }
      }
    };

    // Small delay to ensure all auth state is settled
    const timeoutId = setTimeout(handlePostAuthRedirect, 100);
    
    // Cleanup timeout on unmount or dependency change
    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, profile, loading, location.pathname, navigate, isLoggingOut]);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      // Enhanced input sanitization and validation
      const sanitizedEmail = InputSanitizer.sanitizeEmail(email);
      const sanitizedName = InputSanitizer.sanitizeText(metadata?.full_name || metadata?.fullName || '', { maxLength: 100 });
      
      // Validate password strength
      const passwordValidation = InputSanitizer.validatePassword(password);
      if (!passwordValidation.isValid) {
        toast({
          title: "סיסמה לא תקינה",
          description: passwordValidation.errors[0],
          variant: "destructive"
        });
        return { error: { message: passwordValidation.errors[0] } };
      }
      
      console.log('[AUTH] SignUp attempt:', { 
        email: sanitizedEmail, 
        role: metadata?.role, 
        origin: window.location.origin 
      });

      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: sanitizedName,
              role: metadata?.role || 'client',
              onboarding_completed: false,
              onboarding_status: 'not_started',
              onboarding_step: 0
            }
          }
        }),
        12000
      );

      if (error) {
        let errorMessage = "שגיאה בהרשמה";
        if (error.message.includes('User already registered')) {
          errorMessage = "המשתמש כבר רשום במערכת";
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = "הסיסמה חייבת להכיל לפחות 6 תווים";
        } else if (error.message.includes('Unable to validate email address')) {
          errorMessage = "כתובת האימייל לא תקינה";
        } else if (error.message.includes('Signup is disabled')) {
          errorMessage = "ההרשמה מושבתת זמנית";
        } else if (error.message.includes('duplicate') || error.message.includes('23505')) {
          errorMessage = "אירעה שגיאה בשמירת הנתונים. אנא נסה שוב במספר שניות";
        }
        
        console.error('[AUTH] Signup error details:', {
          message: error.message,
          code: error.code,
          details: error
        });
        
        toast({
          title: "שגיאה בהרשמה",
          description: errorMessage,
          variant: "destructive"
        });
        return { error: { ...error, message: errorMessage } };
      }

      // Check if user is immediately available (no email confirmation required)
      if (data.user && data.session) {
        toast({
          title: "הרשמה בוצעה בהצלחה",
          description: "ברוך הבא!"
        });
      } else {
        toast({
          title: "הרשמה بוצעה בהצלחה",
          description: "אנא בדוק את האימייל שלך לאישור החשבון"
        });
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "שגיאה במערכת",
        description: "אירעה שגיאה לא צפויה. אנא נסו שוב מאוחר יותר.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const sanitizedEmail = InputSanitizer.sanitizeEmail(email);
      
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        }),
        12000
      );

      if (error) {
        console.error('SignIn error:', error);
        let errorMessage = "שגיאה בהתחברות";
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "אימייל או סיסמה שגויים";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "האימייל לא אושר. אנא בדקו את תיבת הדואר";
        } else if (error.message.includes('too many requests')) {
          errorMessage = "יותר מדי ניסיונות התחברות. אנא נסו שוב מאוחר יותר";
        }
        
        toast({
          title: "שגיאה בהתחברות",
          description: errorMessage,
          variant: "destructive"
        });
        
        return { error };
      }

      // Profile fetch and navigation will be handled by useEffect
      console.log('[AUTH] Login successful, profile and navigation handled by useEffect');

      toast({
        title: "התחברת בהצלחה",
        description: "ברוך הבא!",
      });

      return { data, error: null };
    } catch (error) {
      console.error('SignIn error:', error);
      toast({
        title: "שגיאה במערכת",
        description: "אירעה שגיאה לא צפויה. אנא נסה שנית.",
        variant: "destructive"
      });
      return { 
        error: { message: 'אירעה שגיאה בהתחברות. אנا נסה שנית.' }
      };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('[AUTH] Starting Google OAuth signin');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        let errorMessage = "שגיאה בהתחברות עם Google";
        
        if (error.message.includes('popup')) {
          errorMessage = "החלון הקופץ נחסם. אנא אפשר חלונות קופצים ונסה שוב";
        } else if (error.message.includes('network')) {
          errorMessage = "בעיית רשת. אנא בדוק את החיבור לאינטרנט";
        }
        
        toast({
          title: "שגיאה בהתחברות",
          description: errorMessage,
          variant: "destructive"
        });
        
        return { error };
      }

      console.log('[AUTH] Google OAuth initiated successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      toast({
        title: "שגיאה במערכת",
        description: "אירעה שגיאה בהתחברות עם Google. אנא נסה שנית.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('[AUTH] Starting sign out process');
      setIsLoggingOut(true);
      const currentUserId = user?.id;
      
      // 1. Clear state FIRST to prevent race conditions
      setUser(null);
      setSession(null);
      
      // 2. Clear ALL auth-related storage
      clearAuthStorage(currentUserId);
      
      // 3. Call Supabase signOut (clears server-side session)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AUTH] Sign out error:', error);
        // Don't show error to user - we already cleared everything
      } else {
        console.log('[AUTH] Sign out successful');
      }
      
      // 4. Show success toast
      toast({
        title: "התנתקת בהצלחה",
        description: "להתראות!"
      });
      
      // 5. Navigate to auth page
      navigate('/auth', { replace: true });
    } catch (error: any) {
      console.error('[AUTH] SignOut unexpected error:', error);
      
      // Still clear everything even on error
      setUser(null);
      setSession(null);
      clearAuthStorage(user?.id);
      setIsLoggingOut(false);
      
      // Navigate anyway
      navigate('/auth', { replace: true });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Enhanced sanitization of updates
      const sanitizedUpdates: any = {};
      
      if (updates.full_name) {
        sanitizedUpdates.full_name = InputSanitizer.sanitizeText(updates.full_name, { maxLength: 100 });
      }
      if (updates.email) {
        sanitizedUpdates.email = InputSanitizer.sanitizeEmail(updates.email);
      }
      
      // Filter out security-sensitive fields that users can't update
      const securityFields = ['role', 'id', 'created_at', 'updated_at'];
      Object.keys(updates).forEach(key => {
        if (!securityFields.includes(key) && updates[key as keyof Profile] !== undefined) {
          sanitizedUpdates[key] = updates[key as keyof Profile];
        }
      });

      const { data, error }: any = await withTimeout(
        supabase
          .from('profiles')
          .update(sanitizedUpdates)
          .eq('id', user.id)
          .select(),
        12000
      );

      if (error) {
        toast({
          title: "שגיאה בעדכון פרופיל",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Refresh profile data using React Query
        await refreshProfile();
        toast({
          title: "פרופיל עודכן בהצלחה"
        });
      }

      return { error };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error: error as Error };
    }
  };

  const updateOnboardingStep = async (step: number, data?: any) => {
    if (!user || !profile) return;

    try {
      const updateData: any = {
        onboarding_step: step,
        onboarding_status: step > 0 ? 'in_progress' : 'not_started',
        last_onboarding_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save comprehensive data to onboarding_data
      if (data) {
        updateData.onboarding_data = {
          ...(profile as Profile).onboarding_data,
          ...data,
          updated_at: new Date().toISOString(),
          step: step
        };
      }

      const { error }: any = await withTimeout(
        supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id)
          .select(),
        12000
      );

      if (error) {
        console.error('Error updating onboarding step:', error);
        return;
      }

      // Refresh profile data using React Query
      await refreshProfile();
      console.log('[AUTH] Updated onboarding step:', step, 'with data:', data);
    } catch (error) {
      console.error('Error updating onboarding step:', error);
    }
  };

  const completeOnboarding = async () => {
    if (!user || !profile) return;

    try {
      const { error }: any = await withTimeout(
        supabase
          .from('profiles')
          .update({
            onboarding_completed: true,
            onboarding_status: 'completed',
            onboarding_step: 0,
            onboarding_completed_at: new Date().toISOString(),
            last_onboarding_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select(),
        12000
      );

      if (error) {
        console.error('Error completing onboarding:', error);
        return;
      }

      // Refresh profile data using React Query
      await refreshProfile();
      console.log('[AUTH] Onboarding completed');

      // Clear redirect flag to allow fresh centralized navigation
      sessionStorage.removeItem(`redirected_${user.id}`);

      // Let centralized post-auth redirect handle navigation
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const value = {
    user,
    session,
    profile: profile as Profile | null,
    loading,
    profileError,
    refreshProfile,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    updateOnboardingStep,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};