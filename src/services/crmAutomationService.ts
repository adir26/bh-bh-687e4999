import { supabase } from "@/integrations/supabase/client";

export interface SLAMetrics {
  avg_response_time_hours: number;
  response_rate_percent: number;
  sla_compliant_percent: number;
  period_days: number;
}

export const crmAutomationService = {
  async getSLAMetrics(supplierId: string, days: number = 30): Promise<SLAMetrics> {
    const { data, error } = await supabase.rpc('get_sla_metrics', {
      p_supplier_id: supplierId,
      p_days: days
    });
    
    if (error) throw error;
    return data as unknown as SLAMetrics;
  },

  async snoozeLead(leadId: string, hours: number = 24): Promise<boolean> {
    const { data, error } = await supabase.rpc('snooze_lead', {
      p_lead_id: leadId,
      p_hours: hours
    });
    
    if (error) throw error;
    return data as boolean;
  },

  async assignLead(leadId: string, assigneeId: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .update({ assigned_to: assigneeId })
      .eq('id', leadId);
    
    if (error) throw error;
  },

  async processAutomations(): Promise<void> {
    // Auto-assign unassigned leads
    await supabase.rpc('auto_assign_leads');
    
    // Process SLA reminders
    await supabase.rpc('process_sla_reminders');
  }
};