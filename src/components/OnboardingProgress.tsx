import React from 'react';
import { Progress } from '@/components/ui/progress';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export default function OnboardingProgress({ currentStep, totalSteps, className = "" }: OnboardingProgressProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  return (
    <div className={`w-full px-6 py-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">
          שלב {currentStep} מתוך {totalSteps}
        </span>
        <span className="text-sm font-medium text-primary">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      
      {/* Step indicators */}
      <div className="flex justify-between mt-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div
              key={stepNumber}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                isCompleted
                  ? 'bg-primary text-primary-foreground'
                  : isCurrent
                  ? 'bg-primary/20 text-primary border-2 border-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {stepNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
}