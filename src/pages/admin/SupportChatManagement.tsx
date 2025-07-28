import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Search, Eye, Clock, CheckCircle, XCircle, User, Phone } from "lucide-react";

interface ChatSession {
  id: string;
  customerName: string;
  customerAvatar?: string;
  agentName?: string;
  status: "active" | "waiting" | "completed" | "escalated";
  priority: "low" | "medium" | "high" | "urgent";
  startTime: string;
  lastMessage: string;
  messageCount: number;
  category: string;
}

const mockChatSessions: ChatSession[] = [
  {
    id: "chat-001",
    customerName: "שרה כהן",
    agentName: "דוד לוי",
    status: "active",
    priority: "high",
    startTime: "09:30",
    lastMessage: "אני צריכה עזרה עם ההזמנה שלי",
    messageCount: 12,
    category: "הזמנות"
  },
  {
    id: "chat-002",
    customerName: "מיכאל רוזן",
    status: "waiting",
    priority: "medium",
    startTime: "10:15",
    lastMessage: "מתי אקבל את המוצר?",
    messageCount: 3,
    category: "משלוחים"
  },
  {
    id: "chat-003",
    customerName: "רחל אברהם",
    agentName: "יעל דוד",
    status: "completed",
    priority: "low",
    startTime: "08:45",
    lastMessage: "תודה רבה על העזרה!",
    messageCount: 8,
    category: "תמיכה כללית"
  }
];

export default function SupportChatManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      waiting: "bg-yellow-100 text-yellow-800", 
      completed: "bg-blue-100 text-blue-800",
      escalated: "bg-red-100 text-red-800"
    };
    return variants[status as keyof typeof variants] || "";
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return variants[priority as keyof typeof variants] || "";
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "active": return <MessageCircle className="h-4 w-4" />;
      case "waiting": return <Clock className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "escalated": return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredSessions = mockChatSessions.filter(session => {
    const matchesSearch = session.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || session.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-hebrew" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ניהול צ'אטים</h1>
          <p className="text-muted-foreground">
            ניהול שיחות תמיכה וצ'אטים עם לקוחות
          </p>
        </div>
      </div>

      {/* סטטיסטיקות מהירות */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">צ'אטים פעילים</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">+2 מהשעה הקודמת</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">בהמתנה</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">זמן המתנה ממוצע: 3 דקות</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הושלמו היום</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+12% מאתמול</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">דירוג שביעות רצון</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">מתוך 5 כוכבים</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="active">פעילים</TabsTrigger>
            <TabsTrigger value="waiting">בהמתנה</TabsTrigger>
            <TabsTrigger value="completed">הושלמו</TabsTrigger>
            <TabsTrigger value="all">הכל</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי שם לקוח או קטגוריה..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 w-80"
              />
            </div>
          </div>
        </div>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {filteredSessions
              .filter(session => session.status === "active")
              .map((session) => (
                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.customerAvatar} />
                          <AvatarFallback>{session.customerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{session.customerName}</h3>
                            <Badge className={getPriorityBadge(session.priority)}>
                              {session.priority === "high" ? "עדיפות גבוהה" : 
                               session.priority === "medium" ? "עדיפות בינונית" : 
                               session.priority === "low" ? "עדיפות נמוכה" : "דחוף"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{session.lastMessage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <div className="flex items-center gap-2 text-sm">
                            {getStatusIcon(session.status)}
                            <Badge className={getStatusBadge(session.status)}>
                              {session.status === "active" ? "פעיל" : 
                               session.status === "waiting" ? "ממתין" : 
                               session.status === "completed" ? "הושלם" : "הועבר"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {session.messageCount} הודעות • {session.startTime}
                          </p>
                          {session.agentName && (
                            <p className="text-xs text-muted-foreground">
                              נציג: {session.agentName}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 ml-2" />
                          צפייה
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="waiting" className="space-y-4">
          <div className="grid gap-4">
            {filteredSessions
              .filter(session => session.status === "waiting")
              .map((session) => (
                <Card key={session.id} className="hover:shadow-lg transition-shadow border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.customerAvatar} />
                          <AvatarFallback>{session.customerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{session.customerName}</h3>
                            <Badge className={getPriorityBadge(session.priority)}>
                              {session.priority === "high" ? "עדיפות גבוהה" : 
                               session.priority === "medium" ? "עדיפות בינונית" : 
                               session.priority === "low" ? "עדיפות נמוכה" : "דחוף"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{session.lastMessage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <div className="flex items-center gap-2 text-sm">
                            {getStatusIcon(session.status)}
                            <Badge className={getStatusBadge(session.status)}>
                              ממתין
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {session.messageCount} הודעות • {session.startTime}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="default">
                            <Phone className="h-4 w-4 ml-2" />
                            קבל צ'אט
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 ml-2" />
                            צפייה
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {filteredSessions
              .filter(session => session.status === "completed")
              .map((session) => (
                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.customerAvatar} />
                          <AvatarFallback>{session.customerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{session.customerName}</h3>
                            <Badge className={getPriorityBadge(session.priority)}>
                              {session.priority === "high" ? "עדיפות גבוהה" : 
                               session.priority === "medium" ? "עדיפות בינונית" : 
                               session.priority === "low" ? "עדיפות נמוכה" : "דחוף"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{session.lastMessage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <div className="flex items-center gap-2 text-sm">
                            {getStatusIcon(session.status)}
                            <Badge className={getStatusBadge(session.status)}>
                              הושלם
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {session.messageCount} הודעות • {session.startTime}
                          </p>
                          {session.agentName && (
                            <p className="text-xs text-muted-foreground">
                              נציג: {session.agentName}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 ml-2" />
                          צפייה
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.customerAvatar} />
                        <AvatarFallback>{session.customerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{session.customerName}</h3>
                          <Badge className={getPriorityBadge(session.priority)}>
                            {session.priority === "high" ? "עדיפות גבוהה" : 
                             session.priority === "medium" ? "עדיפות בינונית" : 
                             session.priority === "low" ? "עדיפות נמוכה" : "דחוף"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{session.lastMessage}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <div className="flex items-center gap-2 text-sm">
                          {getStatusIcon(session.status)}
                          <Badge className={getStatusBadge(session.status)}>
                            {session.status === "active" ? "פעיל" : 
                             session.status === "waiting" ? "ממתין" : 
                             session.status === "completed" ? "הושלם" : "הועבר"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {session.messageCount} הודעות • {session.startTime}
                        </p>
                        {session.agentName && (
                          <p className="text-xs text-muted-foreground">
                            נציג: {session.agentName}
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 ml-2" />
                        צפייה
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}