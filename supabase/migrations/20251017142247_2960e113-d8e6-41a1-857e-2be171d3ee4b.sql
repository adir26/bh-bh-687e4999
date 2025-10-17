-- Step 1: Create private storage bucket for quote signatures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quote-signatures',
  'quote-signatures',
  false,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create quote_approvals table FIRST
CREATE TABLE IF NOT EXISTS public.quote_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL,
  share_token TEXT NOT NULL,
  
  -- Client information (validated)
  client_name TEXT NOT NULL,
  client_id_number TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT NOT NULL,
  
  -- Approval data
  approval_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
  rejection_reason TEXT,
  
  -- Signature storage (not base64!)
  signature_storage_path TEXT,
  signature_hash TEXT,
  
  -- Security & audit trail
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(quote_id, client_email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quote_approvals_quote_id ON public.quote_approvals(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_approvals_status ON public.quote_approvals(status);
CREATE INDEX IF NOT EXISTS idx_quote_approvals_created_at ON public.quote_approvals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_approvals_supplier_id ON public.quote_approvals(supplier_id);

-- Step 3: Enable RLS on table
ALTER TABLE public.quote_approvals ENABLE ROW LEVEL SECURITY;

-- RLS: Suppliers can view their approvals
CREATE POLICY "Suppliers can view their quote approvals" 
ON public.quote_approvals
FOR SELECT USING (
  auth.uid() = supplier_id OR 
  get_user_role(auth.uid()) = 'admin'::user_role
);

-- Step 4: Trigger to update quote status and create notification
CREATE OR REPLACE FUNCTION update_quote_from_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Update quote status
  UPDATE public.quotes
  SET 
    status = NEW.status::TEXT,
    responded_at = NEW.approval_date,
    viewed_at = COALESCE(viewed_at, NEW.approval_date),
    updated_at = NOW()
  WHERE id = NEW.quote_id;
  
  -- Create notification for supplier
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data,
    created_at
  ) VALUES (
    NEW.supplier_id,
    'quote_' || NEW.status,
    CASE 
      WHEN NEW.status = 'approved' THEN '🎉 הצעת מחיר אושרה!'
      ELSE '❌ הצעת מחיר נדחתה'
    END,
    'הלקוח ' || NEW.client_name || ' (' || NEW.client_email || ') ' ||
    CASE 
      WHEN NEW.status = 'approved' THEN 'אישר'
      ELSE 'דחה'
    END || ' את הצעת המחיר',
    jsonb_build_object(
      'quote_id', NEW.quote_id,
      'approval_id', NEW.id,
      'client_name', NEW.client_name,
      'client_email', NEW.client_email,
      'status', NEW.status
    ),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_quote_on_approval
  AFTER INSERT ON public.quote_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_from_approval();

-- Step 5: NOW create Storage RLS policy (after table exists)
CREATE POLICY "Suppliers can view their quote signatures"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'quote-signatures' AND
  EXISTS (
    SELECT 1 FROM public.quote_approvals qa
    WHERE (storage.foldername(objects.name))[1] = qa.id::text
      AND (
        qa.supplier_id = auth.uid() OR
        get_user_role(auth.uid()) = 'admin'::user_role
      )
  )
);