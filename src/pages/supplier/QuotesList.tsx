import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { quotesService, Quote } from '@/services/quotesService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Eye } from 'lucide-react';
import { PageBoundary } from '@/components/system/PageBoundary';
import { withTimeout } from '@/lib/withTimeout';
import { SupplierHeader } from '@/components/SupplierHeader';

export default function QuotesList() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'rejected'>('all');

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

  const filteredQuotes = quotes.filter(quote => {
    if (activeTab === 'all') return true;
    return quote.status === activeTab;
  });

  const getStatusBadge = (status: Quote['status']) => {
    const variants = {
      draft: 'secondary',
      sent: 'default',
      accepted: 'default',
      rejected: 'destructive'
    } as const;
    
    const labels = {
      draft: 'טיוטה',
      sent: 'נשלחה',
      accepted: 'אושרה',
      rejected: 'נדחתה'
    };
    
    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
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
                              <TableCell>{getStatusBadge(quote.status)}</TableCell>
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
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/quote/${quote.id}`)}
                                    title="צפה"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
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
      </div>
    </PageBoundary>
  );
}
