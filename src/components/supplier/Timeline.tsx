import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  FileText,
  Eye,
  EyeOff 
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface TimelineEvent {
  id: string;
  type: 'status_change' | 'call' | 'note' | 'attachment';
  title: string;
  content?: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  isCustomerVisible?: boolean;
  metadata?: {
    oldStatus?: string;
    newStatus?: string;
    outcome?: string;
    fileName?: string;
  };
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

function getEventIcon(type: string, metadata?: any) {
  switch (type) {
    case 'status_change':
      return Clock;
    case 'call':
      return metadata?.outcome === 'whatsapp' ? MessageSquare : Phone;
    case 'note':
      return FileText;
    case 'attachment':
      return FileText;
    default:
      return Clock;
  }
}

function formatEventTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return format(date, 'HH:mm', { locale: he });
  } else if (diffInHours < 24 * 7) {
    return format(date, 'EEEE HH:mm', { locale: he });
  } else {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: he });
  }
}

export function Timeline({ events, className }: TimelineProps) {
  if (!events.length) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 text-muted-foreground ${className}`}>
        <Clock className="w-8 h-8 mb-2" />
        <p>אין אירועים להצגה</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {events.map((event, index) => {
        const Icon = getEventIcon(event.type, event.metadata);
        const isLast = index === events.length - 1;
        
        return (
          <div key={event.id} className="relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute right-4 top-8 w-0.5 h-full bg-border" />
            )}
            
            {/* Event content */}
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium">{event.title}</h4>
                  
                  {/* Visibility indicator */}
                  {event.isCustomerVisible !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {event.isCustomerVisible ? (
                        <>
                          <Eye className="w-3 h-3 ml-1" />
                          לקוח רואה
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 ml-1" />
                          פנימי
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                
                {/* Event content */}
                {event.content && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {event.content}
                  </p>
                )}
                
                {/* Metadata display */}
                {event.metadata && (
                  <div className="text-xs text-muted-foreground mb-2">
                    {event.metadata.oldStatus && event.metadata.newStatus && (
                      <span>
                        {event.metadata.oldStatus} ← {event.metadata.newStatus}
                      </span>
                    )}
                    {event.metadata.outcome && (
                      <span>תוצאה: {event.metadata.outcome}</span>
                    )}
                    {event.metadata.fileName && (
                      <span>קובץ: {event.metadata.fileName}</span>
                    )}
                  </div>
                )}
                
                {/* Footer */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {event.userName && (
                    <>
                      <User className="w-3 h-3" />
                      <span>{event.userName}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{formatEventTime(event.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}