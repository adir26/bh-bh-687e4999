import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <nav className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm">
          <Link 
            to="/accessibility" 
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-2 py-1"
            aria-label="הצהרת נגישות"
          >
            נגישות
          </Link>
          <Link 
            to="/terms" 
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-2 py-1"
            aria-label="תנאי שימוש"
          >
            תנאי שימוש
          </Link>
          <Link 
            to="/privacy-policy" 
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-2 py-1"
            aria-label="מדיניות פרטיות"
          >
            מדיניות פרטיות
          </Link>
        </nav>
      </div>
    </footer>
  );
}