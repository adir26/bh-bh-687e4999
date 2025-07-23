import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  status: 'open' | 'in_progress' | 'closed';
  unread: number;
  type: 'general' | 'order';
  orderId?: string;
}

interface Complaint {
  id: string;
  orderId: string;
  orderSupplier: string;
  title: string;
  status: 'open' | 'under_review' | 'resolved';
  submittedAt: string;
  reason: string;
}

const Support = () => {
  const navigate = useNavigate();
  
  const [conversations] = useState<Conversation[]>([
    {
      id: 'conv-001',
      title: 'בעיה עם הזמנה #12A394',
      lastMessage: 'התמיכה: קיבלנו את פנייתך ונחזור אליך בקרוב',
      timestamp: '10:30',
      status: 'in_progress',
      unread: 1,
      type: 'order',
      orderId: 'ORD-001'
    },
    {
      id: 'conv-002', 
      title: 'שאלה כללית',
      lastMessage: 'אתה: איך אני מוצא ספקים בקרבתי?',
      timestamp: 'אתמול',
      status: 'closed',
      unread: 0,
      type: 'general'
    }
  ]);

  const [complaints] = useState<Complaint[]>([
    {
      id: 'C0021',
      orderId: 'ORD-001',
      orderSupplier: 'מטבחי פרימיום',
      title: 'עיכוב במשלוח',
      status: 'under_review',
      submittedAt: '22.01.2024',
      reason: 'עיכוב'
    },
    {
      id: 'C0019',
      orderId: 'ORD-002',
      orderSupplier: 'מיזוג הצפון',
      title: 'בעיית איכות',
      status: 'resolved',
      submittedAt: '15.01.2024',
      reason: 'בעיית איכות'
    }
  ]);

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
      case 'under_review':
        return 'בבדיקה';
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
      case 'under_review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'closed':
      case 'resolved':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-gray-50 pb-24" dir="rtl">
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
          <div className="space-y-3">
            {conversations.filter(conv => conv.status !== 'closed').map((conversation) => (
              <Card 
                key={conversation.id} 
                className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-xl"
                onClick={() => navigate(`/support/chat/${conversation.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{conversation.title}</h3>
                        <div className="flex items-center gap-2">
                          {conversation.unread > 0 && (
                            <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unread}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-1">{conversation.lastMessage}</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(conversation.status)}
                        <Badge className={`text-xs px-2 py-1 rounded-lg border ${getStatusColor(conversation.status)}`}>
                          {getStatusText(conversation.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Complaints & Disputes */}
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
                        <h3 className="font-semibold text-gray-900 text-sm">תלונה #{complaint.id}</h3>
                        <span className="text-xs text-gray-500">{complaint.submittedAt}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{complaint.title}</p>
                      <p className="text-gray-500 text-xs mb-2">ספק: {complaint.orderSupplier}</p>
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

        {/* Chat History */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">היסטוריית שיחות</h2>
          <div className="space-y-3">
            {conversations.filter(conv => conv.status === 'closed').map((conversation) => (
              <Card 
                key={conversation.id} 
                className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-xl opacity-75"
                onClick={() => navigate(`/support/chat/${conversation.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-700 text-sm">{conversation.title}</h3>
                        <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-2 line-clamp-1">{conversation.lastMessage}</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(conversation.status)}
                        <Badge className={`text-xs px-2 py-1 rounded-lg border ${getStatusColor(conversation.status)}`}>
                          {getStatusText(conversation.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;