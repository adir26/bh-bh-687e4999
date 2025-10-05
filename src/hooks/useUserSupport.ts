import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  assigned_to?: string;
  admin_notes?: string;
  order_id?: string;
  project_id?: string;
  rating?: number;
  rating_feedback?: string;
  response_due_at?: string;
  first_response_at?: string;
  tags?: string[];
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const useUserSupport = () => {
  const { user } = useAuth();

  // Fetch user's support tickets
  const { 
    data: tickets = [], 
    isLoading: ticketsLoading,
    error: ticketsError
  } = useQuery({
    queryKey: ['support-tickets', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[useUserSupport] Error fetching tickets:', error);
          return [];
        }

        return (data || []) as SupportTicket[];
      } catch (error: any) {
        console.error('[useUserSupport] Failed to fetch tickets:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30_000,
  });

  // Separate tickets by status
  const activeTickets = tickets.filter(
    ticket => ticket.status === 'open' || ticket.status === 'in_progress'
  );

  const closedTickets = tickets.filter(
    ticket => ticket.status === 'closed' || ticket.status === 'resolved'
  );

  // Filter complaints by tags - assuming complaints have 'complaint' or 'dispute' tags
  const complaints = tickets.filter(
    ticket => ticket.tags?.includes('complaint') || ticket.tags?.includes('dispute')
  );

  return {
    tickets,
    activeTickets,
    closedTickets,
    complaints,
    unreadCounts: {}, // Simplified for now - can be extended later
    isLoading: ticketsLoading,
    error: ticketsError,
  };
};
