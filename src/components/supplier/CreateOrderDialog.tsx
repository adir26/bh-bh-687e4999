import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useSupplierClients } from '@/hooks/useSupplierClients';
import { useSupplierProjects } from '@/hooks/useSupplierProjects';
import { orderService } from '@/services/orderService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AddClientDialog } from './AddClientDialog';
import { AddProjectDialog } from './AddProjectDialog';
import { SelectLeadDialog } from './SelectLeadDialog';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

interface OrderItem {
  product_name: string;
  qty: number;
  unit_price: number;
}

export function CreateOrderDialog({ open, onOpenChange, onOrderCreated }: CreateOrderDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  const [showSelectLeadDialog, setShowSelectLeadDialog] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [etaDate, setEtaDate] = useState<Date | undefined>();
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { product_name: '', qty: 1, unit_price: 0 }
  ]);

  const { data: clients = [], isLoading: loadingClients, refetch: refetchClients } = useSupplierClients();
  const { data: projects = [], isLoading: loadingProjects, refetch: refetchProjects } = useSupplierProjects(selectedClientId);

  // Calculate total amount
  const totalAmount = orderItems.reduce((sum, item) => {
    return sum + (item.qty * item.unit_price);
  }, 0);

  // Auto-fill customer details when client is selected
  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        setCustomerName(client.full_name);
        setCustomerEmail(client.email);
        setCustomerPhone(client.phone || '');
      }
    }
  }, [selectedClientId, clients]);

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product_name: '', qty: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const resetForm = () => {
    setSelectedClientId('');
    setSelectedProjectId('');
    setSelectedLeadId('');
    setTitle('');
    setDescription('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setStartDate(new Date());
    setEtaDate(undefined);
    setShippingAddress('');
    setOrderItems([{ product_name: '', qty: 1, unit_price: 0 }]);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedClientId) {
      toast.error('יש לבחור לקוח');
      return;
    }

    if (!selectedProjectId) {
      toast.error('יש לבחור פרויקט');
      return;
    }

    if (!title.trim()) {
      toast.error('יש להזין כותרת להזמנה');
      return;
    }

    if (totalAmount <= 0) {
      toast.error('סכום ההזמנה חייב להיות גדול מ-0');
      return;
    }

    // Filter out empty items
    const validItems = orderItems.filter(item => 
      item.product_name.trim() && item.qty > 0 && item.unit_price > 0
    );

    if (validItems.length === 0) {
      toast.error('יש להוסיף לפחות פריט אחד תקין');
      return;
    }

    setIsSubmitting(true);
    try {
      await orderService.createOrder({
        client_id: selectedClientId,
        project_id: selectedProjectId,
        title,
        description: description || undefined,
        amount: totalAmount,
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
        customer_email: customerEmail || undefined,
        due_date: startDate ? startDate.toISOString() : undefined,
        eta_at: etaDate ? etaDate.toISOString() : undefined,
        shipping_address: shippingAddress ? { address: shippingAddress } : undefined,
        items: validItems
      });

      // Update lead status if a lead was selected
      if (selectedLeadId) {
        const { error: leadUpdateError } = await supabase
          .from('leads')
          .update({
            status: 'project_in_process',
            client_id: selectedClientId,
          })
          .eq('id', selectedLeadId);

        if (leadUpdateError) {
          console.error('Failed to update lead status:', leadUpdateError);
        } else {
          await queryClient.invalidateQueries({ 
            queryKey: ['supplier-leads', user?.id] 
          });
        }
      }

      toast.success('ההזמנה נוצרה בהצלחה');
      resetForm();
      onOrderCreated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'שגיאה ביצירת ההזמנה');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>הזמנה חדשה</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Selection */}
          <div className="space-y-2">
            <Label>בחר ליד *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 justify-start"
                onClick={() => setShowSelectLeadDialog(true)}
              >
                <Plus className="w-4 h-4 ml-2" />
                {selectedLeadId ? 'שנה ליד' : 'בחר מלידים קיימים'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddClientDialog(true)}
              >
                <Plus className="w-4 h-4 ml-2" />
                לקוח חדש
              </Button>
            </div>
          </div>

          {/* Client Info (read-only, auto-filled from lead) */}
          {selectedClientId && (
            <div className="space-y-2">
              <Label>לקוח</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  {clients.find(c => c.id === selectedClientId)?.full_name || 'לא נמצא'}
                </p>
                {clients.find(c => c.id === selectedClientId)?.email && (
                  <p className="text-sm text-muted-foreground">
                    {clients.find(c => c.id === selectedClientId)?.email}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Project Selection */}
          <div className="space-y-2">
            <Label>פרויקט *</Label>
            <Select 
              value={selectedProjectId} 
              onValueChange={(value) => {
                if (value === '__new_project__') {
                  setShowAddProjectDialog(true);
                } else {
                  setSelectedProjectId(value);
                }
              }}
              disabled={!selectedClientId}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר פרויקט" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__new_project__">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Plus className="w-4 h-4" />
                    הוסף פרויקט חדש
                  </div>
                </SelectItem>
                {projects.length > 0 && <Separator className="my-2" />}
                {loadingProjects ? (
                  <SelectItem value="loading" disabled>טוען פרויקטים...</SelectItem>
                ) : projects.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">אין פרויקטים. צור פרויקט חדש.</div>
                ) : (
                  projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedClientId && projects.length === 0 && !loadingProjects && (
              <p className="text-sm text-muted-foreground">
                ללקוח זה אין פרויקטים. יש ליצור פרויקט לפני יצירת הזמנה.
              </p>
            )}
          </div>

          {/* Order Title */}
          <div className="space-y-2">
            <Label>כותרת ההזמנה *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: ריהוט למטבח"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>תיאור (אופציונלי)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור מפורט של ההזמנה..."
              rows={3}
            />
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>שם לקוח</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="שם מלא"
              />
            </div>
            <div className="space-y-2">
              <Label>טלפון</Label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="050-1234567"
              />
            </div>
            <div className="space-y-2">
              <Label>אימייל</Label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>תאריך התחלה</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP', { locale: he }) : 'בחר תאריך'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={he}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>מועד סיום משוער (ETA)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !etaDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {etaDate ? format(etaDate, 'PPP', { locale: he }) : 'בחר תאריך'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={etaDate}
                    onSelect={setEtaDate}
                    initialFocus
                    locale={he}
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-2">
            <Label>כתובת למשלוח (אופציונלי)</Label>
            <Textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="רחוב, מספר בית, עיר, מיקוד"
              rows={2}
            />
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">פריטי הזמנה</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="w-4 h-4 ml-1" />
                הוסף פריט
              </Button>
            </div>

            {orderItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-start border p-3 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="md:col-span-1">
                    <Input
                      placeholder="שם המוצר"
                      value={item.product_name}
                      onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="כמות"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="מחיר ליחידה (₪)"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  disabled={orderItems.length === 1}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}

            <div className="flex justify-end border-t pt-4">
              <div className="text-left">
                <Label className="text-muted-foreground">סכום כולל</Label>
                <p className="text-2xl font-bold">₪{totalAmount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'יוצר הזמנה...' : 'צור הזמנה'}
            </Button>
          </div>
        </div>
        </DialogContent>
      </Dialog>

      <AddClientDialog
        open={showAddClientDialog}
        onOpenChange={setShowAddClientDialog}
        supplierId={user?.id || ''}
        leadStatus="project_in_process"
        onClientCreated={async (newClientId) => {
          setSelectedLeadId(''); // Reset lead when creating new client
          setSelectedClientId(newClientId);
          await queryClient.invalidateQueries({ 
            queryKey: ['supplier-clients', user?.id],
            refetchType: 'active'
          });
        }}
      />

      <AddProjectDialog
        open={showAddProjectDialog}
        onOpenChange={setShowAddProjectDialog}
        clientId={selectedClientId}
        supplierId={user?.id || ''}
        onProjectCreated={async (newProjectId) => {
          setSelectedProjectId(newProjectId);
          await queryClient.invalidateQueries({ 
            queryKey: ['supplier-projects', user?.id, selectedClientId],
            refetchType: 'active'
          });
        }}
      />

      <SelectLeadDialog
        open={showSelectLeadDialog}
        onOpenChange={setShowSelectLeadDialog}
        supplierId={user?.id || ''}
        onLeadSelected={async (leadId, clientId) => {
          if (clientId) {
            setSelectedLeadId(leadId);
            setSelectedClientId(clientId);
            setSelectedProjectId(''); // Reset project when changing lead
            await queryClient.invalidateQueries({ 
              queryKey: ['supplier-clients', user?.id],
              refetchType: 'active'
            });
            toast.success('ליד נבחר בהצלחה');
          } else {
            toast.error('ליד זה לא מקושר ללקוח. יש ליצור לקוח תחילה.');
          }
        }}
      />
    </>
  );
}
