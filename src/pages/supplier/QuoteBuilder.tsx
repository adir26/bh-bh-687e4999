import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Plus, Trash2, Download, Save, Users, Share2, PackageCheck, Palette } from 'lucide-react';
import { showToast } from '@/utils/toast';
import { quotesService, Quote } from '@/services/quotesService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { PageBoundary } from '@/components/system/PageBoundary';
import { usePageLoadTimer } from '@/hooks/usePageLoadTimer';
import { withTimeout } from '@/lib/withTimeout';
import { isValidUUID } from '@/utils/validation';
import { createPdfBlob } from '@/utils/pdf';
import { TemplatePreview } from '@/components/proposal/TemplatePreview';

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
  const [selectedClientValue, setSelectedClientValue] = useState(''); // For display in Select
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // Add new client modal state
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [items, setItems] = useState<LocalQuoteItem[]>([
    {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
      sort_order: 0,
    },
  ]);

  const [notes, setNotes] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(17);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('premium');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  // Load clients - combine profiles AND leads for the dropdown
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients-for-quote', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      // Get actual clients from profiles
      const { data: profileClients, error: profileError } = await withTimeout(
        supabase.from('profiles').select('id, full_name, email').eq('role', 'client'),
        12000
      );
      if (profileError) throw new Error('שגיאה בטעינת רשימת הלקוחות');

      // Get leads that belong to this supplier (potential clients)
      const { data: leadClients, error: leadError } = await withTimeout(
        supabase
          .from('leads')
          .select('id, name, contact_email, client_id')
          .eq('supplier_id', profile!.id)
          .not('name', 'is', null)
          .order('created_at', { ascending: false }),
        12000
      );
      if (leadError) throw new Error('שגיאה בטעינת לידים');

      // Combine both lists, avoiding duplicates
      const combined: Array<{ id: string; full_name: string; email: string; isLead?: boolean }> = [
        ...(profileClients || []).map((c) => ({
          id: c.id,
          full_name: c.full_name || '',
          email: c.email || '',
        })),
      ];

      // Add leads that don't have a client_id (i.e., not yet converted to client)
      (leadClients || []).forEach((lead) => {
        if (!lead.client_id) {
          combined.push({
            id: `lead:${lead.id}`,
            full_name: lead.name || '',
            email: lead.contact_email || '',
            isLead: true,
          });
        }
      });
      return combined;
    },
    retry: 1,
    staleTime: 60_000,
  });

  // Load quote data (if editing existing quote)
  const {
    data: quoteData,
    isLoading: quoteLoading,
    error: quoteError,
  } = useQuery({
    queryKey: ['quote', quoteId],
    enabled: !!quoteId,
    queryFn: async () => {
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
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from('leads').select('*').eq('id', leadId!).maybeSingle(),
        12000
      );
      if (error) throw new Error('שגיאה בטעינת פרטי הליד');
      return (data as unknown) as {
        name: string;
        contact_email: string;
        contact_phone: string;
        client_id: string;
        notes: string;
      } | null;
    },
    retry: 1,
    staleTime: 60_000,
  });

  // Load client info for existing quote
  const { data: clientInfo } = useQuery({
    queryKey: ['client-info', quoteData?.quote.client_id],
    enabled: !!quoteData?.quote.client_id,
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from('profiles').select('full_name, email').eq('id', quoteData!.quote.client_id!).maybeSingle(),
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
      
      // Handle both client_id and lead_id
      if (quote.lead_id) {
        setSelectedClientValue(`lead:${quote.lead_id}`);
        setSelectedClientId('');
      } else {
        setSelectedClientId(quote.client_id || '');
        setSelectedClientValue(quote.client_id || '');
      }
      
      setNotes(quote.notes || '');
      setTermsConditions(quote.terms_conditions || '');
      setSelectedTemplate(quote.template || 'premium');
      // Calculate tax_rate from tax_amount and subtotal
      if (quote.subtotal > 0 && quote.tax_amount) {
        setTaxRate((quote.tax_amount / quote.subtotal) * 100);
      } else {
        setTaxRate(17); // Default VAT rate in Israel
      }

      // Convert quote items to local format
      const localItems = quoteItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.subtotal,
        sort_order: item.sort_order,
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
      sort_order: items.length,
    };
    setItems([...items, newItem]);
    triggerAutoSave();
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
      triggerAutoSave();
    }
  };

  const updateItem = (id: string, field: keyof LocalQuoteItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value } as LocalQuoteItem;
          if (field === 'quantity' || field === 'unit_price') {
            updatedItem.total = updatedItem.quantity * updatedItem.unit_price;
          }
          return updatedItem;
        }
        return item;
      })
    );
    triggerAutoSave();
  };

  const calculations = quotesService.calculateTotals(items, discount, taxRate);

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    autoSaveTimer.current = setTimeout(handleSaveDraft, 3000);
  }, []);

  const handleSaveDraft = async () => {
    if (!profile?.id || saving) return;

    // Validation
    if (!title.trim()) {
      showToast.error('נא להזין כותרת להצעת המחיר');
      return;
    }
    if (items.length === 0) {
      showToast.error('יש להוסיף לפחות פריט אחד');
      return;
    }
    setSaving(true);
    try {
      let currentQuote = quote;

      // Parse lead_id if selected value is a lead
      const isLead = selectedClientValue.startsWith('lead:');
      const leadIdValue = isLead ? selectedClientValue.slice(5) : undefined;
      const clientIdValue = !isLead && selectedClientId && isValidUUID(selectedClientId) ? selectedClientId : undefined;

      // Create quote if it doesn't exist
      if (!currentQuote) {
        currentQuote = await quotesService.createQuote({
          title,
          client_id: clientIdValue,
          lead_id: leadIdValue,
          notes,
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
        client_id: clientIdValue,
        lead_id: leadIdValue,
        notes,
        terms_conditions: termsConditions,
        subtotal: calculations.subtotal,
        tax_amount: calculations.taxAmount,
        total_amount: calculations.totalAmount,
        template: selectedTemplate,
      } as any);

      // Sync items with database
      const { items: currentItems } = (await quotesService.getQuoteById(currentQuote.id)) || { items: [] };

      // Remove items that no longer exist
      for (const dbItem of currentItems) {
        if (!items.find((item) => item.id === dbItem.id)) {
          await quotesService.removeItem(dbItem.id);
        }
      }

      // Update or create items
      for (const item of items) {
        const dbItem = currentItems.find((db) => db.id === item.id);
        if (dbItem) {
          // Update existing item
          await quotesService.updateItem(item.id, {
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            sort_order: item.sort_order,
          });
        } else {
          // Create new item
          const newItem = await quotesService.addItem(currentQuote.id, {
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            sort_order: item.sort_order,
          });

          // Update local item with DB id
          setItems((prevItems) =>
            prevItems.map((prevItem) => (prevItem.id === item.id ? { ...prevItem, id: newItem.id } : prevItem))
          );
        }
      }
      showToast.success(`הצעת המחיר "${title}" נשמרה בהצלחה`);
      return currentQuote; // Return the quote for PDF generation
    } catch (error: any) {
      console.error('Failed to save quote:', error);
      showToast.error(error.message || 'שגיאה בשמירת הצעת המחיר');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // If no quote exists, save first
      let currentQuote = quote;
      if (!currentQuote) {
        showToast.info('שומר את ההצעה לפני יצירת PDF...');
        currentQuote = await handleSaveDraft();
        if (!currentQuote) return;
      }

      // העברת טוקן גישה (אם קיים) + בקשת בינארי עם כותרות מפורשות
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const invokeOptions: any = {
        body: { quoteId: currentQuote.id, template: selectedTemplate },
        // @ts-ignore: responseType נתמך על-ידי supabase-js לקריאות Functions
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/pdf',
        },
      };

      if (accessToken) {
        invokeOptions.headers = {
          ...invokeOptions.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      }

      const { data, error } = await supabase.functions.invoke('generate-quote-pdf', invokeOptions);
      if (error) throw error;

      if (!data || (data as ArrayBuffer).byteLength === 0) {
        throw new Error('שרת לא החזיר PDF תקין');
      }

      const blob = createPdfBlob(data as ArrayBuffer);

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quote-${currentQuote.id.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast.success('PDF הורד בהצלחה');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      const message = error?.message || 'שגיאה ביצירת PDF';
      showToast.error(message);
    }
  };

  const handleSendToCustomer = async () => {
    if (items.length === 0) {
      showToast.error('יש להוסיף לפחות פריט אחד');
      return;
    }

    // Must have a valid client UUID (not a lead) to send
    if (!selectedClientId || !isValidUUID(selectedClientId)) {
      showToast.error('נא לבחור לקוח עם פרופיל (לא ליד) לשליחת הצעת מחיר');
      return;
    }
    try {
      const savedQuote = await handleSaveDraft();
      if (!savedQuote) {
        showToast.error('שגיאה בשמירת הצעת המחיר');
        return;
      }
      await quotesService.sendQuote(savedQuote.id, selectedClientId);
      showToast.success('הצעת המחיר נשלחה בהצלחה');
      navigate('/supplier/quotes');
    } catch (error: any) {
      console.error('Error sending quote:', error);
      showToast.error(error.message || 'שגיאה בשליחת הצעת המחיר');
    }
  };

  const handleMarkAsSent = async () => {
    if (items.length === 0) {
      showToast.error('יש להוסיף לפחות פריט אחד');
      return;
    }
    // Check if client/lead is selected
    if (!selectedClientValue) {
      showToast.error('נא לבחור לקוח או ליד לפני שליחה');
      return;
    }
    try {
      let currentQuote = quote;
      if (!currentQuote) {
        showToast.info('שומר את ההצעה לפני שליחה...');
        currentQuote = await handleSaveDraft();
        if (!currentQuote) return;
      }
      const updated = await quotesService.updateQuote(currentQuote.id, {
        status: 'sent' as any,
        sent_at: new Date().toISOString() as any,
      } as any);
      setQuote(updated);
      const isLead = selectedClientValue.startsWith('lead:');
      showToast.success(
        `הצעת המחיר סומנה כ"נשלחה"${isLead ? ' לליד' : ' ללקוח'}. כעת ${isLead ? 'הליד' : 'הלקוח'} יוכל לאשר או לדחות.`
      );
    } catch (error: any) {
      console.error('Failed to mark quote as sent:', error);
      showToast.error(error?.message || 'שגיאה בעדכון סטטוס להצעת מחיר');
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      // If no quote exists, save first
      let currentQuote = quote;
      if (!currentQuote) {
        showToast.info('שומר את ההצעה לפני יצירת קישור...');
        currentQuote = await handleSaveDraft();
        if (!currentQuote) return;
      }

      const link = await quotesService.generateShareLink(currentQuote.id);
      setShareLink(link);

      // Copy to clipboard
      await navigator.clipboard.writeText(link);
      showToast.success('קישור לשיתוף הועתק ללוח!');
    } catch (error) {
      console.error('Failed to generate share link:', error);
      showToast.error('שגיאה ביצירת קישור לשיתוף');
    }
  };

  const handleDeleteQuote = async () => {
    if (!quote) return;
    try {
      await quotesService.deleteQuote(quote.id);
      navigate('/supplier/quotes');
    } catch (error) {
      console.error('Failed to delete quote:', error);
    }
  };

  const handleConvertToOrder = async () => {
    if (!quote) return;
    try {
      const order = await quotesService.convertToOrder(quote.id);
      navigate(`/supplier/orders/${order.id}`);
    } catch (error) {
      console.error('Failed to convert quote to order:', error);
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

  // Handle client selection - support both profiles and leads
  const handleClientSelect = (value: string) => {
    setSelectedClientValue(value);

    // Check if this is a lead (prefixed with "lead:")
    if (value.startsWith('lead:')) {
      setSelectedClientId(''); // No actual client_id yet
      const client = clients.find((c) => c.id === value);
      if (client) {
        setClientName(client.full_name || '');
        setClientEmail(client.email || '');
      }
    } else {
      // Regular client from profiles
      setSelectedClientId(value);
      const client = clients.find((c) => c.id === value);
      if (client) {
        setClientName(client.full_name || '');
        setClientEmail(client.email || '');
      }
    }
  };

  // Handle creating a new client (as a lead)
  const handleCreateNewClient = async () => {
    // שם הוא חובה
    if (!newClientData.name.trim()) {
      showToast.error('נא למלא שם לקוח');
      return;
    }

    // אימייל אופציונלי, אבל אם מולא צריך להיות תקין
    if (newClientData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newClientData.email)) {
        showToast.error('נא להזין כתובת אימייל תקינה');
        return;
      }
    }
    try {
      // Create lead in database
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert({
          supplier_id: profile!.id,
          name: newClientData.name,
          contact_email: newClientData.email.trim() || null,
          contact_phone: newClientData.phone || null,
          source_key: 'website',
          priority_key: 'medium',
          notes: newClientData.notes || null,
          status: 'new',
        } as any)
        .select()
        .maybeSingle();
      if (error) throw error;
      if (newLead) {
        // Set client details in the form
        setSelectedClientValue(`lead:${newLead.id}`);
        setSelectedClientId(''); // No profile ID yet
        setClientName(newLead.name);
        setClientEmail(newLead.contact_email || '');
        setIsAddingClient(false);
        setNewClientData({ name: '', email: '', phone: '', notes: '' });
        showToast.success('לקוח جديد נוסף בהצלחה');
      }
    } catch (error) {
      console.error('Failed to create client:', error);
      showToast.error('שגיאה ביצירת לקוח חדש');
    }
  };

  const isLoading = clientsLoading || quoteLoading || leadLoading;
  const isError = quoteError;

  return (
    <PageBoundary isLoading={isLoading} isError={!!isError} error={isError} onRetry={() => window.location.reload()}>
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
                <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={saving}>
                  <Save className="w-4 h-4 ml-1" />
                  שמור כטיוטה
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button variant="blue" size="sm" onClick={handleDownloadPDF}>
                          <Download className="w-4 h-4 ml-1" />
                          הורד PDF
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>הורד PDF של הצעת המחיר</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 pb-20">
          {/* Template Selection - Always Visible */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                תבנית עיצוב
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">תבנית נוכחית: <span className="font-semibold">{selectedTemplate}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">עיצוב זה יחול על ה-PDF שיופק</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  בחר תבנית
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quote Details */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>פרטי הצעת מחיר</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">כותרת</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="הצעת מחיר לפרויקט..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">לקוח</label>
                  <div className="flex items-center gap-2">
                    <Select value={selectedClientValue} onValueChange={handleClientSelect}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            clientsLoading
                              ? 'טוען לקוחות...'
                              : clients.length === 0
                              ? 'אין לקוחות - הוסף לקוח חדש'
                              : 'בחר לקוח מהרשימה'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {clients.map((client: any) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.full_name} {client.email ? `(${client.email})` : '(ללא אימייל)'}
                            {client.isLead && <span className="text-xs text-muted-foreground mr-2">[ליד]</span>}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingClient(true)}
                      className="whitespace-nowrap flex items-center gap-1"
                    >
                      <Users className="w-4 h-4" />
                      לקוח חדש
                    </Button>
                  </div>
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
              <div>
                <label className="text-sm font-medium mb-1 block">תנאי ההצעה</label>
                <Textarea
                  value={termsConditions}
                  onChange={(e) => setTermsConditions(e.target.value)}
                  placeholder={"תנאי תשלום: 30 יום מיום שליחת הצעה\nאחריות: 12 חודשים\nתוקף ההצעה: 30 יום"}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>פריטים</CardTitle>
                <Button size="sm" onClick={addItem} className="flex items-center gap-1">
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
                    {items.map((item) => (
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
                        <TableCell className="font-medium">₪{item.total.toFixed(2)}</TableCell>
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

          {/* Actions Section */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>פעולות נוספות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">תבנית עיצוב</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplateDialog(true)}
                    className="flex items-center gap-1"
                  >
                    <Palette className="w-4 h-4" />
                    בחר תבנית
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">תבנית נוכחית: {selectedTemplate}</p>
              </div>

              {/* Mark as Sent (save before sending) */}
              <div>
                <Button onClick={handleMarkAsSent} className="w-full">
                  <Save className="w-4 h-4 ml-1" />
                  שמירה לפני שליחה
                </Button>
                <p className="text-xs text-muted-foreground mt-1">כדי לאפשר ללקוח לאשר/לדחות, יש לשמור ולסמן כ“נשלח”.</p>
              </div>

              {/* Share Link */}
              <div>
                <Button variant="outline" onClick={handleGenerateShareLink} className="w-full">
                  <Share2 className="w-4 h-4 ml-1" />
                  צור קישור לשיתוף
                </Button>
                {shareLink && <div className="mt-2 p-2 bg-muted rounded text-sm break-all">{shareLink}</div>}
              </div>

              {/* Convert to Order - only if quote exists and is accepted */}
              {quote?.status === 'accepted' && !quote.order_id && (
                <Button onClick={handleConvertToOrder} variant="default" className="w-full">
                  <PackageCheck className="w-4 h-4 ml-1" />
                  המר להזמנה
                </Button>
              )}

              {/* Delete Quote - only if quote exists and in draft/rejected status */}
              {quote && ['draft', 'rejected'].includes(quote.status) && (
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 ml-1" />
                  מחק הצעת מחיר
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Template Selection Dialog */}
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>בחר תבנית עיצוב</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                {(['premium', 'corporate', 'modern', 'minimal', 'classic'] as const).map((template) => (
                  <TemplatePreview
                    key={template}
                    template={template}
                    isSelected={selectedTemplate === template}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowTemplateDialog(false);
                      showToast.success(`תבנית ${template} נבחרה`);
                      triggerAutoSave();
                    }}
                  />
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                <AlertDialogDescription>
                  פעולה זו תמחק את הצעת המחיר לצמיתות. לא ניתן לבטל פעולה זו.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteQuote} className="bg-destructive text-destructive-foreground">
                  מחק
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Add New Client Dialog */}
          <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>הוסף לקוח חדש</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client-name">שם מלא *</Label>
                  <Input
                    id="client-name"
                    value={newClientData.name}
                    onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                    placeholder="שם הלקוח"
                  />
                </div>
                <div>
                  <Label htmlFor="client-email">אימייל (אופציונלי)</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="client-phone">טלפון</Label>
                  <Input
                    id="client-phone"
                    type="tel"
                    value={newClientData.phone}
                    onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                    placeholder="050-1234567"
                  />
                </div>
                <div>
                  <Label htmlFor="client-notes">הערות</Label>
                  <Textarea
                    id="client-notes"
                    value={newClientData.notes}
                    onChange={(e) => setNewClientData({ ...newClientData, notes: e.target.value })}
                    placeholder="הערות על הלקוח..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingClient(false)}>
                  ביטול
                </Button>
                <Button onClick={handleCreateNewClient}>הוסף לקוח</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageBoundary>
  );
}
