import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPostAuthRoute, UserRole } from '@/utils/authRouting';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

// Task 3: Guard for /auth route to prevent authenticated users from accessing it
export const RedirectIfAuthenticated: React.FC<RedirectIfAuthenticatedProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();

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

  // If user is authenticated and has profile, redirect using centralized rules
  if (user && profile) {
    const destination = getPostAuthRoute({
      role: profile.role as UserRole,
      onboarding_completed: profile.onboarding_completed,
      onboarding_step: profile.onboarding_step,
      fromPath: null, // No previous path when redirecting from /auth
    });

    console.log('[REDIRECT_IF_AUTH] Authenticated user on /auth, redirecting to:', destination);
    return <Navigate to={destination} replace />;
  }

  // User is not authenticated, show the auth page
  return <>{children}</>;
};