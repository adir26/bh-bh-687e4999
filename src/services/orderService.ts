import { supabase } from '@/integrations/supabase/client';

export interface Order {
  id: string;
  client_id: string;
  supplier_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  current_status?: string;
  amount: number;
  paid_amount?: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  event_type: string;
  actor_id?: string;
  meta: any;
  created_at: string;
}

export interface OrderFile {
  id: string;
  order_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string;
  message_text?: string;
  file_url?: string;
  file_name?: string;
  read_by: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface PaymentLink {
  id: string;
  order_id: string;
  provider: string;
  external_id?: string;
  payment_url?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  expires_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export const orderService = {
  async getOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error) throw error;
    return data as Order | null;
  },

  async getOrderEvents(orderId: string): Promise<OrderEvent[]> {
    const { data, error } = await supabase
      .from('order_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as OrderEvent[];
  },

  async createOrderEvent(orderId: string, eventType: string, meta: any = {}): Promise<string> {
    const { data, error } = await supabase.rpc('create_order_event', {
      p_order_id: orderId,
      p_event_type: eventType,
      p_meta: meta
    });

    if (error) throw error;
    return data;
  },

  async getOrderFiles(orderId: string): Promise<OrderFile[]> {
    const { data, error } = await supabase
      .from('order_files')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as OrderFile[];
  },

  async uploadOrderFile(orderId: string, file: File): Promise<OrderFile> {
    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${orderId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('order-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('order-files')
      .getPublicUrl(filePath);

    // Save file record
    const { data: userData } = await supabase.auth.getUser();
    const uploadedBy = userData.user?.id;
    if (!uploadedBy) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('order_files')
      .insert({
        order_id: orderId,
        uploaded_by: uploadedBy,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();

    if (error) throw error;

    // Create event
    await this.createOrderEvent(orderId, 'file_upload', {
      file_name: file.name,
      file_size: file.size
    });

    return data as OrderFile;
  },

  async getOrderMessages(orderId: string): Promise<OrderMessage[]> {
    const { data, error } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as OrderMessage[];
  },

  async sendOrderMessage(
    orderId: string, 
    messageText?: string, 
    file?: File
  ): Promise<OrderMessage> {
    const { data: userData } = await supabase.auth.getUser();
    const senderId = userData.user?.id;
    if (!senderId) throw new Error('Not authenticated');

    let fileUrl: string | undefined;
    let fileName: string | undefined;

    // Handle file upload if provided
    if (file) {
      const fileExt = file.name.split('.').pop();
      const generatedFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${orderId}/${generatedFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('order-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('order-files')
        .getPublicUrl(filePath);

      fileUrl = publicUrl;
      fileName = file.name;
    }

    // Send message
    const { data, error } = await supabase
      .from('order_messages')
      .insert({
        order_id: orderId,
        sender_id: senderId,
        message_text: messageText,
        file_url: fileUrl,
        file_name: fileName
      })
      .select()
      .single();

    if (error) throw error;

    // Create event
    await this.createOrderEvent(orderId, 'message', {
      message_text: messageText,
      has_file: !!file,
      file_name: fileName
    });

    return data as OrderMessage;
  },

  async markMessagesAsRead(orderId: string, messageIds?: string[]): Promise<void> {
    const { error } = await supabase.rpc('mark_order_messages_read', {
      p_order_id: orderId,
      p_message_ids: messageIds || null
    });

    if (error) throw error;
  },

  async getPaymentLinks(orderId: string): Promise<PaymentLink[]> {
    const { FEATURES } = await import('@/config/featureFlags');
    if (!FEATURES.PAYMENTS_ENABLED) {
      throw new Error('Payments are disabled at the moment');
    }

    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PaymentLink[];
  },

  async createPaymentLink(
    orderId: string, 
    amount: number, 
    currency: string = 'USD'
  ): Promise<PaymentLink> {
    const { FEATURES } = await import('@/config/featureFlags');
    if (!FEATURES.PAYMENTS_ENABLED) {
      throw new Error('Payments are disabled at the moment');
    }
    const { data, error } = await supabase
      .from('payment_links')
      .insert({
        order_id: orderId,
        amount,
        currency,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Create event
    await this.createOrderEvent(orderId, 'payment_link_created', {
      amount,
      currency
    });

    return data as PaymentLink;
  },

  async markPaymentAsPaid(paymentLinkId: string): Promise<void> {
    const { FEATURES } = await import('@/config/featureFlags');
    if (!FEATURES.PAYMENTS_ENABLED) {
      throw new Error('Payments are disabled at the moment');
    }

    // Simulate webhook call to mark payment as paid
    const response = await supabase.functions.invoke('payment-webhook', {
      body: {
        provider: 'manual',
        external_id: paymentLinkId,
        status: 'completed',
        metadata: { marked_manually: true }
      }
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to mark payment as paid');
    }
  },

  async copyPaymentLink(paymentLink: PaymentLink): Promise<void> {
    // For now, we'll copy a demo payment URL
    const paymentUrl = paymentLink.payment_url || `https://pay.example.com/payment/${paymentLink.id}`;
    
    try {
      await navigator.clipboard.writeText(paymentUrl);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = paymentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  },

  async updateOrderStatus(
    orderId: string, 
    newStatus: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
    note?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) throw error;

    // Create event
    await this.createOrderEvent(orderId, 'status_change', {
      new_status: newStatus,
      note
    });
  },

  // Real-time subscription for messages
  subscribeToOrderMessages(
    orderId: string, 
    callback: (message: OrderMessage) => void
  ) {
    return supabase
      .channel(`order-messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => callback(payload.new as OrderMessage)
      )
      .subscribe();
  },

  // Real-time subscription for events
  subscribeToOrderEvents(
    orderId: string, 
    callback: (event: OrderEvent) => void
  ) {
    return supabase
      .channel(`order-events-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_events',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => callback(payload.new as OrderEvent)
      )
      .subscribe();
  },

  // Create a new order
  async createOrder(orderData: {
    client_id: string;
    project_id: string;
    title: string;
    description?: string;
    amount: number;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    eta_at?: string;
    due_date?: string;
    shipping_address?: any;
    items?: Array<{
      product_name: string;
      qty: number;
      unit_price: number;
    }>;
  }): Promise<Order> {
    const { data: userData } = await supabase.auth.getUser();
    const supplierId = userData.user?.id;
    if (!supplierId) throw new Error('Not authenticated');

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        supplier_id: supplierId,
        client_id: orderData.client_id,
        project_id: orderData.project_id,
        title: orderData.title,
        description: orderData.description,
        amount: orderData.amount,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email,
        eta_at: orderData.eta_at,
        due_date: orderData.due_date,
        shipping_address: orderData.shipping_address,
        status: 'pending',
        current_status: 'new'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Add order items if provided
    if (orderData.items && orderData.items.length > 0) {
      const itemsToInsert = orderData.items.map(item => ({
        order_id: order.id,
        product_name: item.product_name,
        qty: item.qty,
        unit_price: item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error inserting order items:', itemsError);
        // Continue even if items fail - order is created
      }
    }

    // Create initial event
    try {
      await this.createOrderEvent(order.id, 'order_created', {
        title: order.title,
        amount: order.amount,
        client_id: order.client_id
      });
    } catch (error) {
      console.error('Error creating order event:', error);
      // Continue - event is not critical
    }

    // Create initial status event
    try {
      await supabase
        .from('order_status_events')
        .insert({
          order_id: order.id,
          old_status: null,
          new_status: 'new',
          is_customer_visible: false,
          changed_by: supplierId
        });
    } catch (error) {
      console.error('Error creating status event:', error);
      // Continue - status event is not critical
    }

    return order as Order;
  }
};