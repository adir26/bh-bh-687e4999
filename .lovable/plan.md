

## תוכנית: לוח שנה אינטראקטיבי לספקים עם קביעת פגישות

### מצב קיים
- **DB**: טבלאות `availability` (יום + שעות לספק) ו-`bookings` (הזמנות פגישות) כבר קיימות עם RLS
- **`MeetingService`** — שירות מלא: `getAvailableTimeSlots`, `createBooking`, `updateBookingStatus`, `cancelBooking`, conflict checks
- **`ScheduleMeetingModal`** — מודאל קביעת פגישה ללקוחות (מוצג בפרופיל ספק ציבורי)
- **`MyMeetings`** — דף צפייה בפגישות לשני הצדדים, עם אישור/דחיה/ביטול
- **`MeetingAvailabilityEditor`** — עורך זמינות בסיסי (ימים + שעות) אבל שומר ב-JSON על companies, לא בטבלת `availability`
- **Edge function `send-meeting-notifications`** — שולח מיילים על בקשות/אישורים/דחיות/ביטולים + .ics
- **חסר**: דף ניהול לוח שנה ייעודי לספק, תזכורות אוטומטיות לפני פגישה, ניהול זמינות מ-DB

### מה ייבנה

#### 1. דף חדש: `src/pages/supplier/Calendar.tsx`
לוח שנה אינטראקטיבי לספק עם:
- **תצוגת חודש** (Calendar component) עם סימון ימים שיש בהם פגישות
- **תצוגת יום** — רשימת פגישות + סלוטים פנויים ליום הנבחר
- **ניהול זמינות** — טאב/סקשן לעריכת שעות עבודה לפי יום (CRUD ישירות על טבלת `availability`)
- **פעולות מהירות** — אישור/דחיה/ביטול פגישות ישירות מהלוח
- Badge על ימים עם פגישות ממתינות

#### 2. Hook חדש: `src/hooks/useSupplierCalendar.ts`
- `useSupplierAvailability(supplierId)` — שליפה ועדכון של זמינות מ-DB
- `useSupplierBookings(supplierId, month)` — פגישות לפי חודש
- `useSaveAvailability()` — mutation לשמירת שעות זמינות
- Realtime subscription על `bookings` לעדכון חי

#### 3. Edge Function: `send-meeting-reminders`
- מופעל ע"י pg_cron כל שעה
- שולח תזכורות מייל 24 שעות ו-1 שעה לפני פגישה
- מוסיף עמודת `reminder_sent_at` לטבלת `bookings` למניעת כפילויות

#### 4. מיגרציה
- הוספת `reminder_sent_at TIMESTAMPTZ` ל-`bookings`
- הוספת `meeting_type TEXT DEFAULT 'in_person'` ו-`location TEXT` ל-`bookings`

#### 5. עדכונים
- **`App.tsx`** — נתיב `/supplier/calendar`
- **`Dashboard.tsx`** — quick action "לוח פגישות"
- **`ScheduleMeetingModal`** — הוספת שדות meeting_type + location

### קבצים חדשים
- `src/pages/supplier/Calendar.tsx`
- `src/hooks/useSupplierCalendar.ts`
- `supabase/functions/send-meeting-reminders/index.ts`
- מיגרציית SQL

### קבצים לעדכון
- `src/App.tsx`
- `src/pages/supplier/Dashboard.tsx`

