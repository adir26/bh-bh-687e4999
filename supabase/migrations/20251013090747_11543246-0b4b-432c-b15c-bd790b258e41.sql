-- Drop existing UPDATE policy (missing role check in WITH CHECK)
DROP POLICY IF EXISTS "Suppliers can update their own products" ON public.products;

-- Create improved UPDATE policy with dual role check
CREATE POLICY "Suppliers can update their own products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  auth.uid() = supplier_id
  AND (
    get_user_role(auth.uid()) = 'supplier'::user_role
    OR has_role(auth.uid(), 'supplier'::app_role)
  )
)
WITH CHECK (
  auth.uid() = supplier_id
  AND (
    get_user_role(auth.uid()) = 'supplier'::user_role
    OR has_role(auth.uid(), 'supplier'::app_role)
  )
);