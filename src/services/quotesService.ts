import { supabase } from '@/integrations/supabase/client';
import { showToast } from '@/utils/toast';

export interface Quote {
  id: string;
  supplier_id: string;
  client_id?: string;
  order_id?: string;
  title: string;
  notes?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  appearance?: Record<string, any> | null;
  design_settings?: Record<string, any> | null;
  theme?: string | null;
  branding?: Record<string, any> | null;
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

export interface QuoteAppearanceTheme {
  theme: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily?: string;
  bannerImage?: string | null;
  showBanner?: boolean;
}

export interface QuoteShareViewData {
  quote: Quote;
  items: QuoteItem[];
  supplier?: {
    id: string;
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  } | null;
  company?: {
    id: string;
    name: string;
    logo_url?: string | null;
    banner_url?: string | null;
    tagline?: string | null;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    city?: string | null;
    area?: string | null;
    services?: any;
  } | null;
  appearance?: QuoteAppearanceTheme | null;
}

export interface CreateQuotePayload {
  title: string;
  client_id?: string;
  notes?: string;
}

export interface UpdateQuotePayload {
  title?: string;
  client_id?: string;
  notes?: string;
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
        title: payload.title,
        notes: payload.notes,
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

    // Create notification for client
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: clientId,
        title: 'הצעת מחיר חדשה התקבלה',
        content: `הצעת מחיר חדשה ממתינה לאישורך`,
        message: `הצעת מחיר חדשה ממתינה לאישורך`,
        type: 'quote_received',
        action_url: `/quotes/${quoteId}`,
        metadata: { quote_id: quoteId }
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

      return `${window.location.origin}/quote/share/${token}`;
    } catch (error: any) {
      showToast.error(error.message);
      throw error;
    }
  },

  async getQuoteByToken(token: string): Promise<QuoteShareViewData | null> {
    try {
      // Call the edge function to get quote data
      const { data, error } = await supabase.functions.invoke('quote-share-view', {
        body: { token }
      });

      if (error) throw error;
      if (!data || !(data as any).success) {
        showToast.error((data as any)?.error || 'קישור לא נמצא או פג תוקף');
        return null;
      }

      const payload = data as {
        quote: Quote;
        items: QuoteItem[];
        supplier?: QuoteShareViewData['supplier'];
        company?: QuoteShareViewData['company'];
        appearance?: QuoteAppearanceTheme | null;
      };

      return {
        quote: payload.quote,
        items: (payload.items || []) as QuoteItem[],
        supplier: payload.supplier ?? null,
        company: payload.company ?? null,
        appearance: payload.appearance ?? null,
      };
    } catch (error: any) {
      showToast.error(error.message);
      throw error;
    }
  }
};
