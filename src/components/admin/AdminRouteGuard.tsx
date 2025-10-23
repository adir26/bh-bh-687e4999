import { useLocation, Navigate } from 'react-router-dom';

// Hardcoded whitelist - only these 7 routes allowed (including login)
const ALLOWED_ADMIN_ROUTES = [
  '/admin/login',
  '/admin/dashboard',
  '/admin/analytics',
  '/admin/customers',
  '/admin/suppliers',
  '/admin/categories',
  '/admin/homepage-content'
];

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  
  // Check if current path matches any allowed route (exact or starts with)
  const isAllowed = ALLOWED_ADMIN_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (!isAllowed) {
    console.warn(`Unauthorized admin route access: ${pathname}`);
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
