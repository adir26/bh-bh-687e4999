import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AdminSession {
  isAuthenticated: boolean;
  isValidated: boolean;
  sessionExpiry: Date | null;
}

const ADMIN_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours
const STORAGE_KEY = 'admin_session';

export const useSecureAdminAuth = () => {
  const { user, profile } = useAuth();
  const [adminSession, setAdminSession] = useState<AdminSession>({
    isAuthenticated: false,
    isValidated: false,
    sessionExpiry: null
  });

  // Validate admin session on mount and auth changes
  useEffect(() => {
    validateAdminAccess();
  }, [user, profile]);

  const validateAdminAccess = async () => {
    try {
      // First check if user is authenticated and has admin role in profile
      if (!user || !profile || profile.role !== 'admin') {
        clearAdminSession();
        return false;
      }

      // Check if session exists and is valid
      const storedSession = getStoredSession();
      if (storedSession && new Date() < storedSession.sessionExpiry) {
        setAdminSession(storedSession);
        return true;
      }

      // Validate admin credentials in database
      const { data: adminRecord, error } = await supabase
        .from('admin_credentials')
        .select('id, created_at')
        .eq('user_id', user.id)
        .single();

      if (error || !adminRecord) {
        clearAdminSession();
        return false;
      }

      // Create new session
      const newSession: AdminSession = {
        isAuthenticated: true,
        isValidated: true,
        sessionExpiry: new Date(Date.now() + ADMIN_SESSION_DURATION)
      };

      setAdminSession(newSession);
      storeSession(newSession);
      return true;

    } catch (error) {
      console.error('Admin validation error:', error);
      clearAdminSession();
      return false;
    }
  };

  const getStoredSession = (): AdminSession | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored);
      return {
        ...session,
        sessionExpiry: new Date(session.sessionExpiry)
      };
    } catch {
      return null;
    }
  };

  const storeSession = (session: AdminSession) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to store admin session:', error);
    }
  };

  const clearAdminSession = () => {
    setAdminSession({
      isAuthenticated: false,
      isValidated: false,
      sessionExpiry: null
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const extendSession = () => {
    if (adminSession.isValidated) {
      const extendedSession: AdminSession = {
        ...adminSession,
        sessionExpiry: new Date(Date.now() + ADMIN_SESSION_DURATION)
      };
      setAdminSession(extendedSession);
      storeSession(extendedSession);
    }
  };

  const logout = () => {
    clearAdminSession();
  };

  return {
    isAdminAuthenticated: adminSession.isAuthenticated && adminSession.isValidated,
    sessionExpiry: adminSession.sessionExpiry,
    extendSession,
    logout,
    validateAdminAccess
  };
};