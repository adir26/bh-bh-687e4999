import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface GuestBannerProps {
  className?: string;
}

export const GuestBanner: React.FC<GuestBannerProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const guestBannerDismissed = useAuthStore((state) => state.guestBannerDismissed);
  const setGuestBannerDismissed = useAuthStore((state) => state.setGuestBannerDismissed);
  const setReturnPath = useAuthStore((state) => state.setReturnPath);

  const handleSignIn = () => {
    setReturnPath(window.location.pathname);
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
    <div className={`bg-gradient-to-l from-primary/15 via-primary/10 to-primary/5 border-b border-primary/20 px-3 xs:px-4 py-2 xs:py-3 ${className}`}>
      <div className="container mx-auto flex flex-col xs:flex-row items-start xs:items-center justify-between max-w-7xl gap-2 xs:gap-0">
        <div className="flex items-center gap-2 xs:gap-3">
          <Sparkles className="h-4 w-4 text-primary animate-pulse shrink-0" />
          <div className="text-xs xs:text-sm text-foreground">
            <span className="font-semibold">גלו את כל האפשרויות</span>
            <span className="hidden xs:inline ms-2 text-muted-foreground">• התחברו חינם לשמירת פריטים ויצירת קשר עם ספקים</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full xs:w-auto">
          <Button 
            size="sm" 
            onClick={handleSignIn} 
            className="h-8 px-3 xs:px-4 text-xs font-medium shadow-sm flex-1 xs:flex-initial min-h-[44px] xs:min-h-0"
          >
            <LogIn className="me-1.5 h-3.5 w-3.5" />
            הצטרפו חינם
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss} 
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px]"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuestBanner;
