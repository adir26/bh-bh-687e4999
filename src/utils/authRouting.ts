export type UserRole = 'client' | 'supplier' | 'admin';

/**
 * Get the starting route for onboarding based on user role
 */
export const getOnboardingStartRoute = (role: UserRole): string => {
  switch (role) {
    case 'supplier': 
      return '/onboarding/supplier-welcome';
    case 'client':   
      return '/onboarding/welcome';
    default:         
      return '/onboarding/welcome';
  }
};

/**
 * Get the home/dashboard route for a user role
 */
export const getRoleHomeRoute = (role: UserRole): string => {
  switch (role) {
    case 'supplier': 
      return '/supplier/dashboard'; // Keep existing supplier dashboard route
    case 'admin':    
      return '/admin/dashboard';
    case 'client':
    default:         
      return '/';                  // Client home
  }
};

/**
 * Determine the final destination after authentication/profile load
 */
export const getPostAuthRoute = (opts: {
  role: UserRole;
  onboarding_completed?: boolean;
  onboarding_step?: string | null;
  fromPath?: string | null;
}): string => {
  const { role, onboarding_completed, onboarding_step, fromPath } = opts;

  console.log('[AUTH ROUTING] Determining route for:', opts);

  // 1) If onboarding incomplete → go to saved step or start
  if (!onboarding_completed) {
    const route = onboarding_step || getOnboardingStartRoute(role);
    console.log('[AUTH ROUTING] Onboarding incomplete, routing to:', route);
    return route;
  }

  // 2) If user came from a protected page, honor it (but not auth pages)
  if (fromPath && !fromPath.startsWith('/auth') && !fromPath.startsWith('/onboarding')) {
    console.log('[AUTH ROUTING] Returning to original path:', fromPath);
    return fromPath;
  }

  // 3) Otherwise go to role home/dashboard
  const roleRoute = getRoleHomeRoute(role);
  console.log('[AUTH ROUTING] Routing to role home:', roleRoute);
  return roleRoute;
};

/**
 * Check if a path is an onboarding route
 */
export const isOnboardingRoute = (path: string): boolean => {
  return path.startsWith('/onboarding');
};

/**
 * Check if a path is an auth route
 */
export const isAuthRoute = (path: string): boolean => {
  return path.startsWith('/auth');
};

/**
 * Check if a path requires onboarding to be completed
 */
export const requiresCompletedOnboarding = (path: string, role?: UserRole): boolean => {
  // Auth and onboarding routes don't require completed onboarding
  if (isAuthRoute(path) || isOnboardingRoute(path)) {
    return false;
  }

  // Role-specific dashboard routes require completed onboarding
  if (path.startsWith('/supplier') || path.startsWith('/admin/dashboard')) {
    return true;
  }

  // Client home (/) requires completed onboarding for clients
  if (path === '/' && role === 'client') {
    return true;
  }

  return false;
};