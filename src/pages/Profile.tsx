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
  MapPin, MessageCircle, Phone, Mail, Globe
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
          {/* Home Details Section */}
          {onboardingData.homeDetails && (
            <Card className="mt-6 border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">הבית שלי</h3>
                    <p className="text-sm text-muted-foreground">{onboardingData.homeDetails.streetAndBuilding}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">גודל דירה</span>
                    <p className="font-medium">{onboardingData.homeDetails.apartmentSize} מ"ר</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">מספר חדרים</span>
                    <p className="font-medium">{onboardingData.homeDetails.numberOfRooms}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">קומה</span>
                    <p className="font-medium">{onboardingData.homeDetails.floorNumber}</p>
                  </div>
                  {onboardingData.homeDetails.apartmentNumber && (
                    <div className="space-y-1">
                      <span className="text-muted-foreground">מספר דירה</span>
                      <p className="font-medium">{onboardingData.homeDetails.apartmentNumber}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Planning Section */}
          {onboardingData.projectPlanning && (
            <Card className="mt-4 border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">הפרויקטים שלי</h3>
                    <p className="text-sm text-muted-foreground">תכנון ופרויקטים עתידיים</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {onboardingData.projectPlanning.projectTypes.map((project, index) => (
                      <Badge key={index} variant="secondary" className="bg-orange-500/10 text-orange-700 border-orange-200">
                        {projectLabels[project] || project}
                      </Badge>
                    ))}
                  </div>
                  {onboardingData.projectPlanning.otherProject && (
                    <p className="text-sm bg-muted/50 p-3 rounded-xl">
                      <span className="font-medium text-muted-foreground">פרויקט נוסף:</span> {onboardingData.projectPlanning.otherProject}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interests Section */}
          {onboardingData.userInterests && (
            <Card className="mt-4 border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">התחומים שלי</h3>
                    <p className="text-sm text-muted-foreground">נושאים מעניינים והעדפות</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">תחומי עניין</h4>
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.userInterests.interests.map((interest, index) => (
                        <Badge key={index} variant="outline" className="border-purple-200 text-purple-700">
                          {interestLabels[interest] || interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">דרכי קשר מועדפות</h4>
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.userInterests.contactChannels.map((channel, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-200">
                          {channelLabels[channel] || channel}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">שפות</h4>
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.userInterests.languages.map((language, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-500/10 text-green-700 border-green-200">
                          {languageLabels[language] || language}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {onboardingData.userInterests.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">הערות נוספות</h4>
                      <p className="text-sm text-foreground bg-muted/50 p-3 rounded-xl">
                        {onboardingData.userInterests.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-4 text-lg">פעולות מהירות</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-primary/5">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-sm text-foreground">המסמכים שלי</h4>
                  <p className="text-xs text-muted-foreground mt-1">חוזים ומסמכים</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-orange-500/5">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="font-medium text-sm text-foreground">ספקים בקרבתי</h4>
                  <p className="text-xs text-muted-foreground mt-1">מצא ספקים קרובים</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Menu Items */}
          <div className="mt-8 space-y-3">
            <h3 className="font-semibold text-foreground mb-4 text-lg">הגדרות</h3>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted/50 rounded-2xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Logout Button */}
            <Card className="mt-6 border-destructive/20 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-destructive">התנתק</h3>
                    <p className="text-sm text-destructive/70">התנתק מהחשבון שלך</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* App Version */}
          <div className="text-center text-xs text-muted-foreground mt-8 pb-24">
            גרסה 1.0.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;