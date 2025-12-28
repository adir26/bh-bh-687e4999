import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';
import { LoginModal } from '@/components/modals/LoginModal';

interface GuestActionWrapperProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  action?: string;
  onClick?: () => void;
  className?: string;
  asChild?: boolean;
}

/**
 * Wraps any interactive element to handle guest mode.
 * If requiresAuth is true and user is a guest, shows login modal instead of executing action.
 */
export const GuestActionWrapper: React.FC<GuestActionWrapperProps> = ({
  children,
  requiresAuth = false,
  action,
  onClick,
  className,
  asChild = false,
}) => {
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [attemptedAction, setAttemptedAction] = useState<string | null>(null);

  const isGuest = !user || isGuestMode;

  const handleClick = (e: React.MouseEvent) => {
    if (requiresAuth && isGuest) {
      e.preventDefault();
      e.stopPropagation();
      setAttemptedAction(action || null);
      setShowLoginModal(true);
      return;
    }
    
    onClick?.();
  };

  // If not requiring auth or user is authenticated, render children directly
  if (!requiresAuth || !isGuest) {
    if (asChild) {
      return <>{children}</>;
    }
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    );
  }

  // For guests with requiresAuth, wrap with click interceptor
  return (
    <>
      <div className={className} onClick={handleClick}>
        {children}
      </div>
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        attemptedAction={attemptedAction}
      />
    </>
  );
};

export default GuestActionWrapper;
