import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ExternalLink, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { orderService, PaymentLink, Order } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import { FEATURES } from '@/config/featureFlags';

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

  const { data: paymentLinks = [], isLoading } = useQuery({
    queryKey: ['payment-links', orderId],
    queryFn: () => orderService.getPaymentLinks(orderId),
  });

  const createPaymentMutation = useMutation({
    mutationFn: (amount: number) => orderService.createPaymentLink(orderId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-links', orderId] });
      toast({
        title: 'Payment link created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create payment link',
        description: error.message,
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

  const handleCreatePayment = () => {
    const remainingAmount = order.amount - (order.paid_amount || 0);
    createPaymentMutation.mutate(remainingAmount);
  };

  const totalPaid = order.paid_amount || 0;
  const remainingAmount = order.amount - totalPaid;
  const paymentProgress = (totalPaid / order.amount) * 100;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payments
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payments
          <Badge variant="outline" className="ml-auto">
            ${totalPaid.toFixed(2)} / ${order.amount.toFixed(2)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Payment Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Payment Progress</span>
              <span>{paymentProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(paymentProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Paid: ${totalPaid.toFixed(2)}</span>
              <span>Remaining: ${remainingAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Create Payment Button (Supplier only) */}
          {!isClient && remainingAmount > 0 && (
            <Button
              onClick={handleCreatePayment}
              disabled={createPaymentMutation.isPending}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createPaymentMutation.isPending ? 'Creating...' : 'Create Payment Link'}
            </Button>
          )}

          {/* Payment Links */}
          <div className="space-y-3">
            {paymentLinks.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No payment links created yet</p>
                {!isClient && (
                  <p className="text-sm">Create a payment link to request payment</p>
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
                        ${payment.amount.toFixed(2)} {payment.currency}
                      </span>
                      <Badge variant={getStatusVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div>
                        Created {format(new Date(payment.created_at), 'MMM d, yyyy HH:mm')}
                      </div>
                      {payment.paid_at && (
                        <div className="text-green-600">
                          Paid {format(new Date(payment.paid_at), 'MMM d, yyyy HH:mm')}
                        </div>
                      )}
                      {payment.expires_at && payment.status === 'pending' && (
                        <div className="text-orange-600">
                          Expires {format(new Date(payment.expires_at), 'MMM d, yyyy HH:mm')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {payment.payment_url && payment.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => window.open(payment.payment_url, '_blank')}
                        disabled={!isClient}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {isClient ? 'Pay Now' : 'View Link'}
                      </Button>
                    )}
                    
                    {payment.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // In a real app, this would open a receipt/invoice
                          toast({ title: 'Receipt feature coming soon' });
                        }}
                      >
                        Receipt
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
                  <span className="text-muted-foreground">Completed Payments:</span>
                  <div className="font-medium text-green-600">
                    ${paymentLinks
                      .filter(p => p.status === 'completed')
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Pending Payments:</span>
                  <div className="font-medium text-yellow-600">
                    ${paymentLinks
                      .filter(p => p.status === 'pending' || p.status === 'processing')
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}