import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, getRoleHomeRoute, getOnboardingStartRoute, getRouteFromStep } from '@/utils/authRouting';
import { useGuestMode } from '@/hooks/useGuestMode';
import { isPublicRoute } from '@/utils/publicRoutes';

interface OnboardingGuardProps {
  children: React.ReactNode;
  role?: UserRole;
}

/**
 * Prevents accessing dashboards when onboarding is incomplete
 * Redirects to appropriate onboarding flow if needed
 */
export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children, role }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const { isGuestMode } = useGuestMode();

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  // Allow guests on public routes without onboarding checks
  if (isGuestMode && !user && isPublicRoute(location.pathname)) {
    return <>{children}</>;
  }

  // In guest mode, redirect onboarding routes to home
  if (isGuestMode && !user) {
    return <Navigate to="/" replace />;
  }

  // If no user, redirect to auth with current location
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If no profile, redirect to auth
  if (!profile) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role mismatch (optional role-specific guard)
  if (role && profile.role !== role) {
    const correctRoute = getRoleHomeRoute(profile.role as UserRole);
    console.log('[ONBOARDING GUARD] Role mismatch, redirecting to:', correctRoute);
    return <Navigate to={correctRoute} replace />;
  }

  // Check if onboarding is completed or skipped
  const onboardingCompleted = profile.onboarding_completed || 
    (profile as any).onboarding_skipped || 
    profile.onboarding_status === 'completed';
  
  // If onboarding not completed and not skipped, redirect to saved step or start
  if (!onboardingCompleted) {
    const userRole = (profile.role as UserRole) || 'client';
    const step = profile.onboarding_step || 0;
    const onboardingRoute = step > 0 ? getRouteFromStep(userRole, step) : getOnboardingStartRoute(userRole);
    
    // Prevent redirect loops
    if (location.pathname === onboardingRoute) {
      console.log('[ONBOARDING GUARD] Already on onboarding route, allowing access');
      return <>{children}</>;
    }
    
    console.log('[ONBOARDING GUARD] Onboarding incomplete, redirecting to:', onboardingRoute);
    return <Navigate to={onboardingRoute} replace />;
  }

  // Admin users always have access (even if hypothetically onboarding was incomplete)
  if (profile.role === 'admin') {
    return <>{children}</>;
  }

  return <>{children}</>;
};