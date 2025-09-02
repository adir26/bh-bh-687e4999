import { useEffect } from 'react';

export function usePageLoadTimer(pageKey: string) {
  const start = performance.now();
  
  useEffect(() => {
    const dur = Math.round(performance.now() - start);
    if (dur > 8000) {
      console.warn(`[SLOW PAGE] ${pageKey} took ${dur}ms to render`);
    }
    
    // Development telemetry only
    if (import.meta.env.DEV) {
      console.log(`[PAGE LOAD] ${pageKey} rendered in ${dur}ms`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}