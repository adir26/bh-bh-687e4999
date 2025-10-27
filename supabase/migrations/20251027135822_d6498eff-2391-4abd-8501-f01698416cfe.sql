-- Allow admins to view all companies, regardless of public status or approval
CREATE POLICY "admins_view_all_companies"
ON public.companies
FOR SELECT
TO authenticated
USING (
  public.get_user_role(auth.uid()) = 'admin'::user_role
);