import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { User, Phone, Mail, Calendar, Clock, FileText, CheckCircle2, Tag, History, Trash2 } from 'lucide-react';
import { leadsService, Lead, LeadStatus } from '@/services/leadsService';
import { showToast } from '@/utils/toast';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface LeadDetailDialogProps {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailDialog({ leadId, open, onOpenChange }: LeadDetailDialogProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Reset to details tab when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab('details');
    }
  }, [open, leadId]);

  // Lead data
  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => leadsService.getLeadById(leadId!),
    enabled: !!leadId && open,
  });

  // Lead activities
  const { data: activities = [] } = useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: () => leadsService.getLeadActivities(leadId!),
    enabled: !!leadId && open,
  });

  // Lead history
  const { data: history = [] } = useQuery({
    queryKey: ['lead-history', leadId],
    queryFn: () => leadsService.getLeadHistory(leadId!),
    enabled: !!leadId && open,
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      leadsService.updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] }); // Invalidate all leads queries
      showToast.success('פרטי הליד עודכנו בהצלחה');
    },
    onError: () => {
      showToast.error('שגיאה בעדכון פרטי הליד');
    },
  });

  // Add activity mutation
  const addActivityMutation = useMutation({
    mutationFn: (data: { type: string; title: string; description?: string; scheduledFor?: string }) =>
      leadsService.addLeadActivity(leadId!, data.type, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] }); // Invalidate all leads queries
      showToast.success('הפעילות נוספה בהצלחה');
    },
    onError: () => {
      showToast.error('שגיאה בהוספת הפעילות');
    },
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: async () => {
      console.log('🗑️ Starting delete for lead:', leadId);
      if (!leadId) {
        throw new Error('No lead ID provided');
      }
      const result = await leadsService.deleteLead(leadId);
      console.log('✅ Delete successful:', result);
      return result;
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries...');
      
      // Close dialogs first for immediate feedback
      setDeleteDialogOpen(false);
      onOpenChange(false);
      
      // Then invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead-history', leadId] });
      
      showToast.success('הליד נמחק בהצלחה');
      console.log('✅ Delete complete');
    },
    onError: (error: any) => {
      console.error('❌ Delete lead error:', error);
      const errorMessage = error?.message || 'שגיאה במחיקת הליד';
      showToast.error(errorMessage);
    },
  });

  if (!lead && !isLoading) return null;

  const statusLabels: Record<LeadStatus, string> = {
    'new': 'חדש',
    'no_answer': 'אין מענה',
    'followup': 'פולואפ',
    'no_answer_x5': 'אין מענה x5',
    'not_relevant': 'לא רלוונטי',
    'error': 'טעות',
    'denies_contact': 'מכחיש פנייה',
    'project_in_process': 'פרויקט בתהליך',
    'project_completed': 'פרויקט הסתיים',
  };

  const sourceLabels: Record<string, string> = {
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

  const priorityLabels: Record<string, string> = {
    'low': 'נמוכה',
    'medium': 'בינונית',
    'high': 'גבוהה',
    'vip': 'VIP'
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <User className="w-5 h-5" />
                {lead?.name || 'פרטי ליד'}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">פרטים</TabsTrigger>
            <TabsTrigger value="notes">הערות</TabsTrigger>
            <TabsTrigger value="tasks">משימות</TabsTrigger>
            <TabsTrigger value="meetings">פגישות</TabsTrigger>
            <TabsTrigger value="history">היסטוריה</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <LeadDetailsForm 
              lead={lead} 
              onUpdate={(data) => updateLeadMutation.mutate({ id: leadId!, data })}
              statusLabels={statusLabels}
              sourceLabels={sourceLabels}
              priorityLabels={priorityLabels}
              open={open}
            />
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4 mt-4">
            <NotesTab 
              activities={activities.filter(a => a.activity_type === 'note')}
              onAddNote={(note) => addActivityMutation.mutate({ 
                type: 'note', 
                title: 'הערה', 
                description: note 
              })}
            />
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4 mt-4">
            <TasksTab 
              activities={activities.filter(a => a.activity_type === 'task')}
              onAddTask={(task) => addActivityMutation.mutate({ 
                type: 'task', 
                title: task.title, 
                description: task.description,
                scheduledFor: task.scheduledFor
              })}
            />
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-4 mt-4">
            <MeetingsTab 
              activities={activities.filter(a => a.activity_type === 'meeting')}
              onAddMeeting={(meeting) => addActivityMutation.mutate({ 
                type: 'meeting', 
                title: meeting.title, 
                description: meeting.description,
                scheduledFor: meeting.scheduledFor
              })}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-4">
            <HistoryTab history={history} statusLabels={statusLabels} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
          <AlertDialogDescription>
            פעולה זו תמחק את הליד לצמיתות. לא ניתן לשחזר את המידע לאחר המחיקה.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ביטול</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              deleteLeadMutation.mutate();
            }}
            disabled={deleteLeadMutation.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleteLeadMutation.isPending ? 'מוחק...' : 'מחק ליד'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

// Lead Details Form Component
function LeadDetailsForm({ 
  lead, 
  onUpdate, 
  statusLabels, 
  sourceLabels, 
  priorityLabels,
  open
}: { 
  lead: Lead | undefined; 
  onUpdate: (data: Partial<Lead>) => void;
  statusLabels: Record<LeadStatus, string>;
  sourceLabels: Record<string, string>;
  priorityLabels: Record<string, string>;
  open: boolean;
}) {
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    contact_phone: lead?.contact_phone || '',
    contact_email: lead?.contact_email || '',
    status: lead?.status || 'new',
    source_key: lead?.source_key || 'other',
    priority_key: lead?.priority_key || 'medium',
    campaign_name: lead?.campaign_name || '',
    notes: lead?.notes || '',
  });

  // Update form data when lead changes or dialog opens
  useEffect(() => {
    if (!lead) return;
    setFormData({
      name: lead.name || '',
      contact_phone: lead.contact_phone || '',
      contact_email: lead.contact_email || '',
      status: lead.status || 'new',
      source_key: lead.source_key || 'other',
      priority_key: lead.priority_key || 'medium',
      campaign_name: lead.campaign_name || '',
      notes: lead.notes || '',
    });
  }, [lead?.id, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  if (!lead) return <div className="text-center py-8">טוען...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">שם הלקוח</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="שם הלקוח"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">טלפון</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            placeholder="טלפון"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">אימייל</Label>
        <Input
          id="email"
          type="email"
          value={formData.contact_email}
          onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
          placeholder="אימייל"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">סטטוס</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as LeadStatus })}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">מקור</Label>
          <Select value={formData.source_key} onValueChange={(v) => setFormData({ ...formData, source_key: v })}>
            <SelectTrigger id="source">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sourceLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">עדיפות</Label>
          <Select value={formData.priority_key} onValueChange={(v) => setFormData({ ...formData, priority_key: v })}>
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(priorityLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaign_name">שם קמפיין</Label>
        <Input
          id="campaign_name"
          value={formData.campaign_name}
          onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
          placeholder="שם הקמפיין (למשל: קמפיין קיץ 2024)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">הערות</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="הערות"
          rows={4}
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>נוצר: {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}</span>
      </div>

      <Button type="submit" className="w-full">שמור שינויים</Button>
    </form>
  );
}

// Notes Tab Component
function NotesTab({ activities, onAddNote }: { activities: any[]; onAddNote: (note: string) => void }) {
  const [newNote, setNewNote] = useState('');

  const handleAdd = () => {
    if (!newNote.trim()) return;
    onAddNote(newNote);
    setNewNote('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>הוסף הערה חדשה</Label>
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="הקלד הערה..."
          rows={3}
        />
        <Button onClick={handleAdd} className="w-full">
          <FileText className="w-4 h-4 ml-2" />
          הוסף הערה
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4" />
          הערות קודמות
        </h3>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">אין הערות</p>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Tasks Tab Component
function TasksTab({ 
  activities, 
  onAddTask 
}: { 
  activities: any[]; 
  onAddTask: (task: { title: string; description?: string; scheduledFor?: string }) => void;
}) {
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    scheduledFor: '',
  });

  const handleAdd = () => {
    if (!taskForm.title.trim()) return;
    onAddTask(taskForm);
    setTaskForm({ title: '', description: '', scheduledFor: '' });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>הוסף משימה חדשה</Label>
        <Input
          value={taskForm.title}
          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          placeholder="כותרת המשימה"
        />
        <Textarea
          value={taskForm.description}
          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          placeholder="תיאור המשימה (אופציונלי)"
          rows={2}
        />
        <Input
          type="datetime-local"
          value={taskForm.scheduledFor}
          onChange={(e) => setTaskForm({ ...taskForm, scheduledFor: e.target.value })}
        />
        <Button onClick={handleAdd} className="w-full">
          <CheckCircle2 className="w-4 h-4 ml-2" />
          הוסף משימה
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          משימות
        </h3>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">אין משימות</p>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <h4 className="font-semibold">{activity.title}</h4>
                {activity.description && (
                  <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {activity.scheduled_for && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(activity.scheduled_for), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </span>
                  )}
                  <span>
                    נוצר: {format(new Date(activity.created_at), 'dd/MM/yyyy', { locale: he })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Meetings Tab Component
function MeetingsTab({ 
  activities, 
  onAddMeeting 
}: { 
  activities: any[]; 
  onAddMeeting: (meeting: { title: string; description?: string; scheduledFor: string }) => void;
}) {
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    scheduledFor: '',
  });

  const handleAdd = () => {
    if (!meetingForm.title.trim() || !meetingForm.scheduledFor) return;
    onAddMeeting(meetingForm);
    setMeetingForm({ title: '', description: '', scheduledFor: '' });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>קבע פגישה חדשה</Label>
        <Input
          value={meetingForm.title}
          onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
          placeholder="נושא הפגישה"
        />
        <Textarea
          value={meetingForm.description}
          onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
          placeholder="פרטים נוספים (אופציונלי)"
          rows={2}
        />
        <Input
          type="datetime-local"
          value={meetingForm.scheduledFor}
          onChange={(e) => setMeetingForm({ ...meetingForm, scheduledFor: e.target.value })}
          required
        />
        <Button onClick={handleAdd} className="w-full">
          <Calendar className="w-4 h-4 ml-2" />
          קבע פגישה
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          פגישות
        </h3>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">אין פגישות מתוכננות</p>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <h4 className="font-semibold">{activity.title}</h4>
                {activity.description && (
                  <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-sm font-medium text-primary">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(activity.scheduled_for), 'dd/MM/yyyy HH:mm', { locale: he })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// History Tab Component
function HistoryTab({ 
  history, 
  statusLabels 
}: { 
  history: any[]; 
  statusLabels: Record<LeadStatus, string>;
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold flex items-center gap-2">
        <History className="w-4 h-4" />
        היסטוריית שינויים
      </h3>
      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">אין שינויים</p>
      ) : (
        history.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  סטטוס השתנה מ-
                  <Badge variant="outline" className="mx-1">
                    {statusLabels[item.from_status as LeadStatus] || item.from_status}
                  </Badge>
                  ל-
                  <Badge variant="outline" className="mx-1">
                    {statusLabels[item.to_status as LeadStatus] || item.to_status}
                  </Badge>
                </span>
              </div>
              {item.note && (
                <p className="text-sm text-muted-foreground mt-2">{item.note}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
