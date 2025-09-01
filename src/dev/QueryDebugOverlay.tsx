import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function QueryDebugOverlay() {
  const qc = useQueryClient();
  const [queries, setQueries] = React.useState(qc.getQueryCache().getAll());

  React.useEffect(() => {
    return qc.getQueryCache().subscribe(() => setQueries([...qc.getQueryCache().getAll()]));
  }, [qc]);

  const now = Date.now();
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      maxHeight: '50vh',
      maxWidth: '400px',
      overflow: 'auto',
      background: 'rgba(0,0,0,.85)',
      color: '#fff',
      fontSize: 11,
      padding: 12,
      borderRadius: 8,
      zIndex: 99999,
      fontFamily: 'monospace'
    }}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: '#4ade80' }}>
        Query Inspector ({queries.length})
      </div>
      {queries.map((q) => {
        const state = q.state;
        const age = Math.round((now - (state.dataUpdatedAt || 0)) / 1000);
        const stuck = state.status === 'pending' && age > 10;
        const isError = state.status === 'error';
        
        return (
          <div 
            key={q.queryHash} 
            style={{ 
              marginBottom: 8, 
              borderBottom: '1px solid rgba(255,255,255,.15)', 
              paddingBottom: 6,
              background: stuck ? 'rgba(239, 68, 68, 0.2)' : isError ? 'rgba(245, 101, 101, 0.2)' : 'transparent'
            }}
          >
            <div style={{ color: '#e5e7eb', marginBottom: 2 }}>
              {JSON.stringify(q.queryKey)}
            </div>
            <div style={{ 
              color: stuck ? '#fca5a5' : isError ? '#f87171' : state.status === 'success' ? '#4ade80' : '#fbbf24' 
            }}>
              Status: {state.status} {stuck ? '⚠️ >10s' : ''}
            </div>
            <div style={{ color: '#9ca3af', fontSize: 10 }}>
              Fetching: {String(state.fetchStatus)} | Failures: {state.fetchFailureCount} | Age: {age}s
            </div>
            {state.error && (
              <div style={{ color: '#f87171', fontSize: 10, marginTop: 2 }}>
                Error: {state.error.message}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}