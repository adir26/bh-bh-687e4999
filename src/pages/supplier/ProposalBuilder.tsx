import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Download, Eye, FileText, Palette, Send, Save, Plus, Minus, Upload } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProposalPreview } from '@/components/proposal/ProposalPreview';
import { quotesService } from '@/services/quotesService';
import { proposalsService } from '@/services/proposalsService';
import { useToast } from '@/hooks/use-toast';

interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ProposalData {
  quoteNumber: string;
  creationDate: string;
  supplierInfo: {
    name: string;
    phone: string;
    email: string;
    logo?: string;
  };
  clientInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: ProposalItem[];
  discount: number;
  vat: number;
  notes: string;
  terms: string;
  template: 'modern' | 'minimal' | 'classic' | 'premium' | 'corporate';
}

const ProposalBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { proposalId } = useParams();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('quoteId');
  const { toast } = useToast();
  
  const [showPreview, setShowPreview] = useState(false);
  const [proposalData, setProposalData] = useState<ProposalData>({
    quoteNumber: `PRO-${Date.now().toString().slice(-6)}`,
    creationDate: new Date().toISOString().split('T')[0],
    supplierInfo: {
      name: 'Your Company Name',
      phone: '+972-50-123-4567',
      email: 'contact@yourcompany.com',
    },
    clientInfo: {
      name: '',
      email: '',
      phone: '',
    },
    items: [{
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
    }],
    discount: 0,
    vat: 17,
    notes: '',
    terms: 'תנאי תשלום: 30 יום\nאחריות: 12 חודשים\nמועד אספקה: 7-14 ימי עסקים',
    template: 'premium',
  });

  // Fetch quote data if creating from quote
  const { data: quote } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => quotesService.getQuoteById(quoteId!),
    enabled: !!quoteId && !proposalId
  });

  // Initialize proposal data from quote
  useEffect(() => {
    if (quote && quote.items) {
      const items = quote.items.map((item: any) => ({
        id: item.id,
        description: item.name || item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        subtotal: item.subtotal
      }));

      setProposalData(prev => ({
        ...prev,
        quoteNumber: `Q-${quote.quote.id.slice(-6)}`,
        creationDate: quote.quote.created_at.split('T')[0],
        clientInfo: {
          name: '',
          email: '',
          phone: ''
        },
        items,
        discount: 0,
        vat: ((quote.quote.tax_amount / quote.quote.subtotal) * 100) || 17
      }));
    }
  }, [quote]);

  // Mutations for proposal operations
  const createProposalMutation = useMutation({
    mutationFn: (data: { quoteId: string; htmlContent: string }) =>
      proposalsService.createProposalFromQuote(data.quoteId, data.htmlContent),
    onSuccess: (proposal) => {
      toast({
        title: "הצעה נוצרה בהצלחה",
        description: "ההצעה נשמרה במערכת"
      });
      navigate(`/supplier/proposals/${proposal.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "שגיאה ביצירת הצעה",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const sendForSignatureMutation = useMutation({
    mutationFn: (proposalId: string) => proposalsService.sendForSignature(proposalId),
    onSuccess: (token) => {
      const signatureUrl = `${window.location.origin}/sign/${token}`;
      toast({
        title: "הצעה נשלחה לחתימה",
        description: "קישור החתימה נוצר בהצלחה"
      });
      navigator.clipboard.writeText(signatureUrl);
    },
    onError: (error: any) => {
      toast({
        title: "שגיאה בשליחה לחתימה",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSaveProposal = useCallback(() => {
    if (quoteId) {
      const htmlContent = JSON.stringify(proposalData);
      createProposalMutation.mutate({ quoteId, htmlContent });
    }
  }, [proposalData, quoteId]);

  const handleSendForSignature = useCallback(() => {
    if (!proposalId) {
      toast({
        title: "יש לשמור את הצעת המחיר תחילה",
        description: "נא לשמור את ההצעה לפני שליחה לחתימה",
        variant: "destructive"
      });
      return;
    }
    sendForSignatureMutation.mutate(proposalId);
  }, [proposalId]);

  // Calculations
  const subtotalAmount = proposalData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotalAmount * proposalData.discount) / 100;
  const taxableAmount = subtotalAmount - discountAmount;
  const vatAmount = (taxableAmount * proposalData.vat) / 100;
  const totalAmount = taxableAmount + vatAmount;

  const calculations = { subtotalAmount, discountAmount, vatAmount, totalAmount };

  const addItem = () => {
    const newItem: ProposalItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
    };
    setProposalData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    setProposalData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof ProposalItem, value: any) => {
    setProposalData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.subtotal = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const templateOptions = [
    { value: 'premium', label: 'פרימיום - תבנית A', description: 'עיצוב מודרני עם גרדיאנטים' },
    { value: 'corporate', label: 'קורפורטיבי - תבנית B', description: 'עיצוב עסקי נקי ומקצועי' },
    { value: 'modern', label: 'מודרני', description: 'עיצוב עכשווי ופשוט' },
    { value: 'minimal', label: 'מינימלי', description: 'עיצוב נקי וחסכוני' },
    { value: 'classic', label: 'קלאסי', description: 'עיצוב מסורתי ואלגנטי' }
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">יצירת הצעת מחיר</h1>
                <p className="text-sm text-muted-foreground">מס' הצעה: {proposalData.quoteNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowPreview(!showPreview)} variant="outline" size="sm">
                <Eye className="w-4 h-4 ml-2" />
                {showPreview ? 'עריכה' : 'תצוגה מקדימה'}
              </Button>
              <Button 
                onClick={handleSaveProposal} 
                variant="outline" 
                size="sm"
                disabled={createProposalMutation.isPending}
              >
                <Save className="w-4 h-4 ml-2" />
                שמור הצעה
              </Button>
              {proposalId && (
                <Button 
                  onClick={handleSendForSignature} 
                  size="sm"
                  disabled={sendForSignatureMutation.isPending}
                >
                  <Send className="w-4 h-4 ml-2" />
                  שלח לחתימה
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {showPreview ? (
          <ProposalPreview data={proposalData} calculations={calculations} />
        ) : (
          <>
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  בחירת תבנית
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={proposalData.template}
                  onValueChange={(value: any) => setProposalData(prev => ({ ...prev, template: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateOptions.map(template => (
                      <SelectItem key={template.value} value={template.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{template.label}</span>
                          <span className="text-sm text-muted-foreground">{template.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Company Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>פרטי החברה</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">שם החברה</Label>
                    <Input
                      id="companyName"
                      value={proposalData.supplierInfo.name}
                      onChange={(e) => setProposalData(prev => ({
                        ...prev,
                        supplierInfo: { ...prev.supplierInfo, name: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyPhone">טלפון</Label>
                    <Input
                      id="companyPhone"
                      value={proposalData.supplierInfo.phone}
                      onChange={(e) => setProposalData(prev => ({
                        ...prev,
                        supplierInfo: { ...prev.supplierInfo, phone: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">דואר אלקטרוני</Label>
                    <Input
                      id="companyEmail"
                      value={proposalData.supplierInfo.email}
                      onChange={(e) => setProposalData(prev => ({
                        ...prev,
                        supplierInfo: { ...prev.supplierInfo, email: e.target.value }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>פרטי הלקוח</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clientName">שם הלקוח</Label>
                    <Input
                      id="clientName"
                      value={proposalData.clientInfo.name}
                      onChange={(e) => setProposalData(prev => ({
                        ...prev,
                        clientInfo: { ...prev.clientInfo, name: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">דואר אלקטרוני</Label>
                    <Input
                      id="clientEmail"
                      value={proposalData.clientInfo.email}
                      onChange={(e) => setProposalData(prev => ({
                        ...prev,
                        clientInfo: { ...prev.clientInfo, email: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">טלפון</Label>
                    <Input
                      id="clientPhone"
                      value={proposalData.clientInfo.phone}
                      onChange={(e) => setProposalData(prev => ({
                        ...prev,
                        clientInfo: { ...prev.clientInfo, phone: e.target.value }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  פריטי ההצעה
                  <Button onClick={addItem} size="sm">
                    <Plus className="h-4 w-4 ml-2" />
                    הוסף פריט
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposalData.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                      <div className="col-span-5">
                        <Label>תיאור</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>כמות</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>מחיר יחידה</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>סה"כ</Label>
                        <div className="p-3 bg-muted rounded-md text-sm font-medium">
                          ₪{item.subtotal.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        {proposalData.items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Summary Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="discount">הנחה (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={proposalData.discount}
                      onChange={(e) => setProposalData(prev => ({ 
                        ...prev, 
                        discount: parseFloat(e.target.value) || 0 
                      }))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vat">מע"מ (%)</Label>
                    <Input
                      id="vat"
                      type="number"
                      value={proposalData.vat}
                      onChange={(e) => setProposalData(prev => ({ 
                        ...prev, 
                        vat: parseFloat(e.target.value) || 0 
                      }))}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>סה"כ לתשלום</Label>
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-md text-lg font-bold text-primary">
                      ₪{totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes and Terms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>הערות</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={proposalData.notes}
                    onChange={(e) => setProposalData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    placeholder="הערות נוספות להצעה..."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>תנאי ההצעה</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={proposalData.terms}
                    onChange={(e) => setProposalData(prev => ({ ...prev, terms: e.target.value }))}
                    rows={4}
                    placeholder="תנאי תשלום, אחריות ומסירה..."
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProposalBuilder;