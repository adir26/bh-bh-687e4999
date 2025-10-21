import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, ChevronRight, ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { SelectLeadDialog } from './SelectLeadDialog';

interface CreateOrderWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (orderId: string) => void;
}

interface LeadData {
  mode: 'select' | 'create';
  lead_id?: string;
  lead_name?: string;
  client_id?: string;
  new?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

interface ProjectData {
  mode: 'select' | 'create';
  project_id?: string;
  project_title?: string;
  new?: {
    title: string;
    address: {
      street: string;
      city: string;
      zip: string;
      notes: string;
    };
  };
}

interface OrderItem {
  product_id?: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export function CreateOrderWizard({ open, onOpenChange, onSuccess }: CreateOrderWizardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Lead
  const [leadData, setLeadData] = useState<LeadData>({ mode: 'select' });
  const [showSelectLeadDialog, setShowSelectLeadDialog] = useState(false);
  
  // Step 2: Project
  const [projectData, setProjectData] = useState<ProjectData>({ mode: 'select' });
  const [availableProjects, setAvailableProjects] = useState<Array<{ id: string; title: string }>>([]);
  
  // Step 3: Order Details
  const [orderTitle, setOrderTitle] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [orderAddress, setOrderAddress] = useState({
    street: '',
    city: '',
    zip: '',
    notes: '',
  });
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Step 4: Items
  const [items, setItems] = useState<OrderItem[]>([
    { product_name: '', description: '', quantity: 1, unit_price: 0 },
  ]);

  const resetForm = () => {
    setStep(1);
    setLeadData({ mode: 'select' });
    setProjectData({ mode: 'select' });
    setOrderTitle('');
    setOrderDescription('');
    setStartDate('');
    setEndDate('');
    setOrderAddress({ street: '', city: '', zip: '', notes: '' });
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setItems([{ product_name: '', description: '', quantity: 1, unit_price: 0 }]);
    setAvailableProjects([]);
  };

  const handleLeadSelected = async (leadId: string, clientId: string | null, leadName: string) => {
    if (!clientId) {
      toast.error('ליד זה לא מקושר ללקוח');
      return;
    }

    setLeadData({
      mode: 'select',
      lead_id: leadId,
      lead_name: leadName,
      client_id: clientId,
    });

    // Fetch projects for this client using RPC
    const { data: projects } = await supabase.rpc('supplier_client_projects', {
      p_client_id: clientId
    });

    setAvailableProjects(projects || []);
    setShowSelectLeadDialog(false);
    toast.success('ליד נבחר בהצלחה');
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (leadData.mode === 'select' && !leadData.lead_id) {
        toast.error('יש לבחור ליד');
        return false;
      }
      if (leadData.mode === 'create') {
        if (!leadData.new?.full_name?.trim()) {
          toast.error('יש להזין שם מלא');
          return false;
        }
      }
    }
    
    if (currentStep === 2) {
      if (projectData.mode === 'select' && !projectData.project_id) {
        toast.error('יש לבחור פרויקט');
        return false;
      }
      if (projectData.mode === 'create' && !projectData.new?.title?.trim()) {
        toast.error('יש להזין שם פרויקט');
        return false;
      }
    }
    
    if (currentStep === 3) {
      if (!orderTitle.trim()) {
        toast.error('יש להזין שם הזמנה');
        return false;
      }
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        toast.error('תאריך סיום חייב להיות אחרי תאריך התחלה');
        return false;
      }
    }
    
    if (currentStep === 4) {
      if (items.length === 0) {
        toast.error('יש להוסיף לפחות פריט אחד');
        return false;
      }
      for (const item of items) {
        if (!item.product_name.trim()) {
          toast.error('כל פריט חייב שם');
          return false;
        }
        if (item.quantity <= 0) {
          toast.error('כמות חייבת להיות גדולה מ-0');
          return false;
        }
        if (item.unit_price < 0) {
          toast.error('מחיר לא יכול להיות שלילי');
          return false;
        }
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    if (!user?.id) return;

    setLoading(true);

    try {
      const payload = {
        supplier_id: user.id,
        lead: leadData.mode === 'select' 
          ? { mode: 'select' as const, lead_id: leadData.lead_id }
          : { mode: 'create' as const, new: leadData.new },
        project: projectData.mode === 'select'
          ? { mode: 'select' as const, project_id: projectData.project_id }
          : { mode: 'create' as const, new: projectData.new },
        order: {
          title: orderTitle,
          description: orderDescription || null,
          start_date: startDate || null,
          end_date: endDate || null,
          address: orderAddress,
          customer_name: customerName || leadData.new?.full_name || null,
          customer_email: customerEmail || leadData.new?.email || null,
          customer_phone: customerPhone || leadData.new?.phone || null,
          shipping_address: orderAddress,
          items: items.map(item => ({
            product_id: item.product_id || null,
            product_name: item.product_name,
            description: item.description || null,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        },
      };

      console.log('[CreateOrderWizard] Submitting payload:', payload);

      const { data, error } = await supabase.functions.invoke('create-order-bundle', {
        body: payload,
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('[CreateOrderWizard] Success:', data);

      toast.success('הזמנה נוצרה בהצלחה!');

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['supplier-orders', user.id] });
      await queryClient.invalidateQueries({ queryKey: ['supplier-leads', user.id] });
      if (leadData.client_id) {
        await queryClient.invalidateQueries({ queryKey: ['supplier-projects', user.id, leadData.client_id] });
      }

      resetForm();
      onOpenChange(false);
      
      if (onSuccess && data.order_id) {
        onSuccess(data.order_id);
      }

    } catch (error: any) {
      console.error('[CreateOrderWizard] Error:', error);
      toast.error(error.message || 'שגיאה ביצירת הזמנה');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { product_name: '', description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              יצירת הזמנה חדשה - שלב {step} מתוך 4
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step 1: Lead Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">בחר או צור ליד</h3>
                
                <div className="flex gap-2">
                  <Button
                    variant={leadData.mode === 'select' ? 'default' : 'outline'}
                    onClick={() => setLeadData({ mode: 'select' })}
                    className="flex-1"
                  >
                    בחר ליד קיים
                  </Button>
                  <Button
                    variant={leadData.mode === 'create' ? 'default' : 'outline'}
                    onClick={() => setLeadData({ mode: 'create', new: { full_name: '', email: '', phone: '' } })}
                    className="flex-1"
                  >
                    צור ליד חדש
                  </Button>
                </div>

                {leadData.mode === 'select' && (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowSelectLeadDialog(true)}
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      {leadData.lead_id ? `נבחר: ${leadData.lead_name}` : 'בחר מלידים קיימים'}
                    </Button>
                  </div>
                )}

                {leadData.mode === 'create' && (
                  <div className="space-y-4">
                    <div>
                      <Label>שם מלא *</Label>
                      <Input
                        value={leadData.new?.full_name || ''}
                        onChange={(e) => setLeadData({
                          ...leadData,
                          new: { ...leadData.new!, full_name: e.target.value },
                        })}
                        placeholder="הזן שם מלא"
                      />
                    </div>
                    <div>
                      <Label>אימייל (לא חובה)</Label>
                      <Input
                        type="email"
                        value={leadData.new?.email || ''}
                        onChange={(e) => setLeadData({
                          ...leadData,
                          new: { ...leadData.new!, email: e.target.value },
                        })}
                        placeholder="לא חובה - לצורך יצירת קשר בלבד"
                      />
                    </div>
                    <div>
                      <Label>טלפון</Label>
                      <Input
                        value={leadData.new?.phone || ''}
                        onChange={(e) => setLeadData({
                          ...leadData,
                          new: { ...leadData.new!, phone: e.target.value },
                        })}
                        placeholder="05X-XXXXXXX"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Project Selection */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">בחר או צור פרויקט</h3>
                
                <div className="flex gap-2">
                  <Button
                    variant={projectData.mode === 'select' ? 'default' : 'outline'}
                    onClick={() => setProjectData({ mode: 'select' })}
                    className="flex-1"
                  >
                    בחר פרויקט קיים
                  </Button>
                  <Button
                    variant={projectData.mode === 'create' ? 'default' : 'outline'}
                    onClick={() => setProjectData({
                      mode: 'create',
                      new: { title: '', address: { street: '', city: '', zip: '', notes: '' } },
                    })}
                    className="flex-1"
                  >
                    צור פרויקט חדש
                  </Button>
                </div>

                {projectData.mode === 'select' && (
                  <div className="space-y-2">
                    <Label>בחר פרויקט</Label>
                    {availableProjects.length > 0 ? (
                      <div className="space-y-2">
                        {availableProjects.map(proj => (
                          <Button
                            key={proj.id}
                            variant={projectData.project_id === proj.id ? 'default' : 'outline'}
                            className="w-full justify-start"
                            onClick={() => setProjectData({
                              mode: 'select',
                              project_id: proj.id,
                              project_title: proj.title,
                            })}
                          >
                            {proj.title}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">אין פרויקטים עבור לקוח זה. צור פרויקט חדש.</p>
                    )}
                  </div>
                )}

                {projectData.mode === 'create' && (
                  <div className="space-y-4">
                    <div>
                      <Label>שם פרויקט *</Label>
                      <Input
                        value={projectData.new?.title || ''}
                        onChange={(e) => setProjectData({
                          ...projectData,
                          new: { ...projectData.new!, title: e.target.value },
                        })}
                        placeholder="הזן שם פרויקט"
                      />
                    </div>
                    <div>
                      <Label>כתובת רחוב</Label>
                      <Input
                        value={projectData.new?.address.street || ''}
                        onChange={(e) => setProjectData({
                          ...projectData,
                          new: {
                            ...projectData.new!,
                            address: { ...projectData.new!.address, street: e.target.value },
                          },
                        })}
                        placeholder="רחוב"
                      />
                    </div>
                    <div>
                      <Label>עיר</Label>
                      <Input
                        value={projectData.new?.address.city || ''}
                        onChange={(e) => setProjectData({
                          ...projectData,
                          new: {
                            ...projectData.new!,
                            address: { ...projectData.new!.address, city: e.target.value },
                          },
                        })}
                        placeholder="עיר"
                      />
                    </div>
                    <div>
                      <Label>מיקוד</Label>
                      <Input
                        value={projectData.new?.address.zip || ''}
                        onChange={(e) => setProjectData({
                          ...projectData,
                          new: {
                            ...projectData.new!,
                            address: { ...projectData.new!.address, zip: e.target.value },
                          },
                        })}
                        placeholder="מיקוד"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Order Details */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">פרטי הזמנה</h3>
                
                <div>
                  <Label>כותרת הזמנה *</Label>
                  <Input
                    value={orderTitle}
                    onChange={(e) => setOrderTitle(e.target.value)}
                    placeholder="הזן כותרת"
                  />
                </div>

                <div>
                  <Label>תיאור</Label>
                  <Textarea
                    value={orderDescription}
                    onChange={(e) => setOrderDescription(e.target.value)}
                    placeholder="תיאור ההזמנה"
                    rows={3}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">פרטי לקוח</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>שם לקוח</Label>
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={leadData.new?.full_name || "שם הלקוח"}
                      />
                    </div>
                    <div>
                      <Label>אימייל לקוח</Label>
                      <Input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder={leadData.new?.email || "email@example.com"}
                      />
                    </div>
                    <div>
                      <Label>טלפון לקוח</Label>
                      <Input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder={leadData.new?.phone || "05X-XXXXXXX"}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>תאריך התחלה</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>תאריך סיום</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>כתובת רחוב</Label>
                  <Input
                    value={orderAddress.street}
                    onChange={(e) => setOrderAddress({ ...orderAddress, street: e.target.value })}
                    placeholder="רחוב"
                  />
                </div>

                <div>
                  <Label>עיר</Label>
                  <Input
                    value={orderAddress.city}
                    onChange={(e) => setOrderAddress({ ...orderAddress, city: e.target.value })}
                    placeholder="עיר"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Items */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">פריטי הזמנה</h3>
                
                {items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">פריט {index + 1}</span>
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label>שם פריט *</Label>
                      <Input
                        value={item.product_name}
                        onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                        placeholder="שם הפריט"
                      />
                    </div>

                    <div>
                      <Label>תיאור</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="תיאור"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label>כמות *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>מחיר יחידה *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>סה"כ</Label>
                        <Input
                          type="text"
                          value={`₪${(item.quantity * item.unit_price).toFixed(2)}`}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addItem}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף פריט
                </Button>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>סה"כ הזמנה:</span>
                    <span>₪{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || loading}
              >
                <ChevronRight className="w-4 h-4 ml-2" />
                הקודם
              </Button>

              {step < 4 ? (
                <Button onClick={handleNext} disabled={loading}>
                  הבא
                  <ChevronLeft className="w-4 h-4 mr-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      יוצר הזמנה...
                    </>
                  ) : (
                    'צור הזמנה'
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SelectLeadDialog
        open={showSelectLeadDialog}
        onOpenChange={setShowSelectLeadDialog}
        supplierId={user?.id || ''}
        onLeadSelected={(leadId, clientId, leadName) => {
          handleLeadSelected(leadId, clientId || null, leadName || '');
        }}
      />
    </>
  );
}
