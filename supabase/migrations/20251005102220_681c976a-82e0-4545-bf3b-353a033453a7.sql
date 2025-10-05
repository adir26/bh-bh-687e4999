-- Create mortgage-advisors category
INSERT INTO public.categories (name, slug, description, is_public, is_active, position)
VALUES (
  'יועצי משכנתאות וביטוח',
  'mortgage-advisors',
  'יועצי משכנתאות וביטוח מקצועיים לליווי בתהליך המשכנתא',
  true,
  true,
  10
)
ON CONFLICT (slug) DO NOTHING;

-- Create demo suppliers for mortgage-advisors
INSERT INTO public.companies (owner_id, name, slug, description, status, is_public, rating, review_count, city, area, phone, email, featured)
VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'משכן פלוס - ייעוץ משכנתאות',
    'mashkan-plus',
    'משרד מוביל לייעוץ משכנתאות עם ניסיון של מעל 15 שנה. מתמחים במשכנתאות למשקיעים ודירה ראשונה',
    'approved',
    true,
    4.9,
    127,
    'תל אביב',
    'מרכז',
    '03-1234567',
    'info@mashkanplus.co.il',
    true
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'בית מימון - יועצי משכנתאות',
    'beit-mimun',
    'ייעוץ מקצועי למשכנתאות וביטוחים. מגוון פתרונות מימון מותאמים אישית',
    'approved',
    true,
    4.7,
    89,
    'ירושלים',
    'ירושלים',
    '02-9876543',
    'contact@beit-mimun.co.il',
    false
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'מימון חכם - משכנתאות',
    'mimun-hacham',
    'משרד ייעוץ משכנתאות בוטיק. שירות אישי ומקצועי עם התאמה מלאה לצרכי הלקוח',
    'approved',
    true,
    4.8,
    64,
    'חיפה',
    'חיפה והצפון',
    '04-5555555',
    'info@mimunhacham.com',
    false
  )
ON CONFLICT (slug) DO NOTHING;

-- Create demo suppliers for moving-services
INSERT INTO public.companies (owner_id, name, slug, description, status, is_public, rating, review_count, city, area, phone, email, featured)
VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'הובלות אקספרס',
    'express-moving',
    'שירותי הובלות מקצועיים ומהירים. צוות מנוסה, ציוד מתקדם ואריזה מקצועית',
    'approved',
    true,
    4.6,
    156,
    'פתח תקווה',
    'מרכז',
    '03-7777777',
    'info@expressmoving.co.il',
    true
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'הובלות הבית שלי',
    'my-home-moving',
    'הובלות דירות ומשרדים. שירות אמין ומקצועי עם ביטוח מלא',
    'approved',
    true,
    4.5,
    98,
    'רמת גן',
    'מרכז',
    '03-8888888',
    'contact@myhomemoving.com',
    false
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'הובלות פרימיום',
    'premium-moving',
    'שירותי הובלות יוקרתיים. מתמחים בפריטים עדינים ויקרי ערך',
    'approved',
    true,
    4.9,
    142,
    'הרצליה',
    'מרכז',
    '09-9999999',
    'info@premiummoving.co.il',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Create demo suppliers for home-loans
INSERT INTO public.companies (owner_id, name, slug, description, status, is_public, rating, review_count, city, area, phone, email, featured)
VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'הלוואות מהירות בע"מ',
    'fast-loans',
    'פתרונות הלוואות גמישים ומהירים. אישור תוך 24 שעות',
    'approved',
    true,
    4.4,
    76,
    'תל אביב',
    'מרכז',
    '03-6666666',
    'info@fastloans.co.il',
    false
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'אשראי פלוס',
    'credit-plus',
    'משרד מוביל למתן הלוואות פרטיות ועסקיות. תנאים מעולים ושירות מקצועי',
    'approved',
    true,
    4.7,
    113,
    'רעננה',
    'מרכז',
    '09-1111111',
    'contact@creditplus.co.il',
    true
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'בנק הבית - הלוואות',
    'bank-habait',
    'פתרונות מימון מגוונים להלוואות דירה, שיפוצים והשקעות',
    'approved',
    true,
    4.6,
    91,
    'ראשון לציון',
    'מרכז',
    '03-2222222',
    'info@bankhabait.com',
    false
  )
ON CONFLICT (slug) DO NOTHING;

-- Link mortgage-advisors suppliers to category
INSERT INTO public.company_categories (company_id, category_id)
SELECT c.id, cat.id
FROM public.companies c
CROSS JOIN public.categories cat
WHERE c.slug IN ('mashkan-plus', 'beit-mimun', 'mimun-hacham')
  AND cat.slug = 'mortgage-advisors'
ON CONFLICT DO NOTHING;

-- Link moving-services suppliers to category
INSERT INTO public.company_categories (company_id, category_id)
SELECT c.id, cat.id
FROM public.companies c
CROSS JOIN public.categories cat
WHERE c.slug IN ('express-moving', 'my-home-moving', 'premium-moving')
  AND cat.slug = 'moving-services'
ON CONFLICT DO NOTHING;

-- Link home-loans suppliers to category
INSERT INTO public.company_categories (company_id, category_id)
SELECT c.id, cat.id
FROM public.companies c
CROSS JOIN public.categories cat
WHERE c.slug IN ('fast-loans', 'credit-plus', 'bank-habait')
  AND cat.slug = 'home-loans'
ON CONFLICT DO NOTHING;