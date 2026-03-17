import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/utils/imageErrorHandling';
import { ArrowLeft } from 'lucide-react';
import heroImage from '@/assets/home-hero.jpg';

interface HeroSectionProps {
  href?: string;
  onCTAClick?: () => void;
  showCTA?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ href = '/welcome', onCTAClick, showCTA = true }) => {
  const handleClick = () => {
    onCTAClick?.();
  };

  return (
    <div className="relative h-48 xs:h-56 sm:h-64 md:h-80 lg:h-[400px] mx-3 xs:mx-4 md:mx-0 mb-4 xs:mb-6 md:mb-8 rounded-2xl overflow-hidden">
      <SafeImage 
        src={heroImage}
        alt="בנו את הבית החלומות שלכם"
        className="w-full h-full object-cover"
        showLoader={true}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 xs:p-5 sm:p-6 md:p-10 lg:p-14 text-white">
        <div className="space-y-2 xs:space-y-3 md:space-y-4 md:max-w-xl">
          <h2 className="text-lg xs:text-xl md:text-3xl lg:text-4xl font-bold leading-tight">
            בנו את הבית החלומות שלכם
          </h2>
          <p className="text-xs xs:text-sm md:text-base lg:text-lg text-white/90 leading-relaxed">
            מהתכנון ועד המסירה - כל הספקים במקום אחד
          </p>
          {showCTA && (
            <Link 
              to={href}
              onClick={handleClick}
              className="inline-block"
            >
              <Button 
                variant="blue"
                size="lg"
                className="w-fit min-h-[44px] pointer-events-auto touch-manipulation inline-flex items-center gap-2 text-sm xs:text-base"
                style={{ touchAction: 'manipulation' }}
              >
                התחילו עכשיו
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
