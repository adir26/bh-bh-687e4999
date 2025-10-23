-- ============================================
-- Homepage Content RLS Verification
-- ============================================

-- ודא RLS מופעל
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_items ENABLE ROW LEVEL SECURITY;

-- מחק מדיניות ישנה לפני יצירה חדשה
DROP POLICY IF EXISTS homepage_public_read ON public.homepage_sections;
DROP POLICY IF EXISTS homepage_admin_all ON public.homepage_sections;
DROP POLICY IF EXISTS homepage_items_public_read ON public.homepage_items;
DROP POLICY IF EXISTS homepage_items_admin_all ON public.homepage_items;

-- מדיניות קריאה ציבורית לsections (רק פעיל ופורסם)
CREATE POLICY homepage_public_read ON public.homepage_sections
FOR SELECT
USING (is_active = TRUE AND status = 'published');

-- מדיניות אדמין - CRUD מלא לsections
CREATE POLICY homepage_admin_all ON public.homepage_sections
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- מדיניות קריאה ציבורית לitems (רק אם הsection פעיל ופורסם)
CREATE POLICY homepage_items_public_read ON public.homepage_items
FOR SELECT
USING (
  is_active = TRUE
  AND EXISTS (
    SELECT 1 FROM public.homepage_sections s
    WHERE s.id = section_id 
      AND s.is_active = TRUE 
      AND s.status = 'published'
  )
);

-- מדיניות אדמין - CRUD מלא לitems
CREATE POLICY homepage_items_admin_all ON public.homepage_items
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);