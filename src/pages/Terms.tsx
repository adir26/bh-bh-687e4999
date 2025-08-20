import { PageHeader } from "@/components/ui/page-header";
import { siteSettings } from "@/config/siteSettings";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="תנאי שימוש | Terms of Use" 
        variant="minimal"
        showBackButton={true}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl" dir="rtl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">תנאי שימוש</h1>
          <p className="text-sm text-muted-foreground">עודכן לאחרונה: {siteSettings.lastUpdated.terms}</p>
        </header>
        
        <div className="prose prose-slate max-w-none text-right space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">הסכמה לתנאים</h2>
            <p className="text-foreground leading-relaxed">
              השימוש באתר {siteSettings.company.name} (״האתר״) כפוף לתנאים אלו. כניסה לאתר או הרשמה לשירותים מהווה את הסכמתכם המלאה לתנאים.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">זכאות לשימוש</h2>
            <p className="text-foreground leading-relaxed">
              מיועד לבני 18+ או באישור הורה/אפוטרופוס. פרטי הרשמה חייבים להיות נכונים ומעודכנים.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">חשבון משתמש ואבטחה</h2>
            <p className="text-foreground leading-relaxed">
              אחריות לשמירת סודיות פרטי הגישה ודיווח על שימוש לא מורשה.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">שימוש מותר ואסור</h2>
            <p className="text-foreground leading-relaxed mb-3">
              שימוש בהתאם לחוק. אסור:
            </p>
            <ul className="list-disc list-inside space-y-1 text-foreground">
              <li>להפר זכויות</li>
              <li>לפגוע בפרטיות/אבטחה</li>
              <li>לבצע סריקות אוטומטיות או הנדסה לאחור</li>
              <li>לפרסם ספאם</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">תוכן ושירותים</h2>
            <p className="text-foreground leading-relaxed">
              ייתכנו שינויים/אי־דיוקים/השבתות. אין התחייבות לזמינות מלאה.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">קניין רוחני</h2>
            <p className="text-foreground leading-relaxed">
              הזכויות באתר ובתכנים שייכות ל־{siteSettings.company.name}/צד ג'. אין להעתיק/להפיץ/לפרסם ללא רשות בכתב.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">פרטיות</h2>
            <p className="text-foreground leading-relaxed">
              השימוש במידע אישי כפוף למדיניות הפרטיות בקישור: 
              <a href="/privacy-policy" className="text-primary hover:underline mr-1 ml-1">
                /privacy
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">הצהרת אחריות</h2>
            <p className="text-foreground leading-relaxed">
              השירות ניתן as-is. אין אחריות לנזקים עקיפים/תוצאתיים.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">שיפוי</h2>
            <p className="text-foreground leading-relaxed">
              התחייבות לשפות את {siteSettings.company.name} על נזקים עקב הפרת תנאים או שימוש בלתי ראוי.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">שינויים</h2>
            <p className="text-foreground leading-relaxed">
              אנו רשאים לעדכן שירות/תנאים; המשך שימוש מהווה הסכמה.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">סיום שימוש</h2>
            <p className="text-foreground leading-relaxed">
              אפשרות להשעיה/סיום גישה לפי שיקול דעתנו.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">דין ושיפוט</h2>
            <p className="text-foreground leading-relaxed">
              דיני ישראל; סמכות שיפוט בבתי המשפט במחוז {siteSettings.legal.jurisdiction}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">יצירת קשר</h2>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-foreground">
                <strong>דוא״ל:</strong> 
                <a href={`mailto:${siteSettings.company.email}`} className="text-primary hover:underline mr-2">
                  {siteSettings.company.email}
                </a>
              </p>
              <p className="text-foreground">
                <strong>טלפון:</strong> {siteSettings.company.phone}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              הערה: טקסט תבניתי כללי, אינו ייעוץ משפטי. מומלץ ייעוץ עו״ד להתאמות מלאות.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}