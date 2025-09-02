import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, User } from 'lucide-react';
import { UserRole, getRouteFromStep, getOnboardingStartRoute } from '@/utils/authRouting';

export const OnboardingStatusBanner: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Don't show banner if user is not authenticated
  if (!user || !profile) {
    return null;
  }

  // Don't show banner if onboarding is completed
  if (profile.onboarding_completed) {
    return null;
  }

  // Don't show banner for admin users
  if (profile.role === 'admin') {
    return null;
  }

  const handleContinueOnboarding = () => {
    // Navigate to the saved onboarding step or start from the beginning
    const userRole = (profile.role as UserRole) || 'client';
    const step = profile.onboarding_step || 0;
    const route = step > 0 ? getRouteFromStep(userRole, step) : getOnboardingStartRoute(userRole);
    navigate(route);
  };

  const getProgressText = () => {
    if (profile.role === 'supplier') {
      return 'השלם את הגדרת הפרופיל העסקי שלך';
    }
    return 'השלם את הגדרת הפרופיל שלך';
  };

  return (
    <Card className="mx-4 mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {getProgressText()}
            </h3>
            <p className="text-sm text-muted-foreground">
              גישה מלאה לכל האפשרויות תהיה זמינה לאחר השלמת הרישום
            </p>
          </div>
        </div>
        <Button 
          onClick={handleContinueOnboarding}
          className="flex items-center gap-2"
        >
          המשך
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};