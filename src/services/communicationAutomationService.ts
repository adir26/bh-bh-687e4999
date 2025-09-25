import { supabase } from "@/integrations/supabase/client";

export interface CommunicationAutomation {
  id: string;
  name: string;
  description?: string;
  trigger_event: string;
  trigger_conditions?: any;
  delay_hours: number;
  channel: 'email' | 'sms' | 'notification' | 'whatsapp';
  template_id?: string;
  message_template: any;
  is_active: boolean;
  supplier_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationJob {
  id: string;
  automation_id: string;
  entity_id: string;
  entity_type: string;
  scheduled_for: string;
  executed_at?: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  delivery_log?: any;
  error_message?: string;
  created_at: string;
}

export interface QuietHoursConfig {
  id: string;
  supplier_id?: string;
  start_time: string;
  end_time: string;
  timezone: string;
  days_of_week: number[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RateLimitConfig {
  id: string;
  supplier_id?: string;
  channel: string;
  max_per_hour: number;
  max_per_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunicationOptOut {
  id: string;
  user_id: string;
  supplier_id?: string;
  channel: string;
  automation_type?: string;
  opted_out_at: string;
  reason?: string;
}

export const communicationAutomationService = {
  // Automation Rules Management
  async getAutomations(supplierId?: string): Promise<CommunicationAutomation[]> {
    let query = supabase.from('communication_automations').select('*');
    
    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getTemplateAutomations(): Promise<CommunicationAutomation[]> {
    const { data, error } = await supabase
      .from('communication_automations')
      .select('*')
      .is('supplier_id', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createAutomation(automation: Omit<CommunicationAutomation, 'id' | 'created_at' | 'updated_at'>): Promise<CommunicationAutomation> {
    const { data, error } = await supabase
      .from('communication_automations')
      .insert(automation)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAutomation(id: string, updates: Partial<CommunicationAutomation>): Promise<CommunicationAutomation> {
    const { data, error } = await supabase
      .from('communication_automations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteAutomation(id: string): Promise<void> {
    const { error } = await supabase
      .from('communication_automations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleAutomation(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('communication_automations')
      .update({ is_active: isActive })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Jobs Management
  async getJobs(automationId?: string): Promise<AutomationJob[]> {
    let query = supabase.from('automation_jobs').select(`
      *,
      automation:communication_automations(name, trigger_event, channel)
    `);
    
    if (automationId) {
      query = query.eq('automation_id', automationId);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    return data || [];
  },

  async getJobStats(supplierId?: string): Promise<{
    total: number;
    pending: number;
    sent: number;
    failed: number;
  }> {
    let baseQuery = supabase.from('automation_jobs').select('status');
    
    // Filter by supplier if needed - this would need to be done with a join or separate query
    // For now, let's simplify and get all stats
    
    const { data, error } = await baseQuery;
    
    if (error) throw error;
    
    const stats = {
      total: data?.length || 0,
      pending: data?.filter(j => j.status === 'pending').length || 0,
      sent: data?.filter(j => j.status === 'sent').length || 0,
      failed: data?.filter(j => j.status === 'failed').length || 0,
    };
    
    return stats;
  },

  // Quiet Hours Management
  async getQuietHours(supplierId?: string): Promise<QuietHoursConfig[]> {
    let query = supabase.from('quiet_hours_config').select('*');
    
    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async upsertQuietHours(config: Omit<QuietHoursConfig, 'id' | 'created_at' | 'updated_at'>): Promise<QuietHoursConfig> {
    const { data, error } = await supabase
      .from('quiet_hours_config')
      .upsert(config, {
        onConflict: 'supplier_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Rate Limits Management
  async getRateLimits(supplierId?: string): Promise<RateLimitConfig[]> {
    let query = supabase.from('rate_limits_config').select('*');
    
    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }
    
    const { data, error } = await query.order('channel', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async upsertRateLimit(config: Omit<RateLimitConfig, 'id' | 'created_at' | 'updated_at'>): Promise<RateLimitConfig> {
    const { data, error } = await supabase
      .from('rate_limits_config')
      .upsert(config, {
        onConflict: 'supplier_id,channel'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Opt-outs Management
  async getOptOuts(supplierId?: string): Promise<CommunicationOptOut[]> {
    let query = supabase.from('communication_opt_outs').select('*');
    
    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }
    
    const { data, error } = await query.order('opted_out_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createOptOut(optOut: Omit<CommunicationOptOut, 'id' | 'opted_out_at'>): Promise<CommunicationOptOut> {
    const { data, error } = await supabase
      .from('communication_opt_outs')
      .insert(optOut)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Trigger automation (for testing)
  async triggerAutomation(automationId: string, entityId: string, entityType: string): Promise<void> {
    // This would typically be handled by a backend process/edge function
    // For now, we'll create a job entry for immediate execution
    const { error } = await supabase
      .from('automation_jobs')
      .insert({
        automation_id: automationId,
        entity_id: entityId,
        entity_type: entityType,
        scheduled_for: new Date().toISOString(),
        status: 'pending'
      });
    
    if (error) throw error;
  },

  // Analytics
  async getAutomationAnalytics(supplierId?: string, days: number = 30): Promise<{
    totalSent: number;
    totalFailed: number;
    successRate: number;
    byChannel: Record<string, number>;
    byTrigger: Record<string, number>;
  }> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    let query = supabase
      .from('automation_jobs')
      .select(`
        status,
        automation:communication_automations(channel, trigger_event)
      `)
      .gte('created_at', fromDate.toISOString());
    
    // Filter by supplier if needed - simplified for now
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const jobs = data || [];
    const totalSent = jobs.filter(j => j.status === 'sent').length;
    const totalFailed = jobs.filter(j => j.status === 'failed').length;
    const total = totalSent + totalFailed;
    
    const byChannel: Record<string, number> = {};
    const byTrigger: Record<string, number> = {};
    
    jobs.forEach(job => {
      const automation = job.automation as any;
      if (automation) {
        byChannel[automation.channel] = (byChannel[automation.channel] || 0) + 1;
        byTrigger[automation.trigger_event] = (byTrigger[automation.trigger_event] || 0) + 1;
      }
    });
    
    return {
      totalSent,
      totalFailed,
      successRate: total > 0 ? (totalSent / total) * 100 : 0,
      byChannel,
      byTrigger
    };
  }
};