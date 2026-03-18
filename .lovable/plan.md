

## תוכנית שיפור מקיפה למערכת

לאחר סריקה מעמיקה של הקוד, בסיס הנתונים, וממצאי אבטחה — הנה 4 תחומי שיפור:

---

### 1. אבטחה ותקינות נתונים

**ממצאים קריטיים מסריקת האבטחה:**
- 3 Security Definer Views — צריכות לעבור ל-SECURITY INVOKER או להימחק
- 9+ פונקציות בלי `search_path` מוגדר — פתח להרצת קוד זדוני
- 14 טבלאות ללא RLS מופעל

**שינויים:**

**מיגרציית SQL — תיקוני אבטחה:**
- תיקון כל הפונקציות עם `SET search_path = public`
- הפיכת Views ל-SECURITY INVOKER
- הפעלת RLS על כל הטבלאות שחסר בהן (conversations, bookings, availability ועוד)
- הוספת input validation triggers על טבלאות קריטיות (orders, quotes, messages)

**קוד:**
- הוספת Zod validation ב-`leadsService`, `messagesService` — כל קלט מהלקוח עובר סכמה לפני שליחה ל-DB
- ניקוי `console.log` שמדפיסים מידע רגיש (user IDs, tokens) — שקיים ב-`onboardingService.ts`

---

### 2. ארכיטקטורה ותחזוקתיות

**בעיות שזוהו:**
- `CRM.tsx` = 628 שורות, `Dashboard.tsx` = 424 שורות — קבצים מונוליתיים
- כפילויות: `statusLabel()`, `getStatusBadgeClass()` מוגדרים גם ב-CRM וגם ב-LeadManagement
- הודעות Toast בעברית ובאנגלית מעורבבות ("Lead updated", "Note added" לצד "הייבוא הושלם")

**שינויים:**

**פירוק CRM.tsx:**
- `src/components/crm/KanbanBoard.tsx` — לוח קנבן
- `src/components/crm/LeadListTable.tsx` — תצוגת רשימה
- `src/components/crm/CRMHeader.tsx` — כותרת + פילטרים
- `src/components/crm/LeadCard.tsx` (כבר מוגדר בתחתית הקובץ, צריך הפרדה)

**פירוק Dashboard.tsx:**
- `src/components/supplier/DashboardOverviewTab.tsx`
- `src/components/supplier/DashboardAlertsSection.tsx`
- `src/components/supplier/SmartSuggestions.tsx`

**שיתוף קוד:**
- `src/utils/leadHelpers.ts` — `statusLabel()`, `getStatusBadgeClass()`, `priorityLabel()`, `getSourceLabel()` — מקום מרכזי אחד
- איחוד כל הודעות Toast לעברית

---

### 3. UX ונגישות

**בעיות שזוהו:**
- ה-Kanban board לא באמת ניתן לגרירה (SortableContext בתוך div שהוא לא droppable container)
- הודעות באנגלית ב-CRM: "Lead updated", "Note added", "Failed to update status"
- LeadCard מציג "Call" ו-"Email" באנגלית
- אין מצב loading ייעודי ל-Kanban (כל הדף נחסם)

**שינויים:**
- תיקון Kanban: הוספת `useDroppable` על כל עמודה כדי שגרירה באמת תעבוד
- תרגום כל הודעות ה-Toast וה-UI ב-CRM לעברית
- הוספת Skeleton loading ל-Kanban columns בנפרד מהדף
- שיפור כפתור "Call"/"Email" ל-"התקשר"/"שלח מייל"
- שיפור empty states עם הנחיות ברורות יותר

---

### 4. ביצועים ואופטימיזציה

**בעיות שזוהו:**
- Dashboard מריץ 5+ שאילתות מקבילות בטעינה ראשונית, כולן עם `withTimeout(12_000)` — משמעות: המשתמש מחכה עד 12 שניות
- CRM שולח query חדש בכל שינוי פילטר בלי debounce על search
- `supplierAnalyticsService` מריץ 8 שאילתות נפרדות ל-KPIs — אפשר לאחד ל-RPC אחד

**שינויים:**

**DB — RPC חדש:**
- `get_supplier_kpis(supplier_id, from_date, to_date)` — מחזיר את כל ה-KPIs בשאילתה אחת במקום 8 נפרדות

**קוד:**
- הוספת `useDebouncedValue` על search ב-CRM (כבר קיים ב-admin, צריך להעתיק)
- הורדת timeout ל-8 שניות + retry logic חכם
- `staleTime` אגרסיבי יותר על queries שלא משתנים תכוף (5 דקות → 10 דקות לפרופיל views)
- Lazy loading ל-tab "אנליטיקה" בדשבורד — לא לטעון נתונים עד שהמשתמש לוחץ על הטאב

---

### סיכום קבצים

**קבצים חדשים (7):**
- `src/components/crm/KanbanBoard.tsx`
- `src/components/crm/LeadListTable.tsx`
- `src/components/crm/CRMHeader.tsx`
- `src/components/supplier/DashboardOverviewTab.tsx`
- `src/components/supplier/DashboardAlertsSection.tsx`
- `src/utils/leadHelpers.ts`
- מיגרציית SQL (אבטחה + RPC)

**קבצים לעדכון (4):**
- `src/pages/supplier/CRM.tsx` — שכתוב עם קומפוננטות מפורקות
- `src/pages/supplier/Dashboard.tsx` — פירוק + lazy loading
- `src/pages/supplier/LeadManagement.tsx` — שימוש ב-leadHelpers
- `src/services/supplierAnalyticsService.ts` — שימוש ב-RPC חדש

