-- Create function to track profile views
-- This allows us to record and aggregate profile views for analytics

CREATE OR REPLACE FUNCTION public.track_profile_view(p_company_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or increment view count for today
  INSERT INTO public.company_analytics (
    company_id, 
    metric_name, 
    metric_value, 
    metric_date,
    metadata
  )
  VALUES (
    p_company_id, 
    'profile_view', 
    1, 
    CURRENT_DATE,
    jsonb_build_object('source', 'public_profile')
  )
  ON CONFLICT (company_id, metric_name, metric_date)
  DO UPDATE SET 
    metric_value = company_analytics.metric_value + 1,
    metadata = company_analytics.metadata || jsonb_build_object('last_view', now());
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.track_profile_view(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_profile_view(UUID) TO anon;