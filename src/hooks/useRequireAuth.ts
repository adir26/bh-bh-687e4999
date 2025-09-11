import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';

export type GatedAction = 
  | 'save_favorite'
  | 'open_chat'
  | 'place_order'
  | 'write_review'
  | 'upload_image'
  | 'follow_supplier'
  | 'view_orders'
  | 'create_ideabook'
  | 'book_meeting'
  | 'contact_supplier'
  | 'request_quote';

export const useRequireAuth = () => {
  const { user } = useAuth();
  const { setShowLoginModal, setAttemptedAction, setReturnPath } = useGuestMode();

  const requireAuth = useCallback((action: GatedAction, callback: () => void, returnUrl?: string) => {
    if (user) {
      // User is authenticated, execute the action immediately
      callback();
    } else {
      // User is not authenticated, show login modal and store attempted action
      setAttemptedAction(action);
      if (returnUrl) {
        setReturnPath(returnUrl);
      }
      setShowLoginModal(true);
    }
  }, [user, setShowLoginModal, setAttemptedAction, setReturnPath]);

  const requireAuthAsync = useCallback(async (action: GatedAction, callback: () => Promise<void>, returnUrl?: string) => {
    if (user) {
      // User is authenticated, execute the action immediately
      await callback();
    } else {
      // User is not authenticated, show login modal and store attempted action
      setAttemptedAction(action);
      if (returnUrl) {
        setReturnPath(returnUrl);
      }
      setShowLoginModal(true);
    }
  }, [user, setShowLoginModal, setAttemptedAction, setReturnPath]);

  return {
    requireAuth,
    requireAuthAsync,
    isAuthenticated: !!user
  };
};