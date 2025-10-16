import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quotesService } from '@/services/quotesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { PageBoundary } from '@/components/system/PageBoundary';
import { showToast } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

export default function PublicQuoteView() {
  const { token } = useParams<{ token: string }>();
  
  const { data: quoteData, isLoading, error } = useQuery({
    queryKey: ['public-quote', token],
    queryFn: async () => {
      if (!token) throw new Error('Token missing');
      return await quotesService.getQuoteByToken(token);
    },
    retry: false,
  });

  const handleDownloadPDF = async () => {
    if (!token) return;

    try {
      const { data, error } = await supabase.functions.invoke('generate-quote-pdf', {
        body: { token },
        // @ts-ignore - responseType is valid but not in types
        responseType: 'arraybuffer'
      });

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quote-${quoteData?.quote.id?.slice(0, 8) || token}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast.success('PDF הורד בהצלחה');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast.error('שגיאה ביצירת PDF');
    }
  };

  const handleAccept = async () => {
    if (!quoteData) return;
    try {
      await quotesService.acceptQuote(quoteData.quote.id);
      showToast.success('הצעת המחיר אושרה בהצלחה!');
    } catch (error) {
      console.error('Failed to accept quote:', error);
      showToast.error('שגיאה באישור הצעת המחיר');
    }
  };

  const handleReject = async () => {
    if (!quoteData) return;
    try {
      await quotesService.rejectQuote(quoteData.quote.id);
      showToast.info('הצעת המחיר נדחתה');
    } catch (error) {
      console.error('Failed to reject quote:', error);
      showToast.error('שגיאה בדחיית הצעת המחיר');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: 'secondary', label: 'טיוטה' },
      sent: { variant: 'default', label: 'נשלחה' },
      accepted: { variant: 'default', label: 'אושרה' },
      rejected: { variant: 'destructive', label: 'נדחתה' }
    };
    
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <PageBoundary isLoading={isLoading} isError={!!error || !quoteData}>
      <div className="min-h-screen bg-background p-4 md:p-6" dir="rtl">
        <Card className="max-w-5xl mx-auto">
          {quoteData && (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{quoteData.quote.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>מספר: {quoteData.quote.id.slice(0, 8).toUpperCase()}</span>
                      <span>תאריך: {new Date(quoteData.quote.created_at).toLocaleDateString('he-IL')}</span>
                    </div>
                  </div>
                  {getStatusBadge(quoteData.quote.status)}
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Items Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">פירוט השירותים/מוצרים</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">תיאור</TableHead>
                          <TableHead className="text-right w-24">כמות</TableHead>
                          <TableHead className="text-right w-32">מחיר ליחידה</TableHead>
                          <TableHead className="text-right w-32">סכום חלקי</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quoteData.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                {item.description && (
                                  <div className="text-sm text-muted-foreground">{item.description}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₪{item.unit_price.toLocaleString('he-IL')}</TableCell>
                            <TableCell className="font-medium">₪{item.subtotal.toLocaleString('he-IL')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Summary */}
                <div className="flex justify-end">
                  <div className="w-full max-w-md space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>סכום ביניים:</span>
                      <span>₪{quoteData.quote.subtotal.toLocaleString('he-IL')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>מע"מ ({quoteData.quote.subtotal > 0 ? ((quoteData.quote.tax_amount / quoteData.quote.subtotal) * 100).toFixed(0) : '17'}%):</span>
                      <span>₪{quoteData.quote.tax_amount.toLocaleString('he-IL')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>סה"כ לתשלום:</span>
                      <span>₪{quoteData.quote.total_amount.toLocaleString('he-IL')}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {quoteData.quote.notes && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">הערות ותנאים:</h3>
                    <p className="text-sm whitespace-pre-wrap">{quoteData.quote.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 ml-1" />
                    הורד PDF
                  </Button>
                  {quoteData.quote.status === 'sent' && (
                    <>
                      <Button onClick={handleAccept} variant="default" className="flex-1">
                        <CheckCircle className="w-4 h-4 ml-1" />
                        אשר הצעה
                      </Button>
                      <Button onClick={handleReject} variant="destructive" className="flex-1">
                        <XCircle className="w-4 h-4 ml-1" />
                        דחה הצעה
                      </Button>
                    </>
                  )}
                  {quoteData.quote.status === 'accepted' && (
                    <div className="flex items-center gap-2 text-green-600 flex-1 justify-center">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">הצעה זו אושרה</span>
                    </div>
                  )}
                  {quoteData.quote.status === 'rejected' && (
                    <div className="flex items-center gap-2 text-red-600 flex-1 justify-center">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">הצעה זו נדחתה</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </PageBoundary>
  );
}
