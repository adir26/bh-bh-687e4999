/**
 * Utility functions for cleaning up authentication-related storage
 * Used during sign-out and error recovery to ensure no stale data remains
 */

import { useAuthStore } from '@/stores/authStore';

export const clearAuthStorage = (userId?: string) => {
  // Use Zustand store instead of sessionStorage
  const store = useAuthStore.getState();
  
  // Clear only guest-related state, preserve loginTracked and redirected
  store.setGuestMode(false);
  store.setAppMode(null);
  store.setReturnPath(null);
  store.setPendingAction(null);
  store.setGuestBannerDismissed(false);
  store.setHasSeenWelcome(false);
  
  // Clear ALL Supabase auth keys from localStorage
  const supabaseKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('sb-') || 
    key.includes('auth-token') ||
    key.includes('supabase')
  );
  supabaseKeys.forEach(key => localStorage.removeItem(key));
  
  // Clear auth-related local storage (kept for backwards compatibility)
  localStorage.removeItem('signupData');
  
  // Selective sessionStorage clear (don't clear authStore data)
  const sessionKeysToRemove = ['guestMode', 'appMode', 'returnPath', 'pendingAction'];
  sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
  
  console.log('[AUTH_CLEANUP] Cleared auth storage (preserved tracking)', { 
    userId: userId || 'none',
    clearedKeys: supabaseKeys.length 
  });
};

export const clearUserSpecificFlags = (userId: string) => {
  const store = useAuthStore.getState();
  store.clearUserState(userId);
  console.log('[AUTH_CLEANUP] Cleared user-specific flags', { userId });
};
