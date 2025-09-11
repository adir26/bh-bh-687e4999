import React from "react";
import { ArrowLeft, Save, Bell, BellOff, Settings, Lock, AlertTriangle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useNotificationPermissions } from "@/hooks/useNotificationPermissions";
import type { NotificationSettings } from "@/hooks/useNotificationPermissions";

const NotificationPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSupplier = location.pathname.startsWith('/supplier/');
  
  const {
    permissionState,
    settings,
    isLoading,
    requestPermission,
    updateSetting,
    openSystemSettings,
    hasPermission,
    isBlocked
  } = useNotificationPermissions();

  const handleSave = () => {
    // Settings are automatically saved when changed via updateSetting
    toast({
      title: "ההעדפות נשמרו",
      description: "העדפות ההתראות שלך עודכנו בהצלחה.",
    });
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: "התראות הופעלו",
        description: "כעת תוכל להגדיר את העדפותיך.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">העדפות התראות</h1>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 ml-2" />
            שמור
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-20">
        
        {/* Permission Status */}
        {permissionState === 'default' && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>התראות לא הופעלו</strong>
                  <p className="text-sm mt-1">אשר התראות כדי לקבל עדכונים חשובים על הזמנות ותשלומים.</p>
                </div>
                <Button 
                  onClick={handleEnableNotifications} 
                  disabled={isLoading}
                  className="ml-4"
                >
                  אפשר התראות
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {permissionState === 'denied' && (
          <Alert variant="destructive">
            <BellOff className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>התראות חסומות</strong>
                  <p className="text-sm mt-1">התראות נחסמו בהגדרות הדפדפן. פתח הגדרות כדי לאפשר.</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={openSystemSettings}
                  className="ml-4"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  הגדרות דפדפן
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {hasPermission && (
          <Alert className="border-green-200 bg-green-50">
            <Bell className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>התראות פעילות</strong> - תוכל לקבל עדכונים חשובים.
            </AlertDescription>
          </Alert>
        )}

        {/* System Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  התראות מערכת
                  <Badge variant="secondary" className="text-xs">חיוני</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  התראות אבטחה והודעות מערכת קריטיות
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔔</div>
                <div>
                  <Label className="font-medium">התראות מערכת</Label>
                  <p className="text-xs text-muted-foreground">הודעות אבטחה וגישה</p>
                </div>
                {!hasPermission && (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <Switch
                checked={settings.system}
                onCheckedChange={(enabled) => updateSetting('system', enabled)}
                disabled={!hasPermission}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-500" />
                  התראות עסקיות
                  <Badge variant="secondary" className="text-xs">חשוב</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  הזמנות, הצעות מחיר ושירות לקוחות
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📦</div>
                <div>
                  <Label className="font-medium">עדכוני הזמנות</Label>
                  <p className="text-xs text-muted-foreground">סטטוס, משלוח ותשלומים</p>
                </div>
                {!hasPermission && (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <Switch
                checked={settings.orders}
                onCheckedChange={(enabled) => updateSetting('orders', enabled)}
                disabled={!hasPermission}
              />
            </div>
          </CardContent>
        </Card>

        {/* Marketing Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-500" />
              התראות שיווק
              <Badge variant="outline" className="text-xs">אופציונלי</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              מבצעים, תוכן ועדכוני מוצר (ניתן לבטל בכל עת)
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <Label className="font-medium">מבצעים ועדכונים</Label>
                  <p className="text-xs text-muted-foreground">הנחות, תכונות חדשות וטיפים</p>
                </div>
              </div>
              <Switch
                checked={settings.marketing}
                onCheckedChange={(enabled) => updateSetting('marketing', enabled)}
                disabled={false} // Marketing doesn't require OS permission
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card>
          <CardHeader>
            <CardTitle>הגדרות נוספות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>מצב אל תפריע</Label>
                <p className="text-sm text-muted-foreground">
                  השתק את כל ההתראות (22:00 - 08:00)
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>קבץ התראות דומות</Label>
                <p className="text-sm text-muted-foreground">
                  צרף מספר התראות מאותו סוג
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <div className="space-y-3">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>התראות קריטיות:</strong> התראות אבטחה ומערכת יישלחו תמיד, 
              ללא קשר להגדרות אלה.
            </AlertDescription>
          </Alert>
          
          <div className="text-xs text-muted-foreground p-4 bg-muted rounded-lg">
            <strong>הערות חשובות:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>התראות דחופות דורשות אישור בדפדפן</li>
              <li>הגדרות שיווק נפרדות ואופציונליות לחלוטין</li>
              <li>השינויים נשמרים אוטומטית</li>
              <li>ניתן לשנות הגדרות בכל עת</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;