import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptedAction?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  attemptedAction 
}) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    // Store the attempted action and current location for post-auth redirect
    if (attemptedAction) {
      sessionStorage.setItem('pendingAction', attemptedAction);
    }
    sessionStorage.setItem('returnPath', window.location.pathname);
    
    navigate('/auth');
    onClose();
  };

  const handleCreateAccount = () => {
    // Store the attempted action and current location for post-auth redirect
    if (attemptedAction) {
      sessionStorage.setItem('pendingAction', attemptedAction);
    }
    sessionStorage.setItem('returnPath', window.location.pathname);
    
    navigate('/auth?mode=signup');
    onClose();
  };

  const getActionText = () => {
    switch (attemptedAction) {
      case 'save_favorite':
        return 'לשמור למועדפים';
      case 'start_chat':
        return 'לפתוח צ\'אט';
      case 'request_quote':
        return 'לבקש הצעת מחיר';
      case 'add_to_cart':
        return 'להוסיף לעגלה';
      case 'write_review':
        return 'לכתוב ביקורת';
      case 'upload_photo':
        return 'להעלות תמונה';
      case 'create_ideabook':
        return 'ליצור ספר רעיונות';
      default:
        return 'לבצע פעולה זו';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto my-4 p-4 md:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              צור חשבון בחינם
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-base text-muted-foreground">
            {attemptedAction ? (
              <>
                כדי {getActionText()}, עליך להתחבר תחילה.
                <br />
                היכנס כדי לשמור פריטים, לשלוח הודעות לספקים ולבצע הזמנות.
              </>
            ) : (
              'היכנס כדי לשמור פריטים, לשלוח הודעות לספקים ולבצע הזמנות.'
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={handleSignIn}
            className="w-full"
            size="lg"
          >
            <LogIn className="ml-2 h-4 w-4" />
            התחבר
          </Button>
          
          <Button 
            onClick={handleCreateAccount}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <UserPlus className="ml-2 h-4 w-4" />
            צור חשבון חדש
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full mt-2"
          >
            המשך לעיון
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};