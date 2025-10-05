import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, Plus, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserSupport } from '@/hooks/useUserSupport';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const Support = () => {
  const navigate = useNavigate();
  const { activeTickets, closedTickets, complaints, unreadCounts, isLoading } = useUserSupport();

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return format(date, 'HH:mm', { locale: he });
      } else if (diffInHours < 48) {
        return 'אתמול';
      } else {
        return format(date, 'd.M.yyyy', { locale: he });
      }
    } catch (error) {
      return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'in_progress':
      case 'under_review':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'closed':
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'פתוח';
      case 'in_progress':
        return 'בטיפול';
      case 'closed':
        return 'סגור';
      case 'resolved':
        return 'נפתר';
      default:
        return 'לא ידוע';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'closed':
      case 'resolved':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-gray-50 pb-nav-safe" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 py-6 rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="text-right flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">תמיכה ועזרה</h1>
            <p className="text-gray-600 text-sm">צ'אט עם הצוות שלנו</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/support/chat/new')}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-semibold flex items-center justify-center gap-3"
          >
            <Plus className="w-5 h-5" />
            התחל שיחה חדשה עם התמיכה
          </Button>
        </div>

        {/* Active Conversations */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">שיחות פעילות</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : activeTickets.length === 0 ? (
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium text-foreground mb-2">אין שיחות פעילות</h4>
                <p className="text-sm text-muted-foreground">
                  התחל שיחה חדשה עם צוות התמיכה
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeTickets.map((ticket) => {
                const unreadCount = unreadCounts[ticket.id] || 0;
                return (
                  <Card 
                    key={ticket.id} 
                    className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-xl"
                    onClick={() => navigate(`/support/chat/${ticket.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{ticket.title}</h3>
                            <div className="flex items-center gap-2">
                              {unreadCount > 0 && (
                                <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                  {unreadCount}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">{formatTimestamp(ticket.created_at)}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-1">{ticket.description}</p>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(ticket.status)}
                            <Badge className={`text-xs px-2 py-1 rounded-lg border ${getStatusColor(ticket.status)}`}>
                              {getStatusText(ticket.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Complaints & Disputes */}
        {complaints.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">תלונות ומחלוקות</h2>
            <div className="space-y-3">
              {complaints.map((complaint) => (
                <Card 
                  key={complaint.id} 
                  className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-xl"
                  onClick={() => navigate(`/support/complaint/${complaint.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{complaint.title}</h3>
                          <span className="text-xs text-gray-500">{formatTimestamp(complaint.created_at)}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-1 line-clamp-2">{complaint.description}</p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(complaint.status)}
                          <Badge className={`text-xs px-2 py-1 rounded-lg border ${getStatusColor(complaint.status)}`}>
                            {getStatusText(complaint.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chat History */}
        {closedTickets.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">היסטוריית שיחות</h2>
            <div className="space-y-3">
              {closedTickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-xl opacity-75"
                  onClick={() => navigate(`/support/chat/${ticket.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-700 text-sm">{ticket.title}</h3>
                          <span className="text-xs text-gray-500">{formatTimestamp(ticket.created_at)}</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-2 line-clamp-1">{ticket.description}</p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          <Badge className={`text-xs px-2 py-1 rounded-lg border ${getStatusColor(ticket.status)}`}>
                            {getStatusText(ticket.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;