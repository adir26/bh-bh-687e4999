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

  // Template styles
  const templateStyles: Record<string, any> = {
    premium: {
      gradient: 'from-purple-600 to-pink-600',
      accent: 'bg-purple-600 hover:bg-purple-700',
      accentText: 'text-purple-600',
      border: 'border-purple-200',
      bg: 'bg-purple-50/50',
      headerBg: 'bg-gradient-to-r from-purple-600 to-pink-600'
    },
    corporate: {
      gradient: 'from-gray-700 to-blue-600',
      accent: 'bg-blue-600 hover:bg-blue-700',
      accentText: 'text-blue-600',
      border: 'border-blue-200',
      bg: 'bg-blue-50/50',
      headerBg: 'bg-gradient-to-r from-gray-700 to-blue-600'
    },
    modern: {
      gradient: 'from-blue-500 to-cyan-500',
      accent: 'bg-cyan-600 hover:bg-cyan-700',
      accentText: 'text-cyan-600',
      border: 'border-cyan-200',
      bg: 'bg-cyan-50/50',
      headerBg: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    minimal: {
      gradient: 'from-gray-800 to-gray-600',
      accent: 'bg-gray-800 hover:bg-gray-900',
      accentText: 'text-gray-800',
      border: 'border-gray-300',
      bg: 'bg-gray-100/50',
      headerBg: 'bg-gradient-to-r from-gray-800 to-gray-600'
    },
    classic: {
      gradient: 'from-amber-600 to-orange-600',
      accent: 'bg-amber-600 hover:bg-amber-700',
      accentText: 'text-amber-600',
      border: 'border-amber-200',
      bg: 'bg-amber-50/50',
      headerBg: 'bg-gradient-to-r from-amber-600 to-orange-600'
    }
  };

  const currentStyle = templateStyles[quoteData?.quote.template || 'premium'];

  const handleDownloadPDF = async () => {
    if (!token) return;

    try {
      // Use direct fetch for binary PDF download with proper headers
      const supabaseUrl = 'https://yislkmhnitznvbxfpcxd.supabase.co';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpc2xrbWhuaXR6bnZieGZwY3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTc0ODEsImV4cCI6MjA2OTI5MzQ4MX0.yt9-ethxGb1ztiLT7mXYZyVqGu0P1a37BG6Ju2NnUHk';
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-quote-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/pdf',
            'apikey': anonKey,
          },
          body: JSON.stringify({
            token,
            template: quoteData?.quote.template || 'premium'
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'שגיאה ביצירת PDF');
      }

      const blob = await response.blob();
      
      if (!blob || blob.size === 0) {
        throw new Error('שרת לא החזיר PDF תקין');
      }

      // Validate PDF signature
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const isPdf = uint8Array[0] === 0x25 && 
                    uint8Array[1] === 0x50 && 
                    uint8Array[2] === 0x44 && 
                    uint8Array[3] === 0x46; // %PDF
      
      if (!isPdf) {
        throw new Error('התגובה אינה PDF תקין');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quote-${quoteData?.quote.id?.slice(0, 8) || token}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast.success('PDF הורד בהצלחה');
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      const message =
        err?.message ??
        (typeof err === 'string' ? err : 'שגיאה ביצירת PDF');
      showToast.error(message);
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
      rejected: { variant: 'destructive', label: 'נדחתה' },
    };

    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <PageBoundary isLoading={isLoading} isError={!!error || !quoteData}>
      <div className="min-h-screen bg-background p-4 md:p-6" dir="rtl">
        <Card className="max-w-5xl mx-auto shadow-lg">
          {quoteData && (
            <>
              <CardHeader className={`${currentStyle.headerBg} text-white border-b-0`}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2 text-white">{quoteData.quote.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-white/90">
                      <span>מספר: {quoteData.quote.id.slice(0, 8).toUpperCase()}</span>
                      <span>תאריך: {new Date(quoteData.quote.created_at).toLocaleDateString('he-IL')}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    {quoteData.quote.status === 'sent' && 'נשלחה'}
                    {quoteData.quote.status === 'accepted' && 'אושרה'}
                    {quoteData.quote.status === 'rejected' && 'נדחתה'}
                    {quoteData.quote.status === 'draft' && 'טיוטה'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Items Table */}
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${currentStyle.accentText}`}>פירוט השירותים/מוצרים</h3>
                  <div className={`rounded-md border ${currentStyle.border}`}>
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
                      <span>
                        מע"מ (
                        {quoteData.quote.subtotal > 0
                          ? ((quoteData.quote.tax_amount / quoteData.quote.subtotal) * 100).toFixed(0)
                          : '17'}
                        %):
                      </span>
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
                  <div className={`${currentStyle.bg} p-4 rounded-lg border ${currentStyle.border}`}>
                    <h3 className={`font-semibold mb-2 ${currentStyle.accentText}`}>הערות:</h3>
                    <p className="text-sm whitespace-pre-wrap">{quoteData.quote.notes}</p>
                  </div>
                )}

                {/* Terms & Conditions */}
                {quoteData.quote.terms_conditions && (
                  <div className={`${currentStyle.bg} p-4 rounded-lg border ${currentStyle.border}`}>
                    <h3 className={`font-semibold mb-2 ${currentStyle.accentText}`}>תנאי ההצעה:</h3>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{quoteData.quote.terms_conditions}</p>
                  </div>
                )}

                {/* Actions */}
                <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t ${currentStyle.border}`}>
                  <Button onClick={handleDownloadPDF} variant="outline" className={`flex-1 ${currentStyle.border}`}>
                    <Download className="w-4 h-4 ml-1" />
                    הורד PDF
                  </Button>
                  {quoteData.quote.status === 'sent' && (
                    <>
                      <Button onClick={handleAccept} className={`flex-1 ${currentStyle.accent} text-white`}>
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
