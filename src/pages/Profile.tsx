import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { 
  User, Settings, Bell, CreditCard, HelpCircle, LogOut, 
  Edit3, Check, X, Home, Calendar, Star, FileText, 
  MapPin, MessageCircle, Phone, Mail, Globe, Clock,
  Package, ChevronRight, Truck, ShoppingCart, 
  History, MessageSquare, StarIcon, PenTool
} from 'lucide-react';
import profileHero from '@/assets/profile-hero.jpg';

interface UserProfile {
  fullName: string;
  email: string;
  phone?: string;
}

interface OnboardingData {
  homeDetails?: {
    fullName: string;
    apartmentSize: string;
    floorNumber: string;
    numberOfRooms: string;
    streetAndBuilding: string;
    apartmentNumber?: string;
  };
  projectPlanning?: {
    projectTypes: string[];
    otherProject?: string;
    startDate?: string;
    endDate?: string;
  };
  userInterests?: {
    interests: string[];
    contactChannels: string[];
    languages: string[];
    notes?: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  
  const form = useForm<UserProfile>({
    defaultValues: {
      fullName: 'שירה כהן',
      email: 'shirakohav1234@gmail.com',
      phone: '052-1234567'
    }
  });

  // Mock data for new sections
  const [nextDelivery] = useState({
    date: '28.07.2025',
    supplier: 'אבי רהיטים',
    hasDelivery: true
  });

  const [orderHistory] = useState([
    { id: 1, supplier: 'אבי רהיטים', date: '15.06.2025', amount: '₪2,500', status: 'הושלם' },
    { id: 2, supplier: 'חברת הבנייה', date: '01.06.2025', amount: '₪8,900', status: 'הושלם' },
    { id: 3, supplier: 'קופיקס', date: '20.05.2025', amount: '₪450', status: 'הושלם' }
  ]);

  const [activeOrders] = useState([
    { id: 1, supplier: 'אבי רהיטים', status: 'בדרך', deliveryDate: '28.07.2025', amount: '₪3,200' },
    { id: 2, supplier: 'חברת הבנייה', status: 'אושר', deliveryDate: '02.08.2025', amount: '₪12,500' }
  ]);

  const [pendingReviews] = useState([
    { id: 1, supplier: 'אבי רהיטים', orderDate: '15.06.2025', amount: '₪2,500' },
    { id: 2, supplier: 'חברת הבנייה', orderDate: '01.06.2025', amount: '₪8,900' }
  ]);

  const [submittedReviews] = useState([
    { id: 1, supplier: 'קופיקס', rating: 5, date: '25.05.2025', comment: 'שירות מעולה ומהיר' },
    { id: 2, supplier: 'עולם הרהיטים', rating: 4, date: '10.05.2025', comment: 'מוצרים איכותיים' }
  ]);

  useEffect(() => {
    // Load onboarding data from localStorage
    const homeDetails = localStorage.getItem('homeDetails');
    const projectPlanning = localStorage.getItem('projectPlanning');
    const userInterests = localStorage.getItem('userInterests');

    setOnboardingData({
      homeDetails: homeDetails ? JSON.parse(homeDetails) : null,
      projectPlanning: projectPlanning ? JSON.parse(projectPlanning) : null,
      userInterests: userInterests ? JSON.parse(userInterests) : null,
    });
  }, []);

  const handleSaveProfile = (data: UserProfile) => {
    console.log('Saving profile:', data);
    setIsEditing(false);
    // Here you would typically save to a backend/localStorage
  };

  const handleCancelEdit = () => {
    form.reset();
    setIsEditing(false);
  };

  const interestLabels: Record<string, string> = {
    'interior-design': 'עיצוב פנים',
    'renovation': 'שיפוץ',
    'shading-solutions': 'פתרונות הצללה/תריסים',
    'construction-extensions': 'הרחבות בנייה',
    'electrical-plumbing': 'חשמל ואינסטלציה',
    'design-inspiration': 'השראות לעיצוב',
    'bathroom-renovation': 'חידוש חדרי רחצה'
  };

  const projectLabels: Record<string, string> = {
    'kitchen': 'שדרוג מטבח',
    'living': 'עיצוב סלון',
    'bathroom': 'שיפוץ חדר רחצה',
    'electrical': 'חשמל או בית חכם',
    'other': 'אחר'
  };

  const channelLabels: Record<string, string> = {
    'whatsapp': 'WhatsApp',
    'email': 'אימייל',
    'phone': 'טלפון'
  };

  const languageLabels: Record<string, string> = {
    'hebrew': 'עברית',
    'arabic': 'ערבית',
    'english': 'English'
  };

  const menuItems = [
    {
      id: 'notifications',
      icon: Bell,
      title: 'התראות',
      subtitle: 'נהל העדפות התראות',
      href: '/profile/notifications'
    },
    {
      id: 'payment',
      icon: CreditCard,
      title: 'אמצעי תשלום',
      subtitle: 'כרטיסי אשראי וחשבונות בנק',
      href: '/profile/payment'
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'הגדרות',
      subtitle: 'הגדרות כלליות של האפליקציה',
      href: '/profile/settings'
    },
    {
      id: 'help',
      icon: HelpCircle,
      title: 'עזרה ותמיכה',
      subtitle: 'שאלות נפוצות וצור קשר',
      href: '/profile/help'
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-md mx-auto bg-background">
        {/* Hero Section */}
        <div className="relative h-52 overflow-hidden">
          <img 
            src={profileHero}
            alt="רקע פרופיל"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Profile Header */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 bg-white/95 rounded-2xl flex items-center justify-center border-4 border-white/50">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1 pb-2">
                {isEditing ? (
                  <Form {...form}>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-white/90 text-foreground border-0 text-lg font-bold h-8 p-2 rounded-lg"
                                placeholder="שם מלא"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-white/90 text-muted-foreground border-0 text-sm h-7 p-2 rounded-lg"
                                placeholder="אימייל"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </Form>
                ) : (
                  <div>
                    <h1 className="text-xl font-bold">{form.getValues('fullName')}</h1>
                    <p className="text-white/90 text-sm">{form.getValues('email')}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pb-2">
                {isEditing ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={form.handleSubmit(handleSaveProfile)}
                      className="bg-white/95 hover:bg-white text-primary border-0 h-9 w-9 p-0"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={handleCancelEdit}
                      className="bg-white/95 hover:bg-white text-primary border-0 h-9 w-9 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setIsEditing(true)}
                    className="bg-white/95 hover:bg-white text-primary border-0 h-9 w-9 p-0"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* My Activity Section */}
          {nextDelivery.hasDelivery && (
            <Card className="mt-6 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 text-sm">פעילות שלי</h3>
                    <p className="text-blue-800 text-xs mt-1">
                      ההזמנה הבאה שלך מתוכננת להגיע ב: <span className="font-medium">{nextDelivery.date}</span>
                    </p>
                    <p className="text-blue-700 text-xs">מספק: {nextDelivery.supplier}</p>
                  </div>
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Access Tiles */}
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-4 text-lg">גישה מהירה</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-orange-500/5 rounded-xl">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="font-medium text-sm text-foreground">ספקים בקרבתי</h4>
                  <p className="text-xs text-muted-foreground mt-1">מצא ספקים קרובים</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-primary/5 rounded-xl">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-sm text-foreground">המסמכים שלי</h4>
                  <p className="text-xs text-muted-foreground mt-1">חוזים ומסמכים שהועלו</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Order History Summary */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-lg">סיכום הזמנות</h3>
              <Button variant="ghost" size="sm" className="text-primary">
                צפה בהיסטוריה המלאה
                <ChevronRight className="w-4 h-4 mr-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {orderHistory.slice(0, 3).map((order) => (
                <Card key={order.id} className="border-0 shadow-sm rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-foreground">{order.supplier}</h4>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm text-foreground">{order.amount}</p>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700 text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Track My Orders */}
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-4 text-lg">מעקב אחרי הזמנות</h3>
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <Card key={order.id} className="border-0 shadow-sm rounded-xl border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-foreground">{order.supplier}</h4>
                          <p className="text-xs text-muted-foreground">משלוח צפוי: {order.deliveryDate}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm text-foreground">{order.amount}</p>
                        <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* My Reviews */}
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-4 text-lg">הביקורות שלי</h3>
            
            {/* Pending Reviews */}
            {pendingReviews.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-muted-foreground mb-3 text-sm">ממתינות לביקורת</h4>
                <div className="space-y-3">
                  {pendingReviews.map((review) => (
                    <Card key={review.id} className="border-0 shadow-sm rounded-xl bg-amber-50 border-amber-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                              <PenTool className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-foreground">{review.supplier}</h4>
                              <p className="text-xs text-muted-foreground">הזמנה מ-{review.orderDate} • {review.amount}</p>
                            </div>
                          </div>
                          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
                            כתוב ביקורת
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Submitted Reviews */}
            <div>
              <h4 className="font-medium text-muted-foreground mb-3 text-sm">ביקורות שנשלחו</h4>
              <div className="space-y-3">
                {submittedReviews.map((review) => (
                  <Card key={review.id} className="border-0 shadow-sm rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                            <StarIcon className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm text-foreground">{review.supplier}</h4>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon 
                                    key={i} 
                                    className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{review.date}</p>
                            <p className="text-xs text-foreground">{review.comment}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="mt-8 space-y-3">
            <h3 className="font-semibold text-foreground mb-4 text-lg">הגדרות</h3>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Logout */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-red-50 border-red-100 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-red-700">התנתק</h3>
                    <p className="text-sm text-red-600">צא מהחשבון שלך</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-8 mb-4 text-center pb-24">
            <p className="text-xs text-muted-foreground">גרסה 1.0.0</p>
            <div className="flex justify-center gap-4 mt-2">
              <Button variant="link" size="sm" className="text-xs text-muted-foreground p-0 h-auto">
                מדיניות פרטיות
              </Button>
              <Button variant="link" size="sm" className="text-xs text-muted-foreground p-0 h-auto">
                תנאי שימוש
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;