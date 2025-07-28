import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, UserPlus, MoreHorizontal, Eye, Ban, CheckCircle } from "lucide-react";
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
    <div className="space-y-6 font-hebrew" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mobile-padding">
        <div>
          <h1 className="text-h1 md:text-3xl font-bold tracking-tight">ניהול משתמשים</h1>
          <p className="text-muted-foreground text-body-sm md:text-base">ניהול לקוחות וספקים</p>
        </div>
        <Button className="mobile-button font-hebrew w-full md:w-auto">
          <UserPlus className="h-4 w-4 ml-2" />
          הוספת משתמש
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="mobile-auto-grid px-4 md:px-0">
        <Card className="mobile-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-mobile-sm md:text-sm font-medium text-muted-foreground text-right">סה״כ משתמשים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">12,459</div>
            <p className="text-2xs md:text-xs text-muted-foreground text-right">+12% מהחודש שעבר</p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-mobile-sm md:text-sm font-medium text-muted-foreground text-right">ספקים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">1,247</div>
            <p className="text-2xs md:text-xs text-muted-foreground text-right">+8% מהחודש שעבר</p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-mobile-sm md:text-sm font-medium text-muted-foreground text-right">לקוחות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">11,212</div>
            <p className="text-2xs md:text-xs text-muted-foreground text-right">+13% מהחודש שעבר</p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-mobile-sm md:text-sm font-medium text-muted-foreground text-right">פעילים היום</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">2,847</div>
            <p className="text-2xs md:text-xs text-muted-foreground text-right">+5% מאתמול</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mobile-card mx-4 md:mx-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש משתמשים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right min-h-input"
                dir="rtl"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="mobile-button font-hebrew">
                <Filter className="h-4 w-4 ml-2" />
                סינון
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[600px]">
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
                        <div className="text-mobile-sm text-muted-foreground">{user.email}</div>
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
                          <Button variant="ghost" size="sm" className="mobile-button">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}