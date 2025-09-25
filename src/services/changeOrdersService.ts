import { supabase } from "@/integrations/supabase/client";

export interface ChangeOrder {
  id: string;
  order_id: string;
  supplier_id: string;
  client_id: string;
  co_number: string;
  title: string;
  description?: string;
  subtotal: number;
  tax_amount?: number;
  total_amount: number;
  time_delta_days: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled';
  sent_at?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChangeOrderItem {
  id: string;
  change_order_id: string;
  item_type: 'addition' | 'removal' | 'modification';
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
}

export interface ChangeOrderEvent {
  id: string;
  change_order_id: string;
  event_type: string;
  actor_id?: string;
  metadata: any;
  created_at: string;
}

export const changeOrdersService = {
  // Get change orders for an order
  async getChangeOrdersForOrder(orderId: string): Promise<ChangeOrder[]> {
    const { data, error } = await supabase
      .from('change_orders')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ChangeOrder[];
  },

  // Get single change order with items
  async getChangeOrder(id: string): Promise<{
    changeOrder: ChangeOrder;
    items: ChangeOrderItem[];
    events: ChangeOrderEvent[];
  } | null> {
    const [coResult, itemsResult, eventsResult] = await Promise.all([
      supabase.from('change_orders').select('*').eq('id', id).single(),
      supabase.from('change_order_items').select('*').eq('change_order_id', id).order('created_at'),
      supabase.from('change_order_events').select('*').eq('change_order_id', id).order('created_at')
    ]);

    if (coResult.error) throw coResult.error;
    
    return {
      changeOrder: coResult.data as ChangeOrder,
      items: (itemsResult.data || []) as ChangeOrderItem[],
      events: eventsResult.data || []
    };
  },

  // Create new change order
  async createChangeOrder(changeOrder: Omit<ChangeOrder, 'id' | 'co_number' | 'created_at' | 'updated_at'>): Promise<ChangeOrder> {
    const { data, error } = await supabase
      .from('change_orders')
      .insert(changeOrder as any)
      .select()
      .single();

    if (error) throw error;
    return data as ChangeOrder;
  },

  // Update change order
  async updateChangeOrder(id: string, updates: Partial<ChangeOrder>): Promise<ChangeOrder> {
    const { data, error } = await supabase
      .from('change_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ChangeOrder;
  },

  // Add item to change order
  async addItem(item: Omit<ChangeOrderItem, 'id' | 'created_at'>): Promise<ChangeOrderItem> {
    const { data, error } = await supabase
      .from('change_order_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data as ChangeOrderItem;
  },

  // Update item
  async updateItem(id: string, updates: Partial<ChangeOrderItem>): Promise<ChangeOrderItem> {
    const { data, error } = await supabase
      .from('change_order_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ChangeOrderItem;
  },

  // Delete item
  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('change_order_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Send for approval
  async sendForApproval(id: string): Promise<ChangeOrder> {
    const { data, error } = await supabase
      .from('change_orders')
      .update({ 
        status: 'pending_approval', 
        sent_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log event
    await supabase.from('change_order_events').insert({
      change_order_id: id,
      event_type: 'sent_for_approval',
      actor_id: (await supabase.auth.getUser()).data.user?.id
    });

    return data as ChangeOrder;
  },

  // Approve change order (via RPC function)
  async approveChangeOrder(id: string): Promise<any> {
    const { data, error } = await supabase.rpc('approve_change_order', {
      p_change_order_id: id,
      p_approver_id: (await supabase.auth.getUser()).data.user?.id
    });

    if (error) throw error;
    return data as any;
  },

  // Reject change order
  async rejectChangeOrder(id: string, reason: string): Promise<ChangeOrder> {
    const { data, error } = await supabase
      .from('change_orders')
      .update({ 
        status: 'rejected', 
        rejected_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log event
    await supabase.from('change_order_events').insert({
      change_order_id: id,
      event_type: 'rejected',
      actor_id: (await supabase.auth.getUser()).data.user?.id,
      metadata: { reason }
    });

    return data as ChangeOrder;
  },

  // Calculate totals from items
  calculateTotals(items: ChangeOrderItem[]): { subtotal: number; total: number } {
    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const taxRate = 0.17; // 17% VAT
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return { subtotal, total };
  }
};