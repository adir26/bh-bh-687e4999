import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Mail, 
  MessageSquare, 
  Calendar,
  Clock,
  Bell,
  Users,
  ShoppingCart,
  Star,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  Edit
} from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  executionCount: number;
  lastExecuted?: string;
  category: "email" | "notification" | "workflow" | "report";
}

const automationRules: AutomationRule[] = [
  {
    id: "auto-001",
    name: "ברכת ספק חדש",
    description: "שליחת מייל ברכה אוטומטי לספקים חדשים שמצטרפים למערכת",
    trigger: "רישום ספק חדש",
    action: "שליחת מייל ברכה + מדריך התחלת עבודה",
    isActive: true,
    executionCount: 23,
    lastExecuted: "2024-01-18",
    category: "email"
  },
  {
    id: "auto-002", 
    name: "מעקב הזמנות תקועות",
    description: "התראה אוטומטית כשהזמנה לא מתקדמת יותר מ-48 שעות",
    trigger: "הזמנה ללא עדכון 48 שעות",
    action: "שליחת התראה למנהל + SMS ללקוח",
    isActive: true,
    executionCount: 8,
    lastExecuted: "2024-01-17",
    category: "notification"
  },
  {
    id: "auto-003",
    name: "דוח ביצועים שבועי",
    description: "יצירה ושליחה אוטומטית של דוח ביצועים למנהלים",
    trigger: "כל יום ראשון בשעה 9:00",
    action: "יצירת דוח + שליחת מייל למנהלים",
    isActive: true,
    executionCount: 12,
    lastExecuted: "2024-01-15",
    category: "report"
  },
  {
    id: "auto-004",
    name: "תזכורת ביקורת ללקוחות",
    description: "בקשת ביקורת מלקוחות 7 ימים לאחר השלמת הזמנה",
    trigger: "7 ימים לאחר סיום הזמנה",
    action: "שליחת SMS + מייל בקשת ביקורת",
    isActive: false,
    executionCount: 45,
    lastExecuted: "2024-01-10",
    category: "email"
  },
  {
    id: "auto-005",
    name: "זיהוי פעילות חשודה",
    description: "זיהוי אוטומטי של פעילות חשודה או ניסיונות התקפה",
    trigger: "פעילות חשודה במערכת",
    action: "חסימה זמנית + התראה מיידית למנהל",
    isActive: true,
    executionCount: 2,
    lastExecuted: "2024-01-16",
    category: "notification"
  }
];

export default function AutomationCenter() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const getCategoryBadge = (category: string) => {
    const variants = {
      email: "bg-blue-100 text-blue-800",
      notification: "bg-orange-100 text-orange-800", 
      workflow: "bg-purple-100 text-purple-800",
      report: "bg-green-100 text-green-800"
    };
    return variants[category as keyof typeof variants] || "";
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "email": return <Mail className="h-4 w-4" />;
      case "notification": return <Bell className="h-4 w-4" />;
      case "workflow": return <Zap className="h-4 w-4" />;
      case "report": return <Calendar className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch(category) {
      case "email": return "מייל";
      case "notification": return "התראות";
      case "workflow": return "תהליכים";
      case "report": return "דוחות";
      default: return "כללי";
    }
  };

  const toggleRule = (ruleId: string) => {
    // כאן יהיה הלוגיקה לעדכון סטטוס הכלל
    console.log(`Toggle rule ${ruleId}`);
  };

  const filteredRules = selectedCategory === "all" 
    ? automationRules 
    : automationRules.filter(rule => rule.category === selectedCategory);

  return (
    <div className="space-y-6 font-hebrew" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">מרכז אוטומציה</h1>
          <p className="text-muted-foreground">
            ניהול תהליכים אוטומטיים והתראות חכמות במערכת
          </p>
        </div>
        <Button>
          <Zap className="h-4 w-4 ml-2" />
          כלל חדש
        </Button>
      </div>

      {/* סטטיסטיקות מהירות */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">כללים פעילים</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">מתוך 5 כללים</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הפעלות השבוע</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+23% מהשבוע שעבר</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">זמן חיסכון</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18ש</div>
            <p className="text-xs text-muted-foreground">השבוע</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">שיעור הצלחה</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">מהפעלות הושלמו</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">כללי אוטומציה</TabsTrigger>
          <TabsTrigger value="templates">תבניות</TabsTrigger>
          <TabsTrigger value="logs">יומן פעילות</TabsTrigger>
          <TabsTrigger value="settings">הגדרות</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button 
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              הכל
            </Button>
            <Button 
              variant={selectedCategory === "email" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("email")}
            >
              <Mail className="h-4 w-4 ml-2" />
              מיילים
            </Button>
            <Button 
              variant={selectedCategory === "notification" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("notification")}
            >
              <Bell className="h-4 w-4 ml-2" />
              התראות
            </Button>
            <Button 
              variant={selectedCategory === "workflow" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("workflow")}
            >
              <Zap className="h-4 w-4 ml-2" />
              תהליכים
            </Button>
            <Button 
              variant={selectedCategory === "report" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("report")}
            >
              <Calendar className="h-4 w-4 ml-2" />
              דוחות
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredRules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 space-x-reverse flex-1">
                      <div className={`p-3 rounded-lg ${rule.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {getCategoryIcon(rule.category)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-lg">{rule.name}</h3>
                          <Badge className={getCategoryBadge(rule.category)}>
                            {getCategoryName(rule.category)}
                          </Badge>
                          {rule.isActive ? (
                            <Badge className="bg-green-100 text-green-800">פעיל</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">מושבת</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {rule.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">טריגר: </span>
                            <span>{rule.trigger}</span>
                          </div>
                          <div>
                            <span className="font-medium">פעולה: </span>
                            <span>{rule.action}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            <span>{rule.executionCount} הפעלות</span>
                          </div>
                          {rule.lastExecuted && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>הופעל לאחרונה: {rule.lastExecuted}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                        <span className="text-sm">
                          {rule.isActive ? "פעיל" : "מושבת"}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 ml-2" />
                          עריכה
                        </Button>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 ml-2" />
                          הפעל עכשיו
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  ברכת לקוח חדש
                </CardTitle>
                <CardDescription>
                  שליחת מייל ברכה ומדריך למשתמשים חדשים
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="sm" className="w-full">
                  השתמש בתבנית
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  תזכורת תשלום
                </CardTitle>
                <CardDescription>
                  התראה אוטומטית לתזכורת תשלום לפני תאריך יעד
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="sm" className="w-full">
                  השתמש בתבנית
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  בקשת ביקורת
                </CardTitle>
                <CardDescription>
                  בקשה מלקוחות לביקורת לאחר השלמת שירות
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="sm" className="w-full">
                  השתמש בתבנית
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  התראת בעיה
                </CardTitle>
                <CardDescription>
                  התראה מיידית למנהלים על בעיות במערכת
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="sm" className="w-full">
                  השתמש בתבנית
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>יומן פעילות אוטומציה</CardTitle>
              <CardDescription>רשימת כל הפעלות האוטומציה ב-7 הימים האחרונים</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">ברכת ספק חדש</div>
                      <div className="text-sm text-muted-foreground">נשלח מייל ל: מטבחי פרימיום בע״מ</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">היום 14:32</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">מעקב הזמנות תקועות</div>
                      <div className="text-sm text-muted-foreground">נשלחה התראה על הזמנה #1234</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">אתמול 16:45</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">דוח ביצועים שבועי</div>
                      <div className="text-sm text-muted-foreground">נוצר ונשלח למנהלים</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">15/01 09:00</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">זיהוי פעילות חשודה</div>
                      <div className="text-sm text-muted-foreground">חסימה זמנית של כתובת IP</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">16/01 22:15</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>הגדרות כלליות</CardTitle>
                <CardDescription>הגדרות בסיסיות לתפעול האוטומציה</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">הפעלת אוטומציה</div>
                    <div className="text-sm text-muted-foreground">הפעל/השבת את כל כללי האוטומציה</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">התראות למנהלים</div>
                    <div className="text-sm text-muted-foreground">שלח התראות על הפעלות אוטומציה</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">יומן מפורט</div>
                    <div className="text-sm text-muted-foreground">שמור פרטים מלאים על כל פעילות</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>הגבלות וביטחון</CardTitle>
                <CardDescription>הגדרות ביטחון וגבולות שימוש</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">מקסימום הפעלות בשעה</div>
                  <div className="text-2xl font-bold text-blue-600">100</div>
                  <div className="text-sm text-muted-foreground">למניעת עומס יתר על המערכת</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">זמן המתנה בין הפעלות</div>
                  <div className="text-2xl font-bold text-green-600">5 שניות</div>
                  <div className="text-sm text-muted-foreground">למניעת ספאם או עומס</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}