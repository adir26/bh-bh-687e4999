
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import OnboardingProgress from '@/components/OnboardingProgress';
import supplierWelcomeImage from '@/assets/supplier-welcome.jpg';

export default function SupplierWelcome() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/onboarding/supplier-company-info');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex justify-end items-center border-b border-border">
        <button 
          onClick={() => navigate('/registration')}
          className="text-muted-foreground hover:text-foreground text-xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          ×
        </button>
      </div>

      {/* Progress Indicator */}
      <OnboardingProgress currentStep={1} totalSteps={5} />

      {/* Content */}
      <div className="flex-1 flex flex-col pb-safe">
        {/* Hero Image */}
        <div className="relative h-64 mx-6 mb-6 rounded-2xl overflow-hidden">
          <img 
            src={supplierWelcomeImage}
            alt="ברוכים הבאים לתהליך האונבורדינג לספקים"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Text Content */}
        <div className="flex-1 px-6 flex flex-col justify-center text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-foreground">
              בואו נגדיר את פרופיל הספק שלכם
            </h1>
            <p className="text-muted-foreground text-lg">
              המדריך הזה יעזור לכם ליצור דף ספק יפהפה ולהתחבר עם לקוחות
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6 pb-safe z-50">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleStart}
            variant="blue"
            className="w-full py-4 text-lg rounded-xl h-14 font-medium"
          >
            בואו נתחיל
          </Button>
        </div>
      </div>
    </div>
  );
}
