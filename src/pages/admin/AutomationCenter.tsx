import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Zap, 
  Mail, 
  MessageSquare, 
  Calendar,
  Clock,
  Bell,
  Users,
  ShoppingCart,
  Star,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  Edit,
  Plus,
  Filter,
  TrendingUp
} from "lucide-react";
import { 
  useCommunicationAutomations,
  useTemplateAutomations,
  useJobStats,
  useAutomationAnalytics,
  useQuietHours,
  useUpsertQuietHours,
  useRateLimits,
  useUpsertRateLimit 
} from "@/hooks/useCommunicationAutomations";
import { AutomationRuleCard } from "@/components/automations/AutomationRuleCard";
import { AutomationRuleEditor } from "@/components/automations/AutomationRuleEditor";
import { CommunicationAutomation } from "@/services/communicationAutomationService";

export default function AutomationCenter() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<CommunicationAutomation | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  // Data fetching
  const { data: automations = [], isLoading } = useCommunicationAutomations();
  const { data: templates = [] } = useTemplateAutomations();
  const { data: jobStats } = useJobStats();
  const { data: analytics } = useAutomationAnalytics();
  const { data: quietHours = [] } = useQuietHours();
  const { data: rateLimits = [] } = useRateLimits();

  const upsertQuietHoursMutation = useUpsertQuietHours();
  const upsertRateLimitMutation = useUpsertRateLimit();

  // Filter and search logic
  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = !searchTerm || 
      automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      automation.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || automation.channel === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCreateNew = () => {
    setEditingAutomation(undefined);
    setShowEditor(true);
  };

  const handleEdit = (automation: CommunicationAutomation) => {
    setEditingAutomation(automation);
    setShowEditor(true);
  };

  const handleTest = (automation: CommunicationAutomation) => {
    // TODO: Implement test functionality
    console.log('Testing automation:', automation.name);
  };

  const activeAutomationsCount = automations.filter(a => a.is_active).length;

  return (
    <div className="space-y-6 font-hebrew" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">מרכז אוטומציה</h1>
          <p className="text-muted-foreground">
            ניהול תהליכים אוטומטיים והתראות חכמות במערכת
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 ml-2" />
          כלל חדש
        </Button>
      </div>

      {/* סטטיסטיקות מהירות */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">כללים פעילים</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAutomationsCount}</div>
            <p className="text-xs text-muted-foreground">מתוך {automations.length} כללים</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הודעות נשלחו</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobStats?.sent || 0}</div>
            <p className="text-xs text-muted-foreground">{jobStats?.pending || 0} ממתינות</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הודעות נכשלו</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobStats?.failed || 0}</div>
            <p className="text-xs text-muted-foreground">השבוע</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">שיעור הצלחה</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics?.successRate || 0)}%</div>
            <p className="text-xs text-muted-foreground">מההודעות נשלחו</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">כללי אוטומציה</TabsTrigger>
          <TabsTrigger value="templates">תבניות</TabsTrigger>
          <TabsTrigger value="logs">יומן פעילות</TabsTrigger>
          <TabsTrigger value="settings">הגדרות</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                <Filter className="h-4 w-4 ml-2" />
                הכל
              </Button>
              <Button 
                variant={selectedCategory === "email" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("email")}
              >
                <Mail className="h-4 w-4 ml-2" />
                מייל
              </Button>
              <Button 
                variant={selectedCategory === "sms" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("sms")}
              >
                <MessageSquare className="h-4 w-4 ml-2" />
                SMS
              </Button>
              <Button 
                variant={selectedCategory === "notification" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("notification")}
              >
                <Bell className="h-4 w-4 ml-2" />
                התראות
              </Button>
            </div>
            
            <div className="flex-1 max-w-md">
              <Input
                placeholder="חיפוש כללי אוטומציה..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Automations List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">טוען כללי אוטומציה...</p>
              </div>
            ) : filteredAutomations.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">אין כללי אוטומציה</h3>
                <p className="text-muted-foreground mb-4">צור את הכלל הראשון שלך כדי להתחיל</p>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 ml-2" />
                  צור כלל ראשון
                </Button>
              </div>
            ) : (
              filteredAutomations.map((automation) => (
                <AutomationRuleCard
                  key={automation.id}
                  automation={automation}
                  onEdit={handleEdit}
                  onTest={handleTest}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">תבניות מובנות</h3>
            <p className="text-sm text-muted-foreground">
              השתמש בתבניות המובנות כבסיס לכללי האוטומציה שלך
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {template.channel === 'email' && <Mail className="h-5 w-5" />}
                    {template.channel === 'sms' && <MessageSquare className="h-5 w-5" />}
                    {template.channel === 'notification' && <Bell className="h-5 w-5" />}
                    {template.name}
                  </CardTitle>
                  <CardDescription>
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {template.channel}
                      </Badge>
                      {template.delay_hours > 0 && (
                        <Badge variant="outline" className="text-xs mr-2">
                          עיכוב {template.delay_hours}ש
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setEditingAutomation(template);
                      setShowEditor(true);
                    }}
                  >
                    השתמש בתבנית
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">אין תבניות זמינות</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {/* TODO: Implement automation logs display */}
          <Card>
            <CardHeader>
              <CardTitle>יומן פעילות אוטומציה</CardTitle>
              <CardDescription>רשימת כל הפעלות האוטומציה ב-30 הימים האחרונים</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">יומן פעילות יתווסף בעדכון הבא</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Quiet Hours Settings */}
          <Card>
            <CardHeader>
              <CardTitle>שעות שקט</CardTitle>
              <CardDescription>
                הגדר שעות בהן לא יישלחו הודעות אוטומטיות
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">שעת התחלה</Label>
                  <Input 
                    id="start-time" 
                    type="time" 
                    defaultValue="22:00"
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">שעת סיום</Label>
                  <Input 
                    id="end-time" 
                    type="time" 
                    defaultValue="08:00"
                  />
                </div>
              </div>
              <div>
                <Label>ימי השבוע</Label>
                <div className="flex gap-2 mt-2">
                  {['ב', 'ג', 'ד', 'ה', 'ו', 'ש', 'א'].map((day, index) => (
                    <Button key={index} variant="outline" size="sm" className="w-10 h-10">
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
              <Button>שמור הגדרות</Button>
            </CardContent>
          </Card>

          {/* Rate Limiting */}
          <Card>
            <CardHeader>
              <CardTitle>מגבלות תדירות</CardTitle>
              <CardDescription>
                הגבל את מספר ההודעות שנשלחות בכל ערוץ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {['email', 'sms', 'notification'].map((channel) => (
                  <div key={channel} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">
                        {channel === 'email' ? 'מייל' : channel === 'sms' ? 'SMS' : 'התראות'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div>
                        <Label className="text-xs">לשעה</Label>
                        <Input type="number" className="w-20" defaultValue="10" min="1" />
                      </div>
                      <div>
                        <Label className="text-xs">ליום</Label>
                        <Input type="number" className="w-20" defaultValue="50" min="1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button>עדכן מגבלות</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Automation Editor Modal */}
      <AutomationRuleEditor
        automation={editingAutomation}
        open={showEditor}
        onOpenChange={setShowEditor}
      />
    </div>
  );
}