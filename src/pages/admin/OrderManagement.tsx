import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, MoreHorizontal, DollarSign, ShoppingCart, Clock, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mockOrders = [
  {
    id: "HZM-001",
    customer: "יוסי כהן",
    supplier: "ספקי ABC",
    amount: 2450,
    status: "בטיפול",
    date: "2024-01-20",
    items: 3
  },
  {
    id: "HZM-002",
    customer: "רחל לוי",
    supplier: "מטבחי XYZ",
    amount: 5200,
    status: "נמסר",
    date: "2024-01-19",
    items: 8
  },
  {
    id: "HZM-003",
    customer: "דוד ישראלי",
    supplier: "ריהוט מודרני בע״מ",
    amount: 1800,
    status: "ממתין",
    date: "2024-01-18",
    items: 2
  },
];

export default function AdminOrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders] = useState(mockOrders);

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "נמסר":
        return <Badge variant="default" className="bg-green-100 text-green-800">נמסר</Badge>;
      case "בטיפול":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">בטיפול</Badge>;
      case "ממתין":
        return <Badge variant="secondary">ממתין</Badge>;
      case "בוטל":
        return <Badge variant="destructive">בוטל</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew">
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ניהול הזמנות</h1>
        <p className="text-muted-foreground text-sm md:text-base">מעקב וניהול כל הזמנות הפלטפורמה</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">סה״כ הזמנות</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">1,247</div>
            <p className="text-xs text-muted-foreground text-right">+8% מהחודש הקודם</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">הכנסות כוללות</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">₪89,432</div>
            <p className="text-xs text-muted-foreground text-right">+15% מהחודש הקודם</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">הזמנות ממתינות</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">34</div>
            <p className="text-xs text-muted-foreground text-right">-12% מאתמול</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">הושלמו</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">1,189</div>
            <p className="text-xs text-muted-foreground text-right">+9% מהחודש הקודם</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm order-2 sm:order-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש הזמנות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
                dir="rtl"
              />
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm" className="font-hebrew">
                <Filter className="h-4 w-4 ml-2" />
                סינון
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {/* Mobile Cards for small screens */}
          <div className="block md:hidden space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="space-y-2 text-right">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-primary">{order.id}</div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p><span className="font-medium">לקוח:</span> {order.customer}</p>
                    <p><span className="font-medium">ספק:</span> {order.supplier}</p>
                    <p><span className="font-medium">סכום:</span> ₪{order.amount.toLocaleString()}</p>
                    <p><span className="font-medium">תאריך:</span> {order.date}</p>
                    <p><span className="font-medium">פריטים:</span> {order.items}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full font-hebrew">
                        <MoreHorizontal className="h-4 w-4 ml-2" />
                        פעולות
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="font-hebrew">
                      <DropdownMenuItem className="text-right">
                        <Eye className="h-4 w-4 ml-2" />
                        צפייה בפרטים
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-right">
                        עדכון סטטוס
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-right">
                        שליחת הודעה
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">מזהה הזמנה</TableHead>
                  <TableHead className="text-right">לקוח</TableHead>
                  <TableHead className="text-right">ספק</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">פריטים</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-right">{order.id}</TableCell>
                    <TableCell className="text-right">{order.customer}</TableCell>
                    <TableCell className="text-right">{order.supplier}</TableCell>
                    <TableCell className="text-right">₪{order.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">{order.date}</TableCell>
                    <TableCell className="text-right">{order.items}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="font-hebrew">
                          <DropdownMenuItem className="text-right">
                            <Eye className="h-4 w-4 ml-2" />
                            צפייה בפרטים
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-right">
                            עדכון סטטוס
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-right">
                            שליחת הודעה
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}