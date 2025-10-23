import { useLocation, Navigate } from 'react-router-dom';
import { ENABLED_ADMIN_ROUTES } from '@/config/adminFlags';

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  
  const isAllowed = ENABLED_ADMIN_ROUTES.some((base) =>
    pathname === base || pathname.startsWith(`${base}/`)
  );
  if (!isAllowed) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
