import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function OnboardingWelcome() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/onboarding/home-details');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">שלב 1</div>
        <button 
          onClick={() => navigate('/registration')}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Hero Image */}
        <div className="relative h-64 bg-gray-100">
          <img 
            src="/lovable-uploads/fff68834-a175-4947-9155-edee5597a68d.png"
            alt="Building"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text Content */}
        <div className="flex-1 p-6 flex flex-col justify-center text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              בואו נכיר את הפרויקט
            </h1>
            <p className="text-gray-600 text-lg">
              נתאים עבורכם את החוויה לפרויקט שלכם
            </p>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="p-6">
          <Button 
            onClick={handleStart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
          >
            התחילו
          </Button>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center pb-6">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}