import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  Eye, 
  Phone, 
  Mail,
  TrendingUp,
  Target,
  Calendar,
  Clock
} from "lucide-react";
import { PageBoundary } from '@/components/system/PageBoundary';
import { EmptyState } from '@/components/ui/empty-state';
import { useAdminLeads, useLeadRealtimeSubscription } from '@/hooks/useAdminLeads';
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
  leads 
}: { 
  leads: EnhancedLead[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (lead.contact_email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusText = LEAD_STATUS_LABELS[status as keyof typeof LEAD_STATUS_LABELS] || status;
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800",
      qualified: "bg-purple-100 text-purple-800",
      proposal_sent: "bg-orange-100 text-orange-800",
      converted: "bg-green-100 text-green-800",
      lost: "bg-red-100 text-red-800"
    };
    return <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>{statusText}</Badge>;
  };

  return (
    <div className="space-y-6 font-hebrew" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ניהול לידים</h1>
          <p className="text-muted-foreground">
            ניהול ומעקב אחר לקוחות פוטנציאליים והזדמנויות מכירה
          </p>
        </div>
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{(leads.length * 25000).toLocaleString('he-IL')}</div>
            <p className="text-xs text-muted-foreground">הערכת ערך כולל</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">בטיפול</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.filter(l => ['contacted', 'qualified', 'proposal_sent'].includes(l.status || '')).length}</div>
            <p className="text-xs text-muted-foreground">דורשים מעקב</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש לפי שם, אימייל..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right"
              dir="rtl"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Leads List */}
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
                        {getStatusBadge(lead.status || 'new')}
                        {lead.priority && (
                          <Badge variant="outline">{lead.priority}</Badge>
                        )}
                        {lead.source && (
                          <Badge variant="outline">{lead.source}</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        {lead.contact_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{lead.contact_email}</span>
                          </div>
                        )}
                        {lead.contact_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{lead.contact_phone}</span>
                          </div>
                        )}
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

                      {lead.last_contact_date && (
                        <div className="text-xs text-muted-foreground">
                          קשר אחרון: {new Date(lead.last_contact_date).toLocaleDateString('he-IL')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {lead.contact_phone && (
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 ml-2" />
                        התקשר
                      </Button>
                    )}
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
      <LeadManagementContent leads={leads} />
    </PageBoundary>
  );
}
