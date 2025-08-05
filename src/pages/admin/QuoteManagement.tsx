import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Eye, Download, MoreHorizontal, FileText, DollarSign, Clock, CheckCircle } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const mockQuotes = [
  {
    id: "QT-001",
    customerName: "יוסי כהן",
    customerEmail: "yossi@example.com",
    supplierName: "מטבחי דיאנה",
    projectType: "מטבח חדש",
    amount: 45000,
    status: "ממתין לתגובה",
    validUntil: "2024-02-15",
    createdDate: "2024-01-20",
    description: "מטבח מודרני 4 מטר כולל אי ומכשירי חשמל",
    items: [
      { name: "ארונות עליונים", quantity: 8, price: 1200 },
      { name: "ארונות תחתונים", quantity: 6, price: 1800 },
      { name: "משטח עבודה", quantity: 1, price: 8000 },
      { name: "מכשירי חשמל", quantity: 1, price: 15000 }
    ]
  },
  {
    id: "QT-002",
    customerName: "רחל לוי",
    customerEmail: "rachel@example.com",
    supplierName: "ריהוט הבית",
    projectType: "ריהוט סלון",
    amount: 28000,
    status: "אושר",
    validUntil: "2024-02-10",
    createdDate: "2024-01-18",
    description: "ריהוט מלא לסלון כולל ספה, שולחן וארון טלוויזיה",
    items: [
      { name: "ספה תלת מושבית", quantity: 1, price: 12000 },
      { name: "שולחן סלון", quantity: 1, price: 4000 },
      { name: "ארון טלוויזיה", quantity: 1, price: 8000 },
      { name: "כורסא", quantity: 2, price: 2000 }
    ]
  },
  {
    id: "QT-003",
    customerName: "דוד ישראלי",
    customerEmail: "david@example.com",
    supplierName: "אינסטלציה מקצועית",
    projectType: "שיפוץ מקלחת",
    amount: 18000,
    status: "נדחה",
    validUntil: "2024-02-01",
    createdDate: "2024-01-15",
    description: "שיפוץ מקלחת כולל אריחים, אינסטלציה ואביזרים",
    items: [
      { name: "אריחים", quantity: 25, price: 150 },
      { name: "עבודות אינסטלציה", quantity: 1, price: 8000 },
      { name: "אביזרי אמבטיה", quantity: 1, price: 6000 }
    ]
  },
];

export default function QuoteManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [quotes] = useState(mockQuotes);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const { toast } = useToast();

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.projectType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ממתין לתגובה":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">ממתין לתגובה</Badge>;
      case "אושר":
        return <Badge variant="default" className="bg-green-100 text-green-800">אושר</Badge>;
      case "נדחה":
        return <Badge variant="destructive">נדחה</Badge>;
      case "פג תוקף":
        return <Badge variant="outline">פג תוקף</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAction = (action: string, quoteId: string) => {
    toast({
      title: "פעולה בוצעה",
      description: `${action} עבור הצעת מחיר ${quoteId}`,
    });
  };

  const handleDownloadQuote = (quote: any) => {
    // In a real app, this would generate and download a PDF
    toast({
      title: "הצעת מחיר הורדה",
      description: `הצעת מחיר ${quote.id} הורדה בהצלחה`,
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew">
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ניהול הצעות מחיר</h1>
        <p className="text-muted-foreground text-sm md:text-base">ניהול ומעקב הצעות מחיר שנשלחו ללקוחות</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">סה״כ הצעות</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">1,345</div>
            <p className="text-xs text-muted-foreground text-right">+23% מהחודש הקודם</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">הצעות פעילות</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">234</div>
            <p className="text-xs text-muted-foreground text-right">ממתינות לתגובה</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">הצעות שאושרו</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">789</div>
            <p className="text-xs text-muted-foreground text-right">58.7% אחוז הצלחה</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">ערך הצעות החודש</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">₪2.1M</div>
            <p className="text-xs text-muted-foreground text-right">+31% מהחודש הקודם</p>
          </CardContent>
        </Card>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-sm order-2 sm:order-1">
              <SearchInput
                placeholder="חיפוש הצעות מחיר..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                className="text-right"
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
                <option value="ממתין לתגובה">ממתין לתגובה</option>
                <option value="אושר">אושר</option>
                <option value="נדחה">נדחה</option>
                <option value="פג תוקף">פג תוקף</option>
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
            {filteredQuotes.map((quote) => (
              <Card key={quote.id} className="p-4">
                <div className="space-y-3 text-right">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-primary">{quote.id}</div>
                    {getStatusBadge(quote.status)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{quote.projectType}</h3>
                    <p className="text-sm text-muted-foreground">{quote.supplierName}</p>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium">לקוח:</span> {quote.customerName}</p>
                    <p><span className="font-medium">סכום:</span> ₪{quote.amount.toLocaleString()}</p>
                    <p><span className="font-medium">תוקף עד:</span> {quote.validUntil}</p>
                    <p><span className="font-medium">נוצר:</span> {quote.createdDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 font-hebrew"
                          onClick={() => setSelectedQuote(quote)}
                        >
                          <Eye className="h-4 w-4 ml-2" />
                          צפייה
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="font-hebrew"
                      onClick={() => handleDownloadQuote(quote)}
                    >
                      <Download className="h-4 w-4 ml-2" />
                      הורדה
                    </Button>
                  </div>
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
                  <TableHead className="text-right">פרויקט</TableHead>
                  <TableHead className="text-right">לקוח</TableHead>
                  <TableHead className="text-right">ספק</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">תוקף עד</TableHead>
                  <TableHead className="text-right">תאריך יצירה</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium text-right">{quote.id}</TableCell>
                    <TableCell className="text-right">
                      <div>
                        <div className="font-medium">{quote.projectType}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-32">
                          {quote.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <div className="font-medium">{quote.customerName}</div>
                        <div className="text-sm text-muted-foreground">{quote.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{quote.supplierName}</TableCell>
                    <TableCell className="text-right">₪{quote.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{getStatusBadge(quote.status)}</TableCell>
                    <TableCell className="text-right">{quote.validUntil}</TableCell>
                    <TableCell className="text-right">{quote.createdDate}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="font-hebrew">
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-right"
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setSelectedQuote(quote);
                                }}
                              >
                                <Eye className="h-4 w-4 ml-2" />
                                צפייה בפרטים
                              </DropdownMenuItem>
                            </DialogTrigger>
                          </Dialog>
                          <DropdownMenuItem 
                            className="text-right"
                            onClick={() => handleDownloadQuote(quote)}
                          >
                            <Download className="h-4 w-4 ml-2" />
                            הורדת PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-right"
                            onClick={() => handleAction("שליחה מחדש", quote.id)}
                          >
                            שליחה מחדש ללקוח
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

      {/* Quote Details Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-4xl font-hebrew">
          <DialogHeader>
            <DialogTitle className="text-right">פרטי הצעת מחיר - {selectedQuote?.id}</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-6 text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">פרטי לקוח</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">שם:</span> {selectedQuote.customerName}</p>
                    <p><span className="font-medium">אימייל:</span> {selectedQuote.customerEmail}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">פרטי פרויקט</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">סוג פרויקט:</span> {selectedQuote.projectType}</p>
                    <p><span className="font-medium">ספק:</span> {selectedQuote.supplierName}</p>
                    <p><span className="font-medium">תוקף עד:</span> {selectedQuote.validUntil}</p>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-medium">סטטוס:</span>
                      {getStatusBadge(selectedQuote.status)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3">תיאור הפרויקט</h3>
                <p className="text-muted-foreground bg-muted p-3 rounded-md">
                  {selectedQuote.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">פירוט עלויות</h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">פריט</TableHead>
                        <TableHead className="text-right">כמות</TableHead>
                        <TableHead className="text-right">מחיר יחידה</TableHead>
                        <TableHead className="text-right">סה״כ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuote.items.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="text-right">{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">₪{item.price.toLocaleString()}</TableCell>
                          <TableCell className="text-right">₪{(item.quantity * item.price).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2">
                        <TableCell colSpan={3} className="text-right font-bold">סה״כ כולל</TableCell>
                        <TableCell className="text-right font-bold">₪{selectedQuote.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => handleDownloadQuote(selectedQuote)}
                  className="font-hebrew"
                >
                  <Download className="h-4 w-4 ml-2" />
                  הורדת PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleAction("שליחה מחדש", selectedQuote.id)}
                  className="font-hebrew"
                >
                  שליחה מחדש ללקוח
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}