
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Settings, Package, Users, BarChart3 } from 'lucide-react';

export default function SupplierDashboard() {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Settings,
      title: 'עריכת פרופיל',
      description: 'עדכנו פרטים ותמונות',
      action: () => console.log('Edit profile')
    },
    {
      icon: Package,
      title: 'ניהול מוצרים',
      description: 'הוסיפו או עדכנו מוצרים',
      action: () => console.log('Manage products')
    },
    {
      icon: Users,
      title: 'פניות לקוחות',
      description: 'צפו והגיבו לפניות',
      action: () => console.log('Customer inquiries')
    },
    {
      icon: BarChart3,
      title: 'סטטיסטיקות',
      description: 'צפיות וביצועי הפרופיל',
      action: () => console.log('Statistics')
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="mobile-padding border-b border-border pt-safe">
        <div className="mobile-container flex justify-between items-center">
          <h1 className="text-lg xs:text-xl font-bold">פאנל ספק</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="text-xs xs:text-sm"
          >
            לדף הבית
          </Button>
        </div>
      </div>

      {/* Success Message */}
      <div className="mobile-padding pb-safe">
        <div className="mobile-container text-center space-y-6 xs:space-y-8">
          <div className="flex justify-center pt-6 xs:pt-8">
            <CheckCircle className="w-16 h-16 xs:w-20 xs:h-20 text-green-500 animate-bounce-gentle" />
          </div>
          
          <div className="space-y-3 xs:space-y-4">
            <h2 className="text-xl xs:text-2xl font-bold text-foreground leading-tight">
              🎉 מזל טוב! הפרופיל שלכם פרסם בהצלחה
            </h2>
            <p className="text-muted-foreground text-sm xs:text-base leading-relaxed max-w-md mx-auto">
              הפרופיל שלכם זמין עכשיו ללקוחות באפליקציה
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 xs:space-y-4 mt-6 xs:mt-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={index}
                  className="mobile-card hover-lift cursor-pointer"
                  onClick={action.action}
                >
                  <CardContent className="mobile-padding">
                    <div className="flex items-center gap-3 xs:gap-4 text-right">
                      <Icon className="w-5 h-5 xs:w-6 xs:h-6 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm xs:text-base text-foreground">
                          {action.title}
                        </h3>
                        <p className="text-xs xs:text-sm text-muted-foreground leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="pt-6 xs:pt-8">
            <Button
              variant="blue"
              className="w-full h-12 xs:h-14 text-sm xs:text-base font-medium"
              onClick={() => navigate('/')}
            >
              חזרה לדף הבית
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
