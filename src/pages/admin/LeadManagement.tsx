import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  Eye, 
  Clock, 
  CheckCircle, 
  Star, 
  Phone, 
  Mail, 
  MapPin,
  TrendingUp,
  Target,
  Calendar,
  AlertCircle
} from "lucide-react";
import { PageBoundary } from '@/components/system/PageBoundary';
import { EmptyState } from '@/components/ui/empty-state';
import { useAdminLeads, useLeadMutations, useAllSuppliers, useLeadRealtimeSubscription } from '@/hooks/useAdminLeads';
import { EnhancedLead, LeadFilters, PaginationParams, LEAD_STATUS_LABELS } from '@/types/admin';

// Helper function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

function LeadManagementContent({ 
  leads, 
  isLoading 
}: { 
  leads: EnhancedLead[];
  isLoading: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (lead.contact_email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-hebrew" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ניהול לידים</h1>
          <p className="text-muted-foreground">
            ניהול ומעקב אחר לקוחות פוטנציאליים והזדמנויות מכירה
          </p>
        </div>
        <Button>
          <Users className="h-4 w-4 ml-2" />
          לקוח חדש
        </Button>
      </div>

      {/* סטטיסטיקות מהירות */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לידים חדשים</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.filter(l => l.status === 'new').length}</div>
            <p className="text-xs text-muted-foreground">מהשבוע הנוכחי</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">שיעור המרה</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">מכלל הלידים</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ערך צינור</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{(leads.length * 25000).toLocaleString('he-IL')}</div>
            <p className="text-xs text-muted-foreground">הערכת ערך כולל</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לידים חמים</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.filter(l => l.priority === 'high').length}</div>
            <p className="text-xs text-muted-foreground">דורשים טיפול מיידי</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">הכל</TabsTrigger>
            <TabsTrigger value="new">חדשים</TabsTrigger>
            <TabsTrigger value="contacted">ניצרו קשר</TabsTrigger>
            <TabsTrigger value="qualified">מוכשרים</TabsTrigger>
            <TabsTrigger value="hot">לידים חמים</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי שם, אימייל או קטגוריה..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 w-80"
              />
            </div>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {filteredLeads.length === 0 ? (
            <EmptyState
              icon={Users}
              title="אין לידים"
              description="לא נמצאו לידים התואמים לחיפוש שלכם."
            />
          ) : (
            <div className="grid gap-4">
              {filteredLeads.map((lead) => (
                  <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{(lead.name || 'L')[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-lg">{lead.name || 'לקוח ללא שם'}</h3>
                            <Badge>
                              {LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS] || lead.status}
                            </Badge>
                            <Badge>
                              {lead.priority || 'רגיל'}
                            </Badge>
                            <Badge>
                              {lead.source || 'לא צוין'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{lead.contact_email || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{lead.contact_phone || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(lead.created_at).toLocaleDateString('he-IL')}</span>
                            </div>
                          </div>

                          {lead.notes && (
                            <div className="text-sm text-muted-foreground">
                              <p><span className="font-medium">הערות: </span>{lead.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 ml-2" />
                          התקשר
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 ml-2" />
                          צפייה
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <div className="grid gap-4">
              {filteredLeads
                .filter(lead => lead.status === "new")
                .map((lead) => (
                  <Card key={lead.id} className="hover:shadow-lg transition-shadow border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 space-x-reverse flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={lead.customerAvatar} />
                            <AvatarFallback>{lead.customerName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-lg">{lead.customerName}</h3>
                              <Badge className="bg-blue-100 text-blue-800">חדש</Badge>
                              <Badge className={getPriorityBadge(lead.priority)}>
                                {lead.priority === "hot" ? "חם" :
                                 lead.priority === "high" ? "גבוה" :
                                 lead.priority === "medium" ? "בינוני" : "נמוך"}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">קטגוריה: </span>
                                <span>{lead.category}</span>
                              </div>
                              <div>
                                <span className="font-medium">תקציב: </span>
                                <span>{lead.budget}</span>
                              </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              <p>{lead.notes}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-left">
                            <div className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>
                              {lead.score}
                            </div>
                            <div className="text-xs text-muted-foreground">ציון איכות</div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm">
                              <Phone className="h-4 w-4 ml-2" />
                              התקשר עכשיו
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 ml-2" />
                              צפייה
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
        </TabsContent>

        <TabsContent value="contacted" className="space-y-4">
          <div className="grid gap-4">
              {filteredLeads
                .filter(lead => lead.status === "contacted")
                .map((lead) => (
                  <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 space-x-reverse flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={lead.customerAvatar} />
                            <AvatarFallback>{lead.customerName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-lg">{lead.customerName}</h3>
                              <Badge className="bg-yellow-100 text-yellow-800">ניצר קשר</Badge>
                              <Badge className={getPriorityBadge(lead.priority)}>
                                {lead.priority === "hot" ? "חם" :
                                 lead.priority === "high" ? "גבוה" :
                                 lead.priority === "medium" ? "בינוני" : "נמוך"}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">קטגוריה: </span>
                                <span>{lead.category}</span>
                              </div>
                              <div>
                                <span className="font-medium">אחראי: </span>
                                <span>{lead.assignedTo || 'לא נקבע'}</span>
                              </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              <p>קשר אחרון: {lead.lastContact || 'לא עודכן'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-left">
                            <div className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>
                              {lead.score}
                            </div>
                            <div className="text-xs text-muted-foreground">ציון איכות</div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 ml-2" />
                              צפייה
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="qualified" className="space-y-4">
          <div className="grid gap-4">
            {filteredLeads
              .filter(lead => lead.status === "qualified")
              .map((lead) => (
                <Card key={lead.id} className="hover:shadow-lg transition-shadow border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={lead.customerAvatar} />
                          <AvatarFallback>{lead.customerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-lg">{lead.customerName}</h3>
                            <Badge className="bg-purple-100 text-purple-800">מוכשר</Badge>
                            <Badge className={getPriorityBadge(lead.priority)}>
                              {lead.priority === "hot" ? "חם" :
                               lead.priority === "high" ? "גבוה" :
                               lead.priority === "medium" ? "בינוני" : "נמוך"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">קטגוריה: </span>
                              <span>{lead.category}</span>
                            </div>
                            <div>
                              <span className="font-medium">תקציב: </span>
                              <span>{lead.budget}</span>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <p>אחראי: {lead.assignedTo || 'לא נקבע'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-left">
                          <div className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>
                            {lead.score}
                          </div>
                          <div className="text-xs text-muted-foreground">ציון איכות</div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm">
                            <CheckCircle className="h-4 w-4 ml-2" />
                            המר ללקוח
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 ml-2" />
                            צפייה
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="hot" className="space-y-4">
          <div className="grid gap-4">
            {filteredLeads
              .filter(lead => lead.priority === "hot")
              .map((lead) => (
                <Card key={lead.id} className="hover:shadow-lg transition-shadow border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={lead.customerAvatar} />
                          <AvatarFallback>{lead.customerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-lg">{lead.customerName}</h3>
                            <Badge className="bg-red-100 text-red-800">🔥 חם</Badge>
                            <Badge className={getStatusBadge(lead.status)}>
                              {lead.status === "new" ? "חדש" :
                               lead.status === "contacted" ? "ניצר קשר" :
                               lead.status === "qualified" ? "מוכשר" :
                               lead.status === "converted" ? "הומר" : "אבד"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">קטגוריה: </span>
                              <span>{lead.category}</span>
                            </div>
                            <div>
                              <span className="font-medium">תקציב: </span>
                              <span>{lead.budget}</span>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <p><span className="font-medium">הערות: </span>{lead.notes}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-left">
                          <div className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>
                            {lead.score}
                          </div>
                          <div className="text-xs text-muted-foreground">ציון איכות</div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            <Phone className="h-4 w-4 ml-2" />
                            דחוף - התקשר
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 ml-2" />
                            צפייה
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function LeadManagement() {
  const [filters, setFilters] = useState<LeadFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 100,
    offset: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks
  const { leads, totalCount, isLoading, error, refetch } = useAdminLeads(filters, pagination);
  useLeadRealtimeSubscription();

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setFilters(prev => ({ ...prev, search: term || undefined }));
      setPagination(prev => ({ ...prev, page: 1, offset: 0 }));
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  return (
    <PageBoundary 
      isLoading={isLoading}
      isError={!!error}
      error={error}
      onRetry={refetch}
      isEmpty={leads.length === 0 && !isLoading}
      empty={
        <EmptyState
          icon={Users}
          title="אין לידים"
          description="לא נמצאו לידים במערכת."
        />
      }
    >
      <LeadManagementContent leads={leads} isLoading={isLoading} />
    </PageBoundary>
  );
}