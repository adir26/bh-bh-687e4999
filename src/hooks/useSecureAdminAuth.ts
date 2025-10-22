import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SecureStorage } from '@/utils/secureStorage';

interface AdminSession {
  isAuthenticated: boolean;
  isValidated: boolean;
  sessionExpiry: Date | null;
  sessionToken: string;
}

const ADMIN_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours
const STORAGE_KEY = 'admin_session_v2';
const DEFAULT_SESSION: AdminSession = {
  isAuthenticated: false,
  isValidated: false,
  sessionExpiry: null,
  sessionToken: ''
};

export const useSecureAdminAuth = () => {
  const { user, profile } = useAuth();
  const [adminSession, setAdminSession] = useState<AdminSession>(DEFAULT_SESSION);
  const isValidating = useRef(false);

  const validateAdminAccess = async () => {
    // Prevent concurrent validations
    if (isValidating.current) {
      return adminSession.isAuthenticated && adminSession.isValidated;
    }
    
    isValidating.current = true;
    try {
      // First check if user is authenticated and has admin role in profile
      if (!user || !profile || profile.role !== 'admin') {
        clearAdminSession();
        return false;
      }

      // Check if session exists and is valid
      const storedSession = await getStoredSession();
      if (storedSession && storedSession.sessionExpiry && new Date() < storedSession.sessionExpiry) {
        setAdminSession(storedSession);
        return true;
      }

      // Use new server-side validation function
      const { data: validationResult, error } = await supabase
        .rpc('validate_admin_session', { _user_id: user.id });

      const result = validationResult as { valid: boolean; reason?: string; session_data?: any } | null;

      if (error || !result?.valid) {
        clearAdminSession();
        console.warn('Admin access denied:', result?.reason || error?.message);
        return false;
      }

      // Generate secure session token
      const sessionToken = generateSecureToken();

      // Create new session with server validation
      const newSession: AdminSession = {
        isAuthenticated: true,
        isValidated: true,
        sessionExpiry: new Date(Date.now() + ADMIN_SESSION_DURATION),
        sessionToken
      };

      setAdminSession(newSession);
      await storeSession(newSession);
      return true;

    } catch (error) {
      console.error('Admin validation error:', error);
      clearAdminSession();
      return false;
    } finally {
      isValidating.current = false;
    }
  };

  const generateSecureToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const getStoredSession = async (): Promise<AdminSession | null> => {
    try {
      const stored = await SecureStorage.get(STORAGE_KEY, true);
      if (!stored) return null;

      return {
        ...stored,
        sessionExpiry: new Date(stored.sessionExpiry)
      };
    } catch {
      return null;
    }
  };

  const storeSession = async (session: AdminSession): Promise<void> => {
    try {
      await SecureStorage.set(STORAGE_KEY, session, {
        encrypt: true,
        sensitive: true,
        expiry: ADMIN_SESSION_DURATION
      });
    } catch (error) {
      console.error('Failed to store admin session:', error);
    }
  };

  const clearAdminSession = () => {
    setAdminSession(DEFAULT_SESSION);
    SecureStorage.remove(STORAGE_KEY);
  };

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedSession = await getStoredSession();
      if (!isMounted) return;

      if (storedSession?.sessionExpiry && storedSession.sessionExpiry.getTime() > Date.now()) {
        const isValidated = storedSession.isValidated ?? false;
        setAdminSession({
          ...storedSession,
          // Ensure the hydrated session is marked as validated to prevent re-check loops
          isAuthenticated: Boolean(storedSession.isAuthenticated) && isValidated,
          isValidated
        });
      } else if (storedSession) {
        // Stored session exists but expired – clear it to avoid stale data loops
        setAdminSession(DEFAULT_SESSION);
        SecureStorage.remove(STORAGE_KEY);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const extendSession = async () => {
    if (adminSession.isValidated && adminSession.sessionToken) {
      const extendedSession: AdminSession = {
        ...adminSession,
        sessionExpiry: new Date(Date.now() + ADMIN_SESSION_DURATION)
      };
      setAdminSession(extendedSession);
      await storeSession(extendedSession);
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