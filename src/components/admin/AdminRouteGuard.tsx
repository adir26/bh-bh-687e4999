import { useLocation, Navigate } from 'react-router-dom';
import { ENABLED_ADMIN_ROUTES } from '@/config/adminFlags';

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  
  if (ENABLED_ADMIN_ROUTES !== 'ALL' && !ENABLED_ADMIN_ROUTES.includes(pathname)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <>{children}</>;
}
