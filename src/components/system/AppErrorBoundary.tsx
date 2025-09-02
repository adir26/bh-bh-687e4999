import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppErrorBoundaryProps {
  error?: any;
  reset: () => void;
}

export function AppErrorBoundary({ error, reset }: AppErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">אירעה שגיאה במערכת</h3>
        <p className="text-muted-foreground mb-4">
          {String(error?.message || 'שגיאה לא ידועה. אנא נסו לרענן את הדף.')}
        </p>
        <div className="space-x-2">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            נסה שוב
          </Button>
          <Button variant="outline" onClick={() => location.reload()}>
            רענן דף
          </Button>
        </div>
      </div>
    </div>
  );
}