import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar, MapPin, ArrowRight, Clock, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { supabase } from '@/integrations/supabase/client';
import { showToast } from '@/utils/toast';
import { useQuery } from '@tanstack/react-query';
import { PageBoundary } from '@/components/system/PageBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { supaSelect } from '@/lib/supaFetch';

interface Meeting {
  id: string;
  supplier_id: string;
  meeting_date: string;
  meeting_time?: string;
  location?: string;
  notes?: string;
  status: string;
  created_at: string;
}

export default function MyMeetings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { invalidateMeetings } = useQueryInvalidation();

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings', user?.id],
    enabled: !!user?.id,
    queryFn: async ({ signal }) => {
      try {
        return await supaSelect<Meeting[]>(
          supabase
            .from('meetings')
            .select('*')
            .eq('user_id', user?.id)
            .order('meeting_date', { ascending: true }),
          { 
            signal,
            errorMessage: 'שגיאה בטעינת הפגישות',
            timeoutMs: 10_000
          }
        );
      } catch (error: any) {
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          return [];
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 60_000,
  });

  const deleteMeeting = async (meetingId: string) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);

      if (error) throw error;
      
      invalidateMeetings(user?.id);
      showToast.success('הפגישה נמחקה');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      showToast.error('שגיאה במחיקת הפגישה');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: 'ממתין', variant: 'secondary' as const },
      confirmed: { text: 'מאושר', variant: 'default' as const },
      cancelled: { text: 'בוטל', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant}>
        {config.text}
      </Badge>
    );
  };

  return (
    <PageBoundary
      timeout={15000}
      fallback={
        <div className="min-h-screen bg-background p-4 pb-32">
          <div className="container mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="min-h-screen bg-background p-4 pb-32">
          <div className="container mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background p-4 pb-32">
          <div className="container mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold">הפגישות שלי</h1>
            </header>

            {!meetings || meetings.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold mb-2">אין פגישות מתוכננות</h2>
                  <p className="text-muted-foreground mb-4">
                    כאשר תקבע פגישות עם ספקים, הן יופיעו כאן.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4" role="list" aria-label="רשימת פגישות">
                {meetings.map((meeting) => (
                  <Card key={meeting.id} role="listitem">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">
                            פגישה עם ספק {meeting.supplier_id}
                          </h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(meeting.meeting_date).toLocaleDateString('he-IL')} 
                                {meeting.meeting_time && ` בשעה ${meeting.meeting_time}`}
                              </span>
                            </div>
                            {meeting.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{meeting.location}</span>
                              </div>
                            )}
                            {meeting.notes && (
                              <div className="mt-2">
                                <span className="font-medium">הערות: </span>
                                <span>{meeting.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMeeting(meeting.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                          aria-label={`מחק פגישה עם ספק ${meeting.supplier_id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageBoundary>
  );
}