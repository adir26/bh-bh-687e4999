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
 * Route users after login based on profile role and onboarding state
 */
export const routeAfterLogin = (profile: any): string => {
  // 1) If no role, go to role picker
  if (!profile?.role || !['client', 'supplier', 'admin'].includes(profile.role)) {
    console.log('[AUTH ROUTING] No role found, routing to role picker');
    return '/onboarding/role-picker';
  }

  // 2) If onboarding completed or skipped, go to role-specific home
  const onboardingDone = profile.onboarding_completed || 
                        profile.onboarding_skipped || 
                        profile.onboarding_status === 'completed';

  if (onboardingDone) {
    const homeRoute = profile.role === 'supplier' ? '/supplier/dashboard' : '/';
    console.log('[AUTH ROUTING] Onboarding complete/skipped, routing to:', homeRoute);
    return homeRoute;
  }

  // 3) Otherwise, start/resume onboarding
  const step = profile.onboarding_step || 0;
  const onboardingRoute = step > 0 ? getRouteFromStep(profile.role, step) : getOnboardingStartRoute(profile.role);
  console.log('[AUTH ROUTING] Starting/resuming onboarding:', onboardingRoute);
  return onboardingRoute;
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

  // Use the new routeAfterLogin function for consistent logic
  const profile = {
    role,
    onboarding_completed,
    onboarding_step,
    onboarding_status: onboarding_completed ? 'completed' : 'in_progress'
  };

  const destination = routeAfterLogin(profile);

  // Honor return path only if onboarding is complete and path is not auth/onboarding
  if (onboarding_completed && fromPath && 
      !fromPath.startsWith('/auth') && 
      !fromPath.startsWith('/onboarding')) {
    console.log('[AUTH ROUTING] Onboarding completed, returning to original path:', fromPath);
    return fromPath;
  }

  return destination;
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