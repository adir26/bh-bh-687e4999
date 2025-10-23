-- Add featured suppliers section to homepage
INSERT INTO homepage_sections (
  id,
  type,
  title_he,
  description_he,
  priority,
  is_active,
  platform,
  status,
  key
) VALUES (
  gen_random_uuid(),
  'supplier_cards',
  'ספקים מובילים',
  'ספקים נבחרים המופיעים בדף הבית',
  50,
  true,
  'web',
  'published',
  'featured_suppliers'
);