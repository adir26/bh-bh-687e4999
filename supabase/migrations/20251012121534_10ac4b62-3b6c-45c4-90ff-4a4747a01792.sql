-- Step 4: Fix existing companies

-- 4.1: Approve all pending companies from the last 30 days
UPDATE public.companies
SET 
  status = 'approved',
  is_public = true
WHERE status = 'pending'
  AND created_at > now() - interval '30 days';

-- 4.2: Add default "renovation" category to companies without categories
INSERT INTO public.company_categories (company_id, category_id)
SELECT 
  c.id,
  cat.id
FROM public.companies c
CROSS JOIN (
  SELECT id FROM public.categories 
  WHERE slug = 'renovation' OR name LIKE '%שיפוצ%' 
  LIMIT 1
) cat
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.company_categories cc 
  WHERE cc.company_id = c.id
)
  AND c.created_at > now() - interval '30 days'
ON CONFLICT (company_id, category_id) DO NOTHING;