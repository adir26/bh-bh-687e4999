/**
 * Utility functions for cleaning up authentication-related storage
 * Used during sign-out and error recovery to ensure no stale data remains
 */

export const clearAuthStorage = (userId?: string) => {
  // Clear user-specific session storage
  if (userId) {
    sessionStorage.removeItem(`redirected_${userId}`);
    sessionStorage.removeItem(`login_tracked_${userId}`);
  }
  
  // Clear general auth-related session storage
  sessionStorage.removeItem('guestMode');
  sessionStorage.removeItem('returnPath');
  sessionStorage.removeItem('pendingAction');
  sessionStorage.removeItem('hasSeenWelcome');
  
  // Clear auth-related local storage
  localStorage.removeItem('signupData');
  
  console.log('[AUTH_CLEANUP] Cleared all auth storage', { userId: userId || 'none' });
};

export const clearUserSpecificFlags = (userId: string) => {
  sessionStorage.removeItem(`redirected_${userId}`);
  sessionStorage.removeItem(`login_tracked_${userId}`);
  console.log('[AUTH_CLEANUP] Cleared user-specific flags', { userId });
};
