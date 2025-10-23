import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SecureStorage } from '@/utils/secureStorage';

type AdminAuthStatus = 'idle' | 'checking' | 'authenticated' | 'error';

interface AdminSession {
  isAuthenticated: boolean;
  isValidated: boolean;
  sessionExpiry: Date | null;
  sessionToken: string;
  userId: string;
}

const ADMIN_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours
const STORAGE_KEY = 'admin_session_v2';

export const useSecureAdminAuth = () => {
  const { user, profile } = useAuth();
  const [adminSession, setAdminSession] = useState<AdminSession>({
    isAuthenticated: false,
    isValidated: false,
    sessionExpiry: null,
    sessionToken: '',
    userId: ''
  });
  const [status, setStatus] = useState<AdminAuthStatus>('idle');
  const [lastError, setLastError] = useState<string | null>(null);
  const isValidating = useRef(false);

  const validateAdminAccess = async () => {
    // Prevent concurrent validations
    if (isValidating.current) {
      return adminSession.isAuthenticated && adminSession.isValidated;
    }

    isValidating.current = true;
    setStatus('checking');
    setLastError(null);
    try {
      // First check if user is authenticated and has admin role in profile
      if (!user || !profile || profile.role !== 'admin') {
        clearAdminSession('missing-admin-role');
        return false;
      }

      // Check if session exists, is valid, AND belongs to current user
      const storedSession = await getStoredSession();
      if (
        storedSession &&
        storedSession.userId === user.id &&
        storedSession.sessionExpiry &&
        new Date() < storedSession.sessionExpiry
      ) {
        setAdminSession(storedSession);
        setStatus('authenticated');
        setLastError(null);
        return true;
      }

      // Use new server-side validation function
      const { data: validationResult, error } = await supabase
        .rpc('validate_admin_session', { _user_id: user.id });

      const result = validationResult as { valid: boolean; reason?: string; session_data?: any } | null;

      if (error || !result?.valid) {
        const reason = result?.reason || error?.message || 'validation-failed';
        clearAdminSession(reason);
        console.warn('Admin access denied:', reason);
        return false;
      }

      // Generate secure session token
      const sessionToken = generateSecureToken();

      // Create new session with server validation
      const newSession: AdminSession = {
        isAuthenticated: true,
        isValidated: true,
        sessionExpiry: new Date(Date.now() + ADMIN_SESSION_DURATION),
        sessionToken,
        userId: user.id
      };

      setAdminSession(newSession);
      setStatus('authenticated');
      setLastError(null);
      await storeSession(newSession);
      return true;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown-error';
      console.error('Admin validation error:', error);
      clearAdminSession(message);
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

  const clearAdminSession = (reason?: string) => {
    setAdminSession({
      isAuthenticated: false,
      isValidated: false,
      sessionExpiry: null,
      sessionToken: '',
      userId: ''
    });
    SecureStorage.remove(STORAGE_KEY);
    if (reason) {
      setStatus('error');
      setLastError(reason);
    } else {
      setStatus('idle');
      setLastError(null);
    }
  };

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
    validateAdminAccess,
    status,
    lastError
  };
};