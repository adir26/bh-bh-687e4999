import { PageHeader } from "@/components/ui/page-header";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="מדיניות פרטיות | Privacy Policy" 
        variant="minimal"
        showBackButton={true}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Hebrew Section */}
        <section className="mb-12">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">מדיניות פרטיות</h1>
            <p className="text-sm text-muted-foreground">עודכנה לאחרונה: 3 אוקטובר 2025</p>
          </header>
          
          <div className="prose prose-slate max-w-none text-right" dir="rtl">
            <p className="text-foreground leading-relaxed mb-6">
              האפליקציה Bonimpo (להלן: "האפליקציה") מחויבת לשמור על פרטיות המשתמשים. מסמך זה מפרט איזה מידע אנו אוספים, כיצד אנו משתמשים בו, ואילו זכויות עומדות לרשותך.
            </p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">איזה מידע אנו אוספים</h2>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>שם מלא</li>
                <li>כתובת דוא"ל</li>
                <li>מספר טלפון</li>
                <li>כתובת מגורים</li>
                <li>הודעות או פניות שתשלחו דרך המערכת</li>
              </ul>
              <p className="text-foreground mt-4">
                בעתיד האפליקציה עשויה לכלול פרסומות ושירותי אנליטיקה, ובמקרה כזה עשוי להיאסף מידע נוסף על השימוש שלך לצורכי שיווק ושיפור השירות.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">מטרות השימוש במידע</h2>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>מתן שירות ותמיכה ללקוחות</li>
                <li>פתיחת חשבון משתמש וניהולו</li>
                <li>התאמת תכנים והצעות רלוונטיות</li>
                <li>שליחת עדכונים או התראות</li>
                <li>עמידה בדרישות חוק</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">שיתוף מידע</h2>
              <p className="text-foreground mb-4">איננו משתפים מידע אישי עם צד שלישי אלא במקרים הבאים:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>לצורך עמידה בחוק</li>
                <li>לצורך מתן שירות (כגון ספקי תשלום או אחסון נתונים)</li>
                <li>בהסכמת המשתמש</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">שמירת המידע</h2>
              <p className="text-foreground">
                הנתונים נשמרים במערכות מאובטחות, ואנו נוקטים באמצעי אבטחה מתקדמים למניעת גישה לא מורשית.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">זכויות המשתמש</h2>
              <p className="text-foreground mb-4">כל משתמש רשאי:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>לבקש לעיין במידע שנשמר עליו</li>
                <li>לדרוש מחיקת מידע אישי</li>
                <li>לבטל הסכמה לשימוש במידע</li>
              </ul>
              <p className="text-foreground mt-4">
                לבקשות בנושא פרטיות ניתן לפנות אלינו: 
                <a href="mailto:info@bh-bonimpo.com" className="text-primary hover:underline mr-2">
                  info@bh-bonimpo.com
                </a>
              </p>
            </section>
          </div>
        </section>

        {/* Separator */}
        <hr className="border-border my-12" />

        {/* English Section */}
        <section>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: October 3, 2025</p>
          </header>
          
          <div className="prose prose-slate max-w-none" dir="ltr">
            <p className="text-foreground leading-relaxed mb-6">
              The Bonimpo app ("the App") is committed to protecting users' privacy. This document describes what data we collect, how we use it, and your rights regarding your personal information.
            </p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Physical address</li>
                <li>Messages or inquiries submitted through the system</li>
              </ul>
              <p className="text-foreground mt-4">
                In the future, the App may include ads and analytics services, in which case additional usage data may be collected for marketing and service improvement purposes.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">How We Use the Information</h2>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>To provide customer support</li>
                <li>To create and manage user accounts</li>
                <li>To personalize content and offers</li>
                <li>To send updates or notifications</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Sharing Information</h2>
              <p className="text-foreground mb-4">We do not share personal information with third parties except in the following cases:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>To comply with the law</li>
                <li>To provide services (such as payment providers or hosting services)</li>
                <li>With user consent</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Data Retention & Security</h2>
              <p className="text-foreground">
                We retain data in secure systems and apply advanced security measures to prevent unauthorized access.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">User Rights</h2>
              <p className="text-foreground mb-4">Each user has the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Request access to their stored data</li>
                <li>Request deletion of personal data</li>
                <li>Withdraw consent for data usage</li>
              </ul>
              <p className="text-foreground mt-4">
                For privacy-related requests, contact us at:
                <a href="mailto:info@bh-bonimpo.com" className="text-primary hover:underline ml-2">
                  info@bh-bonimpo.com
                </a>
              </p>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}