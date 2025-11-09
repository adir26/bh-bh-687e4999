
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Filter, MessageSquare, Phone, FileText, X, Calendar, MapPin, User, AlertCircle, Users, Plus, Trash2 } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { showToast } from '@/utils/toast';
import { leadsService, Lead, LeadStatus } from '@/services/leadsService';
import { useAuth } from '@/contexts/AuthContext';
import { PageBoundary } from '@/components/system/PageBoundary';
import { EmptyState } from '@/components/ui/empty-state';
import { AddLeadDialog } from '@/components/crm/AddLeadDialog';
import { LeadDetailDialog } from '@/components/crm/LeadDetailDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useQueryClient } from '@tanstack/react-query';

function LeadManagementContent({ leads, viewMode, setViewMode, statusFilter, setStatusFilter, searchTerm, setSearchTerm }: {
  leads: Lead[];
  viewMode: 'cards' | 'table';
  setViewMode: (v: 'cards' | 'table') => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addLeadDialogOpen, setAddLeadDialogOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleCall = (phone: string) => {
    if (!phone) {
      showToast.error('מספר טלפון לא זמין');
      return;
    }
    
    // Format phone number for tel: link
    const formattedPhone = phone.startsWith('+') ? phone : `+972${phone.replace(/^0/, '')}`;
    window.location.href = `tel:${formattedPhone}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'no_answer': return 'bg-yellow-100 text-yellow-800';
      case 'followup': return 'bg-blue-100 text-blue-800';
      case 'no_answer_x5': return 'bg-orange-100 text-orange-800';
      case 'not_relevant': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'denies_contact': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'חדש';
      case 'no_answer': return 'אין מענה';
      case 'followup': return 'פולואפ';
      case 'no_answer_x5': return 'אין מענה x5';
      case 'not_relevant': return 'לא רלוונטי';
      case 'error': return 'טעות';
      case 'denies_contact': return 'מכחיש פנייה';
      default: return status;
    }
  };

  const getSourceLabel = (sourceKey: string | null | undefined) => {
    if (!sourceKey) return '-';
    
    const labels: Record<string, string> = {
      'website': 'אתר',
      'referral': 'המלצה',
      'social_media': 'מדיה חברתית',
      'advertising': 'פרסום',
      'direct': 'ישיר',
      'facebook_paid': 'פייסבוק ממומן',
      'facebook_organic': 'פייסבוק אורגני',
      'whatsapp': 'וואטסאפ',
      'word_of_mouth': 'פה לאוזן',
      'other': 'אחר'
    };
    
    return labels[sourceKey] || sourceKey;
  };

  const handleDeleteClick = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setLeadToDelete({ id: lead.id, name: lead.name || 'לקוח ללא שם' });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;

    setDeleteDialogOpen(false);

    // Optimistic update - remove from cache
    queryClient.setQueriesData(
      { 
        predicate: (query) => 
          Array.isArray(query.queryKey) && query.queryKey[0] === 'supplier-leads' 
      },
      (oldData: any) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter((lead: any) => lead.id !== leadToDelete.id);
      }
    );
    // Also update main leads listings
    queryClient.setQueriesData(
      { 
        predicate: (query) => 
          Array.isArray(query.queryKey) && query.queryKey[0] === 'leads' 
      },
      (oldData: any) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter((lead: any) => lead.id !== leadToDelete.id);
      }
    );

    try {
      await leadsService.deleteLead(leadToDelete.id);
      
      queryClient.invalidateQueries({ 
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'supplier-leads' 
      });
      queryClient.invalidateQueries({ 
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'leads' 
      });
      
      showToast.success('הליד נמחק בהצלחה');
    } catch (error: any) {
      const isRLSError = error?.message?.includes('row-level security');
      const isFKError = error?.code === '23503' || error?.message?.includes('foreign key') || error?.message?.includes('orders_lead_id_fkey');
      showToast.error(
        isRLSError 
          ? 'אין לך הרשאה למחוק את הליד הזה' 
          : isFKError
            ? 'הליד מקושר להזמנות. פירקתי את הקישור במערכת, נסה שוב.'
            : 'שגיאה במחיקת הליד. נסה שוב.'
      );
      
      queryClient.invalidateQueries({ 
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'supplier-leads' 
      });
      queryClient.invalidateQueries({ 
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'leads' 
      });
    }
    
    setLeadToDelete(null);
  };

  

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/supplier/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                חזור לדשבורד
              </Button>
              <h1 className="text-2xl font-bold text-foreground">ניהול לידים</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="blue"
                size="sm"
                onClick={() => setAddLeadDialogOpen(true)}
              >
                <Plus className="w-4 h-4 ml-1" />
                הוסף ליד
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                כרטיסים
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                טבלה
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-nav-safe">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput
              placeholder="חפש לפי שם לקוח או שירות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="סנן לפי סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="new">חדש</SelectItem>
              <SelectItem value="no_answer">אין מענה</SelectItem>
              <SelectItem value="followup">פולואפ</SelectItem>
              <SelectItem value="no_answer_x5">אין מענה x5</SelectItem>
              <SelectItem value="not_relevant">לא רלוונטי</SelectItem>
              <SelectItem value="error">טעות</SelectItem>
              <SelectItem value="denies_contact">מכחיש פנייה</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        {(() => {
          const stats = {
            new: leads.filter(l => l.status === 'new').length,
            inProgress: leads.filter(l => l.status === 'no_answer' || l.status === 'followup').length,
            closed: leads.filter(l => l.status === 'not_relevant' || l.status === 'error' || l.status === 'denies_contact').length,
            total: leads.length
          };

          const conversionRate = stats.total > 0 
            ? Math.round((stats.closed / stats.total) * 100) 
            : 0;

          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.new}</div>
                  <div className="text-sm text-muted-foreground">לידים חדשים</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                  <div className="text-sm text-muted-foreground">בטיפול</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
                  <div className="text-sm text-muted-foreground">נסגרו</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{conversionRate}%</div>
                  <div className="text-sm text-muted-foreground">שיעור המרה</div>
                </CardContent>
              </Card>
            </div>
          );
        })()}

        {/* Leads Display */}
        {leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="אין לידים"
            description="לא נמצאו לידים. הוסף ליד חדש כדי להתחיל."
            action={{
              label: 'הוסף ליד חדש',
              onClick: () => setAddLeadDialogOpen(true)
            }}
          />
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {leads.map((lead) => (
              <Card 
                key={lead.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedLeadId(lead.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                     <div className="space-y-1">
                       <CardTitle className="text-lg flex items-center gap-2">
                         <User className="w-4 h-4" />
                         {lead.name || 'לקוח ללא שם'}
                       </CardTitle>
                       <div className="flex items-center gap-4 text-sm text-muted-foreground">
                         {lead.contact_phone && (
                           <a 
                             href={`tel:${lead.contact_phone.startsWith('+') ? lead.contact_phone : `+972${lead.contact_phone.replace(/^0/, '')}`}`}
                             className="flex items-center gap-1 hover:text-primary transition-colors"
                           >
                             <Phone className="w-3 h-3" />
                             {lead.contact_phone}
                           </a>
                         )}
                         <span className="flex items-center gap-1">
                           <Calendar className="w-3 h-3" />
                           {new Date(lead.created_at).toLocaleDateString('he-IL')}
                         </span>
                       </div>
                     </div>
                    <Badge className={getStatusColor(lead.status)}>
                      {getStatusText(lead.status)}
                    </Badge>
                  </div>
                </CardHeader>
                  <CardContent className="space-y-4">
                   {lead.campaign_name && (
                     <div>
                       <h4 className="font-medium text-sm text-muted-foreground mb-1">קמפיין:</h4>
                       <p className="font-medium text-primary">{lead.campaign_name}</p>
                     </div>
                   )}
                   {lead.source_key && (
                     <div>
                       <h4 className="font-medium text-sm text-muted-foreground mb-1">מקור:</h4>
                       <p className="font-medium">{getSourceLabel(lead.source_key)}</p>
                     </div>
                   )}
                   {lead.last_activity_note && (
                     <div>
                       <h4 className="font-medium text-sm text-muted-foreground mb-1">הערה אחרונה:</h4>
                       <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                         {lead.last_activity_note}
                       </p>
                       {lead.last_activity_date && (
                         <p className="text-xs text-muted-foreground mt-1">
                           {new Date(lead.last_activity_date).toLocaleDateString('he-IL', {
                             day: '2-digit',
                             month: '2-digit',
                             year: 'numeric',
                             hour: '2-digit',
                             minute: '2-digit'
                           })}
                         </p>
                       )}
                     </div>
                   )}
                   <div className="flex gap-2 pt-2">
                    <Button 
                      variant="blue" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/supplier/quotes');
                      }}
                    >
                      <FileText className="w-4 h-4 ml-1" />
                      שלח הצעת מחיר
                    </Button>
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={(e) => {
                         e.stopPropagation();
                         handleCall(lead.contact_phone);
                       }}
                       disabled={!lead.contact_phone}
                     >
                       <Phone className="w-4 h-4" />
                     </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast.comingSoon('צ\'אט עם לקוח');
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={(e) => handleDeleteClick(e, lead)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                       <th className="text-right p-4 font-medium">שם לקוח</th>
                       <th className="text-right p-4 font-medium">תאריך</th>
                       <th className="text-right p-4 font-medium">סטטוס</th>
                       <th className="text-right p-4 font-medium">טלפון</th>
                       <th className="text-right p-4 font-medium">מקור</th>
                       <th className="text-right p-4 font-medium">קמפיין</th>
                       <th className="text-right p-4 font-medium">פעולות</th>
                    </tr>
                  </thead>
                   <tbody>
                     {leads.map((lead) => (
                       <tr 
                         key={lead.id} 
                         className="border-b hover:bg-muted/50 cursor-pointer"
                         onClick={() => setSelectedLeadId(lead.id)}
                       >
                         <td className="p-4 font-medium">{lead.name || 'לקוח ללא שם'}</td>
                         <td className="p-4 text-muted-foreground">
                           {new Date(lead.created_at).toLocaleDateString('he-IL')}
                         </td>
                         <td className="p-4">
                           <Badge className={getStatusColor(lead.status)}>
                             {getStatusText(lead.status)}
                           </Badge>
                         </td>
                         <td className="p-4">
                           {lead.contact_phone ? (
                             <a 
                               href={`tel:${lead.contact_phone.startsWith('+') ? lead.contact_phone : `+972${lead.contact_phone.replace(/^0/, '')}`}`}
                               className="hover:text-primary transition-colors"
                             >
                               {lead.contact_phone}
                             </a>
                           ) : (
                             <span className="text-muted-foreground">לא זמין</span>
                           )}
                         </td>
                          <td className="p-4 text-muted-foreground">
                            {getSourceLabel(lead.source_key)}
                          </td>
                          <td className="p-4">
                            {lead.campaign_name ? (
                              <Badge variant="outline" className="font-normal">
                                {lead.campaign_name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </td>
                         <td className="p-4">
                           <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/supplier/quotes');
                              }}
                            >
                              <FileText className="w-3 h-3" />
                            </Button>
                             <Button 
                               variant="outline" 
                               size="sm"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleCall(lead.contact_phone);
                               }}
                               disabled={!lead.contact_phone}
                             >
                               <Phone className="w-3 h-3" />
                             </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                showToast.comingSoon('צ\'אט עם לקוח');
                              }}
                            >
                              <MessageSquare className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={(e) => handleDeleteClick(e, lead)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                           </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <AddLeadDialog open={addLeadDialogOpen} onOpenChange={setAddLeadDialogOpen} />
      <LeadDetailDialog 
        leadId={selectedLeadId} 
        open={!!selectedLeadId} 
        onOpenChange={(open) => !open && setSelectedLeadId(null)} 
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>האם למחוק את הליד?</AlertDialogTitle>
            <AlertDialogDescription>
              האם את/ה בטוח/ה שאת/ה רוצה למחוק את הליד של <strong>{leadToDelete?.name}</strong>?
              <br />
              פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              כן, מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function LeadManagement() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: leads = [], isLoading, error, refetch } = useQuery({
    queryKey: ['leads', user?.id, statusFilter, searchTerm],
    enabled: !!user?.id,
    queryFn: async ({ signal }) => {
      const data = await leadsService.listLeads(user!.id, {
        status: statusFilter === 'all' ? undefined : statusFilter as LeadStatus,
        search: searchTerm || undefined
      });
      return data;
    },
    retry: 1,
    staleTime: 30_000,
  });

  return (
    <PageBoundary 
      isLoading={isLoading}
      isError={!!error}
      error={error}
      onRetry={refetch}
    >
      <LeadManagementContent 
        leads={leads}
        viewMode={viewMode}
        setViewMode={setViewMode}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </PageBoundary>
  );
}
