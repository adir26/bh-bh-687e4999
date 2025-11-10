-- הוספת policy לקריאה ציבורית של דוחות
-- מאפשר לכל אחד לקרוא דוחות (בקריאה בלבד!)

CREATE POLICY "דוחות ניתנים לצפייה ציבורית"
ON public.inspection_reports
FOR SELECT
TO anon, authenticated
USING (true);

-- הערה: הpolicy מאפשר רק SELECT (קריאה), אין אפשרות לעדכן, למחוק או להוסיף דוחות
