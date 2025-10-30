-- Create supplier_webhooks table
CREATE TABLE IF NOT EXISTS public.supplier_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  secret_token TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (supplier_id)
);

-- Add indexes for performance
CREATE INDEX idx_supplier_webhooks_supplier_id ON public.supplier_webhooks(supplier_id);
CREATE INDEX idx_supplier_webhooks_secret_token ON public.supplier_webhooks(secret_token);

-- Enable RLS
ALTER TABLE public.supplier_webhooks ENABLE ROW LEVEL SECURITY;

-- Policy: Suppliers can only view their own webhooks
CREATE POLICY "Suppliers can view own webhooks"
ON public.supplier_webhooks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = supplier_webhooks.supplier_id
    AND companies.owner_id = auth.uid()
  )
);

-- Policy: Suppliers can insert their own webhooks
CREATE POLICY "Suppliers can insert own webhooks"
ON public.supplier_webhooks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = supplier_webhooks.supplier_id
    AND companies.owner_id = auth.uid()
  )
);

-- Policy: Suppliers can update their own webhooks
CREATE POLICY "Suppliers can update own webhooks"
ON public.supplier_webhooks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = supplier_webhooks.supplier_id
    AND companies.owner_id = auth.uid()
  )
);

-- Add webhook_logs table for tracking
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  webhook_id UUID REFERENCES public.supplier_webhooks(id) ON DELETE SET NULL,
  request_ip TEXT,
  request_payload JSONB,
  response_status INTEGER,
  response_message TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for webhook logs
CREATE INDEX idx_webhook_logs_supplier_id ON public.webhook_logs(supplier_id);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);

-- Enable RLS for webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Suppliers can view their own webhook logs
CREATE POLICY "Suppliers can view own webhook logs"
ON public.webhook_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = webhook_logs.supplier_id
    AND companies.owner_id = auth.uid()
  )
);

-- Function to generate secure webhook token
CREATE OR REPLACE FUNCTION public.generate_webhook_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Function to get or create supplier webhook
CREATE OR REPLACE FUNCTION public.get_or_create_supplier_webhook(p_supplier_id UUID)
RETURNS TABLE (
  id UUID,
  supplier_id UUID,
  secret_token TEXT,
  webhook_url TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token TEXT;
  v_webhook_url TEXT;
  v_result RECORD;
BEGIN
  -- Check if webhook already exists
  SELECT * INTO v_result
  FROM public.supplier_webhooks
  WHERE supplier_webhooks.supplier_id = p_supplier_id;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      v_result.id,
      v_result.supplier_id,
      v_result.secret_token,
      v_result.webhook_url,
      v_result.is_active,
      v_result.created_at;
  ELSE
    -- Generate new token and URL
    v_token := public.generate_webhook_token();
    v_webhook_url := format(
      'https://yislkmhnitznvbxfpcxd.supabase.co/functions/v1/facebook-webhook/%s?token=%s',
      p_supplier_id,
      v_token
    );
    
    -- Insert new webhook
    RETURN QUERY
    INSERT INTO public.supplier_webhooks (supplier_id, secret_token, webhook_url)
    VALUES (p_supplier_id, v_token, v_webhook_url)
    RETURNING 
      supplier_webhooks.id,
      supplier_webhooks.supplier_id,
      supplier_webhooks.secret_token,
      supplier_webhooks.webhook_url,
      supplier_webhooks.is_active,
      supplier_webhooks.created_at;
  END IF;
END;
$$;