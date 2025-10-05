import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lock, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Verify we have the necessary tokens
  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      console.error('[RESET_PASSWORD] URL Error:', error, errorDescription);
      toast.error('הקישור לא תקין או פג תוקפו');
      setTimeout(() => navigate('/forgot-password'), 3000);
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password validation
    if (password.length < 8) {
      toast.error('סיסמה חייבת להכיל 8 תווים לפחות');
      return;
    }

    const hasLetter = /[A-Za-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const classes = (hasLetter ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSymbol ? 1 : 0);

    if (!hasLetter || classes < 2) {
      toast.error('סיסמה חייבת 8+ תווים ולשלב אותיות + (מספרים או סימנים)');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('הסיסמאות אינן תואמות');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('[RESET_PASSWORD] Error:', error);
        toast.error('שגיאה באיפוס הסיסמה. אנא נסה שוב.');
      } else {
        console.log('[RESET_PASSWORD] Password updated successfully');
        setIsSuccess(true);
        toast.success('הסיסמה עודכנה בהצלחה!');
        
        // Redirect to auth page after 2 seconds
        setTimeout(() => navigate('/auth'), 2000);
      }
    } catch (error: any) {
      console.error('[RESET_PASSWORD] Unexpected error:', error);
      toast.error('אירעה שגיאה. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full p-8 text-center">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
            <h1 className="text-2xl font-bold mb-2">הסיסמה עודכנה בהצלחה!</h1>
            <p className="text-muted-foreground mb-4">מעביר אותך לדף ההתחברות...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full p-8">
          <div className="mb-8 text-center">
            <Lock className="mx-auto mb-4 text-primary" size={48} />
            <h1 className="text-2xl font-bold mb-2">איפוס סיסמה</h1>
            <p className="text-muted-foreground text-sm">
              הזן סיסמה חדשה לחשבון שלך
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה חדשה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="לפחות 8 תווים"
                required
                minLength={8}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                8+ תווים, אותיות + (מספרים או סימנים)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">אימות סיסמה</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="הזן שוב את הסיסמה"
                required
                className="h-12"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12"
              disabled={isLoading}
            >
              {isLoading ? 'מעדכן סיסמה...' : 'עדכן סיסמה'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
