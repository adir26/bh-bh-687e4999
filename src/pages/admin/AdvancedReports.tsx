import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Building,
  ShoppingCart,
  Star,
  MessageSquare
} from "lucide-react";

const salesData = [
  { month: "ינואר", revenue: 45000, orders: 156, suppliers: 12 },
  { month: "פברואר", revenue: 52000, orders: 189, suppliers: 15 },
  { month: "מרץ", revenue: 48000, orders: 167, suppliers: 13 },
  { month: "אפריל", revenue: 61000, orders: 234, suppliers: 18 },
  { month: "מאי", revenue: 55000, orders: 201, suppliers: 16 },
  { month: "יוני", revenue: 67000, orders: 278, suppliers: 22 }
];

const categoryData = [
  { name: "מטבחים", value: 35, color: "#8884d8" },
  { name: "ריהוט", value: 25, color: "#82ca9d" },
  { name: "חשמל", value: 20, color: "#ffc658" },
  { name: "אינסטלציה", value: 15, color: "#ff7300" },
  { name: "אחר", value: 5, color: "#8dd1e1" }
];

const userGrowthData = [
  { date: "שבוע 1", customers: 1240, suppliers: 89 },
  { date: "שבוע 2", customers: 1356, suppliers: 94 },
  { date: "שבוע 3", customers: 1445, suppliers: 102 },
  { date: "שבוע 4", customers: 1589, suppliers: 108 }
];

export default function AdvancedReports() {
  const [dateRange, setDateRange] = useState("30days");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  return (
    <div className="space-y-6 font-hebrew" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">דוחות מתקדמים</h1>
          <p className="text-muted-foreground">
            ניתוח מעמיק של נתוני המערכת ומגמות עסקיות
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 ml-2" />
            סינון
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 ml-2" />
            רענון
          </Button>
          <Button>
            <Download className="h-4 w-4 ml-2" />
            ייצא נתונים
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה״כ הכנסות חודשיות</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪67,000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> מהחודש שעבר
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הזמנות חודשיות</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">278</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18.7%</span> מהחודש שעבר
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ספקים פעילים</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+22.2%</span> ספקים חדשים
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">שביעות רצון ממוצעת</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.2</span> נקודות מהחודש שעבר
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">הכנסות ומכירות</TabsTrigger>
          <TabsTrigger value="users">משתמשים ופעילות</TabsTrigger>
          <TabsTrigger value="categories">קטגוריות ותחומים</TabsTrigger>
          <TabsTrigger value="performance">ביצועים ומגמות</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>מגמת הכנסות חודשית</CardTitle>
                <CardDescription>השוואה של הכנסות, הזמנות וספקים פעילים</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" name="הכנסות (₪)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>התפלגות הכנסות לפי קטגוריה</CardTitle>
                <CardDescription>אחוז ההכנסות מכל תחום עסקי</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ניתוח הזמנות לפי זמן</CardTitle>
              <CardDescription>מספר הזמנות ושווי ממוצע לאורך זמן</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="orders" fill="#82ca9d" name="מספר הזמנות" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#8884d8" name="הכנסות (₪)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>צמיחת בסיס המשתמשים</CardTitle>
                <CardDescription>מגמת הצטרפות לקוחות וספקים</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="customers" stroke="#8884d8" name="לקוחות" />
                    <Line type="monotone" dataKey="suppliers" stroke="#82ca9d" name="ספקים" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>פעילות משתמשים יומית</CardTitle>
                <CardDescription>סטטיסטיקות כניסה ושימוש במערכת</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">משתמשים פעילים היום</span>
                  <Badge className="bg-green-100 text-green-800">342</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">הפעלות חדשות השבוע</span>
                  <Badge className="bg-blue-100 text-blue-800">89</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">זמן שהייה ממוצע</span>
                  <Badge className="bg-purple-100 text-purple-800">24 דקות</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">שיעור חזרה</span>
                  <Badge className="bg-orange-100 text-orange-800">68%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>פילוח משתמשים לפי פלטפורמה</CardTitle>
              <CardDescription>התפלגות השימוש במכשירים שונים</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">65%</div>
                  <div className="text-sm text-muted-foreground">מובייל</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">28%</div>
                  <div className="text-sm text-muted-foreground">דסקטופ</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-600">7%</div>
                  <div className="text-sm text-muted-foreground">טאבלט</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>ביצועי קטגוריות</CardTitle>
                <CardDescription>השוואת מכירות בין תחומים שונים</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ספקים פעילים לפי קטגוריה</CardTitle>
                <CardDescription>מספר הספקים הפעילים בכל תחום</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.name}</span>
                    <Badge style={{ backgroundColor: category.color, color: 'white' }}>
                      {Math.floor(category.value / 5)} ספקים
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>מגמות פופולריות</CardTitle>
              <CardDescription>קטגוריות עם הצמיחה הגבוהה ביותר</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">עיצוב מטבחים</div>
                    <div className="text-sm text-muted-foreground">צמיחה של 25% החודש</div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium">ריהוט חכם</div>
                    <div className="text-sm text-muted-foreground">צמיחה של 18% החודש</div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium">אוטומציה ביתית</div>
                    <div className="text-sm text-muted-foreground">צמיחה של 12% החודש</div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>ביצועי מערכת</CardTitle>
                <CardDescription>זמני תגובה ויציבות</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">זמן טעינה ממוצע</span>
                  <Badge className="bg-green-100 text-green-800">1.2 שניות</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">זמינות מערכת</span>
                  <Badge className="bg-green-100 text-green-800">99.8%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">שגיאות בשעה</span>
                  <Badge className="bg-yellow-100 text-yellow-800">2</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>שיעורי המרה</CardTitle>
                <CardDescription>מביקורים לרכישות</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ביקור לאינטראקציה</span>
                  <Badge className="bg-blue-100 text-blue-800">24%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">אינטראקציה לקשר</span>
                  <Badge className="bg-purple-100 text-purple-800">15%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">קשר להזמנה</span>
                  <Badge className="bg-green-100 text-green-800">68%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>שביעות רצון</CardTitle>
                <CardDescription>דירוגים וביקורות</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">דירוג ממוצע</span>
                  <Badge className="bg-yellow-100 text-yellow-800">4.7/5</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ביקורות חיוביות</span>
                  <Badge className="bg-green-100 text-green-800">89%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">שיעור תגובה</span>
                  <Badge className="bg-blue-100 text-blue-800">94%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>מגמות ותחזיות</CardTitle>
              <CardDescription>ניתוח ותחזיות לתקופה הקרובה</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">תחזיות לחודש הבא</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>הכנסות צפויות:</span>
                      <span className="font-medium">₪74,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>הזמנות צפויות:</span>
                      <span className="font-medium">312</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ספקים חדשים:</span>
                      <span className="font-medium">4-6</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">התראות ומגמות</h4>
                  <div className="space-y-2 text-sm">
                    <div className="text-green-600">📈 עלייה במכירות מטבחים</div>
                    <div className="text-blue-600">💡 עניין גובר בבתים חכמים</div>
                    <div className="text-orange-600">⚠️ ירידה קלה בשביעות רצון</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}