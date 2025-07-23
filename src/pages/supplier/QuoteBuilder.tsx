import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Trash2, Download, Send, Save, Calculator } from 'lucide-react';

interface QuoteItem {
  id: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
}

export default function QuoteBuilder() {
  const navigate = useNavigate();
  const [quoteNumber] = useState(`Q-${Date.now()}`);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', name: '', quantity: 1, pricePerUnit: 0, subtotal: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(17);

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      pricePerUnit: 0,
      subtotal: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'pricePerUnit') {
          updatedItem.subtotal = updatedItem.quantity * updatedItem.pricePerUnit;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = subtotalAmount * (discount / 100);
  const taxableAmount = subtotalAmount - discountAmount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const totalAmount = taxableAmount + taxAmount;

  const handleSaveDraft = () => {
    console.log('Save as draft');
    // TODO: Implement save functionality
  };

  const handleDownloadPDF = () => {
    console.log('Download PDF');
    // TODO: Implement PDF generation
  };

  const handleSendToCustomer = () => {
    console.log('Send to customer');
    // TODO: Implement email sending
  };

  return (
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
              <h1 className="text-2xl font-bold text-foreground">מבנה הצעת מחיר</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                <Save className="w-4 h-4 ml-1" />
                שמור כטיוטה
              </Button>
              <Button variant="blue" size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 ml-1" />
                הורד PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Company Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי החברה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-lg">אבי כהן - עיצוב מטבחים</h3>
                <p className="text-muted-foreground">התמחות בעיצוב מטבחים מודרניים</p>
                <p className="text-sm text-muted-foreground mt-2">
                  רח' הרצל 123, תל אביב<br />
                  טל: 03-1234567<br />
                  אימייל: avi@kitchens.co.il
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-muted-foreground">מספר הצעת מחיר:</p>
                <p className="font-bold text-lg">{quoteNumber}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  תאריך: {new Date().toLocaleDateString('he-IL')}
                </p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <label className="text-sm font-medium text-muted-foreground">טלפון</label>
                <Input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="050-1234567"
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
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          placeholder="תיאור השירות/מוצר"
                        />
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
                          value={item.pricePerUnit}
                          onChange={(e) => updateItem(item.id, 'pricePerUnit', Number(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        ₪{item.subtotal.toLocaleString('he-IL')}
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
                  <span>₪{subtotalAmount.toLocaleString('he-IL')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>הנחה ({discount}%):</span>
                    <span>-₪{discountAmount.toLocaleString('he-IL')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>לפני מע"ם:</span>
                  <span>₪{taxableAmount.toLocaleString('he-IL')}</span>
                </div>
                <div className="flex justify-between">
                  <span>מע"ם ({taxRate}%):</span>
                  <span>₪{taxAmount.toLocaleString('he-IL')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>סה"כ:</span>
                  <span>₪{totalAmount.toLocaleString('he-IL')}</span>
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
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הוסף הערות, תנאי תשלום, זמני אספקה וכד'..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="blue" className="flex-1" onClick={handleSendToCustomer}>
            <Send className="w-4 h-4 ml-1" />
            שלח ללקוח
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 ml-1" />
            הורד PDF
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleSaveDraft}>
            <Save className="w-4 h-4 ml-1" />
            שמור כטיוטה
          </Button>
        </div>
      </div>
    </div>
  );
}