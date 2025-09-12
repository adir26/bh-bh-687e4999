-- Create order_events table for timeline tracking
CREATE TABLE IF NOT EXISTS public.order_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'status_change', 'message', 'file_upload', 'payment'
    actor_id UUID REFERENCES auth.users(id),
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_files table for attachments
CREATE TABLE IF NOT EXISTS public.order_files (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_messages table for chat
CREATE TABLE IF NOT EXISTS public.order_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    message_text TEXT,
    file_url TEXT,
    file_name TEXT,
    read_by JSONB DEFAULT '{}', -- {user_id: timestamp}
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment_links table
CREATE TABLE IF NOT EXISTS public.payment_links (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'stripe', -- 'stripe', 'paypal', etc
    external_id TEXT, -- provider's payment intent/session id
    payment_url TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
    expires_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_events
CREATE POLICY "Order events follow order permissions"
ON public.order_events
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_events.order_id
        AND (o.client_id = auth.uid() OR o.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_events.order_id
        AND (o.client_id = auth.uid() OR o.supplier_id = auth.uid())
    )
);

-- RLS policies for order_files
CREATE POLICY "Order files follow order permissions"
ON public.order_files
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_files.order_id
        AND (o.client_id = auth.uid() OR o.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
)
WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_files.order_id
        AND (o.client_id = auth.uid() OR o.supplier_id = auth.uid())
    )
);

-- RLS policies for order_messages
CREATE POLICY "Order messages follow order permissions"
ON public.order_messages
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_messages.order_id
        AND (o.client_id = auth.uid() OR o.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
)
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_messages.order_id
        AND (o.client_id = auth.uid() OR o.supplier_id = auth.uid())
    )
);

-- RLS policies for payment_links
CREATE POLICY "Payment links follow order permissions"
ON public.payment_links
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = payment_links.order_id
        AND (o.client_id = auth.uid() OR o.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
);

-- Create storage bucket for order files
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-files', 'order-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for order files
CREATE POLICY "Order participants can upload files"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'order-files' AND
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id::text = (storage.foldername(name))[1]
        AND (o.client_id = auth.uid() OR o.supplier_id = auth.uid())
    )
);

CREATE POLICY "Order participants can view files"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'order-files' AND
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id::text = (storage.foldername(name))[1]
        AND (o.client_id = auth.uid() OR o.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
);

-- Add updated_at triggers
CREATE TRIGGER update_order_messages_updated_at
    BEFORE UPDATE ON public.order_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_links_updated_at
    BEFORE UPDATE ON public.payment_links
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create order event
CREATE OR REPLACE FUNCTION public.create_order_event(
    p_order_id UUID,
    p_event_type TEXT,
    p_meta JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event_id UUID;
BEGIN
    -- Check if user can access this order
    IF NOT EXISTS (
        SELECT 1 FROM public.orders
        WHERE id = p_order_id
        AND (client_id = auth.uid() OR supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    ) THEN
        RAISE EXCEPTION 'Access denied to order';
    END IF;

    INSERT INTO public.order_events (order_id, event_type, actor_id, meta)
    VALUES (p_order_id, p_event_type, auth.uid(), p_meta)
    RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_order_messages_read(
    p_order_id UUID,
    p_message_ids UUID[] DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user can access this order
    IF NOT EXISTS (
        SELECT 1 FROM public.orders
        WHERE id = p_order_id
        AND (client_id = auth.uid() OR supplier_id = auth.uid())
    ) THEN
        RAISE EXCEPTION 'Access denied to order';
    END IF;

    -- Mark messages as read
    IF p_message_ids IS NULL THEN
        -- Mark all unread messages as read
        UPDATE public.order_messages
        SET read_by = COALESCE(read_by, '{}') || jsonb_build_object(auth.uid()::text, now())
        WHERE order_id = p_order_id
        AND NOT (read_by ? auth.uid()::text);
    ELSE
        -- Mark specific messages as read
        UPDATE public.order_messages
        SET read_by = COALESCE(read_by, '{}') || jsonb_build_object(auth.uid()::text, now())
        WHERE order_id = p_order_id
        AND id = ANY(p_message_ids)
        AND NOT (read_by ? auth.uid()::text);
    END IF;
END;
$$;