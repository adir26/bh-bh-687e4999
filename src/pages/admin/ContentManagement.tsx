import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Image,
  Video,
  Globe,
  Calendar,
  User,
  Heart,
  MessageCircle,
  Share
} from "lucide-react";

interface Content {
  id: string;
  title: string;
  type: "article" | "banner" | "video" | "promotion" | "page";
  status: "published" | "draft" | "pending" | "archived";
  author: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  category: string;
  excerpt: string;
  featured?: boolean;
}

const mockContent: Content[] = [
  {
    id: "content-001",
    title: "מדריך לעיצוב מטבח מושלם לבית חדש",
    type: "article",
    status: "published",
    author: "צוות העריכה",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-16",
    views: 2340,
    likes: 89,
    comments: 23,
    category: "עיצוב מטבחים",
    excerpt: "כל מה שאתם צריכים לדעת על תכנון ועיצוב מטבח שיתאים בדיוק לצרכים שלכם...",
    featured: true
  },
  {
    id: "content-002",
    title: "בנר פרסומי - הנחות סוף השנה",
    type: "banner",
    status: "published",
    author: "מחלקת שיווק",
    createdAt: "2024-01-14",
    updatedAt: "2024-01-14",
    views: 15200,
    likes: 234,
    comments: 5,
    category: "פרסום",
    excerpt: "בנר פרסומי להנחות סוף השנה עם הצעות מיוחדות לספקים"
  },
  {
    id: "content-003",
    title: "וידאו הדרכה - איך לבחור ספק מקצועי",
    type: "video",
    status: "draft",
    author: "יעל דוד",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-17",
    views: 0,
    likes: 0,
    comments: 0,
    category: "הדרכות",
    excerpt: "וידאו מקיף המסביר את הקריטריונים החשובים לבחירת ספק איכותי ומהימן"
  },
  {
    id: "content-004",
    title: "עמוד מידע - שירותי לקוחות",
    type: "page",
    status: "pending",
    author: "דוד כהן",
    createdAt: "2024-01-13",
    updatedAt: "2024-01-18",
    views: 890,
    likes: 12,
    comments: 3,
    category: "מידע",
    excerpt: "עמוד מידע מקיף על שירותי הלקוחות שלנו ואופן הקשר איתנו"
  }
];

export default function ContentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      archived: "bg-red-100 text-red-800"
    };
    return variants[status as keyof typeof variants] || "";
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      article: "bg-blue-100 text-blue-800",
      banner: "bg-purple-100 text-purple-800",
      video: "bg-orange-100 text-orange-800",
      promotion: "bg-red-100 text-red-800",
      page: "bg-green-100 text-green-800"
    };
    return variants[type as keyof typeof variants] || "";
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "article": return <FileText className="h-4 w-4" />;
      case "banner": return <Image className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "promotion": return <Heart className="h-4 w-4" />;
      case "page": return <Globe className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredContent = mockContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || content.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 font-hebrew" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ניהול תוכן</h1>
          <p className="text-muted-foreground">
            ניהול כל התכנים באתר - מאמרים, בנרים, וידאו ועמודי מידע
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          תוכן חדש
        </Button>
      </div>

      {/* סטטיסטיקות מהירות */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תכנים פעילים</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">מתוך 4 תכנים</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">צפיות היום</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">+15% מאתמול</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תכנים ממתינים</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">לאישור</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אינטראקציות</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">366</div>
            <p className="text-xs text-muted-foreground">לייקים ותגובות</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">הכל</TabsTrigger>
            <TabsTrigger value="published">פורסם</TabsTrigger>
            <TabsTrigger value="draft">טיוטות</TabsTrigger>
            <TabsTrigger value="pending">ממתין לאישור</TabsTrigger>
            <TabsTrigger value="featured">מומלץ</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש תכנים..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 w-80"
              />
            </div>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filteredContent.map((content) => (
              <Card key={content.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 space-x-reverse flex-1">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        {getTypeIcon(content.type)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-lg">{content.title}</h3>
                          {content.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              ⭐ מומלץ
                            </Badge>
                          )}
                          <Badge className={getStatusBadge(content.status)}>
                            {content.status === "published" ? "פורסם" :
                             content.status === "draft" ? "טיוטה" :
                             content.status === "pending" ? "ממתין לאישור" : "בארכיון"}
                          </Badge>
                          <Badge className={getTypeBadge(content.type)}>
                            {content.type === "article" ? "מאמר" :
                             content.type === "banner" ? "בנר" :
                             content.type === "video" ? "וידאו" :
                             content.type === "promotion" ? "קידום" : "עמוד"}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {content.excerpt}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>מחבר: {content.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>נוצר: {content.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{content.views.toLocaleString()} צפיות</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{content.likes} לייקים</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{content.comments} תגובות</span>
                          </div>
                        </div>

                        {content.updatedAt !== content.createdAt && (
                          <div className="text-xs text-muted-foreground">
                            עודכן לאחרונה: {content.updatedAt}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 ml-2" />
                        צפייה
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 ml-2" />
                        עריכה
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4 ml-2" />
                        מחיקה
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <div className="grid gap-4">
            {filteredContent
              .filter(content => content.status === "published")
              .map((content) => (
                <Card key={content.id} className="hover:shadow-lg transition-shadow border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse flex-1">
                        <div className="p-3 bg-green-100 rounded-lg">
                          {getTypeIcon(content.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-lg">{content.title}</h3>
                            {content.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                ⭐ מומלץ
                              </Badge>
                            )}
                            <Badge className="bg-green-100 text-green-800">פורסם</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {content.excerpt}
                          </p>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{content.views.toLocaleString()} צפיות</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              <span>{content.likes} לייקים</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{content.comments} תגובות</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Share className="h-4 w-4 ml-2" />
                          שיתוף
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 ml-2" />
                          עריכה
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <div className="grid gap-4">
            {filteredContent
              .filter(content => content.status === "draft")
              .map((content) => (
                <Card key={content.id} className="hover:shadow-lg transition-shadow border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse flex-1">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          {getTypeIcon(content.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-lg">{content.title}</h3>
                            <Badge className="bg-gray-100 text-gray-800">טיוטה</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {content.excerpt}
                          </p>

                          <div className="text-sm text-muted-foreground">
                            נוצר: {content.createdAt} | עודכן: {content.updatedAt}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm">
                          <Globe className="h-4 w-4 ml-2" />
                          פרסם
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 ml-2" />
                          עריכה
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {filteredContent
              .filter(content => content.status === "pending")
              .map((content) => (
                <Card key={content.id} className="hover:shadow-lg transition-shadow border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse flex-1">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                          {getTypeIcon(content.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-lg">{content.title}</h3>
                            <Badge className="bg-yellow-100 text-yellow-800">ממתין לאישור</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {content.excerpt}
                          </p>

                          <div className="text-sm text-muted-foreground">
                            מחבר: {content.author} | נוצר: {content.createdAt}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          ✓ אשר
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-800">
                          ✗ דחה
                        </Button>
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

        <TabsContent value="featured" className="space-y-4">
          <div className="grid gap-4">
            {filteredContent
              .filter(content => content.featured)
              .map((content) => (
                <Card key={content.id} className="hover:shadow-lg transition-shadow border-yellow-200 bg-yellow-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse flex-1">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                          {getTypeIcon(content.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-lg">{content.title}</h3>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              ⭐ מומלץ
                            </Badge>
                            <Badge className={getStatusBadge(content.status)}>
                              {content.status === "published" ? "פורסם" :
                               content.status === "draft" ? "טיוטה" :
                               content.status === "pending" ? "ממתין לאישור" : "בארכיון"}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {content.excerpt}
                          </p>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{content.views.toLocaleString()} צפיות</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              <span>{content.likes} לייקים</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          🌟 הסר המלצה
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 ml-2" />
                          עריכה
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