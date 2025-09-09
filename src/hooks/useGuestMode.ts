import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export interface GuestModeParams {
  isGuestMode: boolean;
  isAppMode: boolean;
  isIOS: boolean;
}

/**
 * Hook to detect and manage guest mode based on URL parameters
 * Detects ?guest=1&app=ios for guest mode from mobile app
 */
export const useGuestMode = (): GuestModeParams => {
  const location = useLocation();

  const guestModeParams = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const guestParam = searchParams.get('guest');
    const appParam = searchParams.get('app');
    
    const isGuestMode = guestParam === '1';
    const isAppMode = appParam === 'ios' || appParam === 'android';
    const isIOS = appParam === 'ios';

    return {
      isGuestMode,
      isAppMode,
      isIOS
    };
  }, [location.search]);

  return guestModeParams;
};