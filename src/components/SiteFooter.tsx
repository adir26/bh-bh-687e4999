import { Link } from "react-router-dom";
import { getGuestModeParams } from "@/hooks/useGuestMode";
import { useLayoutEffect, useRef } from "react";

export function SiteFooter() {
  const guestParams = getGuestModeParams();
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const setVar = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--footer-h", `${h}px`);
    };
    
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  
  return (
    <footer ref={ref} className="bg-white/90 backdrop-blur border-t border-border mt-auto z-40 md:sticky md:bottom-0">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <nav className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-sm">
          <Link 
            to={`/accessibility${guestParams}`}
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-2 py-1"
            aria-label="הצהרת נגישות"
          >
            נגישות
          </Link>
          <Link 
            to={`/terms${guestParams}`}
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-2 py-1"
            aria-label="תנאי שימוש"
          >
            תנאי שימוש
          </Link>
          <Link 
            to={`/privacy-policy${guestParams}`}
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-2 py-1"
            aria-label="מדיניות פרטיות"
          >
            מדיניות פרטיות
          </Link>
        </nav>
      </div>
      <div className="h-[calc(env(safe-area-inset-bottom,0))]" />
    </footer>
  );
}