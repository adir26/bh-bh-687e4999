import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import notFoundImg from "@/assets/not-found-illustration.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" dir="rtl">
      <div className="text-center space-y-6 max-w-sm mx-auto">
        <img 
          src={notFoundImg} 
          alt="דף לא נמצא" 
          className="w-48 h-48 mx-auto object-contain"
        />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">הדף לא נמצא</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            מצטערים, הדף שחיפשתם לא קיים או הוסר.
          </p>
        </div>
        <Link to="/">
          <Button className="min-h-[44px] gap-2">
            <Home className="h-4 w-4" />
            חזרה לדף הבית
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
