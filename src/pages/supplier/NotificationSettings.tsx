import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Mail, Smartphone, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const handleToggle = async (key: string, value: boolean, isCategory = false) => {
    try {
      const updates = isCategory 
        ? { categories: { ...preferences?.categories, [key]: value } }
        : { [key]: value };

      await updatePreferences.mutateAsync(updates);
      toast.success('העדפות ההתראות עודכנו בהצלחה');
    } catch (error) {
      toast.error('שגיאה בעדכון העדפות ההתראות');
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background">
        <header className="flex items-center justify-between p-4 border-b bg-white">
          <Button onClick={handleBackClick} variant="ghost" size="sm" className="p-2">
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-center flex-1">הגדרות התראות</h1>
          <div className="w-9" />
        </header>

        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <Button onClick={handleBackClick} variant="ghost" size="sm" className="p-2">
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-center flex-1">הגדרות התראות</h1>
        <div className="w-9" />
      </header>

      {/* Content */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Delivery Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              אמצעי מסירה
            </CardTitle>
            <CardDescription>
              בחר כיצד תרצה לקבל התראות
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="email-notifications" className="font-medium">
                  הודעות אימייל
                </Label>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences?.email_opt_in ?? true}
                onCheckedChange={(checked) => handleToggle('email_opt_in', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="push-notifications" className="font-medium">
                  התראות דחיפה
                </Label>
              </div>
              <Switch
                id="push-notifications"
                checked={preferences?.push_opt_in ?? true}
                onCheckedChange={(checked) => handleToggle('push_opt_in', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>התראות עסקיות</CardTitle>
            <CardDescription>
              עדכונים חשובים על הפעילות העסקית שלך
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="leads-notifications" className="font-medium">
                לידים חדשים ועדכונים
              </Label>
              <Switch
                id="leads-notifications"
                checked={preferences?.categories?.leads ?? true}
                onCheckedChange={(checked) => handleToggle('leads', checked, true)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="quotes-notifications" className="font-medium">
                הצעות מחיר ותגובות
              </Label>
              <Switch
                id="quotes-notifications"
                checked={preferences?.categories?.quotes ?? true}
                onCheckedChange={(checked) => handleToggle('quotes', checked, true)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="orders-notifications" className="font-medium">
                עדכוני הזמנות
              </Label>
              <Switch
                id="orders-notifications"
                checked={preferences?.orders ?? true}
                onCheckedChange={(checked) => handleToggle('orders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reviews-notifications" className="font-medium">
                ביקורות חדשות
              </Label>
              <Switch
                id="reviews-notifications"
                checked={preferences?.categories?.reviews ?? true}
                onCheckedChange={(checked) => handleToggle('reviews', checked, true)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>התראות מערכת</CardTitle>
            <CardDescription>
              עדכונים טכניים ומידע חשוב
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="system-notifications" className="font-medium">
                עדכוני מערכת ואבטחה
              </Label>
              <Switch
                id="system-notifications"
                checked={preferences?.system ?? true}
                onCheckedChange={(checked) => handleToggle('system', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="marketing-notifications" className="font-medium">
                הודעות שיווקיות
              </Label>
              <Switch
                id="marketing-notifications"
                checked={preferences?.marketing ?? false}
                onCheckedChange={(checked) => handleToggle('marketing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Important Notes */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-amber-800 mb-2">הערות חשובות:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• התראות על הזמנות דחופות יישלחו תמיד</li>
              <li>• עדכוני אבטחה חשובים לא ניתנים לביטול</li>
              <li>• שינויים נכנסים לתוקף מיידית</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NotificationSettings;