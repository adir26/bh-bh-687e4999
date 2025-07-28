import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple admin authentication - in production this would be proper backend auth
    if (credentials.username === "admin" && credentials.password === "admin123") {
      localStorage.setItem("adminToken", "admin_authenticated");
      toast({
        title: "התחברות בוצעה בהצלחה",
        description: "ברוכים הבאים לפאנל הניהול",
      });
      navigate("/admin/dashboard");
    } else {
      toast({
        title: "שגיאה בהתחברות",
        description: "פרטי הכניסה שגויים",
        variant: "destructive",
      });
    }
    
    setLoading(false);
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
              <Label htmlFor="username" className="font-hebrew text-right block">שם משתמש</Label>
              <Input
                id="username"
                type="text"
                placeholder="הזינו שם משתמש"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
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