import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CTASectionProps {
  isGuest?: boolean;
  onCTAClick?: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({
  isGuest = true,
  onCTAClick
}) => {
  return (
    <section className="w-full py-16 md:py-24 gradient-primary" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Title */}
          <h2 className="text-h2 text-white">
            מוכנים להתחיל פרויקט?
          </h2>
          
          {/* Subtitle */}
          <p className="text-body text-white/90 max-w-xl mx-auto">
            הצטרפו לאלפי בעלי בתים שכבר מצאו את הספקים המושלמים לפרויקט שלהם
          </p>
          
          {/* CTA Button */}
          <Button
            onClick={onCTAClick}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 px-10 py-7 text-lg font-semibold rounded-xl gap-3 shadow-premium-lg btn-premium"
          >
            {isGuest ? 'התחברו חינם' : 'התחילו עכשיו'}
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          {/* Trust indicator */}
          <p className="text-caption text-white/70">
            ✓ ללא עלות • ✓ ללא התחייבות • ✓ 3-5 הצעות תוך 24 שעות
          </p>
        </div>
      </div>
    </section>
  );
};
