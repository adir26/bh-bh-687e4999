import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { quotesService, Quote } from '@/services/quotesService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Eye, Send, Trash2 } from 'lucide-react';
import { showToast } from '@/utils/toast';
import { PageBoundary } from '@/components/system/PageBoundary';
import { withTimeout } from '@/lib/withTimeout';
import { SupplierHeader } from '@/components/SupplierHeader';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function QuotesList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'rejected'>('all');
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);

  const { data: quotes = [], isLoading, error } = useQuery({
    queryKey: ['supplier-quotes', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const result = await withTimeout(
        quotesService.listQuotesBySupplier(profile!.id),
        12000
      );
      return result;
    },
    retry: 1,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (quoteId: string) => quotesService.deleteQuote(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-quotes'] });
      showToast.success('הצעת המחיר נמחקה בהצלחה');
      setQuoteToDelete(null);
    },
    onError: (error: any) => {
      showToast.error(error.message || 'שגיאה במחיקת הצעת המחיר');
    },
  });

  const handleDeleteQuote = (quote: Quote) => {
    if (quote.status === 'sent' || quote.status === 'accepted') {
      showToast.error('לא ניתן למחוק הצעת מחיר שנשלחה או אושרה');
      return;
    }
    setQuoteToDelete(quote);
  };

  const filteredQuotes = quotes.filter(quote => {
    if (activeTab === 'all') return true;
    return quote.status === activeTab;
  });

  const handlePreviewClick = async (quoteId: string) => {
    try {
      const shareLink = await quotesService.generateShareLink(quoteId);
      window.open(shareLink, '_blank');
    } catch (error) {
      console.error('Failed to generate preview link:', error);
      navigate(`/quote/share/${quoteId}`);
    }
  };

  const handleResendQuote = async (quote: Quote) => {
    if (!quote.client_id) {
      showToast.error('לא ניתן לשלוח הצעה ללא לקוח משויך');
      return;
    }

    try {
      await quotesService.sendQuote(quote.id, quote.client_id);
      showToast.success('ההצעה נשלחה מחדש בהצלחה! הלקוח יקבל קישור חדש');
    } catch (error: any) {
      console.error('Failed to resend quote:', error);
      showToast.error(error.message || 'שגיאה בשליחת ההצעה מחדש');
    }
  };

  const getStatusBadge = (quote: Quote) => {
    if (quote.status === 'draft') {
      return <Badge variant="secondary">🕒 טיוטה</Badge>;
    }
    
    if (quote.status === 'sent') {
      if (quote.viewed_at && !quote.responded_at) {
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            👀 נצפתה ב-{new Date(quote.viewed_at).toLocaleDateString('he-IL', { 
              day: 'numeric', 
              month: 'short' 
            })}
          </Badge>
        );
      }
      return <Badge variant="default" className="bg-gray-100 text-gray-700">📤 נשלחה</Badge>;
    }
    
    if (quote.status === 'accepted') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          ✅ אושרה{quote.responded_at ? ` ב-${new Date(quote.responded_at).toLocaleDateString('he-IL', { 
            day: 'numeric', 
            month: 'short' 
          })}` : ''}
        </Badge>
      );
    }
    
    if (quote.status === 'rejected') {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          🔴 נדחתה{quote.responded_at ? ` ב-${new Date(quote.responded_at).toLocaleDateString('he-IL', { 
            day: 'numeric', 
            month: 'short' 
          })}` : ''}
        </Badge>
      );
    }
    
    return <Badge>{quote.status}</Badge>;
  };

  return (
    <PageBoundary isLoading={isLoading} isError={!!error} error={error}>
      <div className="min-h-screen bg-background" dir="rtl">
        <SupplierHeader 
          title="הצעות מחיר"
          subtitle="נהל את כל הצעות המחיר שלך"
          showBackButton={true}
          backUrl="/supplier/dashboard"
        />

        <div className="max-w-7xl mx-auto px-4 py-6 pb-nav-safe">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>הצעות מחיר</CardTitle>
              <Button onClick={() => navigate('/supplier/quote-builder')}>
                <Plus className="w-4 h-4 ml-1" />
                הצעת מחיר חדשה
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-5 mb-4">
                  <TabsTrigger value="all">הכל ({quotes.length})</TabsTrigger>
                  <TabsTrigger value="draft">טיוטאות ({quotes.filter(q => q.status === 'draft').length})</TabsTrigger>
                  <TabsTrigger value="sent">נשלחו ({quotes.filter(q => q.status === 'sent').length})</TabsTrigger>
                  <TabsTrigger value="accepted">אושרו ({quotes.filter(q => q.status === 'accepted').length})</TabsTrigger>
                  <TabsTrigger value="rejected">נדחו ({quotes.filter(q => q.status === 'rejected').length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab}>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">מספר</TableHead>
                          <TableHead className="text-right">כותרת</TableHead>
                          <TableHead className="text-right">סכום כולל</TableHead>
                          <TableHead className="text-right">סטטוס</TableHead>
                          <TableHead className="text-right">תאריך יצירה</TableHead>
                          <TableHead className="text-right">פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredQuotes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              אין הצעות מחיר
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredQuotes.map((quote) => (
                            <TableRow key={quote.id}>
                              <TableCell className="font-mono text-sm">
                                {quote.id.slice(0, 8).toUpperCase()}
                              </TableCell>
                              <TableCell className="font-medium">{quote.title}</TableCell>
                              <TableCell>₪{quote.total_amount.toLocaleString('he-IL')}</TableCell>
                              <TableCell>{getStatusBadge(quote)}</TableCell>
                              <TableCell>{new Date(quote.created_at).toLocaleDateString('he-IL')}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {quote.status === 'draft' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => navigate(`/supplier/quote-builder?quoteId=${quote.id}`)}
                                      title="ערוך"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {(quote.status === 'accepted' || quote.status === 'rejected') && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleResendQuote(quote)}
                                      title="שלח מחדש"
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Send className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePreviewClick(quote.id)}
                                    title="תצוגה מקדימה"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {(quote.status === 'draft' || quote.status === 'rejected') && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteQuote(quote)}
                                      title="מחק"
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!quoteToDelete} onOpenChange={(open) => !open && setQuoteToDelete(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>מחיקת הצעת מחיר</AlertDialogTitle>
              <AlertDialogDescription>
                האם אתה בטוח שברצונך למחוק את הצעת המחיר "{quoteToDelete?.title}"?
                פעולה זו לא ניתנת לביטול.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse gap-2">
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => quoteToDelete && deleteMutation.mutate(quoteToDelete.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? 'מוחק...' : 'מחק'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageBoundary>
  );
}
