import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
          <span className="text-4xl font-bold text-muted-foreground">404</span>
        </div>
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
