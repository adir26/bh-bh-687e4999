import { supabase } from '@/integrations/supabase/client';

export interface Ticket {
  id: string;
  order_id: string;
  opened_by: string;
  assigned_to?: string;
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  description?: string;
  ticket_number: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  closed_by?: string;
  escalated_at?: string;
  sla_due_at?: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message_text?: string;
  file_url?: string;
  file_name?: string;
  is_internal: boolean;
  read_by: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export const ticketService = {
  async createTicket(
    orderId: string,
    reason: string,
    description?: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<Ticket> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        order_id: orderId,
        opened_by: userData.user.id,
        reason,
        description,
        priority
      })
      .select()
      .single();

    if (error) throw error;
    return data as Ticket;
  },

  async getTicketById(ticketId: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .maybeSingle();

    if (error) throw error;
    return data as Ticket | null;
  },

  async getOrderTickets(orderId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Ticket[];
  },

  async getUserTickets(): Promise<Ticket[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        orders!inner(client_id, supplier_id)
      `)
      .or(`opened_by.eq.${userData.user.id},assigned_to.eq.${userData.user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Ticket[];
  },

  async updateTicketStatus(
    ticketId: string,
    status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed'
  ): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (error) throw error;
  },

  async closeTicket(ticketId: string, reason?: string): Promise<void> {
    const { error } = await supabase.rpc('close_ticket', {
      p_ticket_id: ticketId,
      p_reason: reason
    });

    if (error) throw error;
  },

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as TicketMessage[];
  },

  async sendTicketMessage(
    ticketId: string,
    messageText?: string,
    file?: File,
    isInternal: boolean = false
  ): Promise<TicketMessage> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    let fileUrl: string | undefined;
    let fileName: string | undefined;

    // Handle file upload if provided
    if (file) {
      const fileExt = file.name.split('.').pop();
      const generatedFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${ticketId}/${generatedFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ticket-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ticket-files')
        .getPublicUrl(filePath);

      fileUrl = publicUrl;
      fileName = file.name;
    }

    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: userData.user.id,
        message_text: messageText,
        file_url: fileUrl,
        file_name: fileName,
        is_internal: isInternal
      })
      .select()
      .single();

    if (error) throw error;
    return data as TicketMessage;
  },

  async markMessagesAsRead(ticketId: string, messageIds?: string[]): Promise<void> {
    const { error } = await supabase.rpc('mark_ticket_messages_read', {
      p_ticket_id: ticketId,
      p_message_ids: messageIds || null
    });

    if (error) throw error;
  },

  async escalateOverdueTickets(): Promise<void> {
    const { error } = await supabase.rpc('escalate_overdue_tickets');
    if (error) throw error;
  },

  // Real-time subscription for ticket messages
  subscribeToTicketMessages(
    ticketId: string,
    callback: (message: TicketMessage) => void
  ) {
    return supabase
      .channel(`ticket-messages-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => callback(payload.new as TicketMessage)
      )
      .subscribe();
  },

  // Real-time subscription for ticket status changes
  subscribeToTicketUpdates(
    ticketId: string,
    callback: (ticket: Ticket) => void
  ) {
    return supabase
      .channel(`ticket-updates-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticketId}`
        },
        (payload) => callback(payload.new as Ticket)
      )
      .subscribe();
  }
};