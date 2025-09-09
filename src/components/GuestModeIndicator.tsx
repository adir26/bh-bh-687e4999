import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGuestMode } from '@/hooks/useGuestMode';

interface GuestModeIndicatorProps {
  onLoginClick?: () => void;
  showRegister?: boolean;
}

export const GuestModeIndicator: React.FC<GuestModeIndicatorProps> = ({
  onLoginClick,
  showRegister = true
}) => {
  const navigate = useNavigate();
  const { isGuestMode, isAppMode } = useGuestMode();

  if (!isGuestMode) return null;

  return (
    <div className="bg-primary/5 border-b border-primary/10 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary text-xs">👤</span>
          </div>
          <span className="text-sm text-primary/80">מצב אורח</span>
        </div>
        
        {!isAppMode && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoginClick || (() => navigate('/auth'))}
              className="text-primary hover:bg-primary/10 text-xs px-3 py-1"
            >
              <LogIn className="h-3 w-3 mr-1" />
              התחבר
            </Button>
            {showRegister && (
              <Button
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-xs px-3 py-1"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                הירשם
              </Button>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs text-primary/60 mt-2">
        היכנס כדי לקבל גישה מלאה לכל התכונות והשירותים
      </p>
    </div>
  );
};