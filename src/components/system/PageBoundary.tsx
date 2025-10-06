import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

// New interface for error-boundary pattern
type NewPageBoundaryProps = {
  isLoading: boolean;
  isError: boolean;
  error?: any;
  isEmpty?: boolean;
  empty?: React.ReactNode;
  onRetry?: () => void;
  children: React.ReactNode;
};

// Legacy interface for timeout pattern (still supported for backward compatibility)
type LegacyPageBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  timeout?: number;
};

type PageBoundaryProps = NewPageBoundaryProps | LegacyPageBoundaryProps;

export function PageBoundary(props: PageBoundaryProps) {
  // Check if this is the new pattern or legacy pattern
  const isNewPattern = 'isLoading' in props || 'isError' in props;
  
  if (isNewPattern) {
    const { isLoading, isError, error, isEmpty, empty, onRetry, children } = props as NewPageBoundaryProps;
    
    if (isLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">טוען...</p>
          </div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">שגיאה בטעינת הדף</h3>
            <p className="text-muted-foreground mb-4">
              {String(error?.message || 'אירעה שגיאה בטעינת הנתונים')}
            </p>
            {onRetry && (
              <Button onClick={onRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                נסה שוב
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (isEmpty) {
      return <>{empty || <div className="text-center p-8 text-muted-foreground">אין נתונים להצגה</div>}</>;
    }

    return <>{children}</>;
  }
  
  // Legacy timeout pattern - still supported
  const { children, fallback, timeout = 10000 } = props as LegacyPageBoundaryProps;
  const [showFallback, setShowFallback] = useState(true);
  const [escalate, setEscalate] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowFallback(false), 200);
    const t2 = setTimeout(() => setEscalate(true), timeout);
    
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
            ניסינו לטעון נתונים מעל {timeout / 1000} שניות. נסו לרענן.
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
