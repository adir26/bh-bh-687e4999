import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const GuestModeIndicator: React.FC = () => {
  const navigate = useNavigate();
  const guestBannerDismissed = useAuthStore((state) => state.guestBannerDismissed);
  const setGuestBannerDismissed = useAuthStore((state) => state.setGuestBannerDismissed);
  const setReturnPath = useAuthStore((state) => state.setReturnPath);
  const setPendingAction = useAuthStore((state) => state.setPendingAction);

  const handleSignIn = () => {
    setReturnPath(window.location.pathname);
    setPendingAction('guest_upgrade');
    navigate('/auth');
  };

  const handleDismiss = () => {
    setGuestBannerDismissed(true);
  };

  // Don't show if previously dismissed
  if (guestBannerDismissed) {
    return null;
  }

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between max-w-4xl">
        <div className="flex items-center gap-3">
          <div className="text-sm text-primary/80">
            <span className="font-medium">אתה צופה כאורח.</span>
            <span className="mr-2">התחבר כדי לשמור פריטים, ליצור קשר עם ספקים ולקבל הצעות מחיר.</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSignIn} className="h-8 px-3 text-xs">
            <LogIn className="ml-1 h-3 w-3" />
            התחבר
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-8 w-8 p-0 text-primary/60 hover:text-primary">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
