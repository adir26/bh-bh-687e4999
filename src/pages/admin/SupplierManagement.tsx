import React, { useState, useCallback } from 'react';
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle, UserCheck, Filter, Plus, Upload, Download, RefreshCw, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminSuppliers, useSupplierMutations, useSupplierRealtimeSubscription } from '@/hooks/useAdminSuppliers';
import { useAllCategories } from '@/hooks/useAdminCategories';
import { 
  SupplierFilters, 
  PaginationParams,
  STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
  VISIBILITY_LABELS,
  EnhancedCompany
} from '@/types/admin';
import { cn } from '@/lib/utils';
import { PageBoundary } from '@/components/system/PageBoundary';

// Helper function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

const SupplierManagement = () => {
  const { toast } = useToast();
  
  // State for filters and pagination
  const [filters, setFilters] = useState<SupplierFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 25,
    offset: 0
  });
  
  // State for UI interactions
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<EnhancedCompany | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  
  // Custom hooks
  const { suppliers, totalCount, totalPages, isLoading, refetch } = useAdminSuppliers(filters, pagination);
  const { data: categories } = useAllCategories();
  const { 
    updateSupplierStatus, 
    updateSupplierVisibility, 
    updateVerificationStatus, 
    bulkUpdateSuppliers 
  } = useSupplierMutations();
  
  // Real-time subscription
  useSupplierRealtimeSubscription();

  // Debounced search - fixed to prevent infinite loops
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm || undefined }));
      setPagination(prev => ({ ...prev, page: 1, offset: 0 }));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Helper functions
  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'bg-success/10 text-success hover:bg-success/20',
      pending: 'bg-warning/10 text-warning hover:bg-warning/20', 
      suspended: 'bg-destructive/10 text-destructive hover:bg-destructive/20'
    };
    return (
      <Badge className={cn(variants[status as keyof typeof variants])}>
        {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
      </Badge>
    );
  };

  const getVerificationBadge = (status: string) => {
    const variants = {
      verified: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      rejected: 'bg-destructive/10 text-destructive',
      unverified: 'bg-muted/10 text-muted-foreground'
    };
    return (
      <Badge className={cn(variants[status as keyof typeof variants])}>
        {VERIFICATION_STATUS_LABELS[status as keyof typeof VERIFICATION_STATUS_LABELS] || status}
      </Badge>
    );
  };

  const handleFilterChange = (key: keyof SupplierFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1, offset: 0 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage,
      offset: (newPage - 1) * prev.limit
    }));
  };

  const handleSelectSupplier = (supplierId: string, selected: boolean) => {
    setSelectedSuppliers(prev => 
      selected 
        ? [...prev, supplierId]
        : prev.filter(id => id !== supplierId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedSuppliers(selected ? suppliers.map(s => s.id) : []);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedSuppliers.length === 0) {
      toast({
        title: 'שגיאה',
        description: 'נא לבחור לפחות ספק אחד',
        variant: 'destructive',
      });
      return;
    }

    let updates: any = {};
    switch (action) {
      case 'approve':
        updates.status = 'approved';
        break;
      case 'suspend':
        updates.status = 'suspended';
        break;
      case 'make_public':
        updates.is_public = true;
        break;
      case 'make_private':
        updates.is_public = false;
        break;
      case 'feature':
        updates.featured = true;
        break;
      case 'unfeature':
        updates.featured = false;
        break;
    }

    try {
      await bulkUpdateSuppliers.mutateAsync({
        ids: selectedSuppliers,
        updates
      });
      setSelectedSuppliers([]);
    } catch (error) {
      console.error('Bulk action error:', error);
    }
  };

  const handleVerificationAction = async (supplierId: string, status: 'verified' | 'rejected') => {
    try {
      await updateVerificationStatus.mutateAsync({
        id: supplierId,
        verification_status: status,
        verification_notes: verificationNotes
      });
      setShowVerificationDialog(false);
      setVerificationNotes('');
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Verification action error:', error);
    }
  };

  // Statistics calculations
  const approvedCount = suppliers.filter(s => s.status === 'approved').length;
  const pendingCount = suppliers.filter(s => s.status === 'pending').length;
  const avgRating = suppliers.reduce((acc, s) => acc + (s.rating || 0), 0) / suppliers.length || 0;

  return (
    <AdminLayout>
      <PageBoundary
        isLoading={isLoading}
        isError={false}
        isEmpty={!isLoading && suppliers.length === 0}
        empty={
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">לא נמצאו ספקים</p>
          </Card>
        }
      >
        <div className="space-y-6 font-hebrew" dir="rtl">
        {/* Header */}
        <div className="text-right">
          <h1 className="text-3xl font-bold tracking-tight">ניהול ספקים</h1>
          <p className="text-muted-foreground">ניהול וחיפוש ספקים רשומים במערכת</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">סה״כ ספקים</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{totalCount.toLocaleString('he-IL')}</div>
              <p className="text-xs text-muted-foreground text-right">ספקים רשומים במערכת</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">ספקים מאושרים</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{approvedCount.toLocaleString('he-IL')}</div>
              <p className="text-xs text-muted-foreground text-right">
                {totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0}% מהכלל
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">ממתינים לאישור</CardTitle>
              <XCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{pendingCount.toLocaleString('he-IL')}</div>
              <p className="text-xs text-muted-foreground text-right">דורש טיפול</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">דירוג ממוצע</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground text-right">מתוך 5 כוכבים</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
              <div className="flex-1 max-w-md">
                <SearchInput
                  placeholder="חיפוש ספקים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm("")}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="סטטוס" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסטטוסים</SelectItem>
                    <SelectItem value="approved">מאושר</SelectItem>
                    <SelectItem value="pending">ממתין</SelectItem>
                    <SelectItem value="suspended">מושעה</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.verification_status || 'all'} onValueChange={(value) => handleFilterChange('verification_status', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="אימות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל סטטוסי האימות</SelectItem>
                    <SelectItem value="verified">מאומת</SelectItem>
                    <SelectItem value="pending">ממתין לאימות</SelectItem>
                    <SelectItem value="rejected">נדחה</SelectItem>
                    <SelectItem value="unverified">לא מאומת</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.is_public === undefined ? 'all' : filters.is_public ? 'public' : 'private'} onValueChange={(value) => handleFilterChange('is_public', value === 'all' ? undefined : value === 'public')}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="נראות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל רמות הנראות</SelectItem>
                    <SelectItem value="public">ציבורי</SelectItem>
                    <SelectItem value="private">מוסתר</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("h-4 w-4 ml-2", isLoading && "animate-spin")} />
                  רענן
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Bulk Actions */}
        {selectedSuppliers.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-right">
                <span className="text-sm text-muted-foreground">
                  נבחרו {selectedSuppliers.length} ספקים:
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleBulkAction('approve')}>אישור</Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('suspend')}>השעיה</Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('make_public')}>הפוך לציבורי</Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('make_private')}>הסתר</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suppliers Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : suppliers.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                לא נמצאו ספקים התואמים לקריטריונים
              </div>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="block md:hidden p-4 space-y-4">
                  {suppliers.map((supplier) => (
                    <Card key={supplier.id} className="p-4">
                      <div className="space-y-3 text-right">
                        <div className="flex justify-between items-start">
                          <Checkbox
                            checked={selectedSuppliers.includes(supplier.id)}
                            onCheckedChange={(checked) => handleSelectSupplier(supplier.id, checked as boolean)}
                          />
                          <div className="flex gap-2">
                            {getStatusBadge(supplier.status || 'pending')}
                            {getVerificationBadge(supplier.verification_status || 'unverified')}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-lg">{supplier.name}</h3>
                          <p className="text-sm text-muted-foreground">{supplier.owner_profile?.full_name}</p>
                        </div>
                        
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p><span className="font-medium">אימייל:</span> {supplier.email}</p>
                          <p><span className="font-medium">טלפון:</span> {supplier.phone}</p>
                          <p><span className="font-medium">אזור:</span> {supplier.area || 'לא צוין'}</p>
                          <p><span className="font-medium">מוצרים:</span> {supplier.product_count || 0}</p>
                          <p><span className="font-medium">דירוג:</span> {supplier.rating?.toFixed(1) || 'לא דורג'}</p>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <MoreHorizontal className="h-4 w-4 ml-2" />
                              פעולות
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 ml-2" />
                              צפייה בפרטים
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => updateSupplierStatus.mutate({
                                id: supplier.id,
                                status: supplier.status === 'approved' ? 'suspended' : 'approved'
                              })}
                            >
                              {supplier.status === 'approved' ? (
                                <>
                                  <XCircle className="h-4 w-4 ml-2" />
                                  השעה
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 ml-2" />
                                  אשר
                                </>
                              )}
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
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedSuppliers.length === suppliers.length && suppliers.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="text-right">חברה</TableHead>
                        <TableHead className="text-right">בעלים</TableHead>
                        <TableHead className="text-right">סטטוס</TableHead>
                        <TableHead className="text-right">אימות</TableHead>
                        <TableHead className="text-right">נראות</TableHead>
                        <TableHead className="text-right">קטגוריות</TableHead>
                        <TableHead className="text-right">מוצרים</TableHead>
                        <TableHead className="text-right">דירוג</TableHead>
                        <TableHead className="text-right">נוצר</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedSuppliers.includes(supplier.id)}
                              onCheckedChange={(checked) => handleSelectSupplier(supplier.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div>
                              <div className="font-medium">{supplier.name}</div>
                              <div className="text-sm text-muted-foreground">{supplier.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>
                              <div className="font-medium">{supplier.owner_profile?.full_name}</div>
                              <div className="text-sm text-muted-foreground">{supplier.owner_profile?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{getStatusBadge(supplier.status || 'pending')}</TableCell>
                          <TableCell className="text-right">{getVerificationBadge(supplier.verification_status || 'unverified')}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={supplier.is_public ? 'default' : 'secondary'}>
                              {supplier.is_public ? 'ציבורי' : 'מוסתר'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap gap-1 justify-end">
                              {supplier.categories?.slice(0, 2).map((cat) => (
                                <Badge key={cat.category.id} variant="outline" className="text-xs">
                                  {cat.category.name}
                                </Badge>
                              ))}
                              {(supplier.categories?.length || 0) > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(supplier.categories?.length || 0) - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{supplier.product_count || 0}</TableCell>
                          <TableCell className="text-right">
                            {supplier.rating ? supplier.rating.toFixed(1) : 'לא דורג'}
                          </TableCell>
                          <TableCell className="text-right">
                            {new Date(supplier.created_at).toLocaleDateString('he-IL')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 ml-2" />
                                  צפייה בפרטים
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => updateSupplierStatus.mutate({
                                    id: supplier.id,
                                    status: supplier.status === 'approved' ? 'suspended' : 'approved'
                                  })}
                                >
                                  {supplier.status === 'approved' ? (
                                    <>
                                      <XCircle className="h-4 w-4 ml-2" />
                                      השעה
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 ml-2" />
                                      אשר
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateSupplierVisibility.mutate({
                                    id: supplier.id,
                                    is_public: !supplier.is_public
                                  })}
                                >
                                  {supplier.is_public ? (
                                    <>
                                      <XCircle className="h-4 w-4 ml-2" />
                                      הסתר
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 ml-2" />
                                      הפוך לציבורי
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedSupplier(supplier);
                                    setShowVerificationDialog(true);
                                  }}
                                >
                                  <UserCheck className="h-4 w-4 ml-2" />
                                  נהל אימות
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              מציג {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, totalCount)} מתוך {totalCount} ספקים
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                הקודם
              </Button>
              <span className="px-3 py-2 text-sm">
                עמוד {pagination.page} מתוך {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                הבא
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageBoundary>

    {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <DialogContent className="font-hebrew" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">ניהול אימות ספק</DialogTitle>
              <DialogDescription className="text-right">
                עדכון סטטוס האימות עבור {selectedSupplier?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="verification-notes" className="text-right block">הערות אימות</Label>
                <Textarea
                  id="verification-notes"
                  placeholder="הוסף הערות על תהליך האימות..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="text-right"
                  dir="rtl"
                />
              </div>
            </div>
            
            <DialogFooter className="flex gap-2 justify-start">
              <Button
                variant="outline"
                onClick={() => selectedSupplier && handleVerificationAction(selectedSupplier.id, 'rejected')}
              >
                דחה אימות
              </Button>
              <Button
                onClick={() => selectedSupplier && handleVerificationAction(selectedSupplier.id, 'verified')}
              >
                אמת ספק
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </AdminLayout>
  );
};

export default SupplierManagement;