import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface PageBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  timeout?: number;
}

export function PageBoundary({ 
  children, 
  fallback, 
  timeout = 10000 
}: PageBoundaryProps) {
  const [showFallback, setShowFallback] = useState(true);
  const [escalate, setEscalate] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowFallback(false), 200); // avoid flicker
    const t2 = setTimeout(() => setEscalate(true), timeout); // hard stop
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [timeout]);

  if (escalate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">הטעינה נתקעה</h3>
          <p className="text-muted-foreground mb-4">
            ניסינו לטעון נתונים מעל {timeout / 1000} שניות. נסו לרענן או ללחוץ "נסה שוב".
          </p>
          <Button onClick={() => location.reload()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            רענן דף
          </Button>
        </div>
      </div>
    );
  }

  if (showFallback) {
    return fallback ?? (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}