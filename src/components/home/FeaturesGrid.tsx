import React from 'react';
import { Building2, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  cta: string;
  href: string;
}

const features: Feature[] = [
  {
    icon: Building2,
    title: 'ספקים מאומתים',
    description: 'כל הספקים שלנו עוברים תהליך אימות קפדני. אנחנו בודקים רישיונות, ביטוחים וביקורות לקוחות קודמים כדי להבטיח לכם את האיכות הגבוהה ביותר.',
    cta: 'גלו ספקים',
    href: '/top-suppliers'
  },
  {
    icon: TrendingUp,
    title: 'הצעות תחרותיות',
    description: 'קבלו מספר הצעות מחיר מספקים מובילים והשוו ביניהן. המערכת שלנו מבטיחה שתקבלו את המחיר ההוגן ביותר לפרויקט שלכם.',
    cta: 'בקשו הצעות',
    href: '/categories'
  },
  {
    icon: Calendar,
    title: 'מעקב פרויקטים',
    description: 'עקבו אחרי התקדמות הפרויקט שלכם בזמן אמת. קבלו עדכונים, נהלו תקציבים ותקשרו עם הספקים במקום אחד.',
    cta: 'התחילו עכשיו',
    href: '/auth'
  }
];

interface FeaturesGridProps {
  onFeatureClick?: (href: string) => void;
}

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({ onFeatureClick }) => {
  return (
    <section className="w-full py-16 md:py-24 bg-background" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-h2 text-foreground mb-4">למה לבחור בנו?</h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            הפלטפורמה המובילה בישראל לחיבור בין בעלי בתים לספקי בנייה ועיצוב מקצועיים
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="card-premium p-8 flex flex-col items-center text-center group"
              >
                {/* Icon Container */}
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-10 h-10 text-white" />
                </div>
                
                {/* Title */}
                <h3 className="text-h4 text-foreground mb-4">{feature.title}</h3>
                
                {/* Description */}
                <p className="text-body-sm text-muted-foreground mb-6 flex-grow">
                  {feature.description}
                </p>
                
                {/* CTA Button */}
                <Button
                  variant="ghost"
                  onClick={() => onFeatureClick?.(feature.href)}
                  className="text-primary hover:text-primary/80 gap-2 group/btn"
                >
                  {feature.cta}
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover/btn:-translate-x-1" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
