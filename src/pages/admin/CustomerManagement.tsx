import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, UserPlus, MoreHorizontal, Eye, Ban, CheckCircle, Calendar, Mail, ShoppingCart, MessageSquare, Shield } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminCustomers, useCustomerMutations, useCustomerComplaints, useComplaintMutations, useCustomerRealtimeSubscription } from "@/hooks/useAdminCustomers";
import { CustomerFilters, PaginationParams, STATUS_LABELS } from "@/types/admin";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 25;

export default function CustomerManagement() {
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [blockReason, setBlockReason] = useState("");
  const [complaintStatus, setComplaintStatus] = useState("");
  const [complaintNotes, setComplaintNotes] = useState("");
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const pagination: PaginationParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE
  };

  const currentFilters = { ...filters, search: debouncedSearch };
  const { customers, totalCount, totalPages, isLoading } = useAdminCustomers(currentFilters, pagination);
  const { toggleCustomerBlock } = useCustomerMutations();
  const { data: complaints } = useCustomerComplaints(selectedCustomer?.id);
  const { updateComplaintStatus } = useComplaintMutations();

  // Real-time subscription
  useCustomerRealtimeSubscription();

  const handleBlockCustomer = async (customer: any, block: boolean) => {
    if (block) {
      setSelectedCustomer(customer);
      setBlockDialogOpen(true);
    } else {
      await toggleCustomerBlock.mutateAsync({ 
        id: customer.id, 
        block: false 
      });
    }
  };

  const confirmBlock = async () => {
    if (!selectedCustomer || !blockReason.trim()) {
      toast.error('נא להוסיף סיבה לחסימה');
      return;
    }

    await toggleCustomerBlock.mutateAsync({
      id: selectedCustomer.id,
      block: true,
      reason: blockReason
    });

    setBlockDialogOpen(false);
    setBlockReason("");
    setSelectedCustomer(null);
  };

  const handleComplaintUpdate = async () => {
    if (!selectedCustomer || !complaintStatus) return;

    await updateComplaintStatus.mutateAsync({
      id: selectedCustomer.id,
      status: complaintStatus,
      admin_notes: complaintNotes
    });

    setComplaintDialogOpen(false);
    setComplaintStatus("");
    setComplaintNotes("");
    setSelectedCustomer(null);
  };

  const getStatusBadge = (customer: any) => {
    if (customer.is_blocked) {
      return <Badge variant="destructive">חסום</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">פעיל</Badge>;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "supplier":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">ספק</Badge>;
      case "client":
        return <Badge variant="outline">לקוח</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('he-IL');
  };

  const stats = {
    total: totalCount,
    suppliers: customers.filter(c => c.role === 'supplier').length,
    clients: customers.filter(c => c.role === 'client').length,
    blocked: customers.filter(c => c.is_blocked).length
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">טוען נתוני לקוחות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew" dir="rtl">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight rtl-text-right">ניהול לקוחות</h1>
            <p className="text-muted-foreground text-mobile-sm md:text-base rtl-text-right">ניהול לקוחות וספקים</p>
          </div>
          <Button className="w-full sm:w-auto min-h-button font-hebrew">
            <UserPlus className="h-4 w-4 ml-2" />
            הוספת לקוח
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="חיפוש לקוחות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
              className="text-right min-h-input prevent-zoom"
              dir="rtl"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filters.status || ""} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, status: value as any }))
            }>
              <SelectTrigger className="w-40 font-hebrew">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">הכל</SelectItem>
                <SelectItem value="active">פעיל</SelectItem>
                <SelectItem value="blocked">חסום</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.role || ""} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, role: value as any }))
            }>
              <SelectTrigger className="w-40 font-hebrew">
                <SelectValue placeholder="תפקיד" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">הכל</SelectItem>
                <SelectItem value="client">לקוח</SelectItem>
                <SelectItem value="supplier">ספק</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="font-hebrew min-h-button">
              <Filter className="h-4 w-4 ml-2" />
              סינון
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="responsive-grid-2 md:responsive-grid-4">
        <Card className="mobile-card">
          <CardContent className="p-3 md:p-6">
            <div className="text-lg md:text-2xl font-bold text-right">{stats.total.toLocaleString()}</div>
            <p className="text-mobile-xs md:text-sm font-medium text-muted-foreground text-right">סה״כ לקוחות</p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardContent className="p-3 md:p-6">
            <div className="text-lg md:text-2xl font-bold text-right">{stats.suppliers.toLocaleString()}</div>
            <p className="text-mobile-xs md:text-sm font-medium text-muted-foreground text-right">ספקים</p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardContent className="p-3 md:p-6">
            <div className="text-lg md:text-2xl font-bold text-right">{stats.clients.toLocaleString()}</div>
            <p className="text-mobile-xs md:text-sm font-medium text-muted-foreground text-right">לקוחות</p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardContent className="p-3 md:p-6">
            <div className="text-lg md:text-2xl font-bold text-right text-red-600">{stats.blocked.toLocaleString()}</div>
            <p className="text-mobile-xs md:text-sm font-medium text-muted-foreground text-right">חסומים</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Customer Cards */}
      <div className="block md:hidden space-y-3">
        {customers.map((customer) => (
          <Card key={customer.id} className="mobile-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-right truncate">{customer.full_name || 'משתמש'}</h3>
                    {getRoleBadge(customer.role)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 text-right">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-right">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span>הצטרף: {formatDate(customer.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-right">
                      <ShoppingCart className="h-3 w-3 flex-shrink-0" />
                      <span>{customer.orders_count || 0} הזמנות</span>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <MessageSquare className="h-3 w-3 flex-shrink-0" />
                      <span>{customer.complaints_count || 0} תלונות</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    {getStatusBadge(customer)}
                    <span className="text-xs text-muted-foreground">
                      פעיל: {formatDate(customer.updated_at)}
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
                    <DropdownMenuItem 
                      className="font-hebrew text-right"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setComplaintDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 ml-2" />
                      ניהול תלונות
                    </DropdownMenuItem>
                    {customer.is_blocked ? (
                      <DropdownMenuItem 
                        className="font-hebrew text-right"
                        onClick={() => handleBlockCustomer(customer, false)}
                      >
                        <CheckCircle className="h-4 w-4 ml-2" />
                        ביטול חסימה
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem 
                        className="text-red-600 font-hebrew text-right"
                        onClick={() => handleBlockCustomer(customer, true)}
                      >
                        <Ban className="h-4 w-4 ml-2" />
                        חסימה
                      </DropdownMenuItem>
                    )}
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
            <CardTitle className="text-right font-hebrew">רשימת לקוחות</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="table-mobile-wrapper">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">לקוח</TableHead>
                <TableHead className="text-right">תפקיד</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">הצטרפות</TableHead>
                <TableHead className="text-right">הזמנות</TableHead>
                <TableHead className="text-right">תלונות</TableHead>
                <TableHead className="text-right">פעיל לאחרונה</TableHead>
                <TableHead className="w-12 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{customer.full_name || 'משתמש'}</div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{getRoleBadge(customer.role)}</TableCell>
                  <TableCell className="text-right">{getStatusBadge(customer)}</TableCell>
                  <TableCell className="text-right">{formatDate(customer.created_at)}</TableCell>
                  <TableCell className="text-right">{customer.orders_count || 0}</TableCell>
                  <TableCell className="text-right">{customer.complaints_count || 0}</TableCell>
                  <TableCell className="text-right">{formatDate(customer.updated_at)}</TableCell>
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
                        <DropdownMenuItem 
                          className="font-hebrew text-right"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setComplaintDialogOpen(true);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 ml-2" />
                          ניהול תלונות
                        </DropdownMenuItem>
                        {customer.is_blocked ? (
                          <DropdownMenuItem 
                            className="font-hebrew text-right"
                            onClick={() => handleBlockCustomer(customer, false)}
                          >
                            <CheckCircle className="h-4 w-4 ml-2" />
                            ביטול חסימה
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            className="text-red-600 font-hebrew text-right"
                            onClick={() => handleBlockCustomer(customer, true)}
                          >
                            <Ban className="h-4 w-4 ml-2" />
                            חסימה
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="font-hebrew"
          >
            הקודם
          </Button>
          <span className="font-hebrew">
            עמוד {currentPage} מתוך {totalPages}
          </span>
          <Button 
            variant="outline" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="font-hebrew"
          >
            הבא
          </Button>
        </div>
      )}

      {/* Block Customer Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent className="font-hebrew" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">חסימת לקוח</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-right">סיבה לחסימה</Label>
              <Textarea 
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="הזן סיבה לחסימה..."
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={confirmBlock} disabled={!blockReason.trim()}>
              חסום לקוח
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complaint Management Dialog */}
      <Dialog open={complaintDialogOpen} onOpenChange={setComplaintDialogOpen}>
        <DialogContent className="font-hebrew max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">ניהול תלונות - {selectedCustomer?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {complaints && complaints.length > 0 ? (
              <div className="space-y-2">
                {complaints.map((complaint) => (
                  <Card key={complaint.id} className="p-4">
                    <div className="space-y-2 text-right">
                      <div className="flex justify-between items-center">
                        <Badge variant={complaint.status === 'resolved' ? 'default' : 'secondary'}>
                          {complaint.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(complaint.created_at)}
                        </span>
                      </div>
                      <h4 className="font-medium">{complaint.title}</h4>
                      <p className="text-sm text-muted-foreground">{complaint.description}</p>
                      {complaint.admin_notes && (
                        <div className="bg-muted p-2 rounded">
                          <p className="text-sm font-medium">הערות מנהל:</p>
                          <p className="text-sm">{complaint.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">אין תלונות עבור לקוח זה</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComplaintDialogOpen(false)}>
              סגור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}