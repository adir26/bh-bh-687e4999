-- Create RLS policy for suppliers to delete their leads
CREATE POLICY "Suppliers can delete their leads"
ON public.leads
FOR DELETE
USING (
  (auth.uid() = supplier_id OR auth.uid() = assigned_to)
  AND (
    get_user_role(auth.uid()) = 'supplier'::user_role 
    OR has_role(auth.uid(), 'supplier'::app_role)
  )
);