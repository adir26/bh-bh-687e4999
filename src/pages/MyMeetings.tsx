import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, MessageCircle, Check, X, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MeetingService, BookingWithDetails } from '@/services/meetingService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OnboardingGuard } from '@/components/OnboardingGuard';
import { PageBoundary } from '@/components/system/PageBoundary';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import { he } from 'date-fns/locale';

const MyMeetings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: () => MeetingService.getUserBookings(user!.id),
    enabled: !!user?.id,
  });

  // Update booking status mutation (for suppliers)
  const updateStatusMutation = useMutation({
    mutationFn: ({ bookingId, status, notes }: { 
      bookingId: string; 
      status: 'confirmed' | 'rejected'; 
      notes?: string 
    }) => MeetingService.updateBookingStatus(bookingId, status, notes),
    onSuccess: (_, { status }) => {
      toast({
        title: status === 'confirmed' ? "פגישה אושרה" : "פגישה נדחתה",
        description: status === 'confirmed' 
          ? "הלקוח יקבל הודעת אישור" 
          : "הלקוח יקבל הודעה על הדחיה",
      });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את סטטוס הפגישה",
        variant: "destructive",
      });
    }
  });

  // Cancel booking mutation (for clients)
  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => MeetingService.cancelBooking(bookingId),
    onSuccess: () => {
      toast({
        title: "פגישה בוטלה",
        description: "הספק יקבל הודעה על הביטול",
      });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
    },
    onError: () => {
      toast({
        title: "שגיאה", 
        description: "לא ניתן לבטל את הפגישה",
        variant: "destructive",
      });
    }
  });

  if (!user || !profile) {
    return (
      <PageBoundary>
        <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
          <div className="text-center space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-foreground">התחבר כדי לראות פגישות</h3>
              <p className="text-sm text-muted-foreground">
                התחבר לחשבון שלך כדי לראות את הפגישות שלך
              </p>
            </div>
          </div>
        </div>
      </PageBoundary>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">ממתין לאישור</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="text-green-600 border-green-600">אושר</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">נדחה</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">בוטל</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">הושלם</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = parseISO(dateTime);
    return {
      date: format(date, 'EEEE, dd MMMM', { locale: he }),
      time: format(date, 'HH:mm', { locale: he })
    };
  };

  const isUserSupplier = profile.role === 'supplier';
  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];
  const upcomingBookings = bookings?.filter(b => 
    ['confirmed'].includes(b.status) && isFuture(parseISO(b.starts_at))
  ) || [];
  const pastBookings = bookings?.filter(b => 
    ['completed', 'rejected', 'cancelled'].includes(b.status) || 
    (b.status === 'confirmed' && isPast(parseISO(b.starts_at)))
  ) || [];

  if (isLoading) {
    return (
      <PageBoundary>
        <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <span className="text-muted-foreground">טוען פגישות...</span>
          </div>
        </div>
      </PageBoundary>
    );
  }

  const renderBookingCard = (booking: BookingWithDetails) => {
    const { date, time } = formatDateTime(booking.starts_at);
    const endTime = format(parseISO(booking.ends_at), 'HH:mm', { locale: he });
    const otherUser = isUserSupplier ? booking.client : booking.supplier;
    
    return (
      <Card key={booking.id} className="border-0 shadow-sm rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg text-right text-foreground">
                פגישה עם {otherUser?.full_name || 'משתמש'}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{time} - {endTime}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(booking.status)}
            </div>
          </div>
          
          {booking.notes && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-right">{booking.notes}</p>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex gap-3">
            {/* Client actions */}
            {!isUserSupplier && booking.status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => cancelMutation.mutate(booking.id)}
                disabled={cancelMutation.isPending}
                className="flex-1"
              >
                <X className="w-4 h-4 ml-1" />
                ביטול בקשה
              </Button>
            )}
            
            {!isUserSupplier && booking.status === 'confirmed' && isFuture(parseISO(booking.starts_at)) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`mailto:${otherUser?.email}`, '_self')}
                >
                  <MessageCircle className="w-4 h-4 ml-1" />
                  שלח הודעה
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelMutation.mutate(booking.id)}
                  disabled={cancelMutation.isPending}
                  className="flex-1"
                >
                  <X className="w-4 h-4 ml-1" />
                  בטל פגישה
                </Button>
              </>
            )}

            {/* Supplier actions */}
            {isUserSupplier && booking.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ 
                    bookingId: booking.id, 
                    status: 'confirmed' 
                  })}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 ml-1" />
                  אשר פגישה
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ 
                    bookingId: booking.id, 
                    status: 'rejected' 
                  })}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1"
                >
                  <X className="w-4 h-4 ml-1" />
                  דחה
                </Button>
              </>
            )}
            
            {isUserSupplier && booking.status === 'confirmed' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(`mailto:${otherUser?.email}`, '_self')}
              >
                <Phone className="w-4 h-4 ml-1" />
                צור קשר
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <OnboardingGuard>
      <PageBoundary>
        <div className="min-h-screen bg-background" dir="rtl">
          <div className="max-w-md mx-auto bg-background pb-nav-safe">
            {/* Header */}
            <div className="bg-background border-b border-border px-6 py-6">
              <h1 className="text-2xl font-bold text-foreground text-right">הפגישות שלי</h1>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="bg-background border-b border-border px-6 py-2">
                <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50">
                  {isUserSupplier && (
                    <TabsTrigger
                      value="pending"
                      className="rounded-xl text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      בקשות ({pendingBookings.length})
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="upcoming"
                    className="rounded-xl text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    קרובות ({upcomingBookings.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="past"
                    className="rounded-xl text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    עבר ({pastBookings.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Content */}
              <div className="flex-1 px-6 py-6">
                {/* Pending bookings (suppliers only) */}
                {isUserSupplier && (
                  <TabsContent value="pending" className="mt-0">
                    <div className="space-y-4">
                      {pendingBookings.length > 0 ? (
                        pendingBookings.map(renderBookingCard)
                      ) : (
                        <div className="text-center py-16">
                          <Clock3 className="w-20 h-20 bg-muted/50 rounded-full p-5 mx-auto mb-6 text-muted-foreground" />
                          <h3 className="text-xl font-semibold text-foreground mb-3">אין בקשות ממתינות</h3>
                          <p className="text-muted-foreground">כשלקוחות יבקשו פגישות, הן יופיעו כאן</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Upcoming bookings */}
                <TabsContent value="upcoming" className="mt-0">
                  <div className="space-y-4">
                    {upcomingBookings.length > 0 ? (
                      upcomingBookings.map(renderBookingCard)
                    ) : (
                      <div className="text-center py-16">
                        <Calendar className="w-20 h-20 bg-muted/50 rounded-full p-5 mx-auto mb-6 text-muted-foreground" />
                        <h3 className="text-xl font-semibold text-foreground mb-3">אין פגישות קרובות</h3>
                        <p className="text-muted-foreground">
                          {isUserSupplier 
                            ? "פגישות מאושרות יופיעו כאן" 
                            : "הזמן פגישות עם ספקים ותראה אותן כאן"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Past bookings */}
                <TabsContent value="past" className="mt-0">
                  <div className="space-y-4">
                    {pastBookings.length > 0 ? (
                      pastBookings.map(renderBookingCard)
                    ) : (
                      <div className="text-center py-16">
                        <Clock className="w-20 h-20 bg-muted/50 rounded-full p-5 mx-auto mb-6 text-muted-foreground" />
                        <h3 className="text-xl font-semibold text-foreground mb-3">אין פגישות בעבר</h3>
                        <p className="text-muted-foreground">פגישות שהושלמו יופיעו כאן</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </PageBoundary>
    </OnboardingGuard>
  );
};

export default MyMeetings;