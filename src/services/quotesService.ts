import { supabase } from '@/integrations/supabase/client';
import { showToast } from '@/utils/toast';

const PUBLIC_BASE_URL = "https://bh-bonimpo.com";

export interface Quote {
  id: string;
  supplier_id: string;
  client_id?: string;
  lead_id?: string;
  order_id?: string;
  title: string;
  notes?: string;
  terms_conditions?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  template?: string;
  viewed_at?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  sort_order: number;
}

export interface CreateQuotePayload {
  title: string;
  client_id?: string;
  lead_id?: string;
  notes?: string;
  terms_conditions?: string;
}

export interface UpdateQuotePayload {
  title?: string;
  client_id?: string;
  lead_id?: string;
  notes?: string;
  terms_conditions?: string;
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  status?: Quote['status'];
}

export interface CreateQuoteItemPayload {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  sort_order?: number;
}

export interface UpdateQuoteItemPayload {
  name?: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
  sort_order?: number;
}

export const quotesService = {
  async createQuote(payload: CreateQuotePayload): Promise<Quote> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        supplier_id: userId,
        client_id: payload.client_id,
        lead_id: payload.lead_id,
        title: payload.title,
        notes: payload.notes,
        terms_conditions: payload.terms_conditions,
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        status: 'draft'
      } as any)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as unknown as Quote;
  },

  async updateQuote(quoteId: string, payload: UpdateQuotePayload): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .update(payload)
      .eq('id', quoteId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as unknown as Quote;
  },

  async getQuoteById(quoteId: string): Promise<{ quote: Quote; items: QuoteItem[] } | null> {
    const [quoteRes, itemsRes] = await Promise.all([
      supabase
        .from('quotes')
        .select()
        .eq('id', quoteId)
        .maybeSingle(),
      supabase
        .from('quote_items')
        .select()
        .eq('quote_id', quoteId)
        .order('sort_order', { ascending: true })
    ]);

    if (quoteRes.error) throw quoteRes.error;
    if (itemsRes.error) throw itemsRes.error;

    if (!quoteRes.data) return null;

    return {
      quote: quoteRes.data as unknown as Quote,
      items: (itemsRes.data || []) as unknown as QuoteItem[]
    };
  },

  async listQuotesBySupplier(supplierId: string): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select()
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Quote[];
  },

  async listQuotesByClient(clientId: string): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select()
      .eq('client_id', clientId)
      .in('status', ['sent', 'accepted', 'rejected'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Quote[];
  },

  async addItem(quoteId: string, item: CreateQuoteItemPayload): Promise<QuoteItem> {
    const subtotal = item.quantity * item.unit_price;
    
    const { data, error } = await supabase
      .from('quote_items')
      .insert({
        quote_id: quoteId,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal,
        sort_order: item.sort_order || 0,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as unknown as QuoteItem;
  },

  async updateItem(itemId: string, payload: UpdateQuoteItemPayload): Promise<QuoteItem> {
    // Calculate subtotal if quantity or unit_price is being updated
    const updateData: any = { ...payload };
    if (payload.quantity !== undefined || payload.unit_price !== undefined) {
      // We need to get current values to calculate subtotal
      const { data: currentItem } = await supabase
        .from('quote_items')
        .select('quantity, unit_price')
        .eq('id', itemId)
        .maybeSingle();

      if (currentItem) {
        const quantity = payload.quantity ?? currentItem.quantity;
        const unitPrice = payload.unit_price ?? currentItem.unit_price;
        updateData.subtotal = quantity * unitPrice;
      }
    }

    const { data, error } = await supabase
      .from('quote_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as unknown as QuoteItem;
  },

  async removeItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('quote_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  async sendQuote(quoteId: string, clientId: string): Promise<Quote> {
    // Update quote status to sent
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .update({ 
        status: 'sent' as const,
        client_id: clientId 
      })
      .eq('id', quoteId)
      .select()
      .maybeSingle();

    if (quoteError) throw quoteError;

    // Generate public share link
    const shareUrl = await this.generateShareLink(quoteId);

    // Create notification for client with public share link
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: clientId,
        title: 'הצעת מחיר חדשה התקבלה',
        content: `הצעת מחיר חדשה ממתינה לאישורך`,
        message: `הצעת מחיר חדשה ממתינה לאישורך`,
        type: 'quote_received',
        action_url: shareUrl,
        metadata: { quote_id: quoteId, share_url: shareUrl }
      });

    if (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't throw - quote was sent successfully
    }

    showToast.success('הצעת המחיר נשלחה בהצלחה');
    return quote as unknown as Quote;
  },

  async acceptQuote(quoteId: string): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .update({ status: 'accepted' as const })
      .eq('id', quoteId)
      .select()
      .maybeSingle();

    if (error) throw error;

    // Get quote details for notification
    const quote = data as unknown as Quote;
    
    // Create notification for supplier
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: quote.supplier_id,
        title: 'הצעת מחיר אושרה!',
        content: `הצעת המחיר שלך אושרה על ידי הלקוח`,
        message: `הצעת המחיר שלך אושרה על ידי הלקוח`,
        type: 'quote_accepted',
        action_url: `/supplier/quotes/${quoteId}`,
        metadata: { quote_id: quoteId }
      });

    if (notificationError) {
      console.error('Failed to create notification:', notificationError);
    }

    showToast.success('הצעת המחיר אושרה');
    return quote;
  },

  async rejectQuote(quoteId: string): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .update({ status: 'rejected' as const })
      .eq('id', quoteId)
      .select()
      .maybeSingle();

    if (error) throw error;

    // Get quote details for notification
    const quote = data as unknown as Quote;
    
    // Create notification for supplier
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: quote.supplier_id,
        title: 'הצעת מחיר נדחתה',
        content: `הצעת המחיר שלך נדחתה על ידי הלקוח`,
        message: `הצעת המחיר שלך נדחתה על ידי הלקוח`,
        type: 'quote_rejected',
        action_url: `/supplier/quotes/${quoteId}`,
        metadata: { quote_id: quoteId }
      });

    if (notificationError) {
      console.error('Failed to create notification:', notificationError);
    }

    showToast.info('הצעת המחיר נדחתה');
    return quote;
  },

  // Calculate totals for a quote
  calculateTotals(items: { total: number }[], discountPercent: number = 0, taxRate: number = 17) {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const totalAmount = taxableAmount + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      totalAmount
    };
  },

  async generateShareLink(quoteId: string): Promise<string> {
    try {
      // Update quote status to 'sent' when generating share link
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ 
          status: 'sent' as const, 
          sent_at: new Date().toISOString() 
        })
        .eq('id', quoteId)
        .eq('status', 'draft'); // Only update if currently draft

      if (updateError) {
        console.error('Failed to update quote status:', updateError);
        // Continue anyway - link is still valid
      }

      const token = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

      const { error } = await supabase
        .from('quote_share_links')
        .insert({
          quote_id: quoteId,
          token,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      // Use fixed public base URL to ensure links are always public
      const shareUrl = new URL(`/quote/share/${token}`, PUBLIC_BASE_URL);
      // Force guest mode so the recipient never sees an auth wall
      if (!shareUrl.searchParams.has('guest')) {
        shareUrl.searchParams.set('guest', '1');
      }

      return shareUrl.toString();
    } catch (error: any) {
      showToast.error(error.message);
      throw error;
    }
  },

  async getQuoteByToken(token: string): Promise<{ quote: Quote; items: QuoteItem[] } | null> {
    try {
      // Call the edge function to get quote data
      const { data, error } = await supabase.functions.invoke('quote-share-view', {
        body: { token }
      });

      if (error) throw error;
      if (!data || !data.success) {
        showToast.error(data?.error || 'קישור לא נמצא או פג תוקף');
        return null;
      }

      return {
        quote: data.quote,
        items: data.items || []
      };
    } catch (error: any) {
      showToast.error(error.message);
      throw error;
    }
  },

  async deleteQuote(quoteId: string): Promise<void> {
    try {
      // Delete quote items first (cascade should handle this, but being explicit)
      const { error: itemsError } = await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', quoteId);

      if (itemsError) throw itemsError;

      // Delete the quote
      const { error: quoteError } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId);

      if (quoteError) throw quoteError;

      showToast.success('הצעת המחיר נמחקה בהצלחה');
    } catch (error: any) {
      showToast.error(error.message || 'שגיאה במחיקת הצעת המחיר');
      throw error;
    }
  },

  async convertToOrder(quoteId: string): Promise<any> {
    try {
      // Get quote and items
      const quoteData = await this.getQuoteById(quoteId);
      if (!quoteData) throw new Error('הצעת המחיר לא נמצאה');

      const { quote, items } = quoteData;

      if (!quote.client_id) {
        throw new Error('לא ניתן להמיר הצעת מחיר ללא לקוח');
      }

      // Create order with notes and terms_conditions combined
      const orderNotes = [quote.notes, quote.terms_conditions]
        .filter(Boolean)
        .join('\n\n--- תנאי ההצעה ---\n');

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          client_id: quote.client_id,
          title: quote.title,
          amount: quote.total_amount,
          status: 'pending',
          notes: orderNotes || undefined
        } as any)
        .select()
        .maybeSingle();

      if (orderError) throw orderError;
      if (!order) throw new Error('שגיאה ביצירת ההזמנה');

      // Update quote with order_id
      await this.updateQuote(quoteId, { order_id: order.id } as any);

      showToast.success('ההצעה הומרה להזמנה בהצלחה!');
      return order;
    } catch (error: any) {
      showToast.error(error.message || 'שגיאה בהמרת הצעת המחיר להזמנה');
      throw error;
    }
  }
};
