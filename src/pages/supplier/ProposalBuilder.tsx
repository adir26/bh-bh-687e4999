import React, { useState, useCallback } from 'react';
import { ArrowLeft, Download, Eye, FileText, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ProposalPDF } from '@/components/proposal/ProposalPDF';
import { ProposalPreview } from '@/components/proposal/ProposalPreview';

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
  template: 'modern' | 'minimal' | 'classic';
}

const ProposalBuilder: React.FC = () => {
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
    items: [
      {
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
      },
    ],
    discount: 0,
    vat: 17,
    notes: '',
    terms: 'תנאי תשלום: 30 יום\nאחריות: 12 חודשים\nמועד אספקה: 7-14 ימי עסקים',
    template: 'modern',
  });

  const [showPreview, setShowPreview] = useState(false);

  const addItem = useCallback(() => {
    const newItem: ProposalItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
    };
    setProposalData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setProposalData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  }, []);

  const updateItem = useCallback((id: string, field: keyof ProposalItem, value: string | number) => {
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
      }),
    }));
  }, []);

  const updateClientInfo = useCallback((field: keyof ProposalData['clientInfo'], value: string) => {
    setProposalData(prev => ({
      ...prev,
      clientInfo: { ...prev.clientInfo, [field]: value },
    }));
  }, []);

  const updateField = useCallback((field: keyof ProposalData, value: any) => {
    setProposalData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Calculations
  const subtotalAmount = proposalData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotalAmount * proposalData.discount) / 100;
  const taxableAmount = subtotalAmount - discountAmount;
  const vatAmount = (taxableAmount * proposalData.vat) / 100;
  const totalAmount = taxableAmount + vatAmount;

  const handleDownloadPDF = () => {
    toast.success('PDF יורד כעת...');
  };

  const templates = [
    { id: 'modern', name: 'מודרני', description: 'עיצוב נקי ומודרני' },
    { id: 'minimal', name: 'מינימלי', description: 'עיצוב פשוט ואלגנטי' },
    { id: 'classic', name: 'קלאסי', description: 'עיצוב מסורתי ומקצועי' },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">יצירת הצעת מחיר</h1>
                <p className="text-sm text-muted-foreground">מס' הצעה: {proposalData.quoteNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? 'עריכה' : 'תצוגה מקדימה'}
              </Button>
              <PDFDownloadLink
                document={<ProposalPDF data={proposalData} calculations={{ subtotalAmount, discountAmount, vatAmount, totalAmount }} />}
                fileName={`proposal-${proposalData.quoteNumber}.pdf`}
              >
                {({ loading }) => (
                  <Button 
                    variant="blue" 
                    onClick={handleDownloadPDF}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {loading ? 'מכין PDF...' : 'הורד PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {showPreview ? (
          <ProposalPreview 
            data={proposalData} 
            calculations={{ subtotalAmount, discountAmount, vatAmount, totalAmount }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    בחירת תבנית עיצוב
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          proposalData.template === template.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => updateField('template', template.id)}
                      >
                        <div className="aspect-[3/4] bg-muted rounded mb-2 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-sm">{template.name}</h3>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle>פרטי לקוח</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">שם לקוח *</Label>
                      <Input
                        id="clientName"
                        value={proposalData.clientInfo.name}
                        onChange={(e) => updateClientInfo('name', e.target.value)}
                        placeholder="הכנס שם לקוח"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">אימייל</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={proposalData.clientInfo.email}
                        onChange={(e) => updateClientInfo('email', e.target.value)}
                        placeholder="client@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">טלפון</Label>
                    <Input
                      id="clientPhone"
                      value={proposalData.clientInfo.phone}
                      onChange={(e) => updateClientInfo('phone', e.target.value)}
                      placeholder="050-123-4567"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Items Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>פריטים ושירותים</CardTitle>
                    <Button onClick={addItem} size="sm">הוסף פריט</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">תיאור</TableHead>
                          <TableHead className="text-right w-20">כמות</TableHead>
                          <TableHead className="text-right w-24">מחיר יחידה</TableHead>
                          <TableHead className="text-right w-24">סה"כ</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proposalData.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Input
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                placeholder="תיאור השירות או המוצר"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                min="0"
                                step="1"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                                min="0"
                                step="0.01"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">₪{item.subtotal.toFixed(2)}</div>
                            </TableCell>
                            <TableCell>
                              {proposalData.items.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  ×
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

              {/* Notes and Terms */}
              <Card>
                <CardHeader>
                  <CardTitle>הערות ותנאים</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">הערות נוספות</Label>
                    <Textarea
                      id="notes"
                      value={proposalData.notes}
                      onChange={(e) => updateField('notes', e.target.value)}
                      placeholder="הערות או הסברים נוספים ללקוח..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="terms">תנאי ההצעה</Label>
                    <Textarea
                      id="terms"
                      value={proposalData.terms}
                      onChange={(e) => updateField('terms', e.target.value)}
                      placeholder="תנאי תשלום, אחריות, זמני אספקה..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Summary */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>סיכום הצעה</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>סכום ביניים:</span>
                      <span>₪{subtotalAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discount">הנחה (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={proposalData.discount}
                        onChange={(e) => updateField('discount', Number(e.target.value))}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    
                    {proposalData.discount > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>הנחה ({proposalData.discount}%):</span>
                        <span>-₪{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="vat">מע"מ (%)</Label>
                      <Input
                        id="vat"
                        type="number"
                        value={proposalData.vat}
                        onChange={(e) => updateField('vat', Number(e.target.value))}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>מע"מ ({proposalData.vat}%):</span>
                      <span>₪{vatAmount.toFixed(2)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>סה"כ לתשלום:</span>
                      <span className="text-primary">₪{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <Badge variant="outline" className="w-full justify-center">
                      {proposalData.items.length} פריטים
                    </Badge>
                    <Badge variant="secondary" className="w-full justify-center">
                      תבנית: {templates.find(t => t.id === proposalData.template)?.name}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalBuilder;