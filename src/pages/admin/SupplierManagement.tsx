import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, MoreHorizontal, Star, CheckCircle, XCircle, Clock, Building } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const mockSuppliers = [
  {
    id: "SPL-001",
    name: "מטבחי דיאנה",
    email: "info@diana-kitchens.co.il",
    phone: "03-1234567",
    category: "מטבחים",
    status: "פעיל",
    rating: 4.8,
    projects: 45,
    joinDate: "2023-01-15",
    verified: true
  },
  {
    id: "SPL-002",
    name: "ריהוט הבית",
    email: "contact@home-furniture.co.il",
    phone: "04-9876543",
    category: "ריהוט",
    status: "ממתין לאישור",
    rating: 0,
    projects: 0,
    joinDate: "2024-01-20",
    verified: false
  },
  {
    id: "SPL-003",
    name: "אינסטלציה מקצועית",
    email: "service@pro-plumbing.co.il",
    phone: "08-5555555",
    category: "אינסטלציה",
    status: "פעיל",
    rating: 4.5,
    projects: 128,
    joinDate: "2022-06-10",
    verified: true
  },
];

export default function SupplierManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [suppliers] = useState(mockSuppliers);
  const { toast } = useToast();

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "פעיל":
        return <Badge variant="default" className="bg-green-100 text-green-800">פעיל</Badge>;
      case "ממתין לאישור":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">ממתין לאישור</Badge>;
      case "מושעה":
        return <Badge variant="destructive">מושעה</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAction = (action: string, supplierId: string) => {
    toast({
      title: "פעולה בוצעה",
      description: `${action} עבור ספק ${supplierId}`,
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew">
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ניהול ספקים</h1>
        <p className="text-muted-foreground text-sm md:text-base">ניהול וחיפוש ספקים רשומים</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">סה״כ ספקים</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">1,847</div>
            <p className="text-xs text-muted-foreground text-right">+12% מהחודש הקודם</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">ספקים פעילים</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">1,623</div>
            <p className="text-xs text-muted-foreground text-right">87.9% מהכלל</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">ממתינים לאישור</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">67</div>
            <p className="text-xs text-muted-foreground text-right">דורש טיפול</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">דירוג ממוצע</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">4.6</div>
            <p className="text-xs text-muted-foreground text-right">מתוך 5 כוכבים</p>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm order-2 sm:order-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש ספקים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
                dir="rtl"
              />
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background font-hebrew text-right text-sm"
                dir="rtl"
              >
                <option value="all">כל הסטטוסים</option>
                <option value="פעיל">פעיל</option>
                <option value="ממתין לאישור">ממתין לאישור</option>
                <option value="מושעה">מושעה</option>
              </select>
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
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="p-4">
                <div className="space-y-3 text-right">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-primary">{supplier.id}</div>
                    {getStatusBadge(supplier.status)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{supplier.name}</h3>
                    <p className="text-sm text-muted-foreground">{supplier.category}</p>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium">אימייל:</span> {supplier.email}</p>
                    <p><span className="font-medium">טלפון:</span> {supplier.phone}</p>
                    <p><span className="font-medium">פרויקטים:</span> {supplier.projects}</p>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">דירוג:</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{supplier.rating || "לא דורג"}</span>
                    </div>
                    <p><span className="font-medium">הצטרף:</span> {supplier.joinDate}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full font-hebrew">
                        <MoreHorizontal className="h-4 w-4 ml-2" />
                        פעולות
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="font-hebrew">
                      <DropdownMenuItem 
                        className="text-right"
                        onClick={() => handleAction("צפייה בפרטים", supplier.id)}
                      >
                        <Eye className="h-4 w-4 ml-2" />
                        צפייה בפרטים
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-right"
                        onClick={() => handleAction("אישור ספק", supplier.id)}
                      >
                        <CheckCircle className="h-4 w-4 ml-2" />
                        אישור ספק
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-right"
                        onClick={() => handleAction("השעיית ספק", supplier.id)}
                      >
                        <XCircle className="h-4 w-4 ml-2" />
                        השעיית ספק
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
                  <TableHead className="text-right">מזהה</TableHead>
                  <TableHead className="text-right">שם הספק</TableHead>
                  <TableHead className="text-right">קטגוריה</TableHead>
                  <TableHead className="text-right">טלפון</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">דירוג</TableHead>
                  <TableHead className="text-right">פרויקטים</TableHead>
                  <TableHead className="text-right">תאריך הצטרפות</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium text-right">{supplier.id}</TableCell>
                    <TableCell className="text-right">
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-sm text-muted-foreground">{supplier.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{supplier.category}</TableCell>
                    <TableCell className="text-right">{supplier.phone}</TableCell>
                    <TableCell className="text-right">{getStatusBadge(supplier.status)}</TableCell>
                    <TableCell className="text-right">
                      {supplier.rating > 0 ? (
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{supplier.rating}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">לא דורג</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{supplier.projects}</TableCell>
                    <TableCell className="text-right">{supplier.joinDate}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="font-hebrew">
                          <DropdownMenuItem 
                            className="text-right"
                            onClick={() => handleAction("צפייה בפרטים", supplier.id)}
                          >
                            <Eye className="h-4 w-4 ml-2" />
                            צפייה בפרטים
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-right"
                            onClick={() => handleAction("אישור ספק", supplier.id)}
                          >
                            <CheckCircle className="h-4 w-4 ml-2" />
                            אישור ספק
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-right"
                            onClick={() => handleAction("השעיית ספק", supplier.id)}
                          >
                            <XCircle className="h-4 w-4 ml-2" />
                            השעיית ספק
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