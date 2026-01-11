import React from 'react';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/utils/imageErrorHandling';
import adImage from '@/assets/bonimpo-ad-banner.jpg';

interface AdBannerProps {
  onAdClick?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ onAdClick }) => {
  return (
    <div className="w-full px-3 xs:px-4 mb-6">
      <div className="relative h-36 sm:h-40 md:h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50 shadow-md">
        <SafeImage 
          src={adImage}
          alt="פרסומת - שיפוצים מקצועיים"
          className="w-full h-full object-cover object-right"
          showLoader={true}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-primary/20 to-primary/80" />
        
        {/* Content overlay - on the left side for RTL layout */}
        <div className="absolute inset-0 flex flex-col justify-center ps-4 xs:ps-5 sm:ps-6 md:ps-8 text-white">
          <div className="space-y-1.5 xs:space-y-2 max-w-[55%] sm:max-w-[50%]">
            <div className="text-[10px] xs:text-xs text-white/90 font-medium tracking-wide">
              פרסומת ממומנת
            </div>
            <h3 className="text-sm xs:text-base sm:text-lg font-bold leading-tight drop-shadow-sm">
              שיפוצים מקצועיים עם אחריות
            </h3>
            <p className="text-xs xs:text-sm text-white/95 leading-relaxed hidden xs:block">
              קבלו הצעת מחיר חינם תוך 24 שעות
            </p>
            <Button 
              onClick={onAdClick}
              size="sm"
              className="w-fit bg-white/95 hover:bg-white text-primary border-0 font-medium px-3 xs:px-4 py-1 xs:py-1.5 rounded-lg text-xs min-h-[36px] shadow-md mt-1 xs:mt-2"
            >
              לפרטים נוספים
            </Button>
          </div>
        </div>
        
        {/* Small ad indicator */}
        <div className="absolute top-2 xs:top-3 left-2 xs:left-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5 xs:py-1">
          <span className="text-[10px] xs:text-xs text-white/90 font-medium">מודעה</span>
        </div>
      </div>
    </div>
  );
};