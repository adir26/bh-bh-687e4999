-- Create onboarding analytics table for admin reporting
CREATE TABLE public.onboarding_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_role TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_duration_seconds INTEGER,
  onboarding_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all onboarding analytics" 
ON public.onboarding_analytics 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "System can insert onboarding analytics" 
ON public.onboarding_analytics 
FOR INSERT 
WITH CHECK (true);

-- Add index for performance
CREATE INDEX idx_onboarding_analytics_user_id ON public.onboarding_analytics(user_id);
CREATE INDEX idx_onboarding_analytics_completed_at ON public.onboarding_analytics(completed_at);
CREATE INDEX idx_onboarding_analytics_user_role ON public.onboarding_analytics(user_role);