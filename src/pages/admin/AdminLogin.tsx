import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const sanitizeEmail = (email: string) => {
    return email?.replace(/\u200F|\u200E/g, '').trim().toLowerCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanEmail = sanitizeEmail(credentials.email);
      
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: credentials.password,
      });

      if (error) {
        console.error('[ADMIN_AUTH] Error:', error);
        toast({
          title: "שגיאה בהתחברות",
          description: error.message === "Invalid login credentials" 
            ? "פרטי הכניסה שגויים" 
            : "שגיאה בהתחברות, נסו שנית",
          variant: "destructive",
        });
        return;
      }

      if (!data.user) {
        toast({
          title: "שגיאה בהתחברות", 
          description: "לא ניתן לאמת את המשתמש",
          variant: "destructive",
        });
        return;
      }

      // Check if user is admin
      const { data: isAdminResult, error: adminError } = await supabase
        .rpc('is_admin', { user_id: data.user.id });

      if (adminError) {
        console.error('[ADMIN_AUTH] Admin check error:', adminError);
        toast({
          title: "שגיאה בהרשאות",
          description: "לא ניתן לאמת הרשאות מנהל",
          variant: "destructive",
        });
        return;
      }

      if (!isAdminResult) {
        toast({
          title: "גישה נדחתה",
          description: "אין לכם הרשאות מנהל",
          variant: "destructive",
        });
        // Sign out the user since they're not an admin
        await supabase.auth.signOut();
        return;
      }

      // Store session securely
      localStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem("adminUserId", data.user.id);
      
      toast({
        title: "התחברות בוצעה בהצלחה",
        description: "ברוכים הבאים לפאנל הניהול",
      });
      
      navigate("/admin/dashboard");
    } catch (error) {
      console.error('[ADMIN_AUTH] Unexpected error:', error);
      toast({
        title: "שגיאה בהתחברות",
        description: "שגיאה לא צפויה, נסו שנית",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
            >
              {loading ? "מתחבר..." : "התחברות"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}