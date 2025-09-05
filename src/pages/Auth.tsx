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
import loginImage from '@/assets/login-interior.jpg';
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
    if (signupForm.password.length < 6) {
      toast.error('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    if (!signupForm.fullName.trim() || signupForm.fullName.trim().length < 2) {
      toast.error('אנא הזן שם מלא תקין');
      return;
    }
    setIsLoading(true);
    try {
      console.log('[AUTH_PAGE] Starting signup for:', {
        email: signupForm.email,
        role: signupForm.role,
        fullName: signupForm.fullName
      });
      const {
        error,
        data
      } = await signUp(signupForm.email, signupForm.password, {
        full_name: signupForm.fullName,
        role: signupForm.role
      });
      if (!error && data) {
        console.log('[AUTH_PAGE] Signup result:', {
          hasUser: !!data.user,
          hasSession: !!data.session
        });

        // Check if user is immediately available (no email confirmation required)
        if (data.user && data.session) {
          // User is logged in immediately - navigation handled in AuthContext
          console.log('[AUTH_PAGE] Immediate signup success');
        } else {
          // Email confirmation required, show message and switch to login tab
          console.log('[AUTH_PAGE] Email confirmation required');
          setActiveTab('login');
          setLoginForm({
            email: signupForm.email,
            password: ''
          });
          toast.success('הרשמה בוצעה בהצלחה! אנא בדוק את האימייל שלך לאישור החשבון ולאחר מכן התחבר.');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('שגיאה בהרשמה');
    }
    setIsLoading(false);
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
        <img src={loginImage} alt="Interior design" className="object-cover w-full h-full" />
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
                      <Input id="signup-password" type="password" placeholder="בחרו סיסמה חזקה (לפחות 6 תווים)" value={signupForm.password} onChange={e => setSignupForm({
                      ...signupForm,
                      password: e.target.value
                    })} required className="h-12 text-base" autoComplete="new-password" minLength={6} />
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
                      {isLoading ? 'נרשם...' : 'הרשמה'}
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