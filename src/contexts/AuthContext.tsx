import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'client' | 'supplier' | 'admin';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
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
  getRoute: (isNewUser?: boolean) => string;
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
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, onboarding_completed, created_at, updated_at')
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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AUTH] State change:', { 
          event, 
          hasSession: !!session, 
          userId: session?.user?.id,
          origin: window.location.origin 
        });
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer Supabase calls to prevent deadlock
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH] Initial session check:', { 
        hasSession: !!session, 
        userId: session?.user?.id 
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then((profileData) => {
          setProfile(profileData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    try {
      // Sanitize email - strip RTL marks, spaces, and normalize
      const cleanEmail = email?.replace(/\u200F|\u200E/g, '').trim().toLowerCase();
      
      console.log('[AUTH] SignUp attempt:', { 
        email: cleanEmail, 
        role: metadata?.role, 
        origin: window.location.origin 
      });

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: metadata?.full_name || metadata?.fullName || '',
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
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Sanitize email - strip RTL marks, spaces, and normalize
      const cleanEmail = email?.replace(/\u200F|\u200E/g, '').trim().toLowerCase();
      
      console.log('[AUTH] SignIn attempt:', { 
        email: cleanEmail, 
        origin: window.location.origin 
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        let errorMessage = "שגיאה בהתחברות";
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "פרטי ההתחברות שגויים";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "אנא אמת את כתובת האימייל שלך";
        }
        
        toast({
          title: "שגיאה בהתחברות",
          description: errorMessage,
          variant: "destructive"
        });
        return { error };
      }

      // Fetch profile after successful login
      if (data.user) {
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
      }

      toast({
        title: "התחברת בהצלחה",
        description: "ברוך הבא!"
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error };
    } finally {
      setLoading(false);
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

    const { error } = await supabase
      .from('profiles')
      .update(updates)
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
  };

  const getRoute = (isNewUser?: boolean) => {
    if (!profile) return '/auth';
    
    const { role, onboarding_completed } = profile;
    
    console.log('[AUTH] Route decision:', { 
      role, 
      onboarding_completed, 
      isNewUser 
    });
    
    // Force onboarding for new users or incomplete onboarding
    if (isNewUser || !onboarding_completed) {
      return role === 'supplier' ? '/onboarding/supplier-welcome' : '/onboarding/welcome';
    }
    
    // Redirect to appropriate dashboard based on role
    if (role === 'supplier') return '/supplier-dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/'; // client dashboard/home
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
    getRoute
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};