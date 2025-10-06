import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
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
import { supabase } from '@/integrations/supabase/client';
import { PageBoundary } from '@/components/system/PageBoundary';
import { EmptyState } from '@/components/ui/empty-state';

interface Lead {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAvatar?: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  priority: "low" | "medium" | "high" | "hot";
  source: "website" | "referral" | "ads" | "social" | "direct";
  category: string;
  budget: string;
  location: string;
  createdAt: string;
  lastContact?: string;
  assignedTo?: string;
  notes: string;
  score: number;
}

function LeadManagementContent({ leads }: { leads: Lead[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const getStatusBadge = (status: string) => {
    const variants = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800",
      qualified: "bg-purple-100 text-purple-800",
      converted: "bg-green-100 text-green-800",
      lost: "bg-red-100 text-red-800"
    };
    return variants[status as keyof typeof variants] || "";
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      hot: "bg-red-100 text-red-800"
    };
    return variants[priority as keyof typeof variants] || "";
  };

  const getSourceBadge = (source: string) => {
    const variants = {
      website: "bg-green-100 text-green-800",
      referral: "bg-purple-100 text-purple-800",
      ads: "bg-orange-100 text-orange-800",
      social: "bg-blue-100 text-blue-800",
      direct: "bg-gray-100 text-gray-800"
    };
    return variants[source as keyof typeof variants] || "";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
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
            <div className="text-2xl font-bold">₪{leads.length * 25000}</div>
            <p className="text-xs text-muted-foreground">הערכת ערך כולל</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לידים חמים</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.filter(l => l.priority === 'hot').length}</div>
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
                          <AvatarImage src={lead.customerAvatar} />
                          <AvatarFallback>{lead.customerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-lg">{lead.customerName}</h3>
                            <Badge className={getStatusBadge(lead.status)}>
                              {lead.status === "new" ? "חדש" :
                               lead.status === "contacted" ? "ניצר קשר" :
                               lead.status === "qualified" ? "מוכשר" :
                               lead.status === "converted" ? "הומר" : "אבד"}
                            </Badge>
                            <Badge className={getPriorityBadge(lead.priority)}>
                              {lead.priority === "hot" ? "חם" :
                               lead.priority === "high" ? "גבוה" :
                               lead.priority === "medium" ? "בינוני" : "נמוך"}
                            </Badge>
                            <Badge className={getSourceBadge(lead.source)}>
                              {lead.source === "website" ? "אתר" :
                               lead.source === "referral" ? "המלצה" :
                               lead.source === "ads" ? "פרסום" :
                               lead.source === "social" ? "רשתות חברתיות" : "ישיר"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{lead.customerEmail}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{lead.customerPhone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{lead.location}</span>
                            </div>
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

                          {lead.assignedTo && (
                            <div className="text-sm">
                              <span className="font-medium">אחראי: </span>
                              <span>{lead.assignedTo}</span>
                            </div>
                          )}

                          <div className="text-sm text-muted-foreground">
                            <p><span className="font-medium">הערות: </span>{lead.notes}</p>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>נוצר: {lead.createdAt}</span>
                            </div>
                            {lead.lastContact && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>קשר אחרון: {lead.lastContact}</span>
                              </div>
                            )}
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
                            <Phone className="h-4 w-4 ml-2" />
                            התקשר
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4 ml-2" />
                            שלח מייל
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: leads = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-leads', selectedStatus, searchQuery],
    queryFn: async ({ signal }) => {
      let query = supabase
        .from('leads')
        .select(`
          *,
          profiles!leads_client_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,contact_email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      return data?.map(lead => ({
        id: lead.id,
        customerName: lead.name || (lead.profiles && lead.profiles[0]?.full_name) || 'לקוח ללא שם',
        customerEmail: lead.contact_email || (lead.profiles && lead.profiles[0]?.email) || '',
        customerPhone: lead.contact_phone || '',
        customerAvatar: undefined,
        status: lead.status as Lead['status'],
        priority: (lead.priority || 'medium') as Lead['priority'],
        source: (lead.source || 'website') as Lead['source'],
        category: 'עיצוב פנים',
        budget: '0-50,000 ₪',
        location: 'לא צוין',
        createdAt: new Date(lead.created_at).toLocaleDateString('he-IL'),
        lastContact: lead.last_contact_date ? new Date(lead.last_contact_date).toLocaleDateString('he-IL') : undefined,
        assignedTo: undefined,
        notes: lead.notes || '',
        score: Math.floor(Math.random() * 40) + 60
      })) || [];
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
      isEmpty={leads.length === 0}
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