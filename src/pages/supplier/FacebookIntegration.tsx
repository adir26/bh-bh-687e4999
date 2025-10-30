import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SupplierHeader } from '@/components/SupplierHeader';
import { SupplierBottomNavigation } from '@/components/SupplierBottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSupplierWebhook } from '@/hooks/useSupplierWebhook';
import { Copy, Facebook, AlertCircle, RefreshCw, CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function FacebookIntegration() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Get supplier's company
  const { data: company } = useQuery({
    queryKey: ['supplier-company', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', user!.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { webhook, isLoading, regenerateToken, toggleActive } = useSupplierWebhook(company?.id || null);

  const handleCopy = () => {
    if (webhook?.webhook_url) {
      navigator.clipboard.writeText(webhook.webhook_url);
      setCopied(true);
      toast.success('הקישור הועתק ללוח');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SupplierHeader title="אינטגרציות" />
        <main className="container max-w-7xl mx-auto px-4 py-6 pb-24">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
        <SupplierBottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SupplierHeader title="אינטגרציות" />
      <main className="container max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">אינטגרציות</h1>
          <p className="text-muted-foreground">חבר מקורות לידים חיצוניים למערכת</p>
        </div>

        {/* Facebook Integration Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <Facebook className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl">חיבור לידים מפייסבוק</CardTitle>
                <CardDescription>Facebook Lead Ads Integration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Label htmlFor="webhook-active" className="text-base font-medium cursor-pointer">
                  {webhook?.is_active ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 inline ml-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-muted-foreground inline ml-2" />
                  )}
                  סטטוס חיבור
                </Label>
                <span className="text-sm text-muted-foreground">
                  {webhook?.is_active ? 'פעיל' : 'לא פעיל'}
                </span>
              </div>
              <Switch
                id="webhook-active"
                checked={webhook?.is_active || false}
                onCheckedChange={(checked) => toggleActive.mutate(checked)}
                disabled={toggleActive.isPending}
              />
            </div>

            {/* Webhook URL */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">הקישור האישי שלך</Label>
              <p className="text-sm text-muted-foreground">
                זהו הקישור הייחודי שלך למערכת. רק אתה יכול להשתמש בו – <strong>אל תשתף אותו עם ספקים אחרים.</strong>
              </p>
              <div className="flex gap-2">
                <Input
                  value={webhook?.webhook_url || ''}
                  readOnly
                  className="font-mono text-sm"
                  dir="ltr"
                />
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Warning */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                אל תשנה או תשתף קישור זה. הוא ייחודי עבורך בלבד ומזהה אותך במערכת.
                {webhook?.last_used_at && (
                  <span className="block mt-2 text-xs">
                    שימוש אחרון: {new Date(webhook.last_used_at).toLocaleString('he-IL')}
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {/* Regenerate Token */}
            <div className="flex justify-end">
              <Button
                onClick={() => regenerateToken.mutate()}
                variant="outline"
                disabled={regenerateToken.isPending}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${regenerateToken.isPending ? 'animate-spin' : ''}`} />
                צור טוקן חדש
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Accordion */}
        <Card>
          <CardHeader>
            <CardTitle>מדריך חיבור למערכת Make (Integromat)</CardTitle>
            <CardDescription>
              המערכת מאפשרת לך לחבר את טפסי הלידים שלך מפייסבוק כך שכל ליד חדש שנכנס בפייסבוק
              ייכנס אוטומטית ל-CRM שלך ב-Bonimpo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="setup">
                <AccordionTrigger className="text-lg font-semibold">
                  ⚙️ איך לחבר את זה ב-Make?
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-base leading-relaxed">
                  <ol className="list-decimal list-inside space-y-3 mr-4">
                    <li>
                      היכנס ל-
                      <a href="https://www.make.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mx-1">
                        make.com
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      (אפשר גם חשבון חינמי)
                    </li>
                    <li>לחץ על <strong>Create a new scenario</strong></li>
                    <li>בחר Trigger: <strong>Facebook Lead Ads → New Lead</strong></li>
                    <li>הוסף Action: <strong>HTTP → Make a request</strong></li>
                    <li>הדבק את הקישור האישי שלך (מעל) בשדה <strong>URL</strong></li>
                    <li>בחר בשיטת השליחה <strong>POST</strong></li>
                    <li>
                      הוסף את השדות הבאים ב-Body:
                      <ul className="list-disc list-inside mr-6 mt-2 space-y-1">
                        <li><code className="bg-muted px-2 py-1 rounded">full_name</code></li>
                        <li><code className="bg-muted px-2 py-1 rounded">email</code></li>
                        <li><code className="bg-muted px-2 py-1 rounded">phone</code></li>
                        <li><code className="bg-muted px-2 py-1 rounded">campaign_name</code></li>
                        <li><code className="bg-muted px-2 py-1 rounded">adset_name</code></li>
                        <li><code className="bg-muted px-2 py-1 rounded">ad_name</code></li>
                        <li><code className="bg-muted px-2 py-1 rounded">form_id</code></li>
                      </ul>
                    </li>
                    <li>לחץ על <strong>Run once</strong> לבדיקה</li>
                    <li>ברגע שליד נכנס בפייסבוק – הוא יופיע אוטומטית אצלך ב-Bonimpo CRM</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="example">
                <AccordionTrigger className="text-lg font-semibold">
                  🧩 דוגמה לשימוש
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed">
                  <p>
                    אם יש לך קמפיין בשם "מטבחים מעוצבים – מבצע קיץ",
                    כל ליד חדש מטופס הפייסבוק שלך יגיע ישירות למערכת Bonimpo עם כל הפרטים – ללא הקלדה ידנית.
                  </p>
                  <p className="mt-4 p-4 bg-muted rounded-lg">
                    <strong>טיפ:</strong> אם יש לך כמה קמפיינים שמשתמשים באותו טופס לידים, מספיק להגדיר את זה פעם אחת בלבד.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="benefits">
                <AccordionTrigger className="text-lg font-semibold">
                  ✅ יתרונות החיבור
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-2 text-base mr-4">
                    <li>חיסכון בזמן – אין צורך להוריד לידים ידנית</li>
                    <li>מענה מהיר ללקוחות חדשים</li>
                    <li>ניהול מרוכז של כל הקמפיינים והמקורות</li>
                    <li>ניתור ובקרה בזמן אמת</li>
                    <li>כל הנתונים נשמרים באופן אוטומטי: מקור, קמפיין, סט אד ומודעה</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="troubleshooting">
                <AccordionTrigger className="text-lg font-semibold">
                  🛠️ פתרון בעיות
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-base">
                  <p>במידה ויש בעיה, בדוק את הדברים הבאים:</p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>ודא שהטופס בפייסבוק "פעיל"</li>
                    <li>ודא שבחרת את אותו עמוד פייסבוק של הקמפיין</li>
                    <li>הפעל "Run once" שוב לבדיקה</li>
                    <li>בדוק שהחיבור למערכת פעיל (מתג בראש העמוד)</li>
                    <li>אם לא נפתר – פנה לתמיכה עם צילום מסך של הסנריו שלך</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="important">
                <AccordionTrigger className="text-lg font-semibold">
                  ⚠️ חשוב לדעת
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-2 text-base mr-4">
                    <li>לכל ספק יש <strong>קישור אישי ייחודי</strong> – אין לשתף אותו</li>
                    <li>אם פתחת טופס לידים חדש בפייסבוק, חזור על שלבי ההגדרה בלבד</li>
                    <li>הקישור שלך מאובטח ומזהה אותך לפי מזהה ספק + Token אישי</li>
                    <li>אין אפשרות של ערבוב לידים בין ספקים</li>
                    <li>כל בקשה נרשמת למעקב ואבטחה</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>
      <SupplierBottomNavigation />
    </div>
  );
}
