import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ 
    email: '', 
    password: '', 
    fullName: '', 
    role: 'client' as 'client' | 'supplier',
    phone: ''
  });
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('login');

  // Handle tab switching and prefill data
  useEffect(() => {
    if (user) {
      navigate('/');
      return;
    }

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
  }, [user, navigate, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('אנא מלא את כל השדות');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(loginForm.email, loginForm.password);
      
      if (!error) {
        // Success toast is handled in AuthContext
        // Navigation will happen automatically via auth state change
      }
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
    
    if (signupForm.password.length < 6) {
      toast.error('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(
        signupForm.email, 
        signupForm.password, 
        signupForm.fullName,
        signupForm.role
      );
      
      if (!error) {
        // Success toast is handled in AuthContext
        setActiveTab('login');
        setLoginForm({ email: signupForm.email, password: '' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('שגיאה בהרשמה');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex pb-nav-safe">
      {/* Right side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={loginImage}
          alt="Interior design"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-2">ברוכים הבאים לפלטפורמה המובילה</h2>
            <p className="text-lg opacity-90">חברו לקהילת הספקים והלקוחות הגדולה ביותר בישראל</p>
          </div>
        </div>
      </div>

      {/* Left side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">התחברות לחשבון</h1>
            <p className="text-muted-foreground mt-2">
              הזינו את פרטיכם להתחברות או הרשמה
            </p>
          </div>

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
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">סיסמה</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
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
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="השם המלא שלכם"
                        value={signupForm.fullName}
                        onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">כתובת אימייל</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">סיסמה</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="בחרו סיסמה חזקה"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">מספר טלפון</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="052-123-4567"
                        value={signupForm.phone}
                        onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-role">סוג המשתמש</Label>
                      <Select 
                        value={signupForm.role} 
                        onValueChange={(value: 'client' | 'supplier') => setSignupForm({ ...signupForm, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="בחרו סוג משתמש" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">לקוח</SelectItem>
                          <SelectItem value="supplier">ספק</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'נרשם...' : 'הרשמה'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;