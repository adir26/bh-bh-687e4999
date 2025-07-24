import React, { useState } from "react";
import { ArrowLeft, Upload, Save } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSupplier = location.pathname.startsWith('/supplier/');
  
  const [formData, setFormData] = useState({
    fullName: "יוחנן כהן",
    email: "yohanan@example.com",
    phone: "+972-50-123-4567",
    location: "תל אביב",
    language: "he",
    darkMode: false,
    fontSize: "medium",
    // Supplier specific
    businessDescription: "",
    workingHours: "8:00 - 18:00",
    serviceCategories: "עיצוב מטבחים, שיפוצים"
  });

  const handleSave = () => {
    toast({
      title: "ההגדרות נשמרו",
      description: "ההעדפות שלך עודכנו בהצלחה.",
    });
  };

  const handleLogout = () => {
    toast({
      title: "התנתקת מהמערכת",
      description: "התנתקת בהצלחה מהמערכת.",
    });
    navigate("/login");
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
            <h1 className="text-xl font-semibold">הגדרות</h1>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 ml-2" />
            שמור
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-20">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי החשבון</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">שם מלא</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">מספר טלפון</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="location">מיקום ראשי</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="language">שפה</Label>
              <Select value={formData.language} onValueChange={(value) => setFormData({...formData, language: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="he">עברית</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" className="w-full">
              איפוס סיסמה
            </Button>
          </CardContent>
        </Card>

        {/* Interface Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>העדפות תצוגה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>מצב כהה</Label>
                <p className="text-sm text-muted-foreground">שימוש בערכת נושא כהה</p>
              </div>
              <Switch
                checked={formData.darkMode}
                onCheckedChange={(checked) => setFormData({...formData, darkMode: checked})}
              />
            </div>
            
            <div>
              <Label htmlFor="fontSize">גודל גופן</Label>
              <Select value={formData.fontSize} onValueChange={(value) => setFormData({...formData, fontSize: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">קטן</SelectItem>
                  <SelectItem value="medium">בינוני</SelectItem>
                  <SelectItem value="large">גדול</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Specific Settings */}
        {isSupplier && (
          <Card>
            <CardHeader>
              <CardTitle>פרטי העסק</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>לוגו החברה</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">לחץ להעלאת לוגו</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="businessDescription">תיאור העסק</Label>
                <Textarea
                  id="businessDescription"
                  placeholder="תאר את העסק והשירותים שלך..."
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({...formData, businessDescription: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="workingHours">שעות פעילות</Label>
                <Input
                  id="workingHours"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({...formData, workingHours: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="serviceCategories">קטגוריות שירות</Label>
                <Input
                  id="serviceCategories"
                  value={formData.serviceCategories}
                  onChange={(e) => setFormData({...formData, serviceCategories: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Links */}
        <Card>
          <CardContent className="p-0">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4"
                onClick={() => navigate(isSupplier ? '/supplier/notifications-preferences' : '/notifications-preferences')}
              >
                הגדרות התראות
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4"
                onClick={() => navigate('/faq')}
              >
                שאלות נפוצות
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4"
                onClick={() => navigate('/support')}
              >
                צור קשר עם התמיכה
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4"
              >
                תנאי שימוש
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4 text-destructive"
                onClick={handleLogout}
              >
                התנתק
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;