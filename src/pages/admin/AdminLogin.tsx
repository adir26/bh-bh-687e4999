import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from '@tanstack/react-query';
import { withTimeout } from '@/lib/withTimeout';
import { usePageLoadTimer } from '@/hooks/usePageLoadTimer';
import { PageBoundary } from '@/components/system/PageBoundary';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  usePageLoadTimer('AdminLogin');

  const sanitizeEmail = (email: string) => {
    return email?.replace(/\u200F|\u200E/g, '').trim().toLowerCase();
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      const cleanEmail = sanitizeEmail(credentials.email);
      
      // Authenticate with Supabase
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: credentials.password,
        }),
        12000
      );

      if (error) {
        console.error('[ADMIN_AUTH] Error:', error);
        throw new Error(error.message === "Invalid login credentials" 
          ? "פרטי הכניסה שגויים" 
          : "שגיאה בהתחברות, נסו שנית");
      }

      if (!data.user) {
        throw new Error("לא ניתן לאמת את המשתמש");
      }

      // Check if user is admin
      const { data: isAdminResult, error: adminError } = await withTimeout(
        supabase.rpc('is_admin', { user_id: data.user.id }),
        12000
      );

      if (adminError) {
        console.error('[ADMIN_AUTH] Admin check error:', adminError);
        throw new Error("לא ניתן לאמת הרשאות מנהל");
      }

      if (!isAdminResult) {
        // Sign out the user since they're not an admin
        await supabase.auth.signOut();
        throw new Error("אין לכם הרשאות מנהל");
      }

      // SECURITY FIX: Admin auth is now handled by useSecureAdminAuth hook
      // No need to store anything in localStorage
      return data;
    },
    onSuccess: () => {
      toast({
        title: "התחברות בוצעה בהצלחה",
        description: "ברוכים הבאים לפאנל הניהול",
      });
      navigate("/admin/dashboard");
    },
    onError: (error: Error) => {
      console.error('[ADMIN_AUTH] Error:', error);
      toast({
        title: "שגיאה בהתחברות",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4" dir="rtl">
      <Card className="w-full max-w-md mobile-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-hebrew">כניסת מנהלים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="font-hebrew text-right block">אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="הזינו כתובת אימייל"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                required
                className="text-right min-h-input mobile-button"
                dir="rtl"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="font-hebrew text-right block">סיסמה</Label>
              <Input
                id="password"
                type="password"
                placeholder="הזינו סיסמה"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
                className="text-right min-h-input mobile-button"
                dir="rtl"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full min-h-button mobile-button font-hebrew text-button" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "מתחבר..." : "התחברות"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}