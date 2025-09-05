export type UserRole = 'client' | 'supplier' | 'admin';

/**
 * Convert numeric step to route path
 */
export const getRouteFromStep = (role: UserRole, step: number): string => {
  if (role === 'supplier') {
    switch (step) {
      case 1: return '/onboarding/supplier-welcome';
      case 2: return '/onboarding/supplier-company-info';
      case 3: return '/onboarding/supplier-branding';
      case 4: return '/onboarding/supplier-products';
      case 5: return '/onboarding/supplier-summary';
      default: return '/onboarding/supplier-welcome';
    }
  } else {
    switch (step) {
      case 1: return '/onboarding/welcome';
      case 2: return '/onboarding/home-details';
      case 3: return '/onboarding/project-planning';
      case 4: return '/onboarding/documents';
      case 5: return '/onboarding/interests';
      default: return '/onboarding/welcome';
    }
  }
};

/**
 * Get the starting route for onboarding based on user role
 */
export const getOnboardingStartRoute = (role: UserRole): string => {
  switch (role) {
    case 'supplier': 
      return '/onboarding/supplier-welcome';
    case 'client':   
      return '/onboarding/welcome';
    case 'admin':
      return '/admin/dashboard';
    default:         
      return '/onboarding/role-picker'; // For users without a role
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
  onboarding_step?: number;
  fromPath?: string | null;
}): string => {
  const { role, onboarding_completed, onboarding_step, fromPath } = opts;

  console.log('[AUTH ROUTING] Determining route for:', opts);

  // 1) If onboarding completed → honor return path or go to role home
  if (onboarding_completed) {
    // If user came from a protected page, honor it (but not auth pages)
    if (fromPath && !fromPath.startsWith('/auth') && !fromPath.startsWith('/onboarding')) {
      console.log('[AUTH ROUTING] Onboarding completed, returning to original path:', fromPath);
      return fromPath;
    }
    
    const roleRoute = getRoleHomeRoute(role);
    console.log('[AUTH ROUTING] Onboarding completed, routing to role home:', roleRoute);
    return roleRoute;
  }

  // 2) If onboarding not completed, check status and role
  // Step 0 with known role should start onboarding, not go to role picker
  const step = onboarding_step || 0;
  
  // Only go to role picker if role is truly unknown/missing or invalid
  if (!role || !['client', 'supplier', 'admin'].includes(role as string)) {
    console.log('[AUTH ROUTING] Role unknown or invalid, routing to role picker');
    return '/onboarding/role-picker';
  }
  
  // Otherwise start or resume role-specific onboarding
  const route = step > 0 ? getRouteFromStep(role, step) : getOnboardingStartRoute(role);
  console.log('[AUTH ROUTING] Starting/resuming onboarding for role:', role, 'at step:', step, '→', route);
  return route;
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