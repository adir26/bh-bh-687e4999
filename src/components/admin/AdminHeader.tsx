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
    <header className="h-14 md:h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 md:px-6 gap-3 md:gap-4 sticky top-0 z-40">
      {/* Mobile menu trigger */}
      <div className="md:hidden">
        <SidebarTrigger className="min-h-button min-w-button">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </div>
      
      <div className="flex items-center gap-2 text-primary flex-1 min-w-0">
        <Shield className="h-5 w-5 flex-shrink-0" />
        <span className="font-semibold font-hebrew text-sm md:text-base truncate">פאנל ניהול</span>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout} 
          className="font-hebrew min-h-button text-xs md:text-sm"
        >
          <LogOut className="h-4 w-4 ml-1 md:ml-2" />
          <span className="hidden xs:inline">יציאה</span>
          <span className="xs:hidden">יציאה</span>
        </Button>
      </div>
    </header>
  );
}