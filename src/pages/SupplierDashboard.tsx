import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Settings, Package, Users, BarChart3 } from 'lucide-react';

export default function SupplierDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">פאנל ספק</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
          >
            לדף הבית
          </Button>
        </div>
      </div>

      {/* Success Message */}
      <div className="p-6">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              🎉 מזל טוב! הפרופיל שלכם פרסם בהצלחה
            </h2>
            <p className="text-muted-foreground">
              הפרופיל שלכם זמין עכשיו ללקוחות באפליקציה
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 mt-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-primary" />
                  <div className="flex-1 text-right">
                    <h3 className="font-semibold">עריכת פרופיל</h3>
                    <p className="text-sm text-muted-foreground">עדכנו פרטים ותמונות</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-primary" />
                  <div className="flex-1 text-right">
                    <h3 className="font-semibold">ניהול מוצרים</h3>
                    <p className="text-sm text-muted-foreground">הוסיפו או עדכנו מוצרים</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <div className="flex-1 text-right">
                    <h3 className="font-semibold">פניות לקוחות</h3>
                    <p className="text-sm text-muted-foreground">צפו והגיבו לפניות</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  <div className="flex-1 text-right">
                    <h3 className="font-semibold">סטטיסטיקות</h3>
                    <p className="text-sm text-muted-foreground">צפיות וביצועי הפרופיל</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="pt-6">
            <Button
              variant="blue"
              className="w-full"
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