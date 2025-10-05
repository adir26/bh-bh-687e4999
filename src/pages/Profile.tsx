import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { profilesService } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, Settings, Bell, CreditCard, HelpCircle, LogOut, 
  Edit3, Check, X, Clock, Truck, ChevronRight, 
  ShoppingCart, Package, MapPin, FileText
} from 'lucide-react';
import profileHero from '@/assets/profile-hero.jpg';
import { supaSelect } from '@/lib/supaFetch';
import { OnboardingGuard } from '@/components/OnboardingGuard';
import { PageBoundary } from '@/components/system/PageBoundary';
import { usePageLoadTimer } from '@/hooks/usePageLoadTimer';

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
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  // Page load timer for performance tracking
  usePageLoadTimer('profile');
  
  // Debug logging
  console.log('[Profile] User:', user?.id, 'Profile:', profile?.id);

  const form = useForm<UserProfile>({
    defaultValues: {
      fullName: profile?.full_name || '',
      email: profile?.email || ''
    },
    values: {
      fullName: profile?.full_name || '',
      email: profile?.email || ''
    }
  });

  // Fetch user orders with React Query - only when user and profile are ready
  const { data: userOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    enabled: !!user?.id && !!profile,
    queryFn: async ({ signal }) => {
      try {
        console.log('[Profile] Fetching orders for user:', user!.id);
        const data = await supaSelect<any[]>(
          supabase
            .from('orders')
            .select('*')
            .eq('client_id', user!.id)
            .order('created_at', { ascending: false }),
          { 
            signal,
            errorMessage: 'שגיאה בטעינת ההזמנות',
            timeoutMs: 10_000
          }
        );
        console.log('[Profile] Orders loaded:', data?.length || 0);
        return data || [];
      } catch (error: any) {
        // Handle missing table or RLS issues gracefully
        console.log('[Profile] Orders query failed, returning empty array:', error.message);
        return [];
      }
    },
    retry: 1,
    staleTime: 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Fetch onboarding data from localStorage
  const { data: onboardingData = {} } = useQuery({
    queryKey: ['onboarding-data'],
    queryFn: async (): Promise<OnboardingData> => {
      try {
        const homeDetails = localStorage.getItem('homeDetails');
        const projectPlanning = localStorage.getItem('projectPlanning');
        const userInterests = localStorage.getItem('userInterests');

        return {
          homeDetails: homeDetails ? JSON.parse(homeDetails) : null,
          projectPlanning: projectPlanning ? JSON.parse(projectPlanning) : null,
          userInterests: userInterests ? JSON.parse(userInterests) : null,
        };
      } catch (error) {
        console.error('Error loading localStorage data:', error);
        return {};
      }
    },
    staleTime: Infinity, // This data doesn't change frequently
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UserProfile) => {
      if (!user) throw new Error('משתמש לא מחובר');
      
      await profilesService.updateProfile(user.id, {
        full_name: data.fullName
      });
      return data;
    },
    onSuccess: () => {
      toast.success('הפרופיל עודכן בהצלחה');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('שגיאה בעדכון הפרופיל');
    }
  });

  // Process user orders for display
  const activeOrders = userOrders.filter(order => 
    !['completed', 'cancelled'].includes(order.status)
  );
  
  const orderHistory = userOrders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  ).slice(0, 3);
  
  const nextDelivery = activeOrders.find(order => 
    order.status === 'confirmed' || order.status === 'in_progress'
  );

  const handleSaveProfile = (data: UserProfile) => {
    updateProfileMutation.mutate(data);
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
      href: '/notifications-preferences'
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
      href: '/settings'
    },
    {
      id: 'help',
      icon: HelpCircle,
      title: 'עזרה ותמיכה',
      subtitle: 'שאלות נפוצות וצור קשר',
      href: '/support'
    }
  ];

  return (
    <OnboardingGuard>
      <PageBoundary>
        <div className="min-h-screen bg-background" dir="rtl">
          <div className="max-w-md mx-auto bg-background">
            {!user ? (
              <div className="text-center space-y-4 py-16 px-6">
                <User className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-semibold text-foreground">התחבר כדי לראות פרופיל</h3>
                  <p className="text-sm text-muted-foreground">
                    התחבר לחשבון שלך כדי לנהל את הפרופיל והעדפות
                  </p>
                  <Button onClick={() => navigate('/auth')} className="mt-4">
                    התחבר עכשיו
                  </Button>
                </div>
              </div>
            ) : !profile ? (
              <div className="text-center space-y-4 py-16 px-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">טוען פרופיל...</p>
              </div>
            ) : (
              <>
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
                              disabled={updateProfileMutation.isPending}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={handleCancelEdit}
                              className="bg-white/95 hover:bg-white text-primary border-0 h-9 w-9 p-0"
                              disabled={updateProfileMutation.isPending}
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
                <div className="px-6 pb-nav-safe">
            {/* My Activity Section */}
            {nextDelivery && (
              <Card className="mt-6 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 text-sm">פעילות שלי</h3>
                      <p className="text-blue-800 text-xs mt-1">
                        ההזמנה הבאה שלך: <span className="font-medium">{nextDelivery.title}</span>
                      </p>
                      <p className="text-blue-700 text-xs">סכום: ₪{Number(nextDelivery.amount).toLocaleString()}</p>
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary"
                  onClick={() => navigate('/orders')}
                >
                  צפה בהיסטוריה המלאה
                  <ChevronRight className="w-4 h-4 mr-1" />
                </Button>
              </div>
              
              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : orderHistory.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-xl">
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-medium text-foreground mb-2">אין הזמנות עדיין</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      התחל לחפש ספקים ולבצע הזמנות
                    </p>
                    <Button onClick={() => navigate('/')}>
                      חפש ספקים
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {orderHistory.map((order) => (
                    <Card key={order.id} className="border-0 shadow-sm rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-foreground">{order.title}</h4>
                              <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('he-IL')}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-sm text-foreground">₪{Number(order.amount).toLocaleString()}</p>
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700 text-xs">
                              {order.status === 'completed' ? 'הושלם' : 'בוטל'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
                            <h4 className="font-medium text-sm text-foreground">{order.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {order.due_date ? `צפוי: ${new Date(order.due_date).toLocaleDateString('he-IL')}` : 'בתהליך'}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm text-foreground">₪{Number(order.amount).toLocaleString()}</p>
                          <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                            {order.status === 'pending' ? 'ממתין' : order.status === 'confirmed' ? 'אושר' : 'בעבודה'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Settings Menu */}
            <div className="mt-8 space-y-3">
              {menuItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow rounded-xl"
                  onClick={() => navigate(item.href)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-foreground">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Logout Button */}
            <div className="mt-8 mb-32">
              <Button 
                variant="outline" 
                className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl h-12"
                onClick={() => {
                  // Add logout logic here
                  console.log('Logout clicked');
                }}
              >
                <LogOut className="w-5 h-5 ml-2" />
                התנתק
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
</PageBoundary>
</OnboardingGuard>
  );
};

export default Profile;