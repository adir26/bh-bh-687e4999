import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  ShoppingCart, 
  FileText, 
  TrendingUp,
  DollarSign,
  Star,
  MessageSquare,
  Package
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const kpiData = [
  { title: "סה״כ משתמשים", value: "12,459", change: "+12%", icon: Users, color: "text-blue-600" },
  { title: "הזמנות פעילות", value: "1,247", change: "+8%", icon: ShoppingCart, color: "text-green-600" },
  { title: "סה״כ הכנסות", value: "₪89,432", change: "+23%", icon: DollarSign, color: "text-purple-600" },
  { title: "דירוג ממוצע", value: "4.8", change: "+0.2", icon: Star, color: "text-yellow-600" },
];

const monthlyData = [
  { name: "ינו׳", users: 400, orders: 240, revenue: 2400 },
  { name: "פבר׳", users: 300, orders: 139, revenue: 1398 },
  { name: "מרץ", users: 200, orders: 980, revenue: 9800 },
  { name: "אפר׳", users: 278, orders: 390, revenue: 3908 },
  { name: "מאי", users: 189, orders: 480, revenue: 4800 },
  { name: "יוני", users: 239, orders: 380, revenue: 3800 },
];

const categoryData = [
  { name: "מטבח", value: 35, color: "#8884d8" },
  { name: "שיפוצים", value: 25, color: "#82ca9d" },
  { name: "ריהוט", value: 20, color: "#ffc658" },
  { name: "אחר", value: 20, color: "#ff7300" },
];

const recentActivity = [
  { type: "רישום משתמש חדש", details: "יוחנן דוד הצטרף", time: "לפני דקותיים", icon: Users },
  { type: "הזמנה חדשה", details: "הזמנה #1234 בוצעה", time: "לפני 5 דקות", icon: ShoppingCart },
  { type: "ביקורת נשלחה", details: "ביקורת 5 כוכבים עבור ספקי ABC", time: "לפני 10 דקות", icon: Star },
  { type: "תלונה הוגשה", details: "דווח על בעיה במשלוח", time: "לפני 15 דקות", icon: MessageSquare },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-4 md:space-y-6 font-hebrew pb-nav-safe" dir="rtl">
      <div>
        <h1 className="text-xl md:text-3xl font-bold tracking-tight rtl-text-right">לוח בקרה</h1>
        <p className="text-muted-foreground text-mobile-sm md:text-base rtl-text-right">סקירה כללית של ביצועי הפלטפורמה</p>
      </div>

      {/* KPI Cards */}
      <div className="responsive-grid-2">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="mobile-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-mobile-xs md:text-sm font-medium text-muted-foreground text-right">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color} flex-shrink-0`} />
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <div className="text-lg md:text-2xl font-bold text-right">{kpi.value}</div>
              <p className="text-mobile-xs md:text-xs text-muted-foreground text-right">
                <span className="text-green-600">{kpi.change}</span> מהחודש שעבר
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Monthly Trends */}
        <Card className="mobile-card">
          <CardHeader>
            <CardTitle className="text-right font-hebrew text-mobile-sm md:text-base">מגמות חודשיות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="mobile-card">
          <CardHeader>
            <CardTitle className="text-right font-hebrew text-mobile-sm md:text-base">התפלגות קטגוריות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={60}
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
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Revenue Chart */}
        <Card className="mobile-card">
          <CardHeader>
            <CardTitle className="text-right font-hebrew text-mobile-sm md:text-base">סקירת הכנסות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mobile-card">
          <CardHeader>
            <CardTitle className="text-right font-hebrew text-mobile-sm md:text-base">פעילות אחרונה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 md:p-3 rounded-lg border mobile-transition hover:bg-muted/50">
                  <activity.icon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 text-right min-w-0">
                    <p className="font-medium text-mobile-xs md:text-sm truncate">{activity.type}</p>
                    <p className="text-mobile-xs md:text-sm text-muted-foreground truncate">{activity.details}</p>
                  </div>
                  <span className="text-mobile-xs md:text-xs text-muted-foreground flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}