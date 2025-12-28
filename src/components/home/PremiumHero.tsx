import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Building2, Users, Star } from 'lucide-react';
import heroImage from '@/assets/home-hero.jpg';

interface PremiumHeroProps {
  onSearchClick?: () => void;
  onInspirationClick?: () => void;
  isGuest?: boolean;
}

// Animated counter component
const AnimatedCounter = ({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return <span>{count.toLocaleString('he-IL')}{suffix}</span>;
};

export const PremiumHero: React.FC<PremiumHeroProps> = ({
  onSearchClick,
  onInspirationClick,
  isGuest = true
}) => {
  return (
    <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Premium home design"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero-overlay" />
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Title */}
          <h1 className="text-h1 text-white animate-fade-in-up">
            מצאו מומחי בנייה ועיצוב מובילים בישראל
          </h1>
          
          {/* Subtitle */}
          <p className="text-body md:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in-up-delay-1">
            קבלו 3-5 הצעות מחיר תחרותיות תוך 24 שעות
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up-delay-2">
            <Button
              onClick={onSearchClick}
              size="lg"
              className="gradient-primary btn-premium text-white px-8 py-6 text-lg font-semibold rounded-xl min-w-[200px] gap-2 shadow-glow-primary"
            >
              <Search className="w-5 h-5" />
              חפש ספקים עכשיו
            </Button>
            
            <Button
              onClick={onInspirationClick}
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl min-w-[200px] gap-2"
            >
              גלו השראה
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Trust Bar */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 pt-8 animate-fade-in-up-delay-3">
            <div className="flex items-center gap-2 text-white">
              <Building2 className="w-5 h-5 text-accent" />
              <span className="text-body-sm">
                <AnimatedCounter end={10000} suffix="+" /> ספקים
              </span>
            </div>
            
            <div className="w-px h-6 bg-white/30 hidden sm:block" />
            
            <div className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-accent" />
              <span className="text-body-sm">
                <AnimatedCounter end={50000} /> פרויקטים
              </span>
            </div>
            
            <div className="w-px h-6 bg-white/30 hidden sm:block" />
            
            <div className="flex items-center gap-2 text-white">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-body-sm">4.9/5 דירוג</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
