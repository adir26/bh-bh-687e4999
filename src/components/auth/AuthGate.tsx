import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { PageBoundary } from '@/components/system/PageBoundary';
import { getPostAuthRoute, UserRole, getRouteFromStep, getOnboardingStartRoute } from '@/utils/authRouting';

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  role?: 'client' | 'supplier' | 'admin';
  onboarding_completed?: boolean;
  onboarding_status?: 'not_started' | 'in_progress' | 'completed';
  onboarding_step?: number;
}

interface AuthGateProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
}

export function AuthGate({ 
  children, 
  requireAuth = true, 
  requiredRole 
}: AuthGateProps) {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, status: profileStatus } = useProfile(user?.id);

  // Wait for auth to resolve
  if (authLoading) {
    return (
      <PageBoundary>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageBoundary>
    );
  }

  // Require authentication
  if (requireAuth && !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Wait for profile if user exists
  if (user && profileStatus === 'pending') {
    return (
      <PageBoundary>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageBoundary>
    );
  }

  const typedProfile = profile as Profile | null;

  // Check if onboarding is required
  if (user && typedProfile && typedProfile.onboarding_status !== 'completed') {
    const userRole = (typedProfile.role as UserRole) || 'client';
    const step = typedProfile.onboarding_step || 0;
    const onboardingRoute = step > 0 ? getRouteFromStep(userRole, step) : getOnboardingStartRoute(userRole);
    return <Navigate to={onboardingRoute} replace />;
  }

  // Check role requirements
  if (requiredRole && typedProfile?.role !== requiredRole) {
    const homeRoute = getPostAuthRoute({
      role: (typedProfile?.role as UserRole) || 'client',
      onboarding_completed: typedProfile?.onboarding_status === 'completed',
      onboarding_step: typedProfile?.onboarding_step || 0,
    });
    return <Navigate to={homeRoute} replace />;
  }

  return <>{children}</>;
}