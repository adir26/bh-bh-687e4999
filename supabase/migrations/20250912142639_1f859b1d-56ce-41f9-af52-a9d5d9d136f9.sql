-- Create proposals table
CREATE TABLE public.proposals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    html_content TEXT,
    pdf_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(quote_id, version)
);

-- Create proposal_events table for audit trail
CREATE TABLE public.proposal_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create signature_links table for secure token-based signing
CREATE TABLE public.signature_links (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    acted_by UUID REFERENCES auth.users(id),
    action TEXT, -- 'accept' or 'reject'
    acted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proposals
CREATE POLICY "Suppliers can manage their own proposals"
ON public.proposals
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.quotes q 
        WHERE q.id = proposals.quote_id 
        AND q.supplier_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.quotes q 
        WHERE q.id = proposals.quote_id 
        AND q.supplier_id = auth.uid()
    )
);

CREATE POLICY "Clients can view proposals sent to them"
ON public.proposals
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.quotes q 
        WHERE q.id = proposals.quote_id 
        AND q.client_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all proposals"
ON public.proposals
FOR ALL
USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for proposal_events
CREATE POLICY "Proposal events follow proposal permissions"
ON public.proposal_events
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.proposals p
        JOIN public.quotes q ON q.id = p.quote_id
        WHERE p.id = proposal_events.proposal_id
        AND (q.supplier_id = auth.uid() OR q.client_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
)
WITH CHECK (
    auth.uid() = actor_id AND
    EXISTS (
        SELECT 1 FROM public.proposals p
        JOIN public.quotes q ON q.id = p.quote_id
        WHERE p.id = proposal_events.proposal_id
        AND (q.supplier_id = auth.uid() OR q.client_id = auth.uid())
    )
);

-- RLS Policies for signature_links
CREATE POLICY "Suppliers can create signature links for their proposals"
ON public.signature_links
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.proposals p
        JOIN public.quotes q ON q.id = p.quote_id
        WHERE p.id = signature_links.proposal_id
        AND q.supplier_id = auth.uid()
    )
);

CREATE POLICY "Anyone can view signature links (for token validation)"
ON public.signature_links
FOR SELECT
USING (true);

CREATE POLICY "Proposal participants can update signature links"
ON public.signature_links
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.proposals p
        JOIN public.quotes q ON q.id = p.quote_id
        WHERE p.id = signature_links.proposal_id
        AND (q.supplier_id = auth.uid() OR q.client_id = auth.uid())
    )
);

-- Create triggers for updated_at
CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate proposal from quote
CREATE OR REPLACE FUNCTION public.create_proposal_from_quote(
    p_quote_id UUID,
    p_html_content TEXT DEFAULT NULL
) 
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_proposal_id UUID;
    v_supplier_id UUID;
BEGIN
    -- Check if user owns the quote
    SELECT supplier_id INTO v_supplier_id
    FROM quotes
    WHERE id = p_quote_id AND supplier_id = auth.uid();
    
    IF v_supplier_id IS NULL THEN
        RAISE EXCEPTION 'Quote not found or access denied';
    END IF;
    
    -- Insert new proposal
    INSERT INTO proposals (quote_id, html_content)
    VALUES (p_quote_id, p_html_content)
    RETURNING id INTO v_proposal_id;
    
    -- Log creation event
    INSERT INTO proposal_events (proposal_id, event_type, actor_id)
    VALUES (v_proposal_id, 'created', auth.uid());
    
    RETURN v_proposal_id;
END;
$$;

-- Create function to send proposal for signature
CREATE OR REPLACE FUNCTION public.send_proposal_for_signature(
    p_proposal_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_token TEXT;
    v_supplier_id UUID;
BEGIN
    -- Check if user owns the proposal
    SELECT q.supplier_id INTO v_supplier_id
    FROM proposals p
    JOIN quotes q ON q.id = p.quote_id
    WHERE p.id = p_proposal_id AND q.supplier_id = auth.uid();
    
    IF v_supplier_id IS NULL THEN
        RAISE EXCEPTION 'Proposal not found or access denied';
    END IF;
    
    -- Update proposal status
    UPDATE proposals
    SET status = 'sent', updated_at = now()
    WHERE id = p_proposal_id;
    
    -- Create signature link
    INSERT INTO signature_links (proposal_id)
    VALUES (p_proposal_id)
    RETURNING token INTO v_token;
    
    -- Log sent event
    INSERT INTO proposal_events (proposal_id, event_type, actor_id)
    VALUES (p_proposal_id, 'sent', auth.uid());
    
    RETURN v_token;
END;
$$;

-- Create function to sign proposal
CREATE OR REPLACE FUNCTION public.sign_proposal(
    p_token TEXT,
    p_action TEXT,
    p_actor_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_link_record signature_links%ROWTYPE;
    v_proposal_id UUID;
    v_quote_id UUID;
    v_client_id UUID;
BEGIN
    -- Validate action
    IF p_action NOT IN ('accept', 'reject') THEN
        RAISE EXCEPTION 'Invalid action. Must be accept or reject';
    END IF;
    
    -- Get signature link
    SELECT * INTO v_link_record
    FROM signature_links
    WHERE token = p_token
    AND expires_at > now()
    AND acted_at IS NULL;
    
    IF v_link_record.id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired signature link';
    END IF;
    
    v_proposal_id := v_link_record.proposal_id;
    
    -- Get quote and client info
    SELECT p.quote_id, q.client_id INTO v_quote_id, v_client_id
    FROM proposals p
    JOIN quotes q ON q.id = p.quote_id
    WHERE p.id = v_proposal_id;
    
    -- Update signature link
    UPDATE signature_links
    SET action = p_action,
        acted_by = p_actor_id,
        acted_at = now()
    WHERE id = v_link_record.id;
    
    -- Update proposal status
    UPDATE proposals
    SET status = CASE 
        WHEN p_action = 'accept' THEN 'accepted'
        WHEN p_action = 'reject' THEN 'rejected'
    END,
    updated_at = now()
    WHERE id = v_proposal_id;
    
    -- Update quote status if accepted
    IF p_action = 'accept' THEN
        UPDATE quotes
        SET status = 'accepted',
            responded_at = now()
        WHERE id = v_quote_id;
    END IF;
    
    -- Log event
    INSERT INTO proposal_events (proposal_id, event_type, actor_id, metadata)
    VALUES (v_proposal_id, p_action, p_actor_id, jsonb_build_object('via_token', true));
    
    RETURN jsonb_build_object(
        'success', true,
        'proposal_id', v_proposal_id,
        'action', p_action,
        'status', CASE WHEN p_action = 'accept' THEN 'accepted' ELSE 'rejected' END
    );
END;
$$;