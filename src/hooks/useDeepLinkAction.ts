import { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useRequireAuth, type GatedAction } from '@/hooks/useRequireAuth';
import { useGuestMode } from '@/hooks/useGuestMode';

export const useDeepLinkAction = (
  onAction: (action: GatedAction) => void,
  supportedActions: GatedAction[] = []
) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { requireAuth } = useRequireAuth();
  const { isGuestMode } = useGuestMode();
  
  useEffect(() => {
    const action = searchParams.get('action') as GatedAction;
    
    if (action && supportedActions.includes(action)) {
      const returnUrl = location.pathname + location.search;
      
      requireAuth(action, () => {
        // Execute the action after authentication
        onAction(action);
      }, returnUrl);
    }
  }, [searchParams, location, requireAuth, onAction, supportedActions]);
  
  return {
    hasDeepLinkAction: !!searchParams.get('action')
  };
};