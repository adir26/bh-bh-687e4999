import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, AlertCircle, CheckCircle, Clock, MessageCircle, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ComplaintUpdate {
  id: string;
  status: 'open' | 'under_review' | 'resolved';
  message: string;
  timestamp: string;
  author: 'system' | 'support' | 'supplier';
}

interface Complaint {
  id: string;
  orderId: string;
  orderInvoiceNumber: string;
  orderSupplier: string;
  orderService: string;
  reason: string;
  reasonLabel: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved';
  submittedAt: string;
  requestRefund: boolean;
  attachments: Array<{
    name: string;
    type: 'image' | 'pdf';
    url: string;
  }>;
  updates: ComplaintUpdate[];
}

const ComplaintDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [complaint] = useState<Complaint>({
    id: id || 'C0021',
    orderId: 'ORD-001',
    orderInvoiceNumber: '12A394',
    orderSupplier: 'מטבחי פרימיום',
    orderService: 'עיצוב והתקנת מטבח',
    reason: 'delay',
    reasonLabel: 'עיכוב במשלוח/הגעה',
    description: 'המטבח אמור היה להתקבל השבוע אבל עדיין לא הגיע. הספק לא מחזיר טלפונים ואני מודאג מהמצב.',
    status: 'under_review',
    submittedAt: '22.01.2024 14:30',
    requestRefund: false,
    attachments: [
      {
        name: 'חוזה_מטבח.pdf',
        type: 'pdf',
        url: '#'
      },
      {
        name: 'תמונת_האתר.jpg',
        type: 'image',
        url: '#'
      }
    ],
    updates: [
      {
        id: 'update-001',
        status: 'open',
        message: 'התלונה נפתחה ונשלחה לבדיקה',
        timestamp: '22.01.2024 14:30',
        author: 'system'
      },
      {
        id: 'update-002',
        status: 'under_review',
        message: 'התלונה עברה לבדיקת צוות התמיכה. יצרנו קשר עם הספק לבירור',
        timestamp: '22.01.2024 16:45',
        author: 'support'
      },
      {
        id: 'update-003',
        status: 'under_review',
        message: 'הספק מתחייב להגיע מחר (23.01) בשעות הבוקר',
        timestamp: '23.01.2024 09:15',
        author: 'support'
      }
    ]
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'under_review':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'פתוח';
      case 'under_review':
        return 'בבדיקה';
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
      case 'under_review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getAuthorLabel = (author: string) => {
    switch (author) {
      case 'system':
        return 'מערכת';
      case 'support':
        return 'צוות תמיכה';
      case 'supplier':
        return 'ספק';
      default:
        return 'לא ידוע';
    }
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      'delay': 'עיכוב במשלוח/הגעה',
      'wrong_item': 'פריט שגוי/לא תואם להזמנה',
      'quality_issue': 'בעיית איכות/פגם במוצר',
      'service_issue': 'בעיה בשירות/התנהגות',
      'billing_issue': 'בעיה בחיוב/תשלום',
      'other': 'אחר'
    };
    return reasons[reason] || reason;
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-gray-50 pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 py-6 rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/support')}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="text-right flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">תלונה #{complaint.id}</h1>
            <div className="flex items-center gap-2">
              {getStatusIcon(complaint.status)}
              <Badge className={`text-xs px-2 py-1 rounded-lg border ${getStatusColor(complaint.status)}`}>
                {getStatusText(complaint.status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Order Information */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900">פרטי ההזמנה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">מספר הזמנה:</span>
              <span className="font-medium">#{complaint.orderInvoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ספק:</span>
              <span className="font-medium">{complaint.orderSupplier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">שירות:</span>
              <span className="font-medium">{complaint.orderService}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/orders/${complaint.orderId}/status`)}
              className="w-full mt-3 rounded-xl"
            >
              צפה בפרטי ההזמנה
            </Button>
          </CardContent>
        </Card>

        {/* Complaint Details */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900">פרטי התלונה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">סיבת התלונה:</h4>
              <Badge variant="outline" className="text-sm px-3 py-1 rounded-lg">
                {complaint.reasonLabel}
              </Badge>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">תיאור:</h4>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                {complaint.description}
              </p>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">תאריך הגשה:</span>
              <span className="font-medium">{complaint.submittedAt}</span>
            </div>

            {complaint.requestRefund && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">בקשת החזר כספי</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attachments */}
        {complaint.attachments.length > 0 && (
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900">קבצים מצורפים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {complaint.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {attachment.type === 'image' ? (
                    <FileText className="w-5 h-5 text-blue-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm text-gray-700 flex-1">{attachment.name}</span>
                  <Button variant="ghost" size="sm" className="text-primary">
                    הורד
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Status Timeline */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900">מעקב אחרי התלונה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {complaint.updates.map((update, index) => (
              <div key={update.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  {getStatusIcon(update.status)}
                  {index < complaint.updates.length - 1 && (
                    <div className="w-px h-8 bg-gray-200 mt-2"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={`text-xs px-2 py-1 rounded-lg border ${getStatusColor(update.status)}`}>
                      {getStatusText(update.status)}
                    </Badge>
                    <span className="text-xs text-gray-500">{update.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{update.message}</p>
                  <span className="text-xs text-gray-500">על ידי: {getAuthorLabel(update.author)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate(`/support/chat/complaint-${complaint.id}`)}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl"
          >
            <MessageCircle className="w-5 h-5 ml-2" />
            צ'אט עם התמיכה
          </Button>
          
          {complaint.status === 'resolved' && (
            <Button
              variant="outline"
              className="w-full h-12 border-2 border-green-200 text-green-700 hover:bg-green-50 font-semibold rounded-xl"
            >
              <CheckCircle className="w-5 h-5 ml-2" />
              התלונה נפתרה
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;