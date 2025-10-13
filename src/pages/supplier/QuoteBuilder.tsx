import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Plus, Trash2, Download, Send, Save, Calculator, Users, Share2 } from 'lucide-react';
import { showToast } from '@/utils/toast';
import { quotesService, Quote, QuoteItem, CreateQuoteItemPayload } from '@/services/quotesService';
import { QuotePDF } from '@/components/quotes/QuotePDF';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageBoundary } from '@/components/system/PageBoundary';
import { usePageLoadTimer } from '@/hooks/usePageLoadTimer';
import { withTimeout } from '@/lib/withTimeout';

interface LocalQuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
}

export default function QuoteBuilder() {
  usePageLoadTimer('QuoteBuilder');
  
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');
  const quoteId = searchParams.get('quoteId');
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('הצעת מחיר חדשה');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  
  const [items, setItems] = useState<LocalQuoteItem[]>([
    { id: crypto.randomUUID(), name: '', description: '', quantity: 1, unit_price: 0, total: 0, sort_order: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(17);
  const [shareLink, setShareLink] = useState<string | null>(null);
  
  // Auto-save
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load supplier products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['supplier-products', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('products')
          .select('id, name, description, price, is_service')
          .eq('supplier_id', profile!.id)
          .eq('is_published', true)
          .order('name'),
        12000
      );
      
      if (error) throw error;
      return data || [];
    },
    retry: 1,
    staleTime: 60_000,
  });

  // Load clients for the dropdown
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async ({ signal }) => {
      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('role', 'client'),
        12000
      );
      
      if (error) throw new Error('שגיאה בטעינת רשימת הלקוחות');
      return data || [];
    },
    retry: 1,
    staleTime: 60_000,
  });

  // Load quote data (if editing existing quote)
  const { data: quoteData, isLoading: quoteLoading, error: quoteError } = useQuery({
    queryKey: ['quote', quoteId],
    enabled: !!quoteId,
    queryFn: async ({ signal }) => {
      const result = await withTimeout(quotesService.getQuoteById(quoteId!), 12000);
      if (!result) throw new Error('הצעת המחיר לא נמצאה');
      return result;
    },
    retry: 1,
    staleTime: 60_000,
  });

  // Load lead data (if creating from lead)
  const { data: leadData, isLoading: leadLoading } = useQuery({
    queryKey: ['lead', leadId],
    enabled: !!leadId,
    queryFn: async ({ signal }) => {
      const { data, error } = await withTimeout(
        supabase
          .from('leads')
          .select('*')
          .eq('id', leadId!)
          .maybeSingle(),
        12000
      );
      
      if (error) throw new Error('שגיאה בטעינת פרטי הליד');
      return data as unknown as { name: string; contact_email: string; contact_phone: string; client_id: string; notes: string } | null;
    },
    retry: 1,
    staleTime: 60_000,
  });

  // Load client info for existing quote
  const { data: clientInfo } = useQuery({
    queryKey: ['client-info', quoteData?.quote.client_id],
    enabled: !!quoteData?.quote.client_id,
    queryFn: async ({ signal }) => {
      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', quoteData!.quote.client_id!)
          .maybeSingle(),
        12000
      );
      
      if (error) throw new Error('שגיאה בטעינת פרטי הלקוח');
      return data;
    },
    retry: 1,
    staleTime: 60_000,
  });

  // Initialize form data when quote/lead data loads
  React.useEffect(() => {
    if (quoteData) {
      const { quote, items: quoteItems } = quoteData;
      setQuote(quote);
      setTitle(quote.title);
      setSelectedClientId(quote.client_id || '');
      setNotes(quote.notes || '');
      setTaxRate(quote.tax_rate);
      
      // Convert quote items to local format
      const localItems = quoteItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.subtotal,
        sort_order: item.sort_order
      }));
      
      if (localItems.length > 0) {
        setItems(localItems);
      }
    }
  }, [quoteData]);

  React.useEffect(() => {
    if (clientInfo) {
      setClientName(clientInfo.full_name || '');
      setClientEmail(clientInfo.email || '');
    }
  }, [clientInfo]);

  React.useEffect(() => {
    if (leadData) {
      setTitle(`הצעת מחיר עבור ${leadData.name || 'ליד'}`);
      if (leadData.client_id) {
        setSelectedClientId(leadData.client_id);
      }
      setClientName(leadData.name || '');
      setClientEmail(leadData.contact_email || '');
      setNotes(leadData.notes || '');
    }
  }, [leadData]);

  const addItem = () => {
    const newItem: LocalQuoteItem = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
      sort_order: items.length
    };
    setItems([...items, newItem]);
    triggerAutoSave();
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
      triggerAutoSave();
    }
  };

  const updateItem = (id: string, field: keyof LocalQuoteItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total = updatedItem.quantity * updatedItem.unit_price;
        }
        return updatedItem;
      }
      return item;
    }));
    triggerAutoSave();
  };

  const calculations = quotesService.calculateTotals(
    items,
    discount,
    taxRate
  );

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    autoSaveTimer.current = setTimeout(handleSaveDraft, 3000);
  }, []);

  const handleSaveDraft = async () => {
    if (!profile?.id || saving) return;
    
    setSaving(true);
    try {
      let currentQuote = quote;
      
      // Create quote if it doesn't exist
      if (!currentQuote) {
        currentQuote = await quotesService.createQuote({
          title,
          client_id: selectedClientId || undefined,
          notes,
          tax_rate: taxRate
        });
        setQuote(currentQuote);
        
        // Update URL to include quote ID
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('quoteId', currentQuote.id);
        if (leadId) newSearchParams.delete('leadId'); // Remove leadId after creation
        navigate(`?${newSearchParams.toString()}`, { replace: true });
      }
      
      // Update quote details
      await quotesService.updateQuote(currentQuote.id, {
        title,
        client_id: selectedClientId || undefined,
        notes,
        subtotal: calculations.subtotal,
        tax_rate: taxRate,
        tax_amount: calculations.taxAmount,
        total_amount: calculations.totalAmount
      });

      // Sync items with database
      const { items: currentItems } = await quotesService.getQuoteById(currentQuote.id) || { items: [] };
      
      // Remove items that no longer exist
      for (const dbItem of currentItems) {
        if (!items.find(item => item.id === dbItem.id)) {
          await quotesService.removeItem(dbItem.id);
        }
      }
      
      // Update or create items
      for (const item of items) {
        const dbItem = currentItems.find(db => db.id === item.id);
        
        if (dbItem) {
          // Update existing item
          await quotesService.updateItem(item.id, {
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            sort_order: item.sort_order
          });
        } else {
          // Create new item
          const newItem = await quotesService.addItem(currentQuote.id, {
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            sort_order: item.sort_order
          });
          
          // Update local item with DB id
          setItems(prevItems => 
            prevItems.map(prevItem => 
              prevItem.id === item.id ? { ...prevItem, id: newItem.id } : prevItem
            )
          );
        }
      }
      
      showToast.success('הצעת המחיר נשמרה');
    } catch (error) {
      console.error('Failed to save quote:', error);
      showToast.error('שגיאה בשמירת הצעת המחיר');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!quote || !profile) {
      showToast.info('💾 נא לשמור את ההצעה לפני הורדת PDF');
      // Auto-trigger save
      await handleSaveDraft();
      return;
    }

    try {
      const quoteData = await quotesService.getQuoteById(quote.id);
      if (!quoteData) return;

      const supplierInfo = {
        name: profile.full_name || 'ספק',
        email: profile.email
      };

      const clientInfo = {
        name: clientName,
        email: clientEmail
      };

      const doc = (
        <QuotePDF
          quote={quoteData.quote}
          items={quoteData.items}
          supplierInfo={supplierInfo}
          clientInfo={clientInfo}
          calculations={calculations}
          discountPercent={discount}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quote-${quote.id.slice(0, 8)}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      showToast.success('קובץ PDF הורד בהצלחה');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      showToast.error('שגיאה ביצירת קובץ PDF');
    }
  };

  const handleSendToCustomer = async () => {
    if (!quote) {
      showToast.error('נא לשמור את ההצעה תחילה');
      return;
    }
    
    if (!selectedClientId) {
      showToast.error('נא לבחור לקוח');
      return;
    }
    
    if (items.some(item => !item.name || item.quantity <= 0 || item.unit_price <= 0)) {
      showToast.error('נא למלא את כל פרטי הפריטים');
      return;
    }

    try {
      await quotesService.sendQuote(quote.id, selectedClientId);
      setQuote(prev => prev ? { ...prev, status: 'sent' } : null);
    } catch (error) {
      console.error('Failed to send quote:', error);
      showToast.error('שגיאה בשליחת הצעת המחיר');
    }
  };

  const handleGenerateShareLink = async () => {
    if (!quote) {
      showToast.error('נא לשמור את ההצעה תחילה');
      return;
    }
    
    try {
      const link = await quotesService.generateShareLink(quote.id);
      setShareLink(link);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(link);
      showToast.success('קישור לשיתוף הועתק ללוח!');
    } catch (error) {
      console.error('Failed to generate share link:', error);
      showToast.error('שגיאה ביצירת קישור לשיתוף');
    }
  };

  // Cleanup auto-save timer
  React.useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setClientName(client.full_name || '');
      setClientEmail(client.email || '');
    }
  };

  const isLoading = clientsLoading || quoteLoading || leadLoading;
  const isError = quoteError;

  return (
    <PageBoundary 
      isLoading={isLoading}
      isError={!!isError}
      error={isError}
      onRetry={() => window.location.reload()}
    >
      <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/supplier/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                חזור לדשבורד
              </Button>
              <h1 className="text-2xl font-bold text-foreground">
                {quote ? 'עריכת הצעת מחיר' : 'הצעת מחיר חדשה'}
                {saving && <span className="text-sm text-muted-foreground mr-2">(שומר...)</span>}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveDraft}
                disabled={saving}
              >
                <Save className="w-4 h-4 ml-1" />
                שמור כטיוטה
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button 
                        variant="blue" 
                        size="sm" 
                        onClick={handleDownloadPDF}
                        disabled={!quote}
                      >
                        <Download className="w-4 h-4 ml-1" />
                        הורד PDF
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>הורד PDF של הצעת המחיר</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleSendToCustomer}
                disabled={!quote || quote.status !== 'draft'}
              >
                <Send className="w-4 h-4 ml-1" />
                שלח ללקוח
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Quote Details */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>פרטי הצעת מחיר</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">כותרת</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="הצעת מחיר לפרויקט..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">לקוח</label>
                <Select value={selectedClientId} onValueChange={handleClientSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר לקוח" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">הערות ללקוח</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות והבהרות ללקוח..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>פריטים</CardTitle>
              <Button
                size="sm"
                onClick={addItem}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                הוסף פריט
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">שם</TableHead>
                    <TableHead>תיאור</TableHead>
                    <TableHead className="w-[100px]">כמות</TableHead>
                    <TableHead className="w-[120px]">מחיר ליחידה</TableHead>
                    <TableHead className="w-[120px]">סה"כ</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          placeholder="שם הפריט"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="תיאור"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        ₪{item.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Price Summary */}
        <Card>
          <CardHeader>
            <CardTitle>סיכום מחירים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">הנחה (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">מע"מ (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>סכום חלקי:</span>
                <span>₪{calculations.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>הנחה ({discount}%):</span>
                <span className="text-destructive">-₪{calculations.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>לפני מע"מ:</span>
                <span>₪{calculations.taxableAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>מע"מ ({taxRate}%):</span>
                <span>₪{calculations.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>סה"כ לתשלום:</span>
                <span>₪{calculations.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Link Section */}
        {quote && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>שתף הצעת מחיר</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateShareLink}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 ml-1" />
                  צור קישור לשיתוף
                </Button>
              </div>
              {shareLink && (
                <div className="mt-2 p-2 bg-muted rounded text-sm break-all">
                  {shareLink}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </PageBoundary>
  );
}
