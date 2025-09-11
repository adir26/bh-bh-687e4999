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
  const { setShowLoginModal, setAttemptedAction } = useGuestMode();

  const requireAuth = useCallback((action: GatedAction, callback: () => void) => {
    if (user) {
      // User is authenticated, execute the action immediately
      callback();
    } else {
      // User is not authenticated, show login modal and store attempted action
      setAttemptedAction(action);
      setShowLoginModal(true);
    }
  }, [user, setShowLoginModal, setAttemptedAction]);

  const requireAuthAsync = useCallback(async (action: GatedAction, callback: () => Promise<void>) => {
    if (user) {
      // User is authenticated, execute the action immediately
      await callback();
    } else {
      // User is not authenticated, show login modal and store attempted action
      setAttemptedAction(action);
      setShowLoginModal(true);
    }
  }, [user, setShowLoginModal, setAttemptedAction]);

  return {
    requireAuth,
    requireAuthAsync,
    isAuthenticated: !!user
  };
};