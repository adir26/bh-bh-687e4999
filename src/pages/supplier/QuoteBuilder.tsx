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
                  {!quote && (
                    <TooltipContent>
                      <p>נא לשמור את ההצעה תחילה</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quote Title Card */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי הצעת המחיר</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">כותרת הצעת המחיר</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="הזן כותרת להצעת המחיר"
                />
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-muted-foreground">מספר הצעת מחיר:</p>
                <p className="font-bold text-lg">
                  {quote ? quote.id.slice(0, 8).toUpperCase() : 'חדש'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  תאריך: {quote ? new Date(quote.created_at).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL')}
                </p>
                {quote && (
                  <p className="text-sm text-muted-foreground">
                    סטטוס: {quote.status === 'draft' ? 'טיוטה' : quote.status === 'sent' ? 'נשלחה' : quote.status === 'accepted' ? 'אושרה' : 'נדחתה'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי הלקוח</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">בחר לקוח קיים</label>
                <Select value={selectedClientId} onValueChange={handleClientSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר לקוח מהרשימה" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {client.full_name || client.email}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">שם הלקוח</label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="הזן שם לקוח"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">אימייל</label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>פירוט השירותים/מוצרים</CardTitle>
            <Button onClick={addItem} size="sm">
              <Plus className="w-4 h-4 ml-1" />
              הוסף פריט
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">תיאור</TableHead>
                    <TableHead className="text-right w-24">כמות</TableHead>
                    <TableHead className="text-right w-32">מחיר ליחידה</TableHead>
                    <TableHead className="text-right w-32">סכום חלקי</TableHead>
                    <TableHead className="text-right w-16">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="space-y-2">
                          {products.length > 0 && (
                            <Select 
                              value=""
                              onValueChange={(productId) => {
                                const product = products.find(p => p.id === productId);
                                if (product) {
                                  updateItem(item.id, 'name', product.name);
                                  updateItem(item.id, 'description', product.description || '');
                                  updateItem(item.id, 'unit_price', product.price);
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="בחר ממוצרים קיימים (אופציונלי)" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} - ₪{product.price.toLocaleString('he-IL')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            placeholder="שם הפריט (או הזן ידנית)"
                          />
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="תיאור נוסף (אופציונלי)"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          min="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        ₪{item.total.toLocaleString('he-IL')}
                      </TableCell>
                      <TableCell>
                        {items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              סיכום מחירים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">הנחה (%)</label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">מע"ם (%)</label>
                  <Input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span>סכום ביניים:</span>
                  <span>₪{calculations.subtotal.toLocaleString('he-IL')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>הנחה ({discount}%):</span>
                    <span>-₪{calculations.discountAmount.toLocaleString('he-IL')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>לפני מע"ם:</span>
                  <span>₪{calculations.taxableAmount.toLocaleString('he-IL')}</span>
                </div>
                <div className="flex justify-between">
                  <span>מע"מ ({taxRate}%):</span>
                  <span>₪{calculations.taxAmount.toLocaleString('he-IL')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>סה"כ:</span>
                  <span>₪{calculations.totalAmount.toLocaleString('he-IL')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes Card */}
        <Card>
          <CardHeader>
            <CardTitle>הערות ותנאים</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                triggerAutoSave();
              }}
              placeholder="הוסף הערות, תנאי תשלום, זמני אספקה וכד'..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="blue" 
            className="flex-1" 
            onClick={handleSendToCustomer}
            disabled={!quote || quote.status !== 'draft' || !selectedClientId}
          >
            <Send className="w-4 h-4 ml-1" />
            שלח ללקוח
          </Button>
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleGenerateShareLink}
            disabled={!quote}
          >
            <Share2 className="w-4 h-4 ml-1" />
            צור קישור לשיתוף
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleDownloadPDF}
                    disabled={!quote}
                  >
                    <Download className="w-4 h-4 ml-1" />
                    הורד PDF
                  </Button>
                </span>
              </TooltipTrigger>
              {!quote && (
                <TooltipContent>
                  <p>נא לשמור את ההצעה תחילה</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleSaveDraft}
            disabled={saving}
          >
            <Save className="w-4 h-4 ml-1" />
            שמור כטיוטה
          </Button>
        </div>

        {/* Share Link Display */}
        {shareLink && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">קישור לשיתוף (תקף 30 יום):</p>
              <code className="text-xs bg-white p-2 rounded block overflow-x-auto border border-blue-200">
                {shareLink}
              </code>
              <p className="text-xs text-blue-600 mt-2">הקישור הועתק ללוח. שתף אותו עם הלקוח!</p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </PageBoundary>
  );
}