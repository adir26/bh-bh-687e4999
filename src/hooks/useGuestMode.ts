import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export interface GuestModeState {
  isGuestMode: boolean;
  isAppMode: boolean; // iOS app vs web browser
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  attemptedAction: string | null;
  setAttemptedAction: (action: string | null) => void;
}

export const useGuestMode = (): GuestModeState => {
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [attemptedAction, setAttemptedAction] = useState<string | null>(null);
  
  const urlParams = new URLSearchParams(location.search);
  const isGuestMode = urlParams.get('guest') === '1';
  const isAppMode = urlParams.get('app') === 'ios';

  // Store guest mode state in sessionStorage for navigation persistence
  useEffect(() => {
    if (isGuestMode) {
      sessionStorage.setItem('guestMode', 'true');
      if (isAppMode) {
        sessionStorage.setItem('appMode', 'ios');
      }
    }
  }, [isGuestMode, isAppMode]);

  return {
    isGuestMode,
    isAppMode,
    showLoginModal,
    setShowLoginModal,
    attemptedAction,
    setAttemptedAction
  };
};

// Helper function to check if user is in guest mode from sessionStorage
export const isInGuestMode = (): boolean => {
  return sessionStorage.getItem('guestMode') === 'true';
};

// Helper function to clear guest mode
export const clearGuestMode = (): void => {
  sessionStorage.removeItem('guestMode');
  sessionStorage.removeItem('appMode');
};

// Helper function to clear welcome screen flag and guest mode when user authenticates
export const clearWelcomeState = (): void => {
  sessionStorage.removeItem('hasSeenWelcome');
  sessionStorage.removeItem('guestMode');
  sessionStorage.removeItem('appMode');
  sessionStorage.removeItem('guestBannerDismissed');
};

// Helper function to get guest mode URL params
export const getGuestModeParams = (): string => {
  const isGuest = sessionStorage.getItem('guestMode') === 'true';
  const isApp = sessionStorage.getItem('appMode') === 'ios';
  
  if (!isGuest) return '';
  
  const params = new URLSearchParams();
  params.set('guest', '1');
  if (isApp) {
    params.set('app', 'ios');
  }
  
  return `?${params.toString()}`;
};