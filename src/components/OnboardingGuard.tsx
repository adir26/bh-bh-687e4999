import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { profile, loading } = useAuth();
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

  // If no profile, redirect to auth
  if (!profile) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If onboarding not completed, redirect to correct onboarding
  if (!profile.onboarding_completed) {
    const onboardingRoute = profile.role === 'supplier' 
      ? '/onboarding/supplier-welcome' 
      : '/onboarding/welcome';
    
    return <Navigate to={onboardingRoute} replace />;
  }

  // Admin users are never forced into onboarding
  if (profile.role === 'admin') {
    return <>{children}</>;
  }

  return <>{children}</>;
};