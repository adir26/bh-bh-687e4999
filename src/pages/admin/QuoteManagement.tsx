import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Eye, Download, MoreHorizontal, FileText, DollarSign, Clock, CheckCircle, Trash2, Send } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdminQuotes, useQuoteMutations, useQuoteRealtimeSubscription, type QuoteFilters, type PaginationParams, type EnhancedQuote } from "@/hooks/useAdminQuotes";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function QuoteManagement() {
  const [filters, setFilters] = useState<QuoteFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 25,
    offset: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState<EnhancedQuote | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { quotes, totalCount, isLoading } = useAdminQuotes(filters, pagination);
  const { updateStatus, deleteQuote, resendQuote } = useQuoteMutations();
  useQuoteRealtimeSubscription();

  // Handle search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm || undefined }));
      setPagination(prev => ({ ...prev, page: 1, offset: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle status filter
  React.useEffect(() => {
    setFilters(prev => ({ 
      ...prev, 
      status: statusFilter === "all" ? undefined : statusFilter 
    }));
    setPagination(prev => ({ ...prev, page: 1, offset: 0 }));
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">טיוטה</Badge>;
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800">נשלח</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">ממתין לתגובה</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">אושר</Badge>;
      case "rejected":
        return <Badge variant="destructive">נדחה</Badge>;
      case "expired":
        return <Badge variant="outline">פג תוקף</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return;
    
    await deleteQuote.mutateAsync(quoteToDelete);
    setDeleteDialogOpen(false);
    setQuoteToDelete(null);
  };

  const handleResendQuote = async (quoteId: string) => {
    await resendQuote.mutateAsync(quoteId);
  };

  const handleDownloadQuote = (quote: EnhancedQuote) => {
    toast({
      title: "הורדת הצעת מחיר",
      description: `הצעת מחיר ${quote.quote_number} תורד בקרוב`,
    });
  };

  // Calculate statistics
  const pendingCount = quotes.filter(q => q.status === 'pending' || q.status === 'sent').length;
  const acceptedCount = quotes.filter(q => q.status === 'accepted').length;
  const totalValue = quotes.reduce((sum, q) => sum + (q.total_amount || 0), 0);

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew">
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ניהול הצעות מחיר</h1>
        <p className="text-muted-foreground text-sm md:text-base">ניהול ומעקב הצעות מחיר שנשלחו ללקוחות</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">סה״כ הצעות</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">{totalCount.toLocaleString('he-IL')}</div>
            <p className="text-xs text-muted-foreground text-right">הצעות במערכת</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">הצעות פעילות</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">{pendingCount.toLocaleString('he-IL')}</div>
            <p className="text-xs text-muted-foreground text-right">ממתינות לתגובה</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">הצעות שאושרו</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">{acceptedCount.toLocaleString('he-IL')}</div>
            <p className="text-xs text-muted-foreground text-right">
              {totalCount > 0 ? ((acceptedCount / totalCount) * 100).toFixed(1) : 0}% אחוז הצלחה
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">ערך כולל</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">₪{totalValue.toLocaleString('he-IL')}</div>
            <p className="text-xs text-muted-foreground text-right">סכום כולל</p>
          </CardContent>
        </Card>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-sm order-2 sm:order-1">
              <SearchInput
                placeholder="חיפוש הצעות מחיר..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                className="text-right"
                dir="rtl"
              />
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background font-hebrew text-right text-sm"
                dir="rtl"
              >
                <option value="all">כל הסטטוסים</option>
                <option value="draft">טיוטה</option>
                <option value="sent">נשלח</option>
                <option value="pending">ממתין</option>
                <option value="accepted">אושר</option>
                <option value="rejected">נדחה</option>
                <option value="expired">פג תוקף</option>
              </select>
              <Button variant="outline" size="sm" className="font-hebrew">
                <Filter className="h-4 w-4 ml-2" />
                סינון
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              לא נמצאו הצעות מחיר
            </div>
          ) : (
            <>
              {/* Mobile Cards for small screens */}
              <div className="block md:hidden space-y-4">
                {quotes.map((quote) => (
                  <Card key={quote.id} className="p-4">
                    <div className="space-y-3 text-right">
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-primary">{quote.quote_number}</div>
                        {getStatusBadge(quote.status || 'draft')}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{quote.title || 'ללא כותרת'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {quote.supplier?.full_name || 'לא משויך לספק'}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><span className="font-medium">לקוח:</span> {quote.client?.full_name || 'ללא לקוח'}</p>
                        <p><span className="font-medium">סכום:</span> ₪{(quote.total_amount || 0).toLocaleString('he-IL')}</p>
                        <p><span className="font-medium">תוקף עד:</span> {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('he-IL') : '—'}</p>
                        <p><span className="font-medium">נוצר:</span> {new Date(quote.created_at).toLocaleDateString('he-IL')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 font-hebrew"
                          onClick={() => setSelectedQuote(quote)}
                        >
                          <Eye className="h-4 w-4 ml-2" />
                          צפייה
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="font-hebrew"
                          onClick={() => handleDownloadQuote(quote)}
                        >
                          <Download className="h-4 w-4 ml-2" />
                          הורדה
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">מזהה</TableHead>
                      <TableHead className="text-right">כותרת</TableHead>
                      <TableHead className="text-right">לקוח</TableHead>
                      <TableHead className="text-right">ספק</TableHead>
                      <TableHead className="text-right">סכום</TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                      <TableHead className="text-right">תוקף עד</TableHead>
                      <TableHead className="text-right">תאריך יצירה</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium text-right">{quote.quote_number}</TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">{quote.title || 'ללא כותרת'}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <div className="font-medium">{quote.client?.full_name || '—'}</div>
                            <div className="text-sm text-muted-foreground">{quote.client?.email || ''}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{quote.supplier?.full_name || '—'}</TableCell>
                        <TableCell className="text-right">₪{(quote.total_amount || 0).toLocaleString('he-IL')}</TableCell>
                        <TableCell className="text-right">{getStatusBadge(quote.status || 'draft')}</TableCell>
                        <TableCell className="text-right">
                          {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('he-IL') : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Date(quote.created_at).toLocaleDateString('he-IL')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="font-hebrew">
                              <DropdownMenuItem 
                                className="text-right"
                                onClick={() => setSelectedQuote(quote)}
                              >
                                <Eye className="h-4 w-4 ml-2" />
                                צפייה בפרטים
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-right"
                                onClick={() => handleDownloadQuote(quote)}
                              >
                                <Download className="h-4 w-4 ml-2" />
                                הורדת PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-right"
                                onClick={() => handleResendQuote(quote.id)}
                              >
                                <Send className="h-4 w-4 ml-2" />
                                שליחה מחדש ללקוח
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-right text-destructive"
                                onClick={() => {
                                  setQuoteToDelete(quote.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 ml-2" />
                                מחיקה
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quote Details Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-4xl font-hebrew">
          <DialogHeader>
            <DialogTitle className="text-right">פרטי הצעת מחיר - {selectedQuote?.quote_number}</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-6 text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">פרטי לקוח</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">שם:</span> {selectedQuote.client?.full_name || '—'}</p>
                    <p><span className="font-medium">אימייל:</span> {selectedQuote.client?.email || '—'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">פרטי הצעה</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">כותרת:</span> {selectedQuote.title || '—'}</p>
                    <p><span className="font-medium">ספק:</span> {selectedQuote.supplier?.full_name || '—'}</p>
                    <p><span className="font-medium">תוקף עד:</span> {selectedQuote.valid_until ? new Date(selectedQuote.valid_until).toLocaleDateString('he-IL') : '—'}</p>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-medium">סטטוס:</span>
                      {getStatusBadge(selectedQuote.status || 'draft')}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3">סכום כולל</h3>
                <div className="text-3xl font-bold text-primary">
                  ₪{(selectedQuote.total_amount || 0).toLocaleString('he-IL')}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => handleDownloadQuote(selectedQuote)}>
                  <Download className="h-4 w-4 ml-2" />
                  הורדת PDF
                </Button>
                <Button onClick={() => handleResendQuote(selectedQuote.id)}>
                  <Send className="h-4 w-4 ml-2" />
                  שליחה מחדש
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="font-hebrew">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">האם למחוק הצעת מחיר זו?</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              פעולה זו תמחק את הצעת המחיר לצמיתות ולא ניתן יהיה לשחזר אותה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuote} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              מחיקה
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Add React import for useEffect
import React from 'react';
