import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface CompletedOnboardingGuardProps {
  children: React.ReactNode;
}

export const CompletedOnboardingGuard: React.FC<CompletedOnboardingGuardProps> = ({ children }) => {
  const { profile, loading, getRoute } = useAuth();

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

  // If no profile, redirect to auth
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  // If onboarding is completed, redirect to appropriate dashboard
  if (profile.onboarding_completed) {
    const dashboardRoute = getRoute(false);
    return <Navigate to={dashboardRoute} replace />;
  }

  // Admin users are never forced into onboarding, so redirect to admin dashboard
  if (profile.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};