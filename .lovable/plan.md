

## תוכנית: מערכת קופונים והנחות

### סקירה

בניית מערכת קופונים מלאה — טבלת DB, ניהול בצד הספק, תצוגה בדף הבית ובפרופיל הספק.

### 1. מיגרציה — טבלת `coupons`

```sql
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  coupon_code TEXT,                    -- NULL = deal without code
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping', 'gift')),
  discount_value NUMERIC DEFAULT 0,
  image_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,                -- NULL = no expiry
  max_uses INTEGER,                   -- NULL = unlimited
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,  -- show on homepage
  min_order_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Suppliers manage their own coupons
CREATE POLICY "Suppliers manage own coupons"
  ON public.coupons FOR ALL TO authenticated
  USING (supplier_id = auth.uid())
  WITH CHECK (supplier_id = auth.uid());

-- Everyone can view active coupons
CREATE POLICY "Public can view active coupons"
  ON public.coupons FOR SELECT TO anon, authenticated
  USING (is_active = true AND starts_at <= now() AND (ends_at IS NULL OR ends_at >= now()));
```

### 2. דף ניהול קופונים לספק — `src/pages/supplier/Coupons.tsx`

- טבלה/רשימה של כל הקופונים של הספק (פעילים, לא פעילים, פגי תוקף)
- כפתור "צור קופון חדש" → Dialog/Sheet עם טופס:
  - כותרת, תיאור, סוג הנחה (אחוז/סכום קבוע/משלוח חינם/מתנה), ערך הנחה
  - קוד קופון (אופציונלי — אם ריק זה דיל ללא קוד)
  - תאריך התחלה/סיום, מגבלת שימושים, סכום הזמנה מינימלי
  - תמונה, checkbox "הצג בדף הבית"
- עריכה ומחיקה של קופונים קיימים
- תגיות סטטוס: פעיל / פג תוקף / לא פעיל

### 3. Hook — `src/hooks/useCoupons.ts`

- `useSupplierCoupons(supplierId)` — כל הקופונים של ספק ספציפי
- `useActiveCoupons()` — קופונים פעילים + featured לדף הבית
- `useCreateCoupon()`, `useUpdateCoupon()`, `useDeleteCoupon()` — mutations

### 4. תצוגה בדף הבית — סקשן חדש ב-`UnifiedHomepage.tsx`

- סקשן "מבצעים והנחות" עם כרטיסי קופון (תמונה, כותרת, ספק, סוג הנחה, תאריך תפוגה)
- קומפוננטת `CouponCard` עם badge הנחה, countdown לתפוגה, כפתור "העתק קוד"
- סקשן מופיע רק כשיש קופונים פעילים עם `is_featured = true`

### 5. דף כל המבצעים — `src/pages/Deals.tsx`

- רשימת כל הקופונים הפעילים עם פילטר לפי קטגוריה/ספק
- נתיב `/deals` ב-App.tsx

### 6. ניווט

- הוספת "קופונים" לתפריט הספק (quick actions בדשבורד + sidebar)
- נתיב `/supplier/coupons` ב-App.tsx
- קישור "כל המבצעים" בדף הבית

### קבצים חדשים
- `supabase/migrations/...coupons.sql`
- `src/pages/supplier/Coupons.tsx`
- `src/pages/Deals.tsx`
- `src/hooks/useCoupons.ts`
- `src/components/CouponCard.tsx`
- `src/components/CouponsSection.tsx`

### קבצים לעדכון
- `src/App.tsx` — נתיבים חדשים
- `src/pages/UnifiedHomepage.tsx` — סקשן מבצעים
- `src/pages/supplier/Dashboard.tsx` — quick action לקופונים

