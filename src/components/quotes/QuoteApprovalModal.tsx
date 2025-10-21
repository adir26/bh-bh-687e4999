import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eraser, Info } from 'lucide-react';
import { showToast } from '@/utils/toast';

interface QuoteApprovalModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ApprovalFormData) => Promise<void>;
}

export interface ApprovalFormData {
  clientName: string;
  clientIdNumber: string;
  clientPhone: string;
  signatureDataUrl: string;
}

export function QuoteApprovalModal({ 
  open, 
  onClose, 
  onSubmit
}: QuoteApprovalModalProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ApprovalFormData>({
    clientName: '',
    clientIdNumber: '',
    clientPhone: '',
    signatureDataUrl: ''
  });

  const validateIdNumber = (id: string) => {
    if (id.length !== 9 || !/^\d+$/.test(id)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let digit = parseInt(id.charAt(i), 10);
      if (i % 2 === 0) {
        digit *= 1;
      } else {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  };

  const validatePhone = (phone: string) => {
    return /^0\d{1,2}-?\d{7,8}$/.test(phone.replace(/\s/g, ''));
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSubmit = async () => {
    if (!formData.clientName.trim()) {
      showToast.error('נא להזין שם מלא');
      return;
    }

    if (!validateIdNumber(formData.clientIdNumber)) {
      showToast.error('תעודת זהות לא תקינה');
      return;
    }

    if (!validatePhone(formData.clientPhone)) {
      showToast.error('מספר טלפון לא תקין');
      return;
    }

    if (signatureRef.current?.isEmpty()) {
      showToast.error('נא לחתום על ההצעה');
      return;
    }

    setIsSubmitting(true);
    try {
      const signatureDataUrl = signatureRef.current?.toDataURL('image/png') || '';
      
      await onSubmit({
        ...formData,
        signatureDataUrl
      });
      
      // Reset form
      setFormData({
        clientName: '',
        clientIdNumber: '',
        clientPhone: '',
        signatureDataUrl: ''
      });
      signatureRef.current?.clear();
      onClose();
    } catch (error) {
      console.error('Error submitting approval:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>אישור הצעת מחיר</DialogTitle>
        </DialogHeader>

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            נא למלא את הפרטים ולחתום באופן דיגיטלי לאישור ההצעה
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="clientName">שם מלא *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="ישראל ישראלי"
              required
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientIdNumber">תעודת זהות *</Label>
              <Input
                id="clientIdNumber"
                value={formData.clientIdNumber}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  clientIdNumber: e.target.value.replace(/\D/g, '').slice(0, 9)
                }))}
                placeholder="123456789"
                required
                inputMode="numeric"
                pattern="\d{9}"
              />
            </div>
            
            <div>
              <Label htmlFor="clientPhone">טלפון *</Label>
              <Input
                id="clientPhone"
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                placeholder="050-1234567"
                required
                inputMode="tel"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>חתימה דיגיטלית *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSignature}
              >
                <Eraser className="w-4 h-4 ml-1" />
                נקה
              </Button>
            </div>
            <div className="border-2 border-dashed rounded-lg p-2 bg-white">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: 'w-full h-40',
                  style: { touchAction: 'none' }
                }}
                backgroundColor="white"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              חתום באמצעות העכבר, עט דיגיטלי או מגע
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'שולח...' : 'אשר הצעה'}
            </Button>
            <Button
              onClick={onClose}
              disabled={isSubmitting}
              variant="outline"
            >
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
