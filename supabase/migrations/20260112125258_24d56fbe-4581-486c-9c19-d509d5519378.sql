-- Create quick_selection_icons table for dynamic icon management
CREATE TABLE public.quick_selection_icons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_key TEXT NOT NULL UNIQUE,
  title_he TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  link_type TEXT DEFAULT 'category',
  link_target TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quick_selection_icons ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (icons are visible to everyone)
CREATE POLICY "Quick selection icons are viewable by everyone" 
ON public.quick_selection_icons 
FOR SELECT 
USING (is_active = true);

-- Create policy for admin write access
CREATE POLICY "Admins can manage quick selection icons" 
ON public.quick_selection_icons 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quick_selection_icons_updated_at
BEFORE UPDATE ON public.quick_selection_icons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial icons data
INSERT INTO public.quick_selection_icons (icon_key, title_he, image_url, display_order, link_type, link_target) VALUES
  ('kitchens', 'מטבחים', '/assets/quick-selection/kitchens.png', 1, 'category', 'kitchens'),
  ('app_exclusive', 'בלעדי לאפליקציה', '/assets/quick-selection/app-exclusive.png', 2, 'page', 'app-exclusive'),
  ('new_suppliers', 'ספקים חדשים', '/assets/quick-selection/new-suppliers.png', 3, 'page', 'new-suppliers'),
  ('hot_now', 'חם עכשיו', '/assets/quick-selection/hot-now.png', 4, 'page', 'hot-now'),
  ('top_leaders', 'המובילים', '/assets/quick-selection/top-leaders.png', 5, 'page', 'top-leaders');

-- Create index for better query performance
CREATE INDEX idx_quick_selection_icons_active_order ON public.quick_selection_icons (is_active, display_order);