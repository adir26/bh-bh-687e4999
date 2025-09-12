import { supabase } from "@/integrations/supabase/client";

export type LeadStatus = 'new' | 'contacted' | 'proposal_sent' | 'won' | 'lost';

export interface Lead {
  id: string;
  supplier_id: string | null;
  client_id: string | null;
  assigned_to: string | null;
  name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  source: string | null;
  status: LeadStatus;
  priority: string | null;
  last_contact_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  first_response_at?: string | null;
  snoozed_until?: string | null;
  sla_risk?: boolean;
}

export interface LeadFilters {
  status?: LeadStatus;
  source?: string;
  search?: string;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  sort?: 'newest' | 'oldest';
}

export const leadsService = {
  async listLeads(supplierId?: string, filters: LeadFilters = {}) {
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: filters.sort === 'oldest' });

    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.source) {
      query = query.eq('source', filters.source);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters.search && filters.search.trim().length > 0) {
      const s = `%${filters.search.trim()}%`;
      query = query.or(
        `name.ilike.${s},contact_email.ilike.${s},contact_phone.ilike.${s}`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as Lead[];
  },

  async updateLeadStatus(id: string, status: LeadStatus) {
    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as unknown as Lead | null;
  },

  async addLeadNote(leadId: string, note: string) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Insert activity log
    const { error: activityErr } = await supabase.from('lead_activities').insert({
      lead_id: leadId,
      user_id: userId,
      title: 'Note',
      description: note,
      activity_type: 'note',
    });
    if (activityErr) throw activityErr;

    // Optionally also store last note on lead
    const { error: leadErr } = await supabase
      .from('leads')
      .update({ notes: note, last_contact_date: new Date().toISOString() })
      .eq('id', leadId);
    if (leadErr) throw leadErr;
  },

  async createQuoteFromLead(leadId: string) {
    const { data: userData } = await supabase.auth.getUser();
    const supplierId = userData.user?.id;
    if (!supplierId) throw new Error('Not authenticated');

    // Load lead to get client_id and name
    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .maybeSingle();
    if (leadErr) throw leadErr;
    const leadData = lead as unknown as { client_id: string; name: string | null; notes: string | null };
    if (!leadData?.client_id) throw new Error('Lead has no client');

    // Generate quote number (in case trigger is not attached)
    const { data: quoteNo, error: genErr } = await supabase.rpc('generate_quote_number');
    if (genErr) throw genErr;

    const title = `Quote for ${leadData.name || 'lead'}`;

    const { data: quote, error: quoteErr } = await supabase
      .from('quotes')
      .insert({
        supplier_id: supplierId,
        client_id: leadData.client_id,
        title,
        description: leadData.notes || null,
        subtotal: 0,
        total_amount: 0,
        discount_amount: 0,
        tax_amount: 0,
        quote_number: quoteNo as string,
        status: 'draft',
      })
      .select()
      .maybeSingle();

    if (quoteErr) throw quoteErr;
    return quote;
  },
};
