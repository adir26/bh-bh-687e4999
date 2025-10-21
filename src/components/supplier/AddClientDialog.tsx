import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClientWithLead } from '@/services/clientService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (clientId: string) => void;
  supplierId: string;
  leadStatus?: 'new' | 'project_in_progress';
}

export function AddClientDialog({
  open,
  onOpenChange,
  onClientCreated,
  supplierId,
  leadStatus = 'new',
}: AddClientDialogProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim() || !email.trim()) {
      toast.error('נא למלא שם ואימייל');
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('כתובת אימייל לא תקינה');
      return;
    }

    setIsSubmitting(true);
    try {
      const clientId = await createClientWithLead({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      }, supplierId, leadStatus);

      toast.success('הלקוח נוצר בהצלחה');
      onClientCreated(clientId);
      onOpenChange(false);
      
      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
    } catch (error: any) {
      toast.error(error.message || 'שגיאה ביצירת לקוח');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הוספת לקוח חדש</DialogTitle>
          <DialogDescription>
            הזן את פרטי הלקוח. ניתן להוסיף את הטלפון מאוחר יותר.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">שם מלא *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="שם הלקוח"
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">אימייל *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">טלפון (אופציונלי)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="050-1234567"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  יוצר...
                </>
              ) : (
                'צור לקוח'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
