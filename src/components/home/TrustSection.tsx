import React from 'react';
import { Star, Shield, CheckCircle, Quote } from 'lucide-react';

// Placeholder logos - in production these would be real partner logos
const partnerLogos = [
  { id: 1, name: 'חברת בניה מובילה', initial: 'ב' },
  { id: 2, name: 'עיצוב פנים פרימיום', initial: 'ע' },
  { id: 3, name: 'שיפוצים מקצועיים', initial: 'ש' },
  { id: 4, name: 'ריהוט יוקרתי', initial: 'ר' },
];

export const TrustSection: React.FC = () => {
  return (
    <section className="w-full py-16 md:py-20 bg-card" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Partner Logos */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {partnerLogos.map((logo) => (
              <div
                key={logo.id}
                className="card-premium p-6 flex items-center justify-center aspect-[3/2]"
              >
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{logo.initial}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Stats Cards */}
          <div className="card-premium p-6 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-10 h-10 text-accent mb-3" />
            <span className="text-h3 text-foreground font-bold">500+</span>
            <span className="text-caption text-muted-foreground mt-1">קבלנים משתמשים</span>
          </div>
          
          <div className="card-premium p-6 flex flex-col items-center justify-center text-center">
            <Shield className="w-10 h-10 text-primary mb-3" />
            <span className="text-h4 text-foreground font-semibold">מאומתים ובטוחים</span>
            <span className="text-caption text-muted-foreground mt-1">כל הספקים נבדקו</span>
          </div>
          
          {/* Testimonial Card */}
          <div className="col-span-2 md:col-span-2 card-premium p-6 md:p-8">
            <div className="flex items-start gap-4">
              <Quote className="w-8 h-8 text-primary/20 flex-shrink-0 rotate-180" />
              <div>
                <p className="text-body text-foreground mb-4">
                  "שירות מעולה! מצאתי את הקבלן המושלם לשיפוץ הדירה שלי תוך יומיים בלבד."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">מ.כ</span>
                  </div>
                  <div>
                    <p className="text-label font-medium text-foreground">מיכל כהן</p>
                    <p className="text-caption text-muted-foreground">תל אביב</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rating Card */}
          <div className="col-span-2 md:col-span-2 card-premium p-6 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-h3 font-bold text-foreground">4.9</span>
            <span className="text-caption text-muted-foreground">מבוסס על 2,500+ ביקורות</span>
          </div>
        </div>
      </div>
    </section>
  );
};
