import React, { useEffect, useState } from 'react';
import { User, Settings, Bell, CreditCard, HelpCircle, LogOut, ChevronLeft, Star, MapPin, Home, FileText, Calendar, MessageCircle, Globe, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OnboardingData {
  homeDetails?: {
    address: string;
    apartmentType: string;
    roomCount: string;
    buildingAge: string;
    residentsCount: string;
    hasElevator: boolean;
    hasParking: boolean;
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
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

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
      id: 'personal-info',
      icon: User,
      title: 'פרטים אישיים',
      subtitle: 'עדכן את הפרטים שלך',
      href: '/profile/personal-info'
    },
    {
      id: 'addresses',
      icon: MapPin,
      title: 'כתובות',
      subtitle: 'נהל את הכתובות שלך',
      href: '/profile/addresses'
    },
    {
      id: 'payment',
      icon: CreditCard,
      title: 'אמצעי תשלום',
      subtitle: 'כרטיסי אשראי וחשבונות בנק',
      href: '/profile/payment'
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'התראות',
      subtitle: 'נהל העדפות התראות',
      href: '/profile/notifications'
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
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-foreground rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">שירה כהן</h1>
              <p className="text-primary-foreground/80 text-sm">shirakohav1234@gmail.com</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Home Details Section */}
          {onboardingData.homeDetails && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">הבית שלי</h3>
                    <p className="text-sm text-muted-foreground">כתובת: {onboardingData.homeDetails.address}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">סוג דירה:</span>
                    <span className="font-medium">{onboardingData.homeDetails.apartmentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">מספר חדרים:</span>
                    <span className="font-medium">{onboardingData.homeDetails.roomCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">גיל הבניין:</span>
                    <span className="font-medium">{onboardingData.homeDetails.buildingAge}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Planning Section */}
          {onboardingData.projectPlanning && (
            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">הפרויקטים שלי</h3>
                    <p className="text-sm text-muted-foreground">תכנון ופרויקטים עתידיים</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {onboardingData.projectPlanning.projectTypes.map((project, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {projectLabels[project] || project}
                      </Badge>
                    ))}
                  </div>
                  {onboardingData.projectPlanning.otherProject && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">פרויקט נוסף:</span> {onboardingData.projectPlanning.otherProject}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interests Section */}
          {onboardingData.userInterests && (
            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">התחומים שלי</h3>
                    <p className="text-sm text-muted-foreground">נושאים מעניינים והעדפות</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">תחומי עניין:</h4>
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.userInterests.interests.map((interest, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {interestLabels[interest] || interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">דרכי קשר מועדפות:</h4>
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.userInterests.contactChannels.map((channel, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {channelLabels[channel] || channel}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">שפות:</h4>
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.userInterests.languages.map((language, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {languageLabels[language] || language}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {onboardingData.userInterests.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">הערות נוספות:</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {onboardingData.userInterests.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents Section */}
          <Card className="mt-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">המסמכים שלי</h3>
                  <p className="text-sm text-muted-foreground">חוזים ומסמכים</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-100 rounded-lg p-3 text-center">
                  <div className="w-8 h-10 bg-orange-300 rounded mx-auto mb-2"></div>
                  <p className="text-xs text-orange-700 font-medium">מידע הבית ג'וניפר 1 ת"א</p>
                  <p className="text-xs text-orange-600">PDF</p>
                </div>
                <div className="bg-orange-100 rounded-lg p-3 text-center">
                  <div className="w-8 h-10 bg-orange-300 rounded mx-auto mb-2"></div>
                  <p className="text-xs text-orange-700 font-medium">מידע הבית ג'וניפר 1 ת"א</p>
                  <p className="text-xs text-orange-600">PDF</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suppliers Section */}
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-4">ספקים שנתבקשתי</h3>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary-foreground rounded text-xs flex items-center justify-center font-bold text-primary">
                        DS
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">Design Studio X</h4>
                      <p className="text-sm text-muted-foreground">עיצוב פנים</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      הזמן שירות
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded text-xs flex items-center justify-center font-bold text-teal-600">
                        HT
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">HomeTech Solutions</h4>
                      <p className="text-sm text-muted-foreground">בית חכם</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      הזמן שירות
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Personalized Offers */}
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-4">הצעות מותאמות אישית</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-orange-100 to-orange-200"></div>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm text-foreground">Kitchen Upgrade</h4>
                  <p className="text-xs text-muted-foreground">Exclusive offer on kitchen appliances</p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-green-100 to-green-200"></div>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm text-foreground">Bathroom Renovation</h4>
                  <p className="text-xs text-muted-foreground">Special discount on bathroom fixtures</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Menu Items */}
          <div className="mt-8 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Logout Button */}
            <Card className="mt-6 border-destructive/20 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-destructive">התנתק</h3>
                    <p className="text-sm text-destructive/70">התנתק מהחשבון שלך</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-destructive/70" />
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