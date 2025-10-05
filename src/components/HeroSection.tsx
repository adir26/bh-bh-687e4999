import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/utils/imageErrorHandling';
import { ArrowRight } from 'lucide-react';
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
          {showCTA && (
            <Link 
              to={href}
              onClick={handleClick}
              className="inline-block"
            >
              <Button 
                variant="blue"
                size="lg"
                className="w-fit min-h-touch pointer-events-auto touch-manipulation inline-flex items-center gap-2"
                style={{ touchAction: 'manipulation' }}
              >
                התחילו עכשיו
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
