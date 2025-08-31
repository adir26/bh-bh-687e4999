import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, getRoleHomeRoute } from '@/utils/authRouting';

interface CompletedOnboardingGuardProps {
  children: React.ReactNode;
}

/**
 * Prevents entering onboarding if already completed
 * Redirects to appropriate role home/dashboard
 */
export const CompletedOnboardingGuard: React.FC<CompletedOnboardingGuardProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

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

  // If no user, redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If no profile, redirect to auth
  if (!profile) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If onboarding is completed, redirect to role home/dashboard
  if (profile.onboarding_completed) {
    const homeRoute = getRoleHomeRoute((profile.role as UserRole) || 'client');
    console.log('[COMPLETED ONBOARDING GUARD] Onboarding completed, redirecting to:', homeRoute);
    return <Navigate to={homeRoute} replace />;
  }

  // Admin users are never forced into onboarding
  if (profile.role === 'admin') {
    console.log('[COMPLETED ONBOARDING GUARD] Admin user, redirecting to admin dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};