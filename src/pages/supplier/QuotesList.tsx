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

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-nav-safe">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">הצעות מחיר</CardTitle>
              <Button onClick={() => navigate('/supplier/quote-builder')} className="min-h-[44px] w-full sm:w-auto">
                <Plus className="w-4 h-4 ml-1" />
                <span className="hidden sm:inline">הצעת מחיר חדשה</span>
                <span className="sm:hidden">הצעה חדשה</span>
              </Button>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                {/* Mobile: Scrollable tabs */}
                <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 mb-4">
                  <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-5 gap-1">
                    <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-4 min-h-[44px] whitespace-nowrap">
                      הכל ({quotes.length})
                    </TabsTrigger>
                    <TabsTrigger value="draft" className="text-xs sm:text-sm px-2 sm:px-4 min-h-[44px] whitespace-nowrap">
                      טיוטאות ({quotes.filter(q => q.status === 'draft').length})
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="text-xs sm:text-sm px-2 sm:px-4 min-h-[44px] whitespace-nowrap">
                      נשלחו ({quotes.filter(q => q.status === 'sent').length})
                    </TabsTrigger>
                    <TabsTrigger value="accepted" className="text-xs sm:text-sm px-2 sm:px-4 min-h-[44px] whitespace-nowrap">
                      אושרו ({quotes.filter(q => q.status === 'accepted').length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="text-xs sm:text-sm px-2 sm:px-4 min-h-[44px] whitespace-nowrap">
                      נדחו ({quotes.filter(q => q.status === 'rejected').length})
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value={activeTab}>
                  {/* Mobile: Card view */}
                  <div className="block sm:hidden space-y-3">
                    {filteredQuotes.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        אין הצעות מחיר
                      </div>
                    ) : (
                      filteredQuotes.map((quote) => (
                        <div key={quote.id} className="border rounded-lg p-3 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-sm">{quote.title}</div>
                              <div className="font-mono text-xs text-muted-foreground">
                                #{quote.id.slice(0, 8).toUpperCase()}
                              </div>
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-sm">₪{quote.total_amount.toLocaleString('he-IL')}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(quote.created_at).toLocaleDateString('he-IL')}
                              </div>
                            </div>
                          </div>
                          <div>{getStatusBadge(quote)}</div>
                          <div className="flex flex-wrap gap-2">
                            {quote.status === 'draft' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/supplier/quote-builder?quoteId=${quote.id}`)}
                                className="min-h-[40px] flex-1"
                              >
                                <Edit className="w-4 h-4 ml-1" />
                                ערוך
                              </Button>
                            )}
                            {(quote.status === 'accepted' || quote.status === 'rejected') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResendQuote(quote)}
                                className="text-blue-600 hover:text-blue-700 min-h-[40px] flex-1"
                              >
                                <Send className="w-4 h-4 ml-1" />
                                שלח מחדש
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreviewClick(quote.id)}
                              className="min-h-[40px] flex-1"
                            >
                              <Eye className="w-4 h-4 ml-1" />
                              צפה
                            </Button>
                            {(quote.status === 'draft' || quote.status === 'rejected') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteQuote(quote)}
                                className="text-destructive hover:text-destructive min-h-[40px]"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop: Table view */}
                  <div className="hidden sm:block rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">מספר</TableHead>
                          <TableHead className="text-right">כותרת</TableHead>
                          <TableHead className="text-right">סכום כולל</TableHead>
                          <TableHead className="text-right">סטטוס</TableHead>
                          <TableHead className="text-right hidden md:table-cell">תאריך יצירה</TableHead>
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
                              <TableCell className="font-medium max-w-[150px] truncate">{quote.title}</TableCell>
                              <TableCell>₪{quote.total_amount.toLocaleString('he-IL')}</TableCell>
                              <TableCell>{getStatusBadge(quote)}</TableCell>
                              <TableCell className="hidden md:table-cell">{new Date(quote.created_at).toLocaleDateString('he-IL')}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {quote.status === 'draft' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => navigate(`/supplier/quote-builder?quoteId=${quote.id}`)}
                                      title="ערוך"
                                      className="min-h-[40px] min-w-[40px] p-2"
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
                                      className="text-blue-600 hover:text-blue-700 min-h-[40px] min-w-[40px] p-2"
                                    >
                                      <Send className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePreviewClick(quote.id)}
                                    title="תצוגה מקדימה"
                                    className="min-h-[40px] min-w-[40px] p-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {(quote.status === 'draft' || quote.status === 'rejected') && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteQuote(quote)}
                                      title="מחק"
                                      className="text-destructive hover:text-destructive min-h-[40px] min-w-[40px] p-2"
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
