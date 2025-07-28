import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Bell, 
  Shield, 
  Mail, 
  Database, 
  Globe,
  CreditCard,
  Users
} from "lucide-react";

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    // General Settings
    platformName: "BuildConnect",
    platformDescription: "התחברו לספקים מהימנים לשיפוצי בית",
    maintenanceMode: false,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    
    // Security Settings
    twoFactorAuth: true,
    passwordExpiry: 90,
    sessionTimeout: 30,
    
    // Email Settings
    smtpHost: "smtp.buildconnect.com",
    smtpPort: "587",
    emailFrom: "noreply@buildconnect.com",
    
    // Payment Settings
    commissionRate: 5,
    paymentTimeout: 72,
    autoPayouts: true,
  });

  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "הגדרות נשמרו",
      description: "הגדרות המערכת עודכנו בהצלחה",
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew">
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">הגדרות מערכת</h1>
        <p className="text-muted-foreground text-sm md:text-base">הגדרת הפלטפורמה והעדפות כלליות</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        {/* Mobile Dropdown for tabs */}
        <div className="block md:hidden">
          <select className="w-full p-2 border rounded-md bg-background font-hebrew text-right" dir="rtl">
            <option value="general">כללי</option>
            <option value="notifications">התראות</option>
            <option value="security">אבטחה</option>
            <option value="email">אימייל</option>
            <option value="payments">תשלומים</option>
            <option value="users">משתמשים</option>
          </select>
        </div>

        {/* Desktop Tabs */}
        <TabsList className="hidden md:grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2 font-hebrew">
            <Settings className="h-4 w-4" />
            כללי
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 font-hebrew">
            <Bell className="h-4 w-4" />
            התראות
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 font-hebrew">
            <Shield className="h-4 w-4" />
            אבטחה
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2 font-hebrew">
            <Mail className="h-4 w-4" />
            אימייל
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2 font-hebrew">
            <CreditCard className="h-4 w-4" />
            תשלומים
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2 font-hebrew">
            <Users className="h-4 w-4" />
            משתמשים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right font-hebrew">הגדרות פלטפורמה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-right">
                <Label htmlFor="platform-name" className="font-hebrew">שם הפלטפורמה</Label>
                <Input
                  id="platform-name"
                  value={settings.platformName}
                  onChange={(e) => updateSetting("platformName", e.target.value)}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2 text-right">
                <Label htmlFor="platform-description" className="font-hebrew">תיאור הפלטפורמה</Label>
                <Textarea
                  id="platform-description"
                  value={settings.platformDescription}
                  onChange={(e) => updateSetting("platformDescription", e.target.value)}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="flex items-center justify-between">
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting("maintenanceMode", checked)}
                />
                <div className="space-y-0.5 text-right">
                  <Label className="font-hebrew">מצב תחזוקה</Label>
                  <p className="text-sm text-muted-foreground font-hebrew">
                    השבתת גישה זמנית לפלטפורמה
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right font-hebrew">הגדרות התראות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                />
                <div className="space-y-0.5 text-right">
                  <Label className="font-hebrew">התראות אימייל</Label>
                  <p className="text-sm text-muted-foreground font-hebrew">
                    שליחת התראות באמצעות אימייל
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                />
                <div className="space-y-0.5 text-right">
                  <Label className="font-hebrew">התראות דחיפה</Label>
                  <p className="text-sm text-muted-foreground font-hebrew">
                    שליחת התראות דחיפה בדפדפן
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSetting("smsNotifications", checked)}
                />
                <div className="space-y-0.5 text-right">
                  <Label className="font-hebrew">התראות SMS</Label>
                  <p className="text-sm text-muted-foreground font-hebrew">
                    שליחת התראות באמצעות SMS
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right font-hebrew">הגדרות אבטחה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting("twoFactorAuth", checked)}
                />
                <div className="space-y-0.5 text-right">
                  <Label className="font-hebrew">אימות דו-שלבי</Label>
                  <p className="text-sm text-muted-foreground font-hebrew">
                    חובת אימות דו-שלבי לחשבונות מנהל
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Label htmlFor="password-expiry" className="font-hebrew">תוקף סיסמה (ימים)</Label>
                <Input
                  id="password-expiry"
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={(e) => updateSetting("passwordExpiry", parseInt(e.target.value))}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2 text-right">
                <Label htmlFor="session-timeout" className="font-hebrew">פקיעת זמן ישיבה (דקות)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting("sessionTimeout", parseInt(e.target.value))}
                  className="text-right"
                  dir="rtl"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right font-hebrew">הגדרות אימייל</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-right">
                <Label htmlFor="smtp-host" className="font-hebrew">שרת SMTP</Label>
                <Input
                  id="smtp-host"
                  value={settings.smtpHost}
                  onChange={(e) => updateSetting("smtpHost", e.target.value)}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2 text-right">
                <Label htmlFor="smtp-port" className="font-hebrew">פורט SMTP</Label>
                <Input
                  id="smtp-port"
                  value={settings.smtpPort}
                  onChange={(e) => updateSetting("smtpPort", e.target.value)}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2 text-right">
                <Label htmlFor="email-from" className="font-hebrew">כתובת שולח</Label>
                <Input
                  id="email-from"
                  type="email"
                  value={settings.emailFrom}
                  onChange={(e) => updateSetting("emailFrom", e.target.value)}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <Button variant="outline" className="font-hebrew">בדיקת הגדרות אימייל</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right font-hebrew">הגדרות תשלומים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-right">
                <Label htmlFor="commission-rate" className="font-hebrew">אחוז עמלה (%)</Label>
                <Input
                  id="commission-rate"
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={settings.commissionRate}
                  onChange={(e) => updateSetting("commissionRate", parseFloat(e.target.value))}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2 text-right">
                <Label htmlFor="payment-timeout" className="font-hebrew">זמן פקיעת תשלום (שעות)</Label>
                <Input
                  id="payment-timeout"
                  type="number"
                  value={settings.paymentTimeout}
                  onChange={(e) => updateSetting("paymentTimeout", parseInt(e.target.value))}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="flex items-center justify-between">
                <Switch
                  checked={settings.autoPayouts}
                  onCheckedChange={(checked) => updateSetting("autoPayouts", checked)}
                />
                <div className="space-y-0.5 text-right">
                  <Label className="font-hebrew">תשלומים אוטומטיים</Label>
                  <p className="text-sm text-muted-foreground font-hebrew">
                    עיבוד אוטומטי של תשלומים לספקים
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right font-hebrew">הגדרות ניהול משתמשים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-right">
                <Label className="font-hebrew">רישום משתמשים</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <span className="font-hebrew">רישום פתוח</span>
                    <input type="radio" name="registration" value="open" />
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <span className="font-hebrew">דרוש אישור</span>
                    <input type="radio" name="registration" value="approval" defaultChecked />
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <span className="font-hebrew">רק בהזמנה</span>
                    <input type="radio" name="registration" value="invite" />
                  </label>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Label className="font-hebrew">אימות ספקים</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <span className="font-hebrew">דרוש אימות רישיון עסק</span>
                    <input type="checkbox" defaultChecked />
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <span className="font-hebrew">דרוש אימות ביטוח</span>
                    <input type="checkbox" defaultChecked />
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <span className="font-hebrew">דרוש בדיקת רקע</span>
                    <input type="checkbox" />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center md:justify-end">
        <Button onClick={handleSave} className="w-full md:w-auto font-hebrew">שמירת הגדרות</Button>
      </div>
    </div>
  );
}