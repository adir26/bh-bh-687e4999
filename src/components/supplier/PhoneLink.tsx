import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PhoneLinkProps {
  phone?: string;
  phoneE164?: string;
  orderId?: string;
  className?: string;
  children?: React.ReactNode;
}

function normalizeToE164(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If already starts with country code
  if (digits.startsWith('972')) {
    return `+${digits}`;
  }
  
  // If starts with 0 (Israeli format)
  if (digits.startsWith('0')) {
    return `+972${digits.substring(1)}`;
  }
  
  // Assume Israeli number if 9-10 digits
  if (digits.length >= 9 && digits.length <= 10) {
    return `+972${digits}`;
  }
  
  return `+${digits}`;
}

function getWhatsAppUrl(phoneE164: string): string {
  return `https://wa.me/${phoneE164.replace('+', '')}`;
}

export function PhoneLink({ phone, phoneE164, orderId, className, children }: PhoneLinkProps) {
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [callOutcome, setCallOutcome] = useState<string>('');
  const [callNote, setCallNote] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const normalizedPhone = phoneE164 || (phone ? normalizeToE164(phone) : '');
  
  if (!normalizedPhone) {
    return (
      <span className="text-muted-foreground text-sm">
        לא זמין
      </span>
    );
  }

  const handleCall = () => {
    // Open dialer
    window.location.href = `tel:${normalizedPhone}`;
    
    // Show call log dialog if we have order ID
    if (orderId) {
      setCallDialogOpen(true);
    }
  };

  const handleWhatsApp = async () => {
    // Open WhatsApp
    window.open(getWhatsAppUrl(normalizedPhone), '_blank');
    
    // Log WhatsApp contact if we have order ID
    if (orderId) {
      try {
        const { error } = await supabase.rpc('rpc_log_call', {
          p_order_id: orderId,
          p_phone_e164: normalizedPhone,
          p_outcome: 'whatsapp',
          p_note: 'נפתח WhatsApp'
        });
        
        if (error) throw error;
        toast.success('נרשמה פעילות WhatsApp');
      } catch (error) {
        console.error('Error logging WhatsApp:', error);
      }
    }
  };

  const handleLogCall = async () => {
    if (!callOutcome) {
      toast.error('יש לבחור תוצאת שיחה');
      return;
    }

    setIsLogging(true);
    try {
      const { error } = await supabase.rpc('rpc_log_call', {
        p_order_id: orderId,
        p_phone_e164: normalizedPhone,
        p_outcome: callOutcome,
        p_note: callNote || null
      });
      
      if (error) throw error;
      
      toast.success('השיחה נרשמה בהצלחה');
      setCallDialogOpen(false);
      setCallOutcome('');
      setCallNote('');
    } catch (error) {
      console.error('Error logging call:', error);
      toast.error('שגיאה ברישום השיחה');
    } finally {
      setIsLogging(false);
    }
  };

  if (children) {
    return (
      <>
        <div className={className} onClick={handleCall}>
          {children}
        </div>
        
        {orderId && (
          <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>רישום שיחה</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="outcome">תוצאת השיחה</Label>
                  <Select value={callOutcome} onValueChange={setCallOutcome}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר תוצאה" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="answered">נענה</SelectItem>
                      <SelectItem value="no_answer">לא נענה</SelectItem>
                      <SelectItem value="voicemail">השאיר הודעה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="note">הערות (אופציונלי)</Label>
                  <Textarea
                    id="note"
                    value={callNote}
                    onChange={(e) => setCallNote(e.target.value)}
                    placeholder="הערות על השיחה..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setCallDialogOpen(false)}
                  >
                    ביטול
                  </Button>
                  <Button 
                    onClick={handleLogCall}
                    disabled={isLogging || !callOutcome}
                  >
                    רשום שיחה
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCall}
        className="text-blue-600 hover:text-blue-800 p-1 h-auto"
      >
        <Phone className="w-4 h-4" />
        <span className="sr-only">התקשר</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleWhatsApp}
        className="text-green-600 hover:text-green-800 p-1 h-auto"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="sr-only">WhatsApp</span>
      </Button>
      
      <span className="text-sm text-muted-foreground">
        {phone || normalizedPhone}
      </span>
      
      {orderId && (
        <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>רישום שיחה</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="outcome">תוצאת השיחה</Label>
                <Select value={callOutcome} onValueChange={setCallOutcome}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תוצאה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="answered">נענה</SelectItem>
                    <SelectItem value="no_answer">לא נענה</SelectItem>
                    <SelectItem value="voicemail">השאיר הודעה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="note">הערות (אופציונלי)</Label>
                <Textarea
                  id="note"
                  value={callNote}
                  onChange={(e) => setCallNote(e.target.value)}
                  placeholder="הערות על השיחה..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setCallDialogOpen(false)}
                >
                  ביטול
                </Button>
                <Button 
                  onClick={handleLogCall}
                  disabled={isLogging || !callOutcome}
                >
                  רשום שיחה
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}