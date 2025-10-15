import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Check, X, MessageCircle } from 'lucide-react';
import { quotesService, Quote, QuoteItem } from '@/services/quotesService';
import { showToast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { supabase } from '@/integrations/supabase/client';
import { pdf } from '@react-pdf/renderer';
import { QuotePDF } from '@/components/quotes/QuotePDF';
import { useQuery } from '@tanstack/react-query';
import { PageBoundary } from '@/components/system/PageBoundary';

export default function QuoteView() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { invalidateQuote } = useQueryInvalidation();

  const { data, isLoading } = useQuery({
    queryKey: ['quote', quoteId, user?.id],
    enabled: !!quoteId && !!user,
    queryFn: async ({ signal }) => {
      try {
        const result = await quotesService.getQuoteById(quoteId!);
        if (!result) {
          throw new Error('הצעת המחיר לא נמצאה');
        }

        // Check if user has permission to view this quote
        const { quote, items } = result;
        if (quote.client_id !== user?.id && quote.supplier_id !== user?.id && profile?.role !== 'admin') {
          throw new Error('אין לך הרשאה לצפות בהצעת מחיר זו');
        }

        // Load supplier info
        const { data: supplier } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', quote.supplier_id)
          .maybeSingle();

        return {
          quote,
          items,
         supplierInfo: {
           name: supplier?.full_name || 'לא זמין',
           email: supplier?.email || ''
         }
        };
      } catch (error: any) {
        // Handle missing tables gracefully
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          return null;
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 60_000,
  });

  const quote = data?.quote || null;
  const items = data?.items || [];
  const supplierInfo = data?.supplierInfo || null;

  const handleAccept = async () => {
    if (!quote) return;

    try {
      await quotesService.acceptQuote(quote.id);
      invalidateQuote(quoteId!, user?.id);
      showToast.success('הצעת המחיר אושרה');
    } catch (error) {
      console.error('Failed to accept quote:', error);
      showToast.error('שגיאה באישור הצעת המחיר');
    }
  };

  const handleReject = async () => {
    if (!quote) return;

    try {
      await quotesService.rejectQuote(quote.id);
      invalidateQuote(quoteId!, user?.id);
      showToast.success('הצעת המחיר נדחתה');
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
        quote.subtotal > 0 ? (quote.tax_amount / quote.subtotal) * 100 : 17
      );

      const clientInfo = {
        name: profile.full_name || 'לקוח',
        email: profile.email || ''
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

  return (
    <PageBoundary 
      timeout={15000}
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      ) : data === null ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">הצעת המחיר לא נמצאה</h2>
            <Button onClick={() => navigate(-1)} aria-label="חזור לעמוד הקודם">
              חזור
            </Button>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background" dir="rtl">
          {(() => {
            const calculations = quotesService.calculateTotals(
              items.map(item => ({ total: item.subtotal })),
              0,
              quote.subtotal > 0 ? (quote.tax_amount / quote.subtotal) * 100 : 17
            );

            const isClient = user?.id === quote.client_id;
            const canRespond = isClient && quote.status === 'sent';

            return (
              <>
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
                          aria-label="חזור לעמוד הקודם"
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
                        <Button variant="outline" size="sm" onClick={handleDownloadPDF} aria-label="הורד הצעת מחיר כ-PDF">
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
                          <p>{supplierInfo?.name || 'לא זמין'}</p>
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
                          <span>מע"מ ({quote.subtotal > 0 ? ((quote.tax_amount / quote.subtotal) * 100).toFixed(0) : '17'}%):</span>
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
                    <div className="flex flex-col sm:flex-row gap-3" role="group" aria-label="פעולות על הצעת המחיר">
                      <Button 
                        variant="blue" 
                        className="flex-1" 
                        onClick={handleAccept}
                        aria-label="אשר הצעת מחיר זו"
                      >
                        <Check className="w-4 h-4 ml-1" />
                        אשר הצעת מחיר
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1" 
                        onClick={handleReject}
                        aria-label="דחה הצעת מחיר זו"
                      >
                        <X className="w-4 h-4 ml-1" />
                        דחה הצעת מחיר
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => navigate(`/messages?supplier=${quote.supplier_id}`)}
                        aria-label="צור קשר עם הספק"
                      >
                        <MessageCircle className="w-4 h-4 ml-1" />
                        צור קשר עם הספק
                      </Button>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </PageBoundary>
  );
}