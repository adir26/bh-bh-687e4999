import { PageHeader } from "@/components/ui/page-header";
import { siteSettings } from "@/config/siteSettings";

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="הצהרת נגישות | Accessibility Statement" 
        variant="minimal"
        showBackButton={true}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl" dir="rtl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">הצהרת נגישות</h1>
          <p className="text-sm text-muted-foreground">עודכן לאחרונה: {siteSettings.lastUpdated.accessibility}</p>
        </header>
        
        <div className="prose prose-slate max-w-none text-right space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">כללי</h2>
            <p className="text-foreground leading-relaxed">
              ב־{siteSettings.company.name} אנו מחויבים להנגשת השירותים והמידע לכלל הציבור, לרבות אנשים עם מוגבלות. האתר פותח בהתאם להנחיות WCAG 2.1 ברמת AA, ובהלימה לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות) ולתקן הישראלי ת״י 5568.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">מה בוצע באתר</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground">
              <li>מבנה סמנטי תקין (כותרות, רשימות, טבלאות).</li>
              <li>אפשרות תפעול מלאה מהמקלדת; פוקוס גלוי וברור.</li>
              <li>יחס ניגודיות מספק בין טקסט לרקע.</li>
              <li>טקסט חלופי לתמונות בעלות משמעות.</li>
              <li>קישורי "דלג לתוכן".</li>
              <li>התאמה לתצוגה בנייד/טאבלט (רספונסיבי).</li>
              <li>תמיכה בקוראי מסך נפוצים (NVDA / JAWS) ובדפדפנים מודרניים.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">תאימות טכנית</h2>
            <p className="text-foreground leading-relaxed">
              האתר נתמך בדפדפנים מודרניים (Chrome, Edge, Firefox, Safari) במכשירי Desktop ונייד. ייתכנו פערים בגרסאות ישנות במיוחד.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">מסמכים וקבצים</h2>
            <p className="text-foreground leading-relaxed">
              אנו שואפים להנגיש גם קבצי PDF/מסמכים. אם נתקלתם בקובץ שאינו נגיש, נשמח לספק חלופה נגישה.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">תוכן שאינו נגיש (במידה וקיים)</h2>
            <p className="text-foreground leading-relaxed">
              ייתכן שחלק מהרכיבים עדיין בתהליך הנגשה. אנו פועלים להסרת פערים אלו.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">יצירת קשר בנושאי נגישות</h2>
            <p className="text-foreground leading-relaxed mb-4">
              אם מצאתם ליקוי נגישות או שיש לכם בקשה/הצעה לשיפור—נשמח לשמע:
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-foreground">
                <strong>איש קשר לנגישות:</strong> {siteSettings.company.contactPerson}
              </p>
              <p className="text-foreground">
                <strong>דוא״ל:</strong> 
                <a href={`mailto:${siteSettings.company.email}`} className="text-primary hover:underline mr-2">
                  {siteSettings.company.email}
                </a>
              </p>
              <p className="text-foreground">
                <strong>טלפון/וואטסאפ:</strong> {siteSettings.company.phone}
              </p>
              <p className="text-foreground">
                <strong>כתובת:</strong> {siteSettings.company.address}
              </p>
            </div>
            <p className="text-foreground leading-relaxed mt-4">
              נטפל בפנייתכם בהקדם, ונחזור אליכם תוך 5 ימי עבודה.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}