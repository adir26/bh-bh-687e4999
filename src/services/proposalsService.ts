import { supabase } from "@/integrations/supabase/client";

export interface Proposal {
  id: string;
  quote_id: string;
  version: number;
  html_content?: string;
  pdf_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalEvent {
  id: string;
  proposal_id: string;
  event_type: string;
  actor_id?: string;
  metadata: any;
  created_at: string;
}

export interface SignatureLink {
  id: string;
  proposal_id: string;
  token: string;
  expires_at: string;
  acted_by?: string;
  action?: string;
  acted_at?: string;
  created_at: string;
}

export const proposalsService = {
  // Create proposal from quote
  async createProposalFromQuote(quoteId: string, htmlContent?: string): Promise<Proposal> {
    const { data, error } = await supabase.rpc('create_proposal_from_quote', {
      p_quote_id: quoteId,
      p_html_content: htmlContent
    });

    if (error) {
      throw new Error(`Failed to create proposal: ${error.message}`);
    }

    // Fetch the created proposal
    const { data: proposal, error: fetchError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', data)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch proposal: ${fetchError.message}`);
    }

    return proposal;
  },

  // Get proposal by ID
  async getProposalById(proposalId: string): Promise<Proposal | null> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch proposal: ${error.message}`);
    }

    return data;
  },

  // Get proposals for a quote
  async getProposalsForQuote(quoteId: string): Promise<Proposal[]> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('quote_id', quoteId)
      .order('version', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch proposals: ${error.message}`);
    }

    return data || [];
  },

  // Update proposal
  async updateProposal(proposalId: string, updates: Partial<Proposal>): Promise<Proposal> {
    const { data, error } = await supabase
      .from('proposals')
      .update(updates)
      .eq('id', proposalId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update proposal: ${error.message}`);
    }

    return data;
  },

  // Generate PDF for proposal
  async generatePDF(proposalId: string, htmlContent: string): Promise<{ pdfUrl: string; proposal: Proposal }> {
    const { data, error } = await supabase.functions.invoke('generate-proposal-pdf', {
      body: {
        proposalId,
        htmlContent
      }
    });

    if (error) {
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Unknown error generating PDF');
    }

    return {
      pdfUrl: data.pdfUrl,
      proposal: data.proposal
    };
  },

  // Send proposal for signature
  async sendForSignature(proposalId: string): Promise<string> {
    const { data, error } = await supabase.rpc('send_proposal_for_signature', {
      p_proposal_id: proposalId
    });

    if (error) {
      throw new Error(`Failed to send proposal for signature: ${error.message}`);
    }

    return data; // Returns the token
  },

  // Get signature link by token
  async getSignatureLinkByToken(token: string): Promise<{
    signatureLink: SignatureLink;
    proposal: Proposal;
    quote: any;
  } | null> {
    const { data, error } = await supabase
      .from('signature_links')
      .select(`
        *,
        proposal:proposals (
          *,
          quote:quotes (
            *,
            supplier:profiles!quotes_supplier_id_fkey (
              full_name,
              email
            )
          )
        )
      `)
      .eq('token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch signature link: ${error.message}`);
    }

    return {
      signatureLink: data,
      proposal: data.proposal,
      quote: data.proposal.quote
    };
  },

  // Sign proposal via service
  async signProposal(token: string, action: 'accept' | 'reject', clientInfo?: { name?: string; email?: string }): Promise<any> {
    const { data, error } = await supabase.functions.invoke('proposal-signature', {
      body: {
        token,
        action,
        clientName: clientInfo?.name,
        clientEmail: clientInfo?.email
      }
    });

    if (error) {
      throw new Error(`Failed to sign proposal: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Unknown error signing proposal');
    }

    return data;
  },

  // Get proposal events
  async getProposalEvents(proposalId: string): Promise<ProposalEvent[]> {
    const { data, error } = await supabase
      .from('proposal_events')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch proposal events: ${error.message}`);
    }

    return data || [];
  },

  // Get proposals for supplier
  async getProposalsForSupplier(supplierId: string): Promise<Array<Proposal & { quote: any }>> {
    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        quote:quotes (
          id,
          title,
          client_id,
          total_amount,
          created_at,
          client:profiles!quotes_client_id_fkey (
            full_name,
            email
          )
        )
      `)
      .eq('quote.supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch supplier proposals: ${error.message}`);
    }

    return data || [];
  }
};