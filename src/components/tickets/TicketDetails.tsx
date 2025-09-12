import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ticketService, Ticket } from '@/services/ticketService';
import { useAuth } from '@/contexts/AuthContext';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketChat } from './TicketChat';
import { 
  Calendar, 
  User, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  ArrowLeft 
} from 'lucide-react';
import { format } from 'date-fns';

interface TicketDetailsProps {
  ticketId: string;
  onBack?: () => void;
}

export function TicketDetails({ ticketId, onBack }: TicketDetailsProps) {
  const [newStatus, setNewStatus] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketService.getTicketById(ticketId),
    enabled: !!ticketId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!newStatus) return;
      await ticketService.updateTicketStatus(ticketId, newStatus as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['order-tickets'] });
      toast({
        title: 'Status updated',
        description: 'Ticket status has been updated successfully.'
      });
      setNewStatus('');
    },
    onError: (error) => {
      toast({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
    }
  });

  const closeTicketMutation = useMutation({
    mutationFn: async () => {
      await ticketService.closeTicket(ticketId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['order-tickets'] });
      toast({
        title: 'Ticket closed',
        description: 'The ticket has been closed successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to close ticket',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
    }
  });

  if (isLoading || !ticket) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isOwner = ticket.opened_by === user?.id;
  const isAssigned = ticket.assigned_to === user?.id;
  const canUpdateStatus = isAssigned || user?.email?.includes('admin'); // Simple admin check
  const isClosed = ticket.status === 'closed';
  const isOverdue = ticket.sla_due_at && new Date(ticket.sla_due_at) < new Date() && !isClosed;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-bold">Ticket #{ticket.ticket_number}</h1>
            <TicketStatusBadge status={ticket.status} />
            {isOverdue && (
              <Badge variant="destructive">
                <Clock className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Created {format(new Date(ticket.created_at), 'MMM d, yyyy')}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {isOwner ? 'Your ticket' : 'Assigned to you'}
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                {ticket.priority.toUpperCase()}
              </Badge>
            </div>
            {ticket.sla_due_at && !isClosed && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                SLA: {format(new Date(ticket.sla_due_at), 'MMM d, HH:mm')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reason</label>
                <p className="mt-1">{ticket.reason}</p>
              </div>
              
              {ticket.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{ticket.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <div className="mt-1">
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <TicketStatusBadge status={ticket.status} />
                </div>
              </div>

              {ticket.closed_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Closed</label>
                  <p className="mt-1 text-sm">
                    {format(new Date(ticket.closed_at), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              )}

              {ticket.escalated_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Escalated</label>
                  <p className="mt-1 text-sm">
                    {format(new Date(ticket.escalated_at), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {canUpdateStatus && !isClosed && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="escalated">Escalate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => updateStatusMutation.mutate()}
                    disabled={!newStatus || updateStatusMutation.isPending}
                    className="w-full"
                  >
                    Update Status
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={() => closeTicketMutation.mutate()}
                  disabled={closeTicketMutation.isPending}
                  className="w-full"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Close Ticket
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat */}
        <div className="lg:col-span-2">
          <TicketChat ticketId={ticketId} isLocked={isClosed} />
        </div>
      </div>
    </div>
  );
}