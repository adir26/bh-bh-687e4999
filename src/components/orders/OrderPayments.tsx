import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, ExternalLink, Plus, CheckCircle, Clock, XCircle, Copy, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { orderService, PaymentLink, Order } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import { FEATURES } from '@/config/featureFlags';
import { useState } from 'react';

interface OrderPaymentsProps {
  orderId: string;
  order: Order;
}

export function OrderPayments({ orderId, order }: OrderPaymentsProps) {
  // Return null if payments are disabled
  if (!FEATURES.PAYMENTS_ENABLED) {
    return null;
  }

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isClient = order.client_id === user?.id;
  const isSupplier = order.supplier_id === user?.id;

  const [createPaymentDialog, setCreatePaymentDialog] = useState(false);
  const [customAmount, setCustomAmount] = useState<number | undefined>(undefined);

  const { data: paymentLinks = [], isLoading } = useQuery({
    queryKey: ['payment-links', orderId],
    queryFn: () => orderService.getPaymentLinks(orderId),
  });

  const createPaymentMutation = useMutation({
    mutationFn: (amount: number) => orderService.createPaymentLink(orderId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-links', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order-events', orderId] });
      toast({
        title: 'קישור תשלום נוצר בהצלחה',
        description: 'הקישור זמין כעת ללקוח',
      });
      setCreatePaymentDialog(false);
      setCustomAmount(undefined);
    },
    onError: (error: any) => {
      toast({
        title: 'יצירת קישור תשלום נכשלה',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const markPaidMutation = useMutation({
    mutationFn: (paymentLinkId: string) => orderService.markPaymentAsPaid(paymentLinkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-links', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order-events', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'התשלום סומן כשולם',
        description: 'סכום ההזמנה עודכן בהתאם',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'עדכון תשלום נכשל',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const copyLinkMutation = useMutation({
    mutationFn: (paymentLink: PaymentLink) => orderService.copyPaymentLink(paymentLink),
    onSuccess: () => {
      toast({
        title: 'קישור הועתק',
        description: 'קישור התשלום הועתק ללוח העתקות',
      });
    },
    onError: () => {
      toast({
        title: 'העתקה נכשלה',
        description: 'לא הצלחנו להעתיק את הקישור',
        variant: 'destructive'
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
      case 'processing':
        return 'secondary';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'שולם';
      case 'pending':
        return 'ממתין';
      case 'processing':
        return 'בעיבוד';
      case 'failed':
        return 'נכשל';
      case 'cancelled':
        return 'בוטל';
      default:
        return status;
    }
  };

  const remainingAmount = order.amount - (order.paid_amount || 0);

  const handleCreatePayment = () => {
    const amount = customAmount || remainingAmount;
    if (amount <= 0) {
      toast({
        title: 'סכום לא תקין',
        description: 'אנא הזן סכום גדול מ-0',
        variant: 'destructive'
      });
      return;
    }
    createPaymentMutation.mutate(amount);
  };

  const totalPaid = order.paid_amount || 0;
  const paymentProgress = (totalPaid / order.amount) * 100;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" dir="rtl">
            <CreditCard className="h-5 w-5" />
            תשלומים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" dir="rtl">
            <CreditCard className="h-5 w-5" />
            תשלומים
            <Badge variant="outline" className="ml-auto">
              ₪{totalPaid.toLocaleString()} / ₪{order.amount.toLocaleString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6" dir="rtl">
          {/* Payment Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>התקדמות תשלום</span>
              <span>{paymentProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(paymentProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>שולם: ₪{totalPaid.toLocaleString()}</span>
              <span>נותר: ₪{remainingAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Create Payment Button (Supplier only) */}
          {isSupplier && remainingAmount > 0 && (
            <Button
              onClick={() => setCreatePaymentDialog(true)}
              disabled={createPaymentMutation.isPending}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createPaymentMutation.isPending ? 'יוצר...' : 'צור קישור תשלום'}
            </Button>
          )}

          {/* Payment Links */}
          <div className="space-y-3">
            {paymentLinks.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>אין קישורי תשלום עדיין</p>
                {isSupplier && (
                  <p className="text-sm">צור קישור תשלום כדי לבקש תשלום</p>
                )}
              </div>
            ) : (
              paymentLinks.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center gap-3 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(payment.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        ₪{payment.amount.toLocaleString()} {payment.currency === 'ILS' ? '' : payment.currency}
                      </span>
                      <Badge variant={getStatusVariant(payment.status)}>
                        {getStatusText(payment.status)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div>
                        נוצר ב{format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                      {payment.paid_at && (
                        <div className="text-green-600">
                          שולם ב{format(new Date(payment.paid_at), 'dd/MM/yyyy HH:mm')}
                        </div>
                      )}
                      {payment.expires_at && payment.status === 'pending' && (
                        <div className="text-orange-600">
                          פג תוקף ב{format(new Date(payment.expires_at), 'dd/MM/yyyy HH:mm')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {payment.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyLinkMutation.mutate(payment)}
                          disabled={copyLinkMutation.isPending}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          העתק קישור
                        </Button>
                        
                        {isSupplier && (
                          <Button
                            size="sm"
                            onClick={() => markPaidMutation.mutate(payment.id)}
                            disabled={markPaidMutation.isPending}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            {markPaidMutation.isPending ? 'מעדכן...' : 'סמן כשולם'}
                          </Button>
                        )}
                        
                        {isClient && payment.payment_url && (
                          <Button
                            size="sm"
                            onClick={() => window.open(payment.payment_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            שלם עכשיו
                          </Button>
                        )}
                      </>
                    )}
                    
                    {payment.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          toast({ title: 'תכונת קבלות תגיע בקרוב' });
                        }}
                      >
                        קבלה
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Summary */}
          {paymentLinks.length > 0 && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">תשלומים שהושלמו:</span>
                  <div className="font-medium text-green-600">
                    ₪{paymentLinks
                      .filter(p => p.status === 'completed')
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">תשלומים ממתינים:</span>
                  <div className="font-medium text-yellow-600">
                    ₪{paymentLinks
                      .filter(p => p.status === 'pending' || p.status === 'processing')
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Payment Dialog */}
      <Dialog open={createPaymentDialog} onOpenChange={setCreatePaymentDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>צור קישור תשלום חדש</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">סכום התשלום (₪)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={customAmount ?? remainingAmount}
                onChange={(e) => setCustomAmount(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="הזן סכום..."
              />
              <div className="text-xs text-muted-foreground">
                סכום נותר לתשלום: ₪{remainingAmount.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">מה קורה בהמשך?</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• קישור תשלום ייווצר ויופיע ברשימה</li>
                <li>• תוכל להעתיק את הקישור ולשלוח ללקוח</li>
                <li>• כשהלקוח ישלם, ההזמנה תתעדכן אוטומטית</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreatePaymentDialog(false)}>
              ביטול
            </Button>
            <Button 
              onClick={handleCreatePayment}
              disabled={createPaymentMutation.isPending}
            >
              {createPaymentMutation.isPending ? 'יוצר...' : 'צור קישור'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}