import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/leadsService';

const LEAD_SOURCES = [
  { value: 'facebook_paid', label: 'פייסבוק ממומן' },
  { value: 'facebook_organic', label: 'פייסבוק אורגני' },
  { value: 'word_of_mouth', label: 'פה לאוזן' },
  { value: 'referral', label: 'המלצה' },
  { value: 'whatsapp', label: 'וואטסאפ' },
  { value: 'other', label: 'אחר' },
] as const;

const LEAD_PRIORITIES = [
  { value: 'vip', label: 'VIP' },
  { value: 'high', label: 'חשוב' },
  { value: 'medium', label: 'בינוני' },
  { value: 'low', label: 'רגיל' },
] as const;

const getLeadErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase();
  
  if (
    message.includes('permission denied') || 
    message.includes('42501') ||
    message.includes('rls') ||
    message.includes('policy')
  ) {
    return 'אין הרשאה להוסיף ליד. נא לוודא שהחשבון מוגדר כספק במערכת.';
  }
  
  if (message.includes('not-null') || message.includes('null value')) {
    return 'שדות חובה חסרים. נא למלא את כל השדות הנדרשים.';
  }
  
  return error.message;
};

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeadDialog({ open, onOpenChange }: AddLeadDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    contact_phone: '',
    contact_email: '',
    source_key: 'other',
    priority_key: 'medium',
    campaign_name: '',
    notes: '',
  });

  const createLeadMutation = useMutation({
    mutationFn: (data: typeof formData) => leadsService.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'ליד נוסף בהצלחה',
        description: 'הליד החדש נוסף למערכת',
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בהוספת ליד',
        description: getLeadErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      contact_phone: '',
      contact_email: '',
      source_key: 'other',
      priority_key: 'medium',
      campaign_name: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'נא להזין שם ליד',
        variant: 'destructive',
      });
      return;
    }

    createLeadMutation.mutate(formData);
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוסף ליד חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם ליד *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="הזן שם ליד"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">טלפון</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="050-1234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="example@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source_key">מקור הגעה</Label>
              <Select
                value={formData.source_key}
                onValueChange={(value) => setFormData({ ...formData, source_key: value })}
              >
                <SelectTrigger id="source_key">
                  <SelectValue placeholder="בחר מקור" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">עדיפות</Label>
              <Select
                value={formData.priority_key}
                onValueChange={(value) => setFormData({ ...formData, priority_key: value })}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="בחר עדיפות" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign_name">שם קמפיין</Label>
            <Input
              id="campaign_name"
              value={formData.campaign_name}
              onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
              placeholder="למשל: קמפיין קיץ 2024, Facebook Ads..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">הערות/משימות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="הוסף הערות או משימות לליד..."
              rows={4}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createLeadMutation.isPending}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              variant="blue"
              disabled={createLeadMutation.isPending}
            >
              {createLeadMutation.isPending ? 'שומר...' : 'הוסף ליד'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
