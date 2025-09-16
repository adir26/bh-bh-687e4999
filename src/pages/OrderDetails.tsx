import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, User, Calendar, DollarSign, AlertTriangle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { orderService } from '@/services/orderService';
import { ticketService } from '@/services/ticketService';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { OrderChat } from '@/components/orders/OrderChat';
import { OrderFiles } from '@/components/orders/OrderFiles';
import { OrderPayments } from '@/components/orders/OrderPayments';
import { FEATURES } from '@/config/featureFlags';
import { OpenDisputeModal } from '@/components/tickets/OpenDisputeModal';
import { TicketDetails } from '@/components/tickets/TicketDetails';
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { PageBoundary } from '@/components/system/PageBoundary';
import { EmptyState } from '@/components/ui/empty-state';

function OrderDetailsContent() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const { data: order, isLoading: orderLoading, error: orderError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId!),
    enabled: !!orderId,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['order-events', orderId],
    queryFn: () => orderService.getOrderEvents(orderId!),
    enabled: !!orderId,
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['order-tickets', orderId],
    queryFn: () => ticketService.getOrderTickets(orderId!),
    enabled: !!orderId,
  });

  if (orderLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <EmptyState
        icon={Package}
        title="Order not found"
        description="The order you're looking for doesn't exist or you don't have permission to view it."
      />
    );
  }

  const isClient = order.client_id === user?.id;
  const isSupplier = order.supplier_id === user?.id;

  if (!isClient && !isSupplier) {
    return (
      <EmptyState
        icon={Package}
        title="Access denied"
        description="You don't have permission to view this order."
      />
    );
  }

  // Show ticket details if one is selected
  if (selectedTicket) {
    return (
      <TicketDetails 
        ticketId={selectedTicket} 
        onBack={() => setSelectedTicket(null)} 
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{order.title}</h1>
            <Badge 
              variant="outline"
              className={`${getStatusColor(order.status)} text-white border-transparent`}
            >
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              Order #{order.id.split('-')[0]}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {isClient ? 'You are the client' : 'You are the supplier'}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(order.created_at), 'MMM d, yyyy')}
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              ${order.amount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Dispute Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDisputeModal(true)}
            disabled={order.status === 'cancelled'}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Open Dispute
          </Button>
        </div>
      </div>

      {/* Order Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="mt-1 capitalize">{order.status.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
              <p className="mt-1 font-semibold">${order.amount.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Paid Amount</label>
              <p className="mt-1 font-semibold text-green-600">
                ${(order.paid_amount || 0).toFixed(2)}
              </p>
            </div>
            {order.due_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                <p className="mt-1">{format(new Date(order.due_date), 'MMM d, yyyy')}</p>
              </div>
            )}
            {order.description && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-sm">{order.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Tickets */}
      {tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedTicket(ticket.id)}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">#{ticket.ticket_number}</p>
                      <p className="text-sm text-muted-foreground">{ticket.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      ticket.priority === 'urgent' ? 'border-red-500 text-red-600' :
                      ticket.priority === 'high' ? 'border-orange-500 text-orange-600' :
                      ticket.priority === 'medium' ? 'border-blue-500 text-blue-600' :
                      'border-green-500 text-green-600'
                    }>
                      {ticket.priority.toUpperCase()}
                    </Badge>
                    <TicketStatusBadge status={ticket.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <OrderTimeline order={order} events={events} />
          <OrderFiles orderId={order.id} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <OrderChat orderId={order.id} />
          {FEATURES.PAYMENTS_ENABLED && (
            <OrderPayments orderId={order.id} order={order} />
          )}
        </div>
      </div>

      {/* Dispute Modal */}
      <OpenDisputeModal
        orderId={order.id}
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
      />
    </div>
  );
}

export default function OrderDetails() {
  return (
    <PageBoundary>
      <OrderDetailsContent />
    </PageBoundary>
  );
}