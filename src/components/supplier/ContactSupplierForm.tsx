import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { showToast } from '@/utils/toast';

interface ContactSupplierFormProps {
  companyId: string;
  companyName: string;
  supplierId?: string;
}

export const ContactSupplierForm: React.FC<ContactSupplierFormProps> = ({
  companyId,
  companyName,
  supplierId,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      showToast.error('נא למלא שם וטלפון');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate lead number
      const leadNumber = `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create lead
      const { error } = await supabase
        .from('leads')
        .insert({
          lead_number: leadNumber,
          company_id: companyId,
          supplier_id: supplierId || null,
          name: formData.name,
          contact_phone: formData.phone,
          contact_email: formData.email || null,
          notes: formData.notes || null,
          source_key: 'website',
          status: 'new',
          priority_key: 'medium',
        });

      if (error) throw error;

      showToast.success('פרטיך נשלחו בהצלחה! הספק יצור איתך קשר בקרוב');
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating lead:', error);
      showToast.error('אירעה שגיאה בשליחת הפרטים. נסה שוב');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4 text-center">השאר פרטים ונחזור אליך</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          מלא את הפרטים ו{companyName} יצור איתך קשר
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">שם מלא *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="שם מלא"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="phone">טלפון *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="05X-XXXXXXX"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="email">אימייל (אופציונלי)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@email.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="notes">פרטים נוספים (אופציונלי)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ספר לנו על הפרויקט שלך..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'שולח...' : 'שלח פרטים'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
