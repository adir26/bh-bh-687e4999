import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const dataToDelete = [
    'פרטי החשבון והפרופיל האישי',
    'כל ההזמנות והצעות המחיר שלך',
    'הודעות וצ\'אט עם ספקים',
    'רשימת המועדפים שלך',
    'ביקורות שכתבת',
    'תמונות שהעלית',
    'לוחות השראה (Ideabooks)',
    'פגישות מתוכננות',
    'כרטיסי תמיכה',
    'נתוני חיפוש והעדפות',
  ];

  const handleDeleteAccount = async () => {
    if (!user || !isConfirmed) return;

    setIsDeleting(true);
    
    try {
      // Call the account deletion function
      const { error } = await supabase.rpc('delete_user_account', {
        user_id: user.id
      });

      if (error) {
        console.error('Account deletion error:', error);
        toast({
          title: 'שגיאה במחיקת החשבון',
          description: 'אירעה שגיאה במחיקת החשבון. אנא פנה לתמיכה.',
          variant: 'destructive'
        });
        setIsDeleting(false);
        return;
      }

      // Show success screen
      setShowSuccess(true);
      
      // Sign out after a short delay
      setTimeout(async () => {
        await signOut();
        navigate('/auth', { replace: true });
      }, 3000);

    } catch (error) {
      console.error('Account deletion error:', error);
      toast({
        title: 'שגיאה במערכת',
        description: 'אירעה שגיאה לא צפויה. אנא נסה שוב מאוחר יותר.',
        variant: 'destructive'
      });
      setIsDeleting(false);
    }
  };

  const resetModal = () => {
    setIsConfirmed(false);
    setIsDeleting(false);
    setShowSuccess(false);
  };

  const handleClose = () => {
    if (!isDeleting && !showSuccess) {
      resetModal();
      onClose();
    }
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" dir="rtl">
          <div className="text-center py-6">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">החשבון נמחק בהצלחה</h3>
            <p className="text-muted-foreground mb-4">
              החשבון שלך נמחק לצמיתות מהמערכת. תועבר בקרוב לדף הכניסה.
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              מחיקת חשבון
            </DialogTitle>
            {!isDeleting && (
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>זהירות!</strong> פעולה זו לא ניתנת לביטול. כל הנתונים שלך יימחקו לצמיתות.
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-medium mb-3">הנתונים הבאים יימחקו לצמיתות:</h4>
            <div className="space-y-2">
              {dataToDelete.map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <strong>הערה:</strong> מסמכים פיננסיים (חשבוניות, קבלות) יישמרו באופן אנונימי למטרות חוקיות וחשבונאיות.
            </p>

            <div className="flex items-start space-x-2 space-x-reverse">
              <Checkbox
                id="confirm-delete"
                checked={isConfirmed}
                onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                disabled={isDeleting}
              />
              <label htmlFor="confirm-delete" className="text-sm leading-relaxed cursor-pointer">
                אני מבין/ה שפעולה זו היא <strong>לצמיתות ולא ניתנת לביטול</strong>, וכל הנתונים שלי יימחקו מהמערכת.
              </label>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1"
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={!isConfirmed || isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  מוחק חשבון...
                </div>
              ) : (
                'מחק את החשבון שלי'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};