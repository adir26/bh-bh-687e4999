import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Check, X, MessageCircle } from 'lucide-react';
import { quotesService, Quote, QuoteItem } from '@/services/quotesService';
import { showToast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { pdf } from '@react-pdf/renderer';
import { QuotePDF } from '@/components/quotes/QuotePDF';

export default function QuoteView() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [supplierInfo, setSupplierInfo] = useState<any>(null);

  useEffect(() => {
    const loadQuote = async () => {
      if (!quoteId || !user) return;

      try {
        const result = await quotesService.getQuoteById(quoteId);
        if (!result) {
          showToast.error('הצעת המחיר לא נמצאה');
          navigate('/');
          return;
        }

        // Check if user has permission to view this quote
        const { quote, items } = result;
        if (quote.client_id !== user.id && quote.supplier_id !== user.id && profile?.role !== 'admin') {
          showToast.error('אין לך הרשאה לצפות בהצעת מחיר זו');
          navigate('/');
          return;
        }

        setQuote(quote);
        setItems(items);

        // Load supplier info
        const { data: supplier } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', quote.supplier_id)
          .maybeSingle();

        setSupplierInfo(supplier);
      } catch (error) {
        console.error('Failed to load quote:', error);
        showToast.error('שגיאה בטעינת הצעת המחיר');
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, [quoteId, user, profile, navigate]);

  const handleAccept = async () => {
    if (!quote) return;

    try {
      const updatedQuote = await quotesService.acceptQuote(quote.id);
      setQuote(updatedQuote);
    } catch (error) {
      console.error('Failed to accept quote:', error);
      showToast.error('שגיאה באישור הצעת המחיר');
    }
  };

  const handleReject = async () => {
    if (!quote) return;

    try {
      const updatedQuote = await quotesService.rejectQuote(quote.id);
      setQuote(updatedQuote);
    } catch (error) {
      console.error('Failed to reject quote:', error);
      showToast.error('שגיאה בדחיית הצעת המחיר');
    }
  };

  const handleDownloadPDF = async () => {
    if (!quote || !supplierInfo || !profile) return;

    try {
      const calculations = quotesService.calculateTotals(
        items.map(item => ({ total: item.subtotal })),
        0, // No discount shown in this view
        quote.tax_rate
      );

      const clientInfo = {
        name: profile.full_name || 'לקוח',
        email: profile.email || '',
        phone: profile.phone || ''
      };

      const doc = (
        <QuotePDF
          quote={quote}
          items={items}
          supplierInfo={supplierInfo}
          clientInfo={clientInfo}
          calculations={calculations}
          discountPercent={0}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">הצעת המחיר לא נמצאה</div>
      </div>
    );
  }

  const calculations = quotesService.calculateTotals(
    items.map(item => ({ total: item.subtotal })),
    0,
    quote.tax_rate
  );

  const isClient = user?.id === quote.client_id;
  const canRespond = isClient && quote.status === 'sent';

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
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                חזור
              </Button>
              <h1 className="text-2xl font-bold text-foreground">הצעת מחיר</h1>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                quote.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {quote.status === 'draft' ? 'טיוטה' :
                 quote.status === 'sent' ? 'נשלחה' :
                 quote.status === 'accepted' ? 'אושרה' : 'נדחתה'}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 ml-1" />
                הורד PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quote Details */}
        <Card>
          <CardHeader>
            <CardTitle>{quote.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">מספר הצעת מחיר</p>
                <p className="font-bold">{quote.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">תאריך יצירה</p>
                <p>{new Date(quote.created_at).toLocaleDateString('he-IL')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ספק</p>
                <p>{supplierInfo?.full_name || 'לא זמין'}</p>
                {supplierInfo?.email && <p className="text-sm text-muted-foreground">{supplierInfo.email}</p>}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">סכום כולל</p>
                <p className="text-2xl font-bold">₪{calculations.totalAmount.toLocaleString('he-IL')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>פירוט הפריטים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border-b border-border pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × ₪{item.unit_price.toLocaleString('he-IL')}
                      </p>
                      <p className="font-bold">₪{item.subtotal.toLocaleString('he-IL')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>סיכום</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>סכום ביניים:</span>
                <span>₪{calculations.subtotal.toLocaleString('he-IL')}</span>
              </div>
              <div className="flex justify-between">
                <span>מע"מ ({quote.tax_rate}%):</span>
                <span>₪{calculations.taxAmount.toLocaleString('he-IL')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>סה"כ לתשלום:</span>
                <span>₪{calculations.totalAmount.toLocaleString('he-IL')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {quote.notes && (
          <Card>
            <CardHeader>
              <CardTitle>הערות</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{quote.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons for Client */}
        {canRespond && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="blue" 
              className="flex-1" 
              onClick={handleAccept}
            >
              <Check className="w-4 h-4 ml-1" />
              אשר הצעת מחיר
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1" 
              onClick={handleReject}
            >
              <X className="w-4 h-4 ml-1" />
              דחה הצעת מחיר
            </Button>
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => navigate(`/messages?supplier=${quote.supplier_id}`)}
            >
              <MessageCircle className="w-4 h-4 ml-1" />
              צור קשר עם הספק
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}