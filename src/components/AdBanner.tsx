import React from 'react';
import { Button } from '@/components/ui/button';
import adImage from '@/assets/ad-banner.jpg';

interface AdBannerProps {
  onAdClick?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ onAdClick }) => {
  return (
    <div className="w-full px-4 mb-6">
      <div className="relative h-40 rounded-2xl overflow-hidden bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50">
        <img 
          src={adImage}
          alt="פרסומת מיוחדת"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-center pr-6 text-white">
          <div className="space-y-2 max-w-[60%]">
            <div className="text-xs text-white/80 font-medium tracking-wide">
              פרסומת ממומנת
            </div>
            <h3 className="text-lg font-bold leading-tight">
              שיפוצים מקצועיים עם אחריות
            </h3>
            <p className="text-sm text-white/90 leading-relaxed">
              קבלו הצעת מחיר חינם תוך 24 שעות
            </p>
            <Button 
              onClick={onAdClick}
              size="sm"
              className="w-fit bg-white/95 hover:bg-white text-primary border-0 font-medium px-4 py-1.5 rounded-lg text-xs mt-2"
            >
              לפרטים נוספים
            </Button>
          </div>
        </div>
        
        {/* Small ad indicator */}
        <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-xs text-white/80 font-medium">מודעה</span>
        </div>
      </div>
    </div>
  );
};