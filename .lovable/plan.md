

## תוכנית: איחוד שני הדשבורדים לדשבורד אחד מקצועי

### מצב נוכחי

יש שני דשבורדים נפרדים:

1. **`src/pages/supplier/Dashboard.tsx`** (הפעיל - נתיב `/supplier/dashboard`) - דשבורד "בית" עם:
   - ברכת שלום אישית + ProfileCompletionCard
   - 4 כרטיסי סטטיסטיקה בסיסיים (לידים, הזמנות, דירוג, הכנסות)
   - פעולות מהירות (11 כפתורים)
   - גרף צפיות בפרופיל (מיני-בר)
   - "דורש תשומת לב" (לידים, הזמנות, ביקורות)
   - RecentActivityFeed
   - המלצות לשיפור

2. **`src/pages/SupplierDashboard.tsx`** (לא מחובר לנתיב) - דשבורד אנליטי עם:
   - פילטרים לפי טווח תאריכים + רמת פירוט
   - 12 KPI cards מפורטים (DashboardKPIs)
   - 4 גרפים מתקדמים עם Recharts (DashboardCharts)
   - 3 טבלאות: לידים, הזמנות, ביקורות (DashboardTables)
   - התראות SLA + הודעות לא נקראו
   - Real-time subscriptions

### גישה

מיזוג הכל ל-`src/pages/supplier/Dashboard.tsx` בלבד - שילוב הפיצ'רים הטובים משני הדשבורדים בתצוגת Tab:

### מבנה הדשבורד המאוחד

```text
┌─────────────────────────────────────────┐
│  Header: שלום + RefreshCw              │
├─────────────────────────────────────────┤
│  Alerts (SLA + unread messages)         │
├─────────────────────────────────────────┤
│  ProfileCompletionCard (if incomplete)  │
├─────────────────────────────────────────┤
│  Tabs: [סקירה כללית] [אנליטיקה]        │
│                                         │
│  Tab 1 - סקירה כללית:                   │
│   • 4 stat cards + needs attention      │
│   • Quick actions grid                  │
│   • Profile views mini chart            │
│   • Recent activity feed                │
│   • Suggestions                         │
│                                         │
│  Tab 2 - אנליטיקה:                      │
│   • Date range filters + granularity    │
│   • 12 KPI cards                        │
│   • 4 Recharts graphs                   │
│   • 3 data tables (leads/orders/reviews)│
└─────────────────────────────────────────┘
```

### שינויים טכניים

1. **`src/pages/supplier/Dashboard.tsx`** - שכתוב מלא:
   - הוספת Tabs (סקירה כללית / אנליטיקה)
   - שילוב כל ה-hooks מ-`useSupplierDashboard` (metrics, timeseries, leads, orders, reviews, realtime)
   - שילוב ה-hooks הקיימים (stats, needsAttention, suggestions, profileViews)
   - הוספת התראות SLA והודעות לא נקראו מהדשבורד האנליטי
   - שילוב DashboardFilters, DashboardKPIs, DashboardCharts, DashboardTables בטאב אנליטיקה

2. **`src/App.tsx`** - ניקוי:
   - הסרת `import SupplierDashboard from "./pages/SupplierDashboard"`
   - הנתיב `/supplier/dashboard` ממשיך להצביע על `SupplierDashboardNew`

3. **`src/pages/SupplierDashboard.tsx`** - מחיקה (לא בשימוש בשום נתיב)

4. **`src/components/supplier/SupplierDashboardMemo.tsx`** - עדכון ה-import אם נדרש

5. **שמירה על כל הקומפוננטות הקיימות**: DashboardFilters, DashboardKPIs, DashboardCharts, DashboardTables, ProfileCompletionCard, RecentActivityFeed - ללא שינוי

