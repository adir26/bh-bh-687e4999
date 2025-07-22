
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Filter, MessageSquare, Phone, FileText, X, Calendar, MapPin, User } from 'lucide-react';

interface Lead {
  id: string;
  customerName: string;
  location: string;
  service: string;
  message: string;
  date: string;
  status: 'new' | 'in-progress' | 'closed' | 'not-relevant';
}

export default function LeadManagement() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const leads: Lead[] = [
    {
      id: '1',
      customerName: 'שרה לוי',
      location: 'תל אביב',
      service: 'עיצוב מטבח',
      message: 'אני מעוניינת בעיצוב מטבח חדש לדירה בת 4 חדרים. המטבח קיים כרגע ישן וצריך חידוש מלא.',
      date: '2024-01-15',
      status: 'new'
    },
    {
      id: '2',
      customerName: 'דוד כהן',
      location: 'ירושלים',
      service: 'שיפוץ חדר אמבטיה',
      message: 'רוצה לשפץ חדר אמבטיה, להחליף אריחים ואבזרים. התקציב עד 50,000 ש"ח.',
      date: '2024-01-14',
      status: 'in-progress'
    },
    {
      id: '3',
      customerName: 'מיכל אברהם',
      location: 'חיפה',
      service: 'תכנון סלון',
      message: 'מתכננת לעצב מחדש את הסלון, מעוניינת בפגישה לייעוץ וקבלת הצעת מחיר.',
      date: '2024-01-13',
      status: 'new'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'not-relevant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'חדש';
      case 'in-progress': return 'בטיפול';
      case 'closed': return 'סגור';
      case 'not-relevant': return 'לא רלוונטי';
      default: return status;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/supplier/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                חזור לדשבורד
              </Button>
              <h1 className="text-2xl font-bold text-foreground">ניהול לידים</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                כרטיסים
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                טבלה
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="חפש לפי שם לקוח או שירות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="סנן לפי סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="new">חדש</SelectItem>
              <SelectItem value="in-progress">בטיפול</SelectItem>
              <SelectItem value="closed">סגור</SelectItem>
              <SelectItem value="not-relevant">לא רלוונטי</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">5</div>
              <div className="text-sm text-muted-foreground">לידים חדשים</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-muted-foreground">בטיפול</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">12</div>
              <div className="text-sm text-muted-foreground">נסגרו</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">75%</div>
              <div className="text-sm text-muted-foreground">שיעור המרה</div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {lead.customerName}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {lead.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(lead.date).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>
                      {getStatusText(lead.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">שירות מבוקש:</h4>
                    <p className="font-medium">{lead.service}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">הודעה:</h4>
                    <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                      {lead.message}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="blue" size="sm" className="flex-1">
                      <FileText className="w-4 h-4 ml-1" />
                      שלח הצעת מחיר
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-right p-4 font-medium">שם לקוח</th>
                      <th className="text-right p-4 font-medium">תאריך</th>
                      <th className="text-right p-4 font-medium">סטטוס</th>
                      <th className="text-right p-4 font-medium">שירות</th>
                      <th className="text-right p-4 font-medium">מיקום</th>
                      <th className="text-right p-4 font-medium">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{lead.customerName}</td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(lead.date).toLocaleDateString('he-IL')}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(lead.status)}>
                            {getStatusText(lead.status)}
                          </Badge>
                        </td>
                        <td className="p-4">{lead.service}</td>
                        <td className="p-4 text-muted-foreground">{lead.location}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <FileText className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Phone className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredLeads.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">לא נמצאו לידים התואמים לחיפוש</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
