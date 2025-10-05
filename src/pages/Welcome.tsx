import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, LogIn, UserPlus, Eye } from 'lucide-react';
import welcomeImage from '@/assets/welcome-onboarding.jpg';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/auth?tab=login');
  };

  const handleSignup = () => {
    navigate('/auth?tab=signup');
  };

  const handleGuestMode = () => {
    // Set guest mode and redirect to public homepage
    sessionStorage.setItem('guestMode', 'true');
    navigate('/?guest=1');
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            ברוכים הבאים
          </h1>
          <p className="text-muted-foreground text-lg">
            הפלטפורמה המובילה לחיבור בין לקוחות וספקים
          </p>
        </div>

        {/* Welcome Image */}
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <img 
            src={welcomeImage} 
            alt="ברוכים הבאים" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
            <p className="text-white text-sm font-medium">
              אלפי ספקים מובילים מחכים לכם
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="space-y-3">
          {/* Login */}
          <Card className="transition-all duration-200 hover:shadow-md border-primary/20">
            <CardContent className="p-4">
              <Button 
                onClick={handleLogin} 
                variant="default" 
                size="lg" 
                className="w-full h-12 text-base font-medium"
              >
                <LogIn className="ml-2 h-5 w-5" />
                התחברות לחשבון קיים
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                יש לכם כבר חשבון? התחברו עכשיו
              </p>
            </CardContent>
          </Card>

          {/* Sign up */}
          <Card className="transition-all duration-200 hover:shadow-md border-secondary/20">
            <CardContent className="p-4">
              <Button 
                onClick={handleSignup} 
                variant="default" 
                size="lg" 
                className="w-full h-12 text-base font-medium"
              >
                <UserPlus className="ml-2 h-5 w-5" />
                הרשמה חינם
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                צרו חשבון חדש והתחילו להשתמש
              </p>
            </CardContent>
          </Card>

          {/* Guest Mode */}
          <Card className="transition-all duration-200 hover:shadow-md border-muted/40">
            <CardContent className="p-4">
              <Button 
                onClick={handleGuestMode} 
                variant="ghost" 
                size="lg" 
                className="w-full h-12 text-base font-medium text-muted-foreground hover:text-foreground"
              >
                <Eye className="ml-2 h-5 w-5" />
                עיון כאורח
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                עיינו בתוכן בלי הרשמה • יכולות מוגבלות
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits for registered users */}
        <div className="bg-primary/5 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-sm text-center text-foreground">
            יתרונות החשבון הרשום:
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• שמירת פריטים למועדפים</li>
            <li>• יצירת קשר ישיר עם ספקים</li>
            <li>• קבלת הצעות מחיר מותאמות</li>
            <li>• גישה למבצעים בלעדיים</li>
            <li>• מעקב אחר הזמנות ופרויקטים</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            על ידי השימוש באתר אתם מסכימים ל
            <a href="/terms" className="text-primary hover:underline mx-1">תקנון</a>
            ול
            <a href="/privacy-policy" className="text-primary hover:underline mx-1">מדיניות הפרטיות</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;