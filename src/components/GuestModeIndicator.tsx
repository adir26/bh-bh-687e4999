import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const GuestModeIndicator: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const handleSignIn = () => {
    sessionStorage.setItem('returnPath', window.location.pathname);
    sessionStorage.setItem('attemptedAction', 'guest_upgrade');
    navigate('/auth');
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal in sessionStorage so it doesn't show again this session
    sessionStorage.setItem('guestBannerDismissed', 'true');
  };

  // Don't show if previously dismissed this session
  if (!isVisible || sessionStorage.getItem('guestBannerDismissed') === 'true') {
    return null;
  }

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between max-w-4xl">
        <div className="flex items-center gap-3">
          <div className="text-sm text-primary/80">
            <span className="font-medium">אתה עוין כאורח.</span>
            <span className="mr-2">התחבר כדי לשמור פריטים, ליצור קשר עם ספקים ולקבל הצעות מחיר.</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={handleSignIn}
            className="h-8 px-3 text-xs"
          >
            <LogIn className="ml-1 h-3 w-3" />
            התחבר
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="h-8 w-8 p-0 text-primary/60 hover:text-primary"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};