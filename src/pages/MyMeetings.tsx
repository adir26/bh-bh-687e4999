import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { supabase } from '@/integrations/supabase/client';
import { showToast } from '@/utils/toast';
import { useQuery } from '@tanstack/react-query';
import { PageBoundary } from '@/components/system/PageBoundary';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyMeetings() {
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
            .order('datetime', { ascending: true }),
          { 
            signal,
            errorMessage: 'שגיאה בטעינת הפגישות',
            timeoutMs: 10_000
          }
        );
      } catch (error: any) {
        // If table doesn't exist, return empty array instead of throwing
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
      pending: { text: 'ממתין', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: 'מאושר', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'בוטל', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    const dateStr = date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return { dateStr, timeStr };
  };

  return (
    <PageBoundary 
      timeout={10000}
      fallback={
        <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white">
          <div className="flex items-center justify-center flex-1">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">טוען פגישות...</p>
            </div>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white">
          <div className="flex items-center justify-center flex-1">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">טוען פגישות...</p>
            </div>
          </div>
        </div>
      ) : (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowRight className="w-6 h-6" />
        </button>
        <span className="text-lg font-semibold">הפגישות שלי</span>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {meetings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">אין פגישות</h3>
            <p className="text-gray-500 mb-4">עדיין לא קבעת פגישות עם ספקים</p>
            <Button onClick={() => navigate('/')}>
              חזרה לדף הבית
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => {
              const { dateStr, timeStr } = formatDateTime(meeting.datetime);
              const isPast = new Date(meeting.datetime) < new Date();
              
              return (
                <Card key={meeting.id} className={`border ${isPast ? 'bg-gray-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">ספק ID: {meeting.supplier_id}</h4>
                          {getStatusBadge(meeting.status)}
                        </div>
                        
                        <div className="space-y-1 mb-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{dateStr}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{timeStr}</span>
                          </div>
                        </div>
                        
                        {meeting.notes && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            הערות: {meeting.notes}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          נקבע: {new Date(meeting.created_at).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/supplier/${meeting.supplier_id}`)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        צפה בספק
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMeeting(meeting.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
      )}
    </PageBoundary>
  );
};

export default MyMeetings;