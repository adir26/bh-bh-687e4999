import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface TemplatePreviewProps {
  template: 'premium' | 'corporate' | 'modern' | 'minimal' | 'classic';
  isSelected: boolean;
  onClick: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ 
  template, 
  isSelected, 
  onClick 
}) => {
  const getTemplateConfig = () => {
    switch (template) {
      case 'premium':
        return {
          name: 'פרימיום - תבנית A',
          description: 'עיצוב מודרני עם גרדיאנטים ואלמנטים גרפיים מתקדמים',
          gradient: 'bg-gradient-to-br from-purple-500 to-pink-500',
          accent: 'text-purple-600',
          features: ['גרדיאנטים מתקדמים', 'סמל מיוחד', 'עיצוב פרימיום', 'צבעים בולטים']
        };
      case 'corporate':
        return {
          name: 'קורפורטיבי - תבנית B',
          description: 'עיצוב עסקי נקי ומקצועי למגזר הקורפורטיבי',
          gradient: 'bg-gradient-to-br from-gray-600 to-blue-600',
          accent: 'text-gray-700',
          features: ['עיצוב עסקי', 'צבעים נייטרליים', 'מקצועי ונקי', 'מתאים לחברות']
        };
      case 'modern':
        return {
          name: 'מודרני',
          description: 'עיצוב עכשווי ופשוט עם צבעים טריים',
          gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
          accent: 'text-blue-600',
          features: ['עיצוב עכשווי', 'צבעים טריים', 'נקי ופשוט', 'ידידותי למשתמש']
        };
      case 'minimal':
        return {
          name: 'מינימלי',
          description: 'עיצוב נקי וחסכוני ללא עומס עיצובי',
          gradient: 'bg-gradient-to-br from-slate-500 to-gray-500',
          accent: 'text-slate-600',
          features: ['עיצוב מינימלי', 'ללא עומס', 'פונקציונלי', 'חסכוני בדיו']
        };
      case 'classic':
        return {
          name: 'קלאסי',
          description: 'עיצוב מסורתי ואלגנטי בסגנון עתיק',
          gradient: 'bg-gradient-to-br from-amber-600 to-orange-600',
          accent: 'text-amber-700',
          features: ['עיצוב מסורתי', 'אלגנטי ויוקרתי', 'סגנון עתיק', 'מתאים לעסקים וותיקים']
        };
    }
  };

  const config = getTemplateConfig();

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg font-hebrew ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4" dir="rtl">
        <div className="relative">
          {/* Template Header Preview */}
          <div className={`h-16 ${config.gradient} rounded-lg mb-3 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-2 right-3 text-white text-xs font-bold">
              הצעת מחיר
            </div>
            <div className="absolute bottom-2 left-3 text-white/90 text-xs">
              חברת דוגמה בע"מ
            </div>
            {template === 'premium' && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-2xl font-bold">
                PREMIUM
              </div>
            )}
          </div>

          {/* Selection indicator */}
          {isSelected && (
            <div className="absolute -top-2 -left-2 bg-primary rounded-full p-1">
              <CheckCircle className="h-4 w-4 text-primary-foreground" />
            </div>
          )}

          {/* Template Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{config.name}</h3>
              {(template === 'premium' || template === 'corporate') && (
                <Badge variant="secondary" className="text-xs">
                  {template === 'premium' ? 'תבנית A' : 'תבנית B'}
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {config.description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-1 mt-3">
              {config.features.map((feature, index) => (
                <div key={index} className="flex items-center text-xs text-muted-foreground">
                  <div className={`w-1 h-1 rounded-full ${config.accent} bg-current ml-2`} />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};