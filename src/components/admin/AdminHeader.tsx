import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { LogOut, Shield, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminHeader() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast({
      title: "התנתקת בהצלחה",
      description: "יצאת מהמערכת בהצלחה",
    });
    navigate("/admin/login");
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 md:px-6 gap-4">
      {/* Mobile menu trigger */}
      <div className="md:hidden">
        <SidebarTrigger className="sidebar-trigger">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </div>
      
      <div className="flex items-center gap-2 text-primary">
        <Shield className="h-5 w-5" />
        <span className="font-semibold font-hebrew">פאנל ניהול</span>
      </div>
      
      <div className="mr-auto flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleLogout} className="font-hebrew">
          <LogOut className="h-4 w-4 ml-2" />
          יציאה
        </Button>
      </div>
    </header>
  );
}