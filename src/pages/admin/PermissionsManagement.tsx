import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  Key, 
  Eye,
  Settings,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Crown,
  Lock
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: "users" | "suppliers" | "orders" | "content" | "system";
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystemRole: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

const permissions: Permission[] = [
  { id: "users_view", name: "צפייה במשתמשים", description: "אפשרות לצפות ברשימת המשתמשים", category: "users" },
  { id: "users_edit", name: "עריכת משתמשים", description: "אפשרות לערוך פרטי משתמשים", category: "users" },
  { id: "users_delete", name: "מחיקת משתמשים", description: "אפשרות למחוק משתמשים", category: "users" },
  { id: "suppliers_view", name: "צפייה בספקים", description: "אפשרות לצפות ברשימת הספקים", category: "suppliers" },
  { id: "suppliers_approve", name: "אישור ספקים", description: "אפשרות לאשר ספקים חדשים", category: "suppliers" },
  { id: "orders_view", name: "צפייה בהזמנות", description: "אפשרות לצפות בכל ההזמנות", category: "orders" },
  { id: "orders_manage", name: "ניהול הזמנות", description: "אפשרות לנהל ולעדכן הזמנות", category: "orders" },
  { id: "content_edit", name: "עריכת תוכן", description: "אפשרות לערוך תוכן באתר", category: "content" },
  { id: "content_publish", name: "פרסום תוכן", description: "אפשרות לפרסם תוכן חדש", category: "content" },
  { id: "system_settings", name: "הגדרות מערכת", description: "אפשרות לשנות הגדרות מערכת", category: "system" },
  { id: "system_backup", name: "גיבוי מערכת", description: "אפשרות ליצור גיבויים", category: "system" }
];

const roles: Role[] = [
  {
    id: "super_admin",
    name: "מנהל על",
    description: "גישה מלאה לכל הפונקציות במערכת",
    permissions: permissions.map(p => p.id),
    userCount: 2,
    isSystemRole: true
  },
  {
    id: "admin",
    name: "מנהל",
    description: "גישה לניהול משתמשים, ספקים והזמנות",
    permissions: ["users_view", "users_edit", "suppliers_view", "suppliers_approve", "orders_view", "orders_manage"],
    userCount: 5,
    isSystemRole: false
  },
  {
    id: "editor", 
    name: "עורך תוכן",
    description: "גישה לעריכה ופרסום תוכן בלבד",
    permissions: ["content_edit", "content_publish"],
    userCount: 3,
    isSystemRole: false
  },
  {
    id: "viewer",
    name: "צופה",
    description: "גישה לצפייה בלבד ללא אפשרות עריכה",
    permissions: ["users_view", "suppliers_view", "orders_view"],
    userCount: 8,
    isSystemRole: false
  }
];

const adminUsers: User[] = [
  {
    id: "user-001",
    name: "דוד כהן",
    email: "david@company.com",
    role: "super_admin",
    isActive: true,
    lastLogin: "2024-01-18 14:30",
    createdAt: "2023-01-15"
  },
  {
    id: "user-002",
    name: "שרה לוי",
    email: "sarah@company.com", 
    role: "admin",
    isActive: true,
    lastLogin: "2024-01-18 09:15",
    createdAt: "2023-03-22"
  },
  {
    id: "user-003",
    name: "מיכאל רוזן",
    email: "michael@company.com",
    role: "editor",
    isActive: false,
    lastLogin: "2024-01-10 16:45",
    createdAt: "2023-06-10"
  },
  {
    id: "user-004",
    name: "רחל אברהם",
    email: "rachel@company.com",
    role: "viewer",
    isActive: true,
    lastLogin: "2024-01-17 11:20",
    createdAt: "2023-09-05"
  }
];

export default function PermissionsManagement() {
  const [selectedTab, setSelectedTab] = useState("users");

  const getRoleBadge = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return null;
    
    if (role.isSystemRole) {
      return <Badge className="bg-red-100 text-red-800"><Crown className="h-3 w-3 ml-1" />מערכת</Badge>;
    }
    
    const variants = {
      admin: "bg-blue-100 text-blue-800",
      editor: "bg-green-100 text-green-800", 
      viewer: "bg-gray-100 text-gray-800"
    };
    return <Badge className={variants[roleId as keyof typeof variants] || "bg-gray-100 text-gray-800"}>{role.name}</Badge>;
  };

  const getCategoryName = (category: string) => {
    const names = {
      users: "משתמשים",
      suppliers: "ספקים", 
      orders: "הזמנות",
      content: "תוכן",
      system: "מערכת"
    };
    return names[category as keyof typeof names] || category;
  };

  return (
    <div className="space-y-6 font-hebrew" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ניהול הרשאות</h1>
          <p className="text-muted-foreground">
            ניהול תפקידים, הרשאות ומשתמשי מנהל במערכת
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          משתמש חדש
        </Button>
      </div>

      {/* סטטיסטיקות מהירות */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משתמשי מנהל</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">16 פעילים, 2 מושבתים</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תפקידים</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">2 תפקידי מערכת</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הרשאות זמינות</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11</div>
            <p className="text-xs text-muted-foreground">בחלוקה ל-5 קטגוריות</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">כניסות היום</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">8 משתמשים שונים</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">משתמשי מנהל</TabsTrigger>
          <TabsTrigger value="roles">תפקידים</TabsTrigger>
          <TabsTrigger value="permissions">הרשאות</TabsTrigger>
          <TabsTrigger value="security">אבטחה</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4">
            {adminUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${user.isActive ? 'bg-blue-500' : 'bg-gray-400'}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-lg">{user.name}</h3>
                          {getRoleBadge(user.role)}
                          {user.isActive ? (
                            <Badge className="bg-green-100 text-green-800">פעיל</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">מושבת</Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p>{user.email}</p>
                        </div>

                        <div className="flex items-center gap-6 text-xs text-muted-foreground">
                          <div>כניסה אחרונה: {user.lastLogin}</div>
                          <div>נוצר: {user.createdAt}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch checked={user.isActive} />
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 ml-2" />
                        עריכה
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4 ml-2" />
                        מחיקה
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4">
            {roles.map((role) => (
              <Card key={role.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 space-x-reverse flex-1">
                      <div className={`p-3 rounded-lg ${role.isSystemRole ? 'bg-red-100' : 'bg-blue-100'}`}>
                        {role.isSystemRole ? <Crown className="h-5 w-5 text-red-600" /> : <Key className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-lg">{role.name}</h3>
                          {role.isSystemRole && (
                            <Badge className="bg-red-100 text-red-800">
                              <Lock className="h-3 w-3 ml-1" />
                              מערכת
                            </Badge>
                          )}
                          <Badge className="bg-gray-100 text-gray-800">
                            {role.userCount} משתמשים
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {role.description}
                        </p>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">הרשאות ({role.permissions.length}):</div>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 6).map((permissionId) => {
                              const permission = permissions.find(p => p.id === permissionId);
                              return permission ? (
                                <Badge key={permissionId} variant="outline" className="text-xs">
                                  {permission.name}
                                </Badge>
                              ) : null;
                            })}
                            {role.permissions.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 6} נוספות
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 ml-2" />
                        צפייה
                      </Button>
                      {!role.isSystemRole && (
                        <>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 ml-2" />
                            עריכה
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-800">
                            <Trash2 className="h-4 w-4 ml-2" />
                            מחיקה
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="space-y-6">
            {["users", "suppliers", "orders", "content", "system"].map((category) => {
              const categoryPermissions = permissions.filter(p => p.category === category);
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      הרשאות {getCategoryName(category)}
                    </CardTitle>
                    <CardDescription>
                      הרשאות הקשורות לניהול {getCategoryName(category)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{permission.name}</div>
                            <div className="text-sm text-muted-foreground">{permission.description}</div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>בשימוש ב-{roles.filter(r => r.permissions.includes(permission.id)).length} תפקידים</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>הגדרות אבטחה</CardTitle>
                <CardDescription>הגדרות בטיחות ואבטחה כלליות</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">אימות דו-שלבי</div>
                    <div className="text-sm text-muted-foreground">הפעלת אימות דו-שלבי לכל המנהלים</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">רישום פעילות</div>
                    <div className="text-sm text-muted-foreground">שמירת לוג מפורט של כל הפעולות</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">התראות כניסה</div>
                    <div className="text-sm text-muted-foreground">התראה על כניסות ממכשירים חדשים</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>מדיניות סיסמאות</CardTitle>
                <CardDescription>דרישות וחוקים לסיסמאות מנהלים</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="font-medium">דרישות סיסמה:</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>לפחות 8 תווים</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>שילוב אותיות גדולות וקטנות</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>מספרים ותווים מיוחדים</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span>החלפה כל 90 יום</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>יומן אבטחה</CardTitle>
                <CardDescription>אירועי אבטחה אחרונים</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">כניסה מוצלחת</div>
                        <div className="text-sm text-muted-foreground">דוד כהן נכנס למערכת</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">היום 14:30</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">ניסיון כניסה כושל</div>
                        <div className="text-sm text-muted-foreground">3 ניסיונות כושלים מאותה IP</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">אתמול 22:15</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">שינוי הרשאות</div>
                        <div className="text-sm text-muted-foreground">עודכנו הרשאות משתמש</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">16/01 11:20</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>גיבוי והשחזור</CardTitle>
                <CardDescription>ניהול גיבויים ושחזור נתונים</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">גיבוי אחרון:</div>
                  <div className="text-sm text-muted-foreground">היום בשעה 03:00</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">תדירות גיבוי:</div>
                  <div className="text-sm text-muted-foreground">יומי בשעה 03:00</div>
                </div>
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 ml-2" />
                  ניהול גיבויים
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}