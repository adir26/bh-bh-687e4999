import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  Search, 
  Eye, 
  Check, 
  X, 
  Flag,
  Calendar,
  User,
  Building,
  AlertTriangle,
  TrendingUp,
  MessageCircle
} from "lucide-react";

interface Review {
  id: string;
  customerName: string;
  customerAvatar?: string;
  supplierName: string;
  supplierCategory: string;
  rating: number;
  title: string;
  content: string;
  status: "pending" | "approved" | "rejected" | "flagged";
  createdAt: string;
  isVerified: boolean;
  helpful: number;
  reportCount: number;
  orderId?: string;
  images?: string[];
}

const mockReviews: Review[] = [
  {
    id: "review-001",
    customerName: "שרה כהן",
    supplierName: "מטבחי פרימיום בע״מ",
    supplierCategory: "עיצוב מטבחים",
    rating: 5,
    title: "שירות מעולה ומקצועיות ברמה הגבוהה ביותר",
    content: "קיבלתי שירות יוצא מן הכלל מהצוות. הם היו מקצועיים, אדיבים ועמדו בכל הלוחות זמנים. המטבח שלי נראה פשוט מדהים! ממליצה בחום.",
    status: "pending",
    createdAt: "2024-01-15",
    isVerified: true,
    helpful: 0,
    reportCount: 0,
    orderId: "order-123"
  },
  {
    id: "review-002",
    customerName: "מיכאל רוזן",
    supplierName: "ריהוט הבית הישראלי",
    supplierCategory: "ריהוט",
    rating: 2,
    title: "שירוץ לא מספק ובעיות באיכות",
    content: "רכשתי רהיטים ולא הייתי מרוצה מהאיכות. בנוסף, השירות היה גרוע והמסירה התאחרה בשבוע. לא אחזור לקנות כאן.",
    status: "flagged",
    createdAt: "2024-01-14",
    isVerified: false,
    helpful: 2,
    reportCount: 1,
    orderId: "order-456"
  },
  {
    id: "review-003",
    customerName: "רחל אברהם",
    supplierName: "טכנאי המזגנים המומחה",
    supplierCategory: "מזגנים וחימום",
    rating: 4,
    title: "שירות טוב עם זמן תגובה מהיר",
    content: "הטכנאי הגיע במהירות ותיקן את המזגן ביעילות. המחיר היה הוגן והשירות מקצועי. נקה מכללה הכל אחרי העבודה.",
    status: "approved",
    createdAt: "2024-01-12",
    isVerified: true,
    helpful: 8,
    reportCount: 0,
    orderId: "order-789"
  },
  {
    id: "review-004",
    customerName: "דוד לוי",
    supplierName: "חברת הבניין המובילה",
    supplierCategory: "קבלנות ובניין",
    rating: 1,
    title: "***אסור לעבוד איתם!!! רמאים***",
    content: "רמאים גמורים!!! לקחו כסף ולא סיימו את העבודה. אל תתקרבו!!! הם נוכלים ורמאים. בזבוז של כסף ומשפחה של שקרנים.",
    status: "flagged",
    createdAt: "2024-01-13",
    isVerified: false,
    helpful: 0,
    reportCount: 3
  }
];

export default function ReviewsModeration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("pending");

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      flagged: "bg-orange-100 text-orange-800"
    };
    return variants[status as keyof typeof variants] || "";
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || review.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-hebrew" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ניהול ביקורות</h1>
          <p className="text-muted-foreground">
            אישור, דחיה וניהול ביקורות לקוחות על ספקים
          </p>
        </div>
      </div>

      {/* סטטיסטיקות מהירות */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ממתינות לאישור</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">צריכות בדיקה</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">דירוג ממוצע</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2</div>
            <p className="text-xs text-muted-foreground">מתוך 5 כוכבים</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ביקורות שדווחו</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">דורשות בדיקה מיידית</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אושרו השבוע</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">+25% מהשבוע שעבר</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="pending">ממתינות</TabsTrigger>
            <TabsTrigger value="flagged">מדווחות</TabsTrigger>
            <TabsTrigger value="approved">מאושרות</TabsTrigger>
            <TabsTrigger value="rejected">נדחו</TabsTrigger>
            <TabsTrigger value="all">הכל</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש ביקורות..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 w-80"
              />
            </div>
          </div>
        </div>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {filteredReviews
              .filter(review => review.status === "pending")
              .map((review) => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow border-yellow-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 space-x-reverse flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={review.customerAvatar} />
                            <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-lg">{review.customerName}</h3>
                              {review.isVerified && (
                                <Badge className="bg-blue-100 text-blue-800">✓ מאומת</Badge>
                              )}
                              <Badge className="bg-yellow-100 text-yellow-800">ממתין לאישור</Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{review.supplierName}</span>
                              <span className="text-xs text-muted-foreground">({review.supplierCategory})</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {getRatingStars(review.rating)}
                          </div>
                          <span className={`font-bold ${getRatingColor(review.rating)}`}>
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">{review.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{review.createdAt}</span>
                          </div>
                          {review.orderId && (
                            <div className="flex items-center gap-1">
                              <span>הזמנה: {review.orderId}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-4">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Check className="h-4 w-4 ml-2" />
                            אשר
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-800">
                            <X className="h-4 w-4 ml-2" />
                            דחה
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

        <TabsContent value="flagged" className="space-y-4">
          <div className="grid gap-4">
            {filteredReviews
              .filter(review => review.status === "flagged")
              .map((review) => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow border-red-200 bg-red-50/30">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 space-x-reverse flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={review.customerAvatar} />
                            <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-lg">{review.customerName}</h3>
                              {review.isVerified ? (
                                <Badge className="bg-blue-100 text-blue-800">✓ מאומת</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">לא מאומת</Badge>
                              )}
                              <Badge className="bg-red-100 text-red-800">
                                <AlertTriangle className="h-3 w-3 ml-1" />
                                דווח
                              </Badge>
                              <Badge className="bg-orange-100 text-orange-800">
                                {review.reportCount} דיווחים
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{review.supplierName}</span>
                              <span className="text-xs text-muted-foreground">({review.supplierCategory})</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {getRatingStars(review.rating)}
                          </div>
                          <span className={`font-bold ${getRatingColor(review.rating)}`}>
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-red-800">{review.title}</h4>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm leading-relaxed">
                            {review.content}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{review.createdAt}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-600">
                            <Flag className="h-3 w-3" />
                            <span>{review.reportCount} דיווחים</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Check className="h-4 w-4 ml-2" />
                            אשר למרות הדיווחים
                          </Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            <X className="h-4 w-4 ml-2" />
                            דחה
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 ml-2" />
                            בדיקה מעמיקה
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid gap-4">
            {filteredReviews
              .filter(review => review.status === "approved")
              .map((review) => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow border-green-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 space-x-reverse flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={review.customerAvatar} />
                            <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-lg">{review.customerName}</h3>
                              {review.isVerified && (
                                <Badge className="bg-blue-100 text-blue-800">✓ מאומת</Badge>
                              )}
                              <Badge className="bg-green-100 text-green-800">מאושר</Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{review.supplierName}</span>
                              <span className="text-xs text-muted-foreground">({review.supplierCategory})</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {getRatingStars(review.rating)}
                          </div>
                          <span className={`font-bold ${getRatingColor(review.rating)}`}>
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">{review.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{review.createdAt}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>👍 {review.helpful} מועיל</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
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

        <TabsContent value="rejected" className="space-y-4">
          <div className="text-center py-12">
            <X className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">אין ביקורות שנדחו</h3>
            <p className="text-muted-foreground">כל הביקורות שנבדקו עד כה אושרו</p>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={review.customerAvatar} />
                          <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-lg">{review.customerName}</h3>
                            {review.isVerified && (
                              <Badge className="bg-blue-100 text-blue-800">✓ מאומת</Badge>
                            )}
                            <Badge className={getStatusBadge(review.status)}>
                              {review.status === "pending" ? "ממתין" :
                               review.status === "approved" ? "מאושר" :
                               review.status === "rejected" ? "נדחה" : "דווח"}
                            </Badge>
                            {review.reportCount > 0 && (
                              <Badge className="bg-orange-100 text-orange-800">
                                {review.reportCount} דיווחים
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{review.supplierName}</span>
                            <span className="text-xs text-muted-foreground">({review.supplierCategory})</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {getRatingStars(review.rating)}
                        </div>
                        <span className={`font-bold ${getRatingColor(review.rating)}`}>
                          {review.rating}/5
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">{review.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{review.createdAt}</span>
                        </div>
                        {review.status === "approved" && (
                          <div className="flex items-center gap-1">
                            <span>👍 {review.helpful} מועיל</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
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
      </Tabs>
    </div>
  );
}