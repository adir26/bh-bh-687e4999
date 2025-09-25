import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Mail, 
  MessageSquare, 
  Bell, 
  Smartphone,
  Clock,
  Play,
  Edit,
  Trash2,
  AlertCircle
} from "lucide-react";
import { CommunicationAutomation } from "@/services/communicationAutomationService";
import { useToggleAutomation, useDeleteAutomation } from "@/hooks/useCommunicationAutomations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AutomationRuleCardProps {
  automation: CommunicationAutomation;
  onEdit?: (automation: CommunicationAutomation) => void;
  onTest?: (automation: CommunicationAutomation) => void;
}

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'email': return <Mail className="h-4 w-4" />;
    case 'sms': return <MessageSquare className="h-4 w-4" />;
    case 'notification': return <Bell className="h-4 w-4" />;
    case 'whatsapp': return <Smartphone className="h-4 w-4" />;
    default: return <Bell className="h-4 w-4" />;
  }
};

const getChannelLabel = (channel: string) => {
  switch (channel) {
    case 'email': return 'מייל';
    case 'sms': return 'SMS';
    case 'notification': return 'התראה';
    case 'whatsapp': return 'WhatsApp';
    default: return channel;
  }
};

const getTriggerLabel = (trigger: string) => {
  switch (trigger) {
    case 'lead_new': return 'ליד חדש';
    case 'quote_sent_no_open': return 'הצעת מחיר לא נפתחה';
    case 'quote_viewed_no_accept': return 'הצעת מחיר נצפתה ללא אישור';
    case 'payment_due': return 'תשלום פגוע';
    case 'order_completed_review': return 'הזמנה הושלמה';
    default: return trigger;
  }
};

const formatDelay = (hours: number) => {
  if (hours === 0) return 'מיידי';
  if (hours < 24) return `${hours} שעות`;
  const days = Math.floor(hours / 24);
  return `${days} ימים`;
};

export function AutomationRuleCard({ automation, onEdit, onTest }: AutomationRuleCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const toggleMutation = useToggleAutomation();
  const deleteMutation = useDeleteAutomation();

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await toggleMutation.mutateAsync({
        id: automation.id,
        isActive: !automation.is_active
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(automation.id);
  };

  const handleTest = () => {
    if (onTest) {
      onTest(automation);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 space-x-reverse flex-1">
            <div className={`p-3 rounded-lg ${
              automation.is_active 
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {getChannelIcon(automation.channel)}
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-lg">{automation.name}</h3>
                <Badge variant="outline" className="gap-1">
                  {getChannelIcon(automation.channel)}
                  {getChannelLabel(automation.channel)}
                </Badge>
                {automation.is_active ? (
                  <Badge className="bg-success/10 text-success border-success/20">
                    פעיל
                  </Badge>
                ) : (
                  <Badge variant="secondary">מושבת</Badge>
                )}
              </div>
              
              {automation.description && (
                <p className="text-sm text-muted-foreground">
                  {automation.description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">טריגר:</span>
                  <span>{getTriggerLabel(automation.trigger_event)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">עיכוב:</span>
                  <span>{formatDelay(automation.delay_hours)}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>נוצר: {new Date(automation.created_at).toLocaleDateString('he-IL')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>עודכן: {new Date(automation.updated_at).toLocaleDateString('he-IL')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                checked={automation.is_active}
                onCheckedChange={handleToggle}
                disabled={isToggling || toggleMutation.isPending}
              />
              <span className="text-sm">
                {automation.is_active ? "פעיל" : "מושבת"}
              </span>
            </div>
            
            <div className="flex gap-2">
              {onEdit && (
                <Button size="sm" variant="outline" onClick={() => onEdit(automation)}>
                  <Edit className="h-4 w-4 ml-2" />
                  עריכה
                </Button>
              )}
              
              {automation.is_active && onTest && (
                <Button size="sm" variant="outline" onClick={handleTest}>
                  <Play className="h-4 w-4 ml-2" />
                  בדיקה
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 ml-2" />
                    מחק
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      מחיקת כלל אוטומציה
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      האם אתה בטוח שברצונך למחוק את כלל האוטומציה "{automation.name}"?
                      פעולה זו תמחק גם את כל המשימות הממתינות הקשורות לכלל זה.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>ביטול</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleteMutation.isPending}
                    >
                      מחק
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}