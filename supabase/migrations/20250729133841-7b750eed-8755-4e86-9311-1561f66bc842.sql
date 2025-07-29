-- Create homepage_content table for managing dynamic content blocks
CREATE TABLE public.homepage_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_name TEXT NOT NULL, -- e.g., 'featured_suppliers', 'trending_now', 'top_categories', 'marketing_banner_1'
  content_data JSONB NOT NULL DEFAULT '{}', -- Flexible data structure for each block type
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;

-- Create policies for admin-only access
CREATE POLICY "Admins can manage homepage content" 
ON public.homepage_content 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create policy for public viewing of enabled content
CREATE POLICY "Anyone can view enabled content" 
ON public.homepage_content 
FOR SELECT 
USING (is_enabled = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));

-- Create updated_at trigger
CREATE TRIGGER update_homepage_content_updated_at
BEFORE UPDATE ON public.homepage_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content blocks
INSERT INTO public.homepage_content (block_name, content_data, display_order) VALUES
('featured_suppliers', '{"supplier_ids": [], "title": "Featured Suppliers", "description": "Hand-picked suppliers for your projects"}', 1),
('trending_now', '{"supplier_ids": [], "title": "Trending Now", "description": "Popular suppliers this week"}', 2),
('top_categories', '{"category_ids": [], "title": "Top Categories", "description": "Browse by popular categories"}', 3),
('new_suppliers', '{"mode": "auto", "count": 6, "title": "New Suppliers", "description": "Recently joined suppliers"}', 4),
('marketing_banner_1', '{"image_url": "", "link_url": "", "title": "", "description": "", "button_text": "Learn More"}', 5),
('carousel_slides', '{"slides": [], "auto_play": true, "interval": 5000}', 6);