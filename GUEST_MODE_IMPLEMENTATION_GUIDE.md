# Guest Mode Implementation Guide - Complete

## סקירה כללית

מדריך זה מתאר את המימוש המלא של Guest Mode באפליקציה, בהתאם להנחיות App Store 5.1.1.

---

## ארכיטקטורה טכנית

### Core Components

#### 1. Hook: `useGuestMode`
```typescript
// מיקום: src/hooks/useGuestMode.ts
export interface GuestModeState {
  isGuestMode: boolean;      // האם במצב אורח
  isAppMode: boolean;        // iOS app vs web browser  
  showLoginModal: boolean;   // הצגת modal התחברות
  setShowLoginModal: (show: boolean) => void;
  attemptedAction: string | null;     // פעולה שנוסתה
  setAttemptedAction: (action: string | null) => void;
}
```

**מאגד נתונים:**
- Query parameters: `?guest=1&app=ios`
- Session storage: `guestMode`, `appMode`
- מצב modal התחברות

#### 2. Component: `PublicRouteWrapper`
```typescript
// מיקום: src/App.tsx
const PublicRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isGuestMode } = useGuestMode();
  const { user } = useAuth();
  
  // במצב אורח - רינדור ישיר
  if (isGuestMode) {
    return <>{children}</>;
  }
  
  // משתמש מחובר - הגנה רגילה + onboarding
  if (user) {
    return (
      <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
        <OnboardingGuard>
          {children}
        </OnboardingGuard>
      </ProtectedRoute>
    );
  }
  
  // ברירת מחדל
  return <>{children}</>;
};
```

#### 3. Component: `GuestModeIndicator`
```typescript
// מיקום: src/components/GuestModeIndicator.tsx
// באנר עליון דיסקרטי המציג:
// "אתה גולש כאורח. התחבר כדי לפתוח שמירה, צ'אט והזמנות"
```

---

## רשימת Public Routes

### דפי ליבה (28 נתיבים ציבוריים)

```typescript
// דף הבית ונחיתה
"/" - HomeWrapper (guest -> PublicHomepage)
"/welcome" - Welcome page

// חיפוש וגלישה  
"/search" - PublicRouteWrapper<Search>
"/top-suppliers" - PublicRouteWrapper<TopSuppliers>
"/new-suppliers" - PublicRouteWrapper<NewSuppliers>
"/hot-now" - PublicRouteWrapper<HotNow>
"/local-deals" - PublicRouteWrapper<LocalDeals>
"/popular-now" - PublicRouteWrapper<PopularNow>
"/category/:category/suppliers" - PublicRouteWrapper<CategorySuppliers>

// ספקים ומוצרים
"/supplier/:id" - PublicRouteWrapper<SupplierProfile>
"/supplier/:id/products" - PublicRouteWrapper<SupplierProductsView>
"/supplier/:id/reviews" - PublicRouteWrapper<SupplierReviews>
"/s/:slug" - PublicSupplierProfile (public URLs)
"/s/:slug/p/:productId" - PublicProductView

// השראה
"/inspiration" - PublicRouteWrapper<Inspiration>
"/inspiration/photo/:id" - PhotoDetail

// תמיכה ומידע
"/support" - PublicRouteWrapper<Support>
"/faq" - PublicRouteWrapper<FAQ>
"/privacy-policy" - PrivacyPolicy
"/terms" - Terms
"/accessibility" - Accessibility

// פיצ'רים מיוחדים
"/app-exclusive" - AppExclusive

// Authentication
"/auth" - Auth
"/auth/callback" - AuthCallback
"/registration" - Registration
"/forgot-password" - ForgotPassword
```

---

## Gated Actions (פעולות מוגבלות)

### רשימת פעולות הדורשות התחברות:

#### שמירה ואיסוף:
- ❤️ **Favorites**: כפתור לב בכרטיסי ספקים
- 🔖 **Save to Ideabook**: שמירת תמונות השראה  
- 📸 **Photo Upload**: העלאת תמונות למערכת

#### תקשורת:
- 💬 **Start Chat**: התחלת שיחה עם ספק
- 📧 **Send Message**: שליחת הודעה
- 📋 **Request Quote**: בקשת הצעת מחיר
- 📞 **Schedule Meeting**: תיאום פגישה

#### עסקות:
- 🛒 **Add to Cart**: הוספה לעגלה
- 💳 **Checkout**: מעבר לתשלום
- 📦 **Place Order**: ביצוע הזמנה

#### תוכן:
- ⭐ **Write Review**: כתיבת ביקורת
- 🔢 **Rate Supplier**: דירוג ספק
- 💭 **Post Comment**: פרסום תגובה

#### ניהול אישי:
- 👤 **View Profile**: צפייה בפרופיל אישי
- 📱 **View Orders**: צפייה בהזמנות
- 💰 **View Quotes**: צפייה בהצעות מחיר
- 🔔 **Notifications**: התראות
- ⚙️ **Settings**: הגדרות

---

## Flow של פעולה מוגבלת

### דוגמה: שמירת ספק למועדפים

```typescript
// 1. אורח לוחץ על כפתור הלב
const handleFavoriteClick = (supplierId: string) => {
  const { isGuestMode, setShowLoginModal, setAttemptedAction } = useGuestMode();
  
  if (isGuestMode) {
    // שמירת הפעולה שנוסתה
    setAttemptedAction(`save_supplier_${supplierId}`);
    // הצגת modal התחברות
    setShowLoginModal(true);
    return;
  }
  
  // משתמש מחובר - ביצוע הפעולה
  toggleFavorite(supplierId);
};

// 2. Modal מוצג עם הודעה ברורה
<LoginModal 
  isOpen={showLoginModal}
  onClose={() => setShowLoginModal(false)}
  attemptedAction={attemptedAction}
  // Modal text: "התחבר כדי לשמור ספקים, לשוחח ולהזמין"
/>

// 3. לאחר התחברות מוצלחת - חזרה להקשר ומימוש הפעולה
useEffect(() => {
  if (user && attemptedAction) {
    const [action, resourceId] = attemptedAction.split('_');
    if (action === 'save' && resourceId) {
      // מימוש הפעולה שנוסתה
      toggleFavorite(resourceId);
    }
    setAttemptedAction(null);
  }
}, [user, attemptedAction]);
```

---

## Guest State Management

### Session Storage Keys:
```typescript
"guestMode": "true" | null      // מצב אורח פעיל
"appMode": "ios" | null         // האם iOS app
"hasSeenWelcome": "true" | null // האם ראה welcome screen
"guestBannerDismissed": "true" | null // האם סגר באנר אורח
```

### Helper Functions:
```typescript
// בדיקה אם במצב אורח
export const isInGuestMode = (): boolean => {
  return sessionStorage.getItem('guestMode') === 'true';
};

// ניקוי מצב אורח
export const clearGuestMode = (): void => {
  sessionStorage.removeItem('guestMode');
  sessionStorage.removeItem('appMode');
};

// ניקוי מלא כולל welcome
export const clearWelcomeState = (): void => {
  sessionStorage.removeItem('hasSeenWelcome');
  sessionStorage.removeItem('guestMode');
  sessionStorage.removeItem('appMode');
  sessionStorage.removeItem('guestBannerDismissed');
};

// יצירת query parameters למצב אורח
export const getGuestModeParams = (): string => {
  const isGuest = sessionStorage.getItem('guestMode') === 'true';
  const isApp = sessionStorage.getItem('appMode') === 'ios';
  
  if (!isGuest) return '';
  
  const params = new URLSearchParams();
  params.set('guest', '1');
  if (isApp) {
    params.set('app', 'ios');
  }
  
  return `?${params.toString()}`;
};
```

---

## Server-Side Enforcement

### Supabase RLS Policies

כל הטבלות מוגנות על ידי Row Level Security:

```sql
-- דוגמה: טבלת favorites
CREATE POLICY "Users can manage their own favorites" 
ON favorites 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- דוגמה: טבלת orders  
CREATE POLICY "Users can view orders they're involved in"
ON orders
FOR SELECT
USING (
  auth.uid() = client_id OR 
  auth.uid() = supplier_id OR 
  get_user_role(auth.uid()) = 'admin'
);
```

### Frontend API Guards

```typescript
// כל קריאת API בודקת authentication
const apiCall = async (endpoint: string, data: any) => {
  const { user } = useAuth();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return supabase.from(endpoint).insert(data);
};
```

---

## Testing & QA

### בדיקות שנדרשות:

#### 1. Public Access
```bash
# בדיקת גישה לכל דף ציבורי במצב אורח
curl -I https://app.com/search?guest=1
curl -I https://app.com/supplier/123?guest=1
curl -I https://app.com/inspiration?guest=1
# Expected: 200 OK, תוכן מלא
```

#### 2. Gated Actions
```javascript
// בדיקת פעולה מוגבלת במצב אורח
cy.visit('/supplier/123?guest=1');
cy.get('[data-testid="favorite-button"]').click();
cy.get('[data-testid="login-modal"]').should('be.visible');
cy.get('[data-testid="login-modal"]').should('contain', 'התחבר כדי לשמור');
```

#### 3. Deep Links
```javascript
// בדיקת deep links
cy.visit('/favorites?guest=1');
cy.get('[data-testid="login-modal"]').should('be.visible');

cy.visit('/supplier/123?guest=1'); 
cy.get('[data-testid="supplier-profile"]').should('be.visible');
```

#### 4. Post-Auth Flow
```javascript
// בדיקת זרימה לאחר התחברות
cy.visit('/supplier/123?guest=1');
cy.get('[data-testid="favorite-button"]').click();
// Login modal appears
cy.get('[data-testid="login-button"]').click();
// After successful login
cy.url().should('include', '/supplier/123');
cy.get('[data-testid="favorite-button"]').should('have.attr', 'data-favorited', 'true');
```

---

## Performance Considerations

### Optimization טכניקות:

1. **Lazy Loading**: דפים ציבוריים נטענים בעצלות
2. **Caching**: תוכן ציבורי נשמר ב-cache
3. **Bundle Splitting**: קוד guest mode נפרד מקוד משתמשים מחוברים
4. **Service Worker**: תוכן ציבורי זמין offline

### Metrics למעקב:

- **Guest Conversion Rate**: % אורחים שמתחברים
- **Guest Engagement**: זמן גלישה, עמודים לביקור
- **Drop-off Points**: היכן אורחים עוזבים
- **Action Attempt Rate**: כמה פעולות מוגבלות מנוסות

---

## Deployment Notes

### Environment Variables:
```bash
# לא נדרש - Guest mode עובד ב-client-side
# מבוסס על query parameters ו-session storage
```

### Build Configuration:
```typescript
// vite.config.ts - אין שינויים מיוחדים נדרשים
// Guest mode עובד עם הקונפיגורציה הקיימת
```

---

**מעודכן לאחרונה: [תאריך נוכחי]**
**סטטוס: Production Ready ✅**