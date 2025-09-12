import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ticketService, Ticket } from '@/services/ticketService';
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge';
import { TicketDetails } from '@/components/tickets/TicketDetails';
import { MessageSquare, Search, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Tickets() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['user-tickets'],
    queryFn: () => ticketService.getUserTickets(),
  });

  if (selectedTicket) {
    return (
      <TicketDetails 
        ticketId={selectedTicket} 
        onBack={() => setSelectedTicket(null)} 
      />
    );
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getTicketCounts = () => {
    return {
      all: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      escalated: tickets.filter(t => t.status === 'escalated').length
    };
  };

  const counts = getTicketCounts();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 text-red-600 bg-red-50';
      case 'high': return 'border-orange-500 text-orange-600 bg-orange-50';
      case 'medium': return 'border-blue-500 text-blue-600 bg-blue-50';
      case 'low': return 'border-green-500 text-green-600 bg-green-50';
      default: return 'border-gray-500 text-gray-600 bg-gray-50';
    }
  };

  const isOverdue = (ticket: Ticket) => {
    return ticket.sla_due_at && 
           new Date(ticket.sla_due_at) < new Date() && 
           !['resolved', 'closed'].includes(ticket.status);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Manage your disputes and support requests</p>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'open', label: 'Open', count: counts.open },
          { key: 'in_progress', label: 'In Progress', count: counts.in_progress },
          { key: 'escalated', label: 'Escalated', count: counts.escalated },
          { key: 'resolved', label: 'Resolved', count: counts.resolved },
          { key: 'closed', label: 'Closed', count: counts.closed }
        ].map((filter) => (
          <Button
            key={filter.key}
            variant={statusFilter === filter.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(filter.key)}
            className="gap-2"
          >
            {filter.label}
            <Badge variant="secondary" className="text-xs">
              {filter.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={searchQuery || statusFilter !== 'all' ? 'No tickets found' : 'No tickets yet'}
          description={
            searchQuery || statusFilter !== 'all' 
              ? 'No tickets match your current filters.'
              : 'You haven\'t opened any support tickets yet.'
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => (
            <Card 
              key={ticket.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedTicket(ticket.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">#{ticket.ticket_number}</h3>
                      <TicketStatusBadge status={ticket.status} />
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(ticket.priority)}
                      >
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      {isOverdue(ticket) && (
                        <Badge variant="destructive" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Overdue
                        </Badge>
                      )}
                    </div>

                    <h4 className="font-medium text-foreground mb-1">
                      {ticket.reason}
                    </h4>
                    
                    {ticket.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                      </div>
                      
                      {ticket.sla_due_at && !['resolved', 'closed'].includes(ticket.status) && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          SLA: {format(new Date(ticket.sla_due_at), 'MMM d, HH:mm')}
                        </div>
                      )}

                      {ticket.escalated_at && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Escalated {format(new Date(ticket.escalated_at), 'MMM d')}
                        </div>
                      )}

                      {ticket.closed_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Closed {format(new Date(ticket.closed_at), 'MMM d')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}