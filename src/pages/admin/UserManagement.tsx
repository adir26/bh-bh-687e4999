import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, UserPlus, MoreHorizontal, Eye, Ban, CheckCircle, Calendar, Mail, ShoppingCart } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mockUsers = [
  {
    id: 1,
    name: "יוחנן דוד",
    email: "yochanan@example.com",
    role: "לקוח",
    status: "פעיל",
    joinDate: "15/01/2024",
    lastActive: "20/01/2024",
    orders: 12
  },
  {
    id: 2,
    name: "ספקי ABC בע״מ",
    email: "info@abcsuppliers.com",
    role: "ספק",
    status: "פעיל",
    joinDate: "10/01/2024",
    lastActive: "20/01/2024",
    orders: 45
  },
  {
    id: 3,
    name: "שרה כהן",
    email: "sarah@example.com",
    role: "לקוח",
    status: "לא פעיל",
    joinDate: "05/01/2024",
    lastActive: "18/01/2024",
    orders: 3
  },
  {
    id: 4,
    name: "מיכאל לוי",
    email: "michael@example.com",
    role: "לקוח",
    status: "פעיל",
    joinDate: "12/01/2024",
    lastActive: "19/01/2024",
    orders: 7
  },
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users] = useState(mockUsers);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "פעיל":
        return <Badge variant="default" className="bg-green-100 text-green-800">פעיל</Badge>;
      case "לא פעיל":
        return <Badge variant="secondary">לא פעיל</Badge>;
      case "מושעה":
        return <Badge variant="destructive">מושעה</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ספק":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">ספק</Badge>;
      case "לקוח":
        return <Badge variant="outline">לקוח</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 px-4 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ניהול משתמשים</h1>
            <p className="text-muted-foreground text-sm md:text-base">ניהול לקוחות וספקים</p>
          </div>
          <Button className="w-full md:w-auto min-h-button font-hebrew">
            <UserPlus className="h-4 w-4 ml-2" />
            הוספת משתמש
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש משתמשים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 text-right min-h-input"
            dir="rtl"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 px-4 md:px-0">
        <Card className="mobile-card">
          <CardContent className="p-4 md:p-6">
            <div className="text-lg md:text-2xl font-bold text-right">12,459</div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground text-right">סה״כ משתמשים</p>
            <p className="text-xs text-green-600 text-right">+12%</p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardContent className="p-4 md:p-6">
            <div className="text-lg md:text-2xl font-bold text-right">1,247</div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground text-right">ספקים</p>
            <p className="text-xs text-green-600 text-right">+8%</p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardContent className="p-4 md:p-6">
            <div className="text-lg md:text-2xl font-bold text-right">11,212</div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground text-right">לקוחות</p>
            <p className="text-xs text-green-600 text-right">+13%</p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardContent className="p-4 md:p-6">
            <div className="text-lg md:text-2xl font-bold text-right">2,847</div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground text-right">פעילים היום</p>
            <p className="text-xs text-green-600 text-right">+5%</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile User Cards */}
      <div className="block md:hidden px-4 space-y-3">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="mobile-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-right truncate">{user.name}</h3>
                    {getRoleBadge(user.role)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 text-right">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-right">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span>הצטרף: {user.joinDate}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-right">
                      <ShoppingCart className="h-3 w-3 flex-shrink-0" />
                      <span>{user.orders} הזמנות</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    {getStatusBadge(user.status)}
                    <span className="text-xs text-muted-foreground">
                      פעיל: {user.lastActive}
                    </span>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-background border shadow-lg">
                    <DropdownMenuItem className="font-hebrew text-right">
                      <Eye className="h-4 w-4 ml-2" />
                      צפייה בפרטים
                    </DropdownMenuItem>
                    <DropdownMenuItem className="font-hebrew text-right">
                      <CheckCircle className="h-4 w-4 ml-2" />
                      הפעלה
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 font-hebrew text-right">
                      <Ban className="h-4 w-4 ml-2" />
                      השעיה
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block mobile-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-right font-hebrew">רשימת משתמשים</CardTitle>
            <Button variant="outline" size="sm" className="font-hebrew">
              <Filter className="h-4 w-4 ml-2" />
              סינון
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">משתמש</TableHead>
                <TableHead className="text-right">תפקיד</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">תאריך הצטרפות</TableHead>
                <TableHead className="text-right">פעיל לאחרונה</TableHead>
                <TableHead className="text-right">הזמנות</TableHead>
                <TableHead className="w-12 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-right">{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-right">{user.joinDate}</TableCell>
                  <TableCell className="text-right">{user.lastActive}</TableCell>
                  <TableCell className="text-right">{user.orders}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-background border shadow-lg">
                        <DropdownMenuItem className="font-hebrew text-right">
                          <Eye className="h-4 w-4 ml-2" />
                          צפייה בפרטים
                        </DropdownMenuItem>
                        <DropdownMenuItem className="font-hebrew text-right">
                          <CheckCircle className="h-4 w-4 ml-2" />
                          הפעלה
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 font-hebrew text-right">
                          <Ban className="h-4 w-4 ml-2" />
                          השעיה
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}