import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Eye, MoreHorizontal, MessageSquare, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const mockComplaints = [
  {
    id: "TLN-001",
    customerName: "יוסי כהן",
    supplierName: "מטבחי דיאנה",
    orderId: "HZM-001",
    subject: "איחור בהתקנה",
    status: "פתוח",
    priority: "גבוה",
    description: "הספק התחייב להתקנה ב-15.1 אך לא הגיע עד היום",
    submittedDate: "2024-01-22",
    lastUpdate: "2024-01-22"
  },
  {
    id: "TLN-002",
    customerName: "רחל לוי",
    supplierName: "ריהוט הבית",
    orderId: "HZM-015",
    subject: "פגם באיכות המוצר",
    status: "בטיפול",
    priority: "בינוני",
    description: "ריהוט שהגיע פגום ולא תואם להזמנה המקורית",
    submittedDate: "2024-01-20",
    lastUpdate: "2024-01-21"
  },
  {
    id: "TLN-003",
    customerName: "דוד ישראלי",
    supplierName: "אינסטלציה מקצועית",
    orderId: "HZM-032",
    subject: "בעיית חיוב",
    status: "נסגר",
    priority: "נמוך",
    description: "חויב סכום גבוה יותר מהמוסכם",
    submittedDate: "2024-01-18",
    lastUpdate: "2024-01-19"
  },
];

export default function ComplaintManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [complaints] = useState(mockComplaints);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "פתוח":
        return <Badge variant="destructive">פתוח</Badge>;
      case "בטיפול":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">בטיפול</Badge>;
      case "נסגר":
        return <Badge variant="default" className="bg-green-100 text-green-800">נסגר</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "גבוה":
        return <Badge variant="destructive">גבוה</Badge>;
      case "בינוני":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">בינוני</Badge>;
      case "נמוך":
        return <Badge variant="outline">נמוך</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const handleAction = (action: string, complaintId: string) => {
    toast({
      title: "פעולה בוצעה",
      description: `${action} עבור תלונה ${complaintId}`,
    });
  };

  const handleResponse = () => {
    if (!response.trim()) return;
    
    toast({
      title: "תגובה נשלחה",
      description: "התגובה נשלחה ללקוח ולספק",
    });
    setResponse("");
    setSelectedComplaint(null);
  };

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew">
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ניהול תלונות</h1>
        <p className="text-muted-foreground text-sm md:text-base">ניהול ומעקב תלונות לקוחות</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">סה״כ תלונות</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">247</div>
            <p className="text-xs text-muted-foreground text-right">+5% מהחודש הקודם</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">תלונות פתוחות</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">23</div>
            <p className="text-xs text-muted-foreground text-right">דורש טיפול מיידי</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">בטיפול</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">67</div>
            <p className="text-xs text-muted-foreground text-right">נטפל בימים הקרובים</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">נפתרו השבוע</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">45</div>
            <p className="text-xs text-muted-foreground text-right">זמן תגובה: 24 שעות</p>
          </CardContent>
        </Card>
      </div>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-sm order-2 sm:order-1">
              <SearchInput
                placeholder="חיפוש תלונות..."
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
                <option value="פתוח">פתוח</option>
                <option value="בטיפול">בטיפול</option>
                <option value="נסגר">נסגר</option>
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
            {filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="p-4">
                <div className="space-y-3 text-right">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-primary">{complaint.id}</div>
                    <div className="flex gap-2">
                      {getStatusBadge(complaint.status)}
                      {getPriorityBadge(complaint.priority)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{complaint.subject}</h3>
                    <p className="text-sm text-muted-foreground">הזמנה: {complaint.orderId}</p>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium">לקוח:</span> {complaint.customerName}</p>
                    <p><span className="font-medium">ספק:</span> {complaint.supplierName}</p>
                    <p><span className="font-medium">תאריך הגשה:</span> {complaint.submittedDate}</p>
                    <p><span className="font-medium">עדכון אחרון:</span> {complaint.lastUpdate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 font-hebrew"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <Eye className="h-4 w-4 ml-2" />
                          צפייה
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl font-hebrew">
                        <DialogHeader>
                          <DialogTitle className="text-right">פרטי תלונה - {selectedComplaint?.id}</DialogTitle>
                        </DialogHeader>
                        {selectedComplaint && (
                          <div className="space-y-4 text-right">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="font-medium">סטטוס:</p>
                                {getStatusBadge(selectedComplaint.status)}
                              </div>
                              <div>
                                <p className="font-medium">עדיפות:</p>
                                {getPriorityBadge(selectedComplaint.priority)}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium mb-2">תיאור התלונה:</p>
                              <p className="text-muted-foreground bg-muted p-3 rounded-md">
                                {selectedComplaint.description}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium mb-2">תגובה לתלונה:</p>
                              <Textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="כתב תגובה לתלונה..."
                                className="text-right"
                                dir="rtl"
                                rows={4}
                              />
                              <Button 
                                onClick={handleResponse}
                                className="mt-2 w-full font-hebrew"
                                disabled={!response.trim()}
                              >
                                שליחת תגובה
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="font-hebrew">
                          <MoreHorizontal className="h-4 w-4 ml-2" />
                          פעולות
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="font-hebrew">
                        <DropdownMenuItem 
                          className="text-right"
                          onClick={() => handleAction("סימון כבטיפול", complaint.id)}
                        >
                          סימון כבטיפול
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-right"
                          onClick={() => handleAction("סגירת תלונה", complaint.id)}
                        >
                          סגירת תלונה
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-right"
                          onClick={() => handleAction("העברה לספק", complaint.id)}
                        >
                          העברה לספק
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                  <TableHead className="text-right">נושא</TableHead>
                  <TableHead className="text-right">לקוח</TableHead>
                  <TableHead className="text-right">ספק</TableHead>
                  <TableHead className="text-right">הזמנה</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">עדיפות</TableHead>
                  <TableHead className="text-right">תאריך הגשה</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-medium text-right">{complaint.id}</TableCell>
                    <TableCell className="text-right max-w-xs">
                      <div className="truncate">{complaint.subject}</div>
                    </TableCell>
                    <TableCell className="text-right">{complaint.customerName}</TableCell>
                    <TableCell className="text-right">{complaint.supplierName}</TableCell>
                    <TableCell className="text-right">{complaint.orderId}</TableCell>
                    <TableCell className="text-right">{getStatusBadge(complaint.status)}</TableCell>
                    <TableCell className="text-right">{getPriorityBadge(complaint.priority)}</TableCell>
                    <TableCell className="text-right">{complaint.submittedDate}</TableCell>
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
                                  setSelectedComplaint(complaint);
                                }}
                              >
                                <Eye className="h-4 w-4 ml-2" />
                                צפייה בפרטים
                              </DropdownMenuItem>
                            </DialogTrigger>
                          </Dialog>
                          <DropdownMenuItem 
                            className="text-right"
                            onClick={() => handleAction("סימון כבטיפול", complaint.id)}
                          >
                            סימון כבטיפול
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-right"
                            onClick={() => handleAction("סגירת תלונה", complaint.id)}
                          >
                            סגירת תלונה
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

      {/* Response Dialog for Desktop */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-2xl font-hebrew">
          <DialogHeader>
            <DialogTitle className="text-right">פרטי תלונה - {selectedComplaint?.id}</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4 text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">סטטוס:</p>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                <div>
                  <p className="font-medium">עדיפות:</p>
                  {getPriorityBadge(selectedComplaint.priority)}
                </div>
              </div>
              <div>
                <p className="font-medium mb-2">תיאור התלונה:</p>
                <p className="text-muted-foreground bg-muted p-3 rounded-md">
                  {selectedComplaint.description}
                </p>
              </div>
              <div>
                <p className="font-medium mb-2">תגובה לתלונה:</p>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="כתב תגובה לתלונה..."
                  className="text-right"
                  dir="rtl"
                  rows={4}
                />
                <Button 
                  onClick={handleResponse}
                  className="mt-2 w-full font-hebrew"
                  disabled={!response.trim()}
                >
                  שליחת תגובה
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}