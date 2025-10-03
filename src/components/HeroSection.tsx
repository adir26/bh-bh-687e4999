import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/utils/imageErrorHandling';
import heroImage from '@/assets/home-hero.jpg';

interface HeroSectionProps {
  href?: string;
  onCTAClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ href = '/welcome', onCTAClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    // Optional callback for additional logic (e.g., tracking, modal opening)
    onCTAClick?.();
  };

  return (
    <div className="relative h-64 mx-4 mb-6 rounded-2xl overflow-hidden">
      <SafeImage 
        src={heroImage}
        alt="בנו את הבית החלומות שלכם"
        className="w-full h-full object-cover"
        showLoader={true}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <div className="space-y-3">
          <h2 className="text-xl font-bold leading-tight">
            בנו את הבית החלומות שלכם
          </h2>
          <p className="text-sm text-white/90 leading-relaxed">
            מהתכנון ועד המסירה - כל הספקים במקום אחד
          </p>
          <Button 
            asChild
            variant="blue"
            size="lg"
            showArrow={true}
            className="w-fit min-h-touch"
            data-testid="start-now"
          >
            <Link to={href} onClick={handleClick}>
              התחילו עכשיו
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
