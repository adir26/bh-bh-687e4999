import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupplierLeads } from '@/hooks/useSupplierLeads';
import { Loader2, Mail, Phone, User } from 'lucide-react';
import { toast } from 'sonner';

interface SelectLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string;
  onLeadSelected: (leadId: string, clientId: string | null) => void;
}

export function SelectLeadDialog({ 
  open, 
  onOpenChange, 
  supplierId, 
  onLeadSelected 
}: SelectLeadDialogProps) {
  const { data: leads, isLoading } = useSupplierLeads(supplierId);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = leads?.filter(lead =>
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact_phone?.includes(searchTerm)
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new':
        return 'default';
      case 'contacted':
        return 'secondary';
      case 'qualified':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'חדש';
      case 'contacted':
        return 'נוצר קשר';
      case 'qualified':
        return 'מוכשר';
      default:
        return status;
    }
  };

  const handleSelectLead = (lead: typeof leads[0]) => {
    if (!lead.client_id) {
      toast.error('ליד זה לא מקושר ללקוח. אנא צור לקוח מתוך ניהול הלידים תחילה.');
      return;
    }
    onLeadSelected(lead.id, lead.client_id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle>בחר ליד קיים</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <Input
            placeholder="חפש לפי שם, אימייל או טלפון..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredLeads && filteredLeads.length > 0 ? (
              filteredLeads.map(lead => (
                <Card key={lead.id} className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">{lead.name || 'ללא שם'}</h3>
                      </div>
                      
                      {lead.contact_email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{lead.contact_email}</span>
                        </div>
                      )}
                      
                      {lead.contact_phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{lead.contact_phone}</span>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Badge variant={getStatusBadgeVariant(lead.status)}>
                          {getStatusLabel(lead.status)}
                        </Badge>
                        {!lead.client_id && (
                          <Badge variant="destructive">ללא לקוח</Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleSelectLead(lead)}
                      disabled={!lead.client_id}
                    >
                      בחר
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? 'לא נמצאו לידים תואמים' : 'אין לידים פעילים'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            סגור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
