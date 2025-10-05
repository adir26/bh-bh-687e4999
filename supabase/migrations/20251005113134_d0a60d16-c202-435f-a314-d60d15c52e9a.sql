-- שלב 1.1: תרגום 8 הקטגוריות הקיימות לעברית
-- Kitchen
UPDATE categories SET 
  name = 'מטבחים',
  description = 'שיפוץ ועיצוב מטבחים מקצועי',
  position = 1
WHERE slug = 'kitchen';

-- Bathroom
UPDATE categories SET 
  name = 'אמבטיות',
  description = 'שיפוץ ועיצוב חדרי אמבטיה',
  position = 2
WHERE slug = 'bathroom';

-- Furniture
UPDATE categories SET 
  name = 'ריהוט',
  description = 'ריהוט ועיצוב פנים לבית',
  position = 3
WHERE slug = 'furniture';

-- Air Conditioning
UPDATE categories SET 
  name = 'מיזוג אוויר',
  description = 'התקנה ותחזוקה של מערכות מיזוג',
  position = 4
WHERE slug = 'air-conditioning';

-- Renovation
UPDATE categories SET 
  name = 'שיפוצים',
  description = 'קבלני שיפוצים ושיפוץ דירות',
  position = 5
WHERE slug = 'renovation';

-- Moving Services
UPDATE categories SET 
  name = 'הובלות',
  description = 'שירותי הובלה מקצועיים',
  position = 6
WHERE slug = 'moving-services';

-- Home Loans
UPDATE categories SET 
  name = 'הלוואות',
  description = 'הלוואות לשיפוץ ורכישת דירה',
  position = 7
WHERE slug = 'home-loans';

-- Mortgage Advisors (כבר בעברית)
UPDATE categories SET 
  position = 8
WHERE slug = 'mortgage-advisors';

-- שלב 1.2: הוספת 62 קטגוריות חדשות (positions 9-70)
INSERT INTO categories (name, slug, description, position, is_active, is_public) VALUES
('אדריכלים', 'architects', 'אדריכלים ומתכנני בתים מומלצים', 9, true, true),
('חברות בנייה', 'construction-companies', 'חברות בנייה וקבלנות מקצועיות', 10, true, true),
('קבלני בניה קלה', 'light-construction', 'מומחי בניה קלה ומודולרית', 11, true, true),
('קבלני שלד', 'structural-contractors', 'קבלני בטון ושלד למבנים', 12, true, true),
('קבלני שיפוצים', 'renovation-contractors', 'שירותי שיפוץ ושיפור דירות', 13, true, true),
('שיפוצניקים', 'home-renovators', 'מומחי שיפוצים ושיפור בית כללי', 14, true, true),
('מפקחי בנייה', 'construction-supervisors', 'פיקוח על בנייה ובקרת איכות', 15, true, true),
('קבלני גבס', 'drywall-contractors', 'אנשי גבס, טיח ותקרות', 16, true, true),
('קבלני איטום', 'sealing-contractors', 'פתרונות איטום ובידוד למבנים', 17, true, true),
('קבלני אלומיניום', 'aluminum-contractors', 'עבודות אלומיניום לדלתות, חלונות וחזיתות', 18, true, true),
('קבלני שיש', 'marble-contractors', 'התקנת שיש, גרניט ואבן', 19, true, true),
('קבלני מצבות', 'gravestone-contractors', 'מומחי זיכרון ומצבות', 20, true, true),
('קונסטרוקטורים', 'structural-engineers', 'הנדסת מבנים וייעוץ בטיחות', 21, true, true),
('אמבטיונרים', 'bathroom-installers', 'מומחי שיפוץ והתקנת חדרי אמבטיה', 22, true, true),
('אנשי עבודות בגובה', 'high-access-technicians', 'אנשי מקצוע מוסמכים לעבודות בגובה', 23, true, true),
('אנשי ייבוש תת רצפתי', 'underfloor-drying', 'טיפול בנזקי מים ולחות תת רצפתית', 24, true, true),
('מנסרי וקודחי בטון', 'concrete-cutters', 'מומחי חיתוך וקידוח בטון', 25, true, true),
('מצפי דלתות', 'door-coaters', 'מומחי ציפוי ושיפוץ דלתות', 26, true, true),
('מתקיני מקלחונים', 'shower-installers', 'התקנה והחלפת מקלחונים', 27, true, true),
('מתקיני מערכות חימום', 'heating-installers', 'התקנה ותחזוקה של מערכות חימום', 28, true, true),
('מתקיני מערכות כיבוי אש', 'fire-system-installers', 'מערכות הגנה וספרינקלרים', 29, true, true),
('חברות שיקום מבנים', 'building-rehabilitation', 'שיקום וחיזוק מבנים מסוכנים', 30, true, true),
('חברות ניהול מבנים', 'property-management', 'ניהול ואחזקת מבנים', 31, true, true),
('חברות בדק בית', 'inspection-companies', 'בדיקות בית ובקרת איכות', 32, true, true),
('מודדים מוסמכים', 'surveyors', 'מודדי קרקע ובנייה מורשים', 33, true, true),
('הנדימנים', 'handymen', 'אנשי תחזוקה ותיקונים כלליים', 34, true, true),
('אנשי תריסים', 'shutter-technicians', 'תיקון תריסים וחלונות גלילה', 35, true, true),
('נגרים למטבחים', 'kitchen-carpenters', 'נגרות מטבח ועבודות עץ', 36, true, true),
('נגרי פרגולות', 'pergola-carpenters', 'מומחי נגרות לפרגולות ודקים', 37, true, true),
('מסגרים', 'metal-workers', 'ריתוך, עבודות מתכת וברזל', 38, true, true),
('מתקיני דלתות', 'door-installers', 'התקנה והחלפת דלתות', 39, true, true),
('מתקיני סוככים', 'awning-installers', 'התקנת סוככים ומבני הצללה', 40, true, true),
('מתקיני פרגולות אלומיניום', 'aluminum-pergolas', 'עיצוב והקמת פרגולות אלומיניום', 41, true, true),
('מתקיני פרקטים', 'parquet-installers', 'התקנת פרקט ולמינציה', 42, true, true),
('מדביקי טפטים', 'wallpaper-installers', 'טפטים וחיפויי קיר', 43, true, true),
('צבעים', 'painters', 'צביעה ועיצוב קירות פנים', 44, true, true),
('צבעי חוץ', 'exterior-painters', 'צביעה וגימור חיצוני', 45, true, true),
('רפדים', 'upholsterers', 'ריפוד רהיטים ובדים מקצועי', 46, true, true),
('חברות ניקוי ספות', 'sofa-cleaning', 'ניקוי ספות וריפוד מקצועי', 47, true, true),
('חברות ניקיון', 'cleaning-polish', 'ניקיון מגורים ומשרדים', 48, true, true),
('מרחיקי יונים', 'pest-bird-control', 'פתרונות להרחקת יונים ומזיקים', 49, true, true),
('מפני דירות', 'apartment-clearers', 'פינוי דירות והוצאת גרוטאות', 50, true, true),
('בוני אקווריומים', 'aquarium-builders', 'עיצוב ובנייה של אקווריומים ובריכות נוי', 51, true, true),
('מקימי בריכות שחייה', 'pool-builders', 'בניית ושיפוץ בריכות שחייה', 52, true, true),
('מפעילי בריכות', 'pool-operators', 'תחזוקה וניקוי בריכות מקצועי', 53, true, true),
('גננים', 'gardeners', 'גינון, דשא ותחזוקת נוף', 54, true, true),
('גוזמי עצים', 'tree-pruners', 'גיזום וטיפול בעצים', 55, true, true),
('גגנים', 'roofers', 'גגות ואיטום מקצועי', 56, true, true),
('עורכי דין מקרקעין', 'real-estate-lawyers', 'מומחי דיני נדל"ן ומקרקעין', 57, true, true),
('טכנאי מזגנים', 'ac-technicians', 'התקנה ותיקון מזגנים', 58, true, true),
('טכנאי מקררים', 'refrigerator-technicians', 'מומחי תיקון מקררים ומקפיאים', 59, true, true),
('טכנאי מוצרי חשמל', 'appliance-technicians', 'תחזוקה ותיקון מכשירי חשמל', 60, true, true),
('טכנאי דודי שמש', 'solar-water-technicians', 'תיקון והתקנת מערכות דוד שמש', 61, true, true),
('טכנאי טלוויזיה', 'tv-technicians', 'תיקון וכוונון טלוויזיות', 62, true, true),
('טכנאי גז', 'gas-technicians', 'התקנה ותחזוקת גז מוסמכת', 63, true, true),
('טכנאי אינטרקום', 'intercom-technicians', 'התקנת מערכות אינטרקום ובקרת גישה', 64, true, true),
('טכנאי אזעקות', 'security-technicians', 'מומחי אזעקה, מצלמות ומערכות אבטחה', 65, true, true),
('טכנאי רשתות', 'network-technicians', 'התקנת תשתיות רשת ו-WiFi', 66, true, true),
('טכנאי מחשבים', 'computer-technicians', 'תיקון מחשבים ותחזוקת IT', 67, true, true),
('טכנאי שערים חשמליים', 'electric-gate-technicians', 'התקנה ותיקון שערים חשמליים', 68, true, true),
('טכנאי מערכות סולאריות', 'solar-system-technicians', 'התקנת פאנלים סולאריים ואנרגיה מתחדשת', 69, true, true);