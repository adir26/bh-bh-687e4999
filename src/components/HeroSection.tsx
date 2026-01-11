import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/utils/imageErrorHandling';
import { ArrowLeft } from 'lucide-react';
import heroImage from '@/assets/bonimpo-hero-home.jpg';

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
    <div className="relative h-48 xs:h-56 sm:h-64 md:h-72 mx-3 xs:mx-4 mb-4 xs:mb-6 rounded-2xl overflow-hidden shadow-lg">
      <SafeImage 
        src={heroImage}
        alt="בנו את הבית החלומות שלכם - בונים פה"
        className="w-full h-full object-cover object-left"
        showLoader={true}
      />
      <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-transparent" />
      
      {/* Content overlay - positioned on the right for RTL */}
      <div className="absolute inset-0 flex flex-col justify-center items-end p-4 xs:p-5 sm:p-6 md:p-8 text-white">
        <div className="space-y-2 xs:space-y-3 text-right max-w-[70%] sm:max-w-[60%]">
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold leading-tight drop-shadow-md">
            בנו את הבית החלומות שלכם
          </h2>
          <p className="text-xs xs:text-sm sm:text-base text-white/95 leading-relaxed drop-shadow-sm">
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
                className="w-fit min-h-[44px] pointer-events-auto touch-manipulation inline-flex items-center gap-2 text-sm xs:text-base shadow-lg hover:shadow-xl transition-shadow"
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
