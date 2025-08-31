import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole, getPostAuthRoute, getRoleHomeRoute } from '@/utils/authRouting';
import { InputSanitizer } from '@/utils/inputSanitizer';

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  role?: 'client' | 'supplier' | 'admin';
  onboarding_completed?: boolean;
  onboarding_step?: string | null;
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
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any, data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any, data?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  updateOnboardingStep: (step: string, context?: any) => Promise<void>;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          email, 
          full_name, 
          role, 
          onboarding_completed, 
          onboarding_step, 
          onboarding_context, 
          last_onboarding_at, 
          created_at, 
          updated_at
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Set up auth state listener and get initial session
  useEffect(() => {
    let mounted = true;

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;
        
        console.log('[AUTH] Auth state changed:', event, !!session);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && mounted) {
          // Fetch profile synchronously after auth change
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          setLoading(false);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(profileData => {
          if (!mounted) return;
          setProfile(profileData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle navigation when both user and profile are ready
  useEffect(() => {
    if (!user || !profile || loading) return;

    const fromState = (location.state as any)?.from;
    const fromPath = fromState?.pathname || null;
    
    const targetRoute = getPostAuthRoute({
      role: (profile.role as UserRole) || 'client',
      onboarding_completed: !!profile.onboarding_completed,
      onboarding_step: profile.onboarding_step || null,
      fromPath: fromPath,
    });

    // Only navigate if we're not already on the target route
    if (location.pathname !== targetRoute) {
      console.log('[AUTH] Navigating from', location.pathname, 'to', targetRoute);
      navigate(targetRoute, { replace: true });
    }
  }, [user, profile, loading, location.pathname, navigate]);

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
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

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: sanitizedName,
            role: metadata?.role || 'client'
          }
        }
      });

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
        }
        
        toast({
          title: "שגיאה בהרשמה",
          description: errorMessage,
          variant: "destructive"
        });
        return { error };
      }

      // Check if user is immediately available (no email confirmation required)
      if (data.user && data.session) {
        toast({
          title: "הרשמה בוצעה בהצלחה",
          description: "ברוך הבא!"
        });
      } else {
        toast({
          title: "הרשמה בוצעה בהצלחה",
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
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const sanitizedEmail = InputSanitizer.sanitizeEmail(email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

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
        error: { message: 'אירעה שגיאה בהתחברות. אנא נסה שנית.' }
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "שגיאה בהתנתקות",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "התנתקת בהצלחה",
        description: "להתראות!"
      });
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

      const { error } = await supabase
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('id', user.id);

      if (error) {
        toast({
          title: "שגיאה בעדכון פרופיל",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Refresh profile data
        const updatedProfile = await fetchProfile(user.id);
        setProfile(updatedProfile);
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

  const updateOnboardingStep = async (step: string, context?: any) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_step: step,
          onboarding_context: context || {},
          last_onboarding_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating onboarding step:', error);
        return;
      }

      // Update local profile state
      setProfile(prev => prev ? {
        ...prev,
        onboarding_step: step,
        onboarding_context: context || {},
        last_onboarding_at: new Date().toISOString(),
      } : null);

      console.log('[AUTH] Updated onboarding step:', step);
    } catch (error) {
      console.error('Error updating onboarding step:', error);
    }
  };

  const completeOnboarding = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_step: null,
          last_onboarding_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error completing onboarding:', error);
        return;
      }

      // Update local profile state
      setProfile(prev => prev ? {
        ...prev,
        onboarding_completed: true,
        onboarding_step: null,
        last_onboarding_at: new Date().toISOString(),
      } : null);

      console.log('[AUTH] Onboarding completed');

      // Navigate to role home
      const homeRoute = getRoleHomeRoute((profile.role as UserRole) || 'client');
      navigate(homeRoute, { replace: true });

    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updateOnboardingStep,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};