import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export interface GuestModeState {
  isGuestMode: boolean;
  isAppMode: boolean; // iOS app vs web browser
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  attemptedAction: string | null;
  setAttemptedAction: (action: string | null) => void;
  returnPath: string | null;
  setReturnPath: (path: string | null) => void;
}

export const useGuestMode = (): GuestModeState => {
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [attemptedAction, setAttemptedAction] = useState<string | null>(null);
  
  // Use Zustand store instead of sessionStorage
  const guestMode = useAuthStore((state) => state.guestMode);
  const appMode = useAuthStore((state) => state.appMode);
  const returnPath = useAuthStore((state) => state.returnPath);
  const pendingAction = useAuthStore((state) => state.pendingAction);
  const setGuestModeStore = useAuthStore((state) => state.setGuestMode);
  const setAppModeStore = useAuthStore((state) => state.setAppMode);
  const setReturnPathStore = useAuthStore((state) => state.setReturnPath);
  const setPendingActionStore = useAuthStore((state) => state.setPendingAction);
  
  const urlParams = new URLSearchParams(location.search);
  const urlGuestMode = urlParams.get('guest') === '1';
  const isGuestMode = urlGuestMode || guestMode;
  const isAppMode = urlParams.get('app') === 'ios' || appMode === 'ios';
  const actionParam = urlParams.get('action');

  // Store guest mode state in Zustand for navigation persistence
  useEffect(() => {
    if (isGuestMode) {
      setGuestModeStore(true);
      if (isAppMode) {
        setAppModeStore('ios');
      }
    }
  }, [isGuestMode, isAppMode, setGuestModeStore, setAppModeStore]);

  // Handle deep-link actions for guests
  useEffect(() => {
    if (actionParam && isGuestMode) {
      const fullPath = location.pathname + location.search;
      setReturnPathStore(fullPath);
      setPendingActionStore(actionParam);
      setAttemptedAction(actionParam);
      setShowLoginModal(true);
    }
  }, [actionParam, isGuestMode, location.pathname, location.search, setReturnPathStore, setPendingActionStore]);

  return {
    isGuestMode,
    isAppMode,
    showLoginModal,
    setShowLoginModal,
    attemptedAction,
    setAttemptedAction,
    returnPath: returnPath || null,
    setReturnPath: setReturnPathStore
  };
};

// Helper function to check if user is in guest mode
export const isInGuestMode = (): boolean => {
  return useAuthStore.getState().guestMode;
};

// Helper function to clear guest mode
export const clearGuestMode = (): void => {
  useAuthStore.getState().clearGuestState();
};

// Helper function to clear welcome screen flag and guest mode when user authenticates
export const clearWelcomeState = (): void => {
  useAuthStore.getState().clearGuestState();
};

// Helper function to get guest mode URL params
export const getGuestModeParams = (): string => {
  const { guestMode, appMode } = useAuthStore.getState();
  
  if (!guestMode) return '';
  
  const params = new URLSearchParams();
  params.set('guest', '1');
  if (appMode === 'ios') {
    params.set('app', 'ios');
  }
  
  return `?${params.toString()}`;
};