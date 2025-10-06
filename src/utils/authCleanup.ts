/**
 * Utility functions for cleaning up authentication-related storage
 * Used during sign-out and error recovery to ensure no stale data remains
 */

import { useAuthStore } from '@/stores/authStore';

export const clearAuthStorage = (userId?: string) => {
  // Use Zustand store instead of sessionStorage
  const store = useAuthStore.getState();
  
  // Clear user-specific state
  if (userId) {
    store.clearUserState(userId);
  }
  
  // Clear all guest and auth state
  store.clearAllAuth();
  
  // Clear auth-related local storage (kept for backwards compatibility)
  localStorage.removeItem('signupData');
  
  console.log('[AUTH_CLEANUP] Cleared all auth storage', { userId: userId || 'none' });
};

export const clearUserSpecificFlags = (userId: string) => {
  const store = useAuthStore.getState();
  store.clearUserState(userId);
  console.log('[AUTH_CLEANUP] Cleared user-specific flags', { userId });
};
