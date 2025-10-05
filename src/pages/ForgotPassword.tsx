import React, { useState } from 'react';
import { ArrowRight, Mail, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('אנא הזן כתובת מייל');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('כתובת האימייל לא תקינה');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('[FORGOT_PASSWORD] Error:', error);
        toast.error('שגיאה בשליחת המייל. אנא נסה שוב.');
      } else {
        console.log('[FORGOT_PASSWORD] Reset email sent successfully');
        setIsSubmitted(true);
      }
    } catch (error: any) {
      console.error('[FORGOT_PASSWORD] Unexpected error:', error);
      toast.error('אירעה שגיאה. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
              <h1 className="text-2xl font-bold mb-2 text-right">נשלח לך מייל!</h1>
              <p className="text-muted-foreground text-right text-sm leading-relaxed">
                שלחנו הוראות לאיפוס הסיסמה לכתובת המייל שלך
                <br />
                <span className="font-medium">{email}</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground text-right">
                לא קיבלת מייל? בדוק את תיקיית הספאם או נסה שוב
              </p>
              
              <div className="space-y-3">
                <Button 
                  variant="blue" 
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                >
                  שלח שוב
                </Button>
                
                <Link to="/auth">
                  <Button variant="ghost" className="w-full">
                    חזור להתחברות
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="bg-background border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-right">שכחתי סיסמה</h1>
           <Link to="/auth">
            <Button variant="ghost" size="icon">
              <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full p-8">
          <div className="mb-8 text-center">
            <Mail className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h2 className="text-xl font-semibold mb-2 text-right">איפוס סיסמה</h2>
            <p className="text-muted-foreground text-right text-sm leading-relaxed">
              הכנס את כתובת המייל שלך ונשלח לך הוראות לאיפוס הסיסמה
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-right">
                כתובת מייל
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                dir="ltr"
                className="text-left"
              />
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                variant="blue" 
                className="w-full"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? 'שולח...' : 'שלח הוראות איפוס'}
              </Button>

              <Link to="/auth">
                <Button variant="ghost" className="w-full">
                  חזור להתחברות
                </Button>
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center">
              זוכר את הסיסמה?{' '}
              <Link to="/auth" className="text-button-primary hover:underline font-medium">
                התחבר כאן
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;