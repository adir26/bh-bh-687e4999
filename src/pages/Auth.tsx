import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import loginImage from '@/assets/auth-luxury-building.jpg';
const Auth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'client' as 'client' | 'supplier'
  });
  const {
    signIn,
    signUp,
    signInWithGoogle,
    user,
    profile
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('login');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Handle tab switching from URL params  
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
      // Load signup data if coming from registration
      const signupData = localStorage.getItem('signupData');
      if (signupData) {
        const data = JSON.parse(signupData);
        setSignupForm(data);
        localStorage.removeItem('signupData');
      }
    }
  }, [searchParams]);
  const getDefaultRoute = (role: string, isNewUser = false) => {
    // If user is new (just signed up), redirect to onboarding
    if (isNewUser) {
      switch (role) {
        case 'supplier':
          return '/onboarding/supplier-welcome';
        case 'client':
        default:
          return '/onboarding/welcome';
      }
    }

    // For existing users (login), redirect to dashboard
    switch (role) {
      case 'supplier':
        return '/supplier-dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'client':
      default:
        return '/';
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('אנא מלא את כל השדות');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginForm.email.trim())) {
      toast.error('כתובת האימייל לא תקינה');
      return;
    }
    setIsLoading(true);
    try {
      const {
        error
      } = await signIn(loginForm.email, loginForm.password);
      if (error) {
        console.error('Login error:', error);
        toast.error('שגיאה בהתחברות');
      }
      // Navigation is now handled in AuthContext
    } catch (error) {
      console.error('Login error:', error);
      toast.error('שגיאה בהתחברות');
    }
    setIsLoading(false);
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isLoading) {
      console.log('[AUTH_PAGE] Signup already in progress, ignoring duplicate submission');
      return;
    }

    // Form validation
    if (!signupForm.email || !signupForm.password || !signupForm.fullName) {
      toast.error('אנא מלא את כל השדות הדרושים');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupForm.email.trim())) {
      toast.error('כתובת האימייל לא תקינה');
      return;
    }
    
    // Password validation using the new relaxed policy
    if (signupForm.password.length < 8) {
      toast.error('סיסמה חייבת 8+ תווים ולשלב אותיות + (מספרים או סימנים)');
      return;
    }
    
    const hasLetter = /[A-Za-z]/.test(signupForm.password);
    const hasDigit = /\d/.test(signupForm.password);
    const hasSymbol = /[^A-Za-z0-9]/.test(signupForm.password);
    const classes = (hasLetter ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSymbol ? 1 : 0);

    if (!hasLetter || classes < 2) {
      toast.error('סיסמה חייבת 8+ תווים ולשלב אותיות + (מספרים או סימנים)');
      return;
    }
    
    if (!signupForm.fullName.trim() || signupForm.fullName.trim().length < 2) {
      toast.error('אנא הזן שם מלא תקין');
      return;
    }

    setIsLoading(true);
    let processingComplete = false;
    
    try {
      console.log('[AUTH_PAGE] Starting signup for:', {
        email: signupForm.email,
        role: signupForm.role,
        fullName: signupForm.fullName
      });
      
      const { error, data } = await signUp(
        signupForm.email, 
        signupForm.password, 
        {
          full_name: signupForm.fullName,
          role: signupForm.role
        }
      );
      
      if (error) {
        console.error('[AUTH_PAGE] Signup error:', error);
        processingComplete = true;
        
        // Provide clear, actionable error messages
        let errorMessage = error.message || 'שגיאה בהרשמה. אנא נסה שוב';
        if (error.message?.includes('שגיאה בשמירת נתונים')) {
          errorMessage = 'אירעה שגיאה בשמירת הנתונים. אנא נסה שוב במספר שניות';
        } else if (error.message?.includes('כבר רשום')) {
          errorMessage = 'המייל כבר רשום במערכת. נסה להתחבר או השתמש במייל אחר';
        }
        
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }
      
      if (data) {
        console.log('[AUTH_PAGE] Signup result:', {
          hasUser: !!data.user,
          hasSession: !!data.session
        });

        // Check if user is immediately available (no email confirmation required)
        if (data.user && data.session) {
          // User is logged in immediately - let AuthContext handle navigation
          // Don't set isLoading(false) here - let the page unmount naturally during navigation
          console.log('[AUTH_PAGE] Immediate signup success - navigation handled by AuthContext');
          toast.success('נרשמת בהצלחה! מעביר אותך לתהליך ההתחלה...');
          processingComplete = true;
        } else {
          // Email confirmation required, show message and switch to login tab
          console.log('[AUTH_PAGE] Email confirmation required');
          processingComplete = true;
          setIsLoading(false);
          setActiveTab('login');
          setLoginForm({
            email: signupForm.email,
            password: ''
          });
          toast.success('הרשמה בוצעה בהצלחה! אנא בדוק את האימייל שלך לאישור החשבון ולאחר מכן התחבר.');
        }
      }
    } catch (error: any) {
      console.error('[AUTH_PAGE] Unexpected signup error:', error);
      processingComplete = true;
      
      const errorMessage = error.message?.includes('שגיאה בשמירת נתונים') 
        ? 'אירעה שגיאה בשמירת הנתונים. אנא נסה שוב במספר שניות'
        : 'שגיאה בהרשמה. אנא נסה שוב';
        
      toast.error(errorMessage);
      setIsLoading(false);
    } finally {
      // Only clear loading if we didn't successfully complete signup with immediate session
      if (!processingComplete) {
        setIsLoading(false);
      }
    }
  };
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      console.log('[AUTH_PAGE] Starting Google OAuth');
      const {
        error
      } = await signInWithGoogle();
      if (error) {
        console.error('[AUTH_PAGE] Google OAuth error:', error);
        // Error is already handled in signInWithGoogle function
      } else {
        console.log('[AUTH_PAGE] Google OAuth initiated successfully');
        // User will be redirected to Google, then back to /auth/callback
      }
    } catch (error) {
      console.error('[AUTH_PAGE] Unexpected Google OAuth error:', error);
      toast.error('שגיאה בהתחברות עם Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };
  return <div className="min-h-screen flex pb-safe">
      {/* Right side - Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src={loginImage} alt="בניין יוקרתי" className="object-cover w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-2">ברוכים הבאים לפלטפורמה המובילה</h2>
            <p className="text-lg opacity-90">חברו לקהילת הספקים והלקוחות הגדולה ביותר בישראל</p>
          </div>
        </div>
      </div>

      {/* Left side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 relative z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">התחברות לחשבון</h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              הזינו את פרטיכם להתחברות או הרשמה
            </p>
          </div>

          {/* Guest Mode Option */}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                רוצים לעיין בלי להירשם?
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  sessionStorage.setItem('guestMode', 'true');
                  navigate('/?guest=1');
                }}
                className="h-10 px-6"
              >
                המשיכו כאורח
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                יכולות מוגבלות • ללא שמירת נתונים
              </p>
            </CardContent>
          </Card>

          {/* Google OAuth Button */}
          

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">התחברות</TabsTrigger>
              <TabsTrigger value="signup">הרשמה</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>התחברות</CardTitle>
                  <CardDescription>
                    הזינו את כתובת האימייל והסיסמה שלכם
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">כתובת אימייל</Label>
                      <Input id="login-email" type="email" placeholder="your@email.com" value={loginForm.email} onChange={e => setLoginForm({
                      ...loginForm,
                      email: e.target.value
                    })} required className="h-12 text-base" autoComplete="email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">סיסמה</Label>
                      <Input id="login-password" type="password" value={loginForm.password} onChange={e => setLoginForm({
                      ...loginForm,
                      password: e.target.value
                    })} required className="h-12 text-base" autoComplete="current-password" />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                      {isLoading ? 'מתחבר...' : 'התחברות'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>הרשמה</CardTitle>
                  <CardDescription>
                    צרו חשבון חדש כדי להתחיל
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">שם מלא</Label>
                      <Input id="signup-name" type="text" placeholder="השם המלא שלכם" value={signupForm.fullName} onChange={e => setSignupForm({
                      ...signupForm,
                      fullName: e.target.value
                    })} required className="h-12 text-base" autoComplete="name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">כתובת אימייל</Label>
                      <Input id="signup-email" type="email" placeholder="your@email.com" value={signupForm.email} onChange={e => setSignupForm({
                      ...signupForm,
                      email: e.target.value
                    })} required className="h-12 text-base" autoComplete="email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">סיסמה</Label>
                      <Input id="signup-password" type="password" placeholder="סיסמה באורך 8 תווים לפחות, ולכלול אותיות וגם (מספרים או סימנים)" value={signupForm.password} onChange={e => setSignupForm({
                      ...signupForm,
                      password: e.target.value
                    })} required className="h-12 text-base" autoComplete="new-password" minLength={8} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-role">סוג המשתמש</Label>
                      <Select value={signupForm.role} onValueChange={(value: 'client' | 'supplier') => setSignupForm({
                      ...signupForm,
                      role: value
                    })}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="בחרו סוג משתמש" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">לקוח</SelectItem>
                          <SelectItem value="supplier">ספק</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                      {isLoading ? 'מעבד את הרישום...' : 'הרשמה'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Terms & Privacy Notice */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              על ידי המשך השימוש באתר אתם מסכימים ל
              <a href="/terms" className="text-primary hover:underline mx-1">תקנון</a>
              ול
              <a href="/privacy-policy" className="text-primary hover:underline mx-1">מדיניות הפרטיות</a>
              שלנו
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default Auth;