import React from 'react';
import { SEO } from '@/components/SEO';
import { useAllActiveCoupons } from '@/hooks/useCoupons';
import { CouponCard } from '@/components/CouponCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Deals: React.FC = () => {
  const { data: coupons = [], isLoading } = useAllActiveCoupons();
  const navigate = useNavigate();

  return (
    <div className="flex w-full min-h-screen flex-col items-center bg-background">
      <SEO title="מבצעים והנחות" description="כל המבצעים, הקופונים וההנחות הפעילים באתר" />
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-nav-safe" dir="rtl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">מבצעים והנחות 🔥</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">אין מבצעים פעילים כרגע</p>
            <p className="text-sm mt-2">חזרו בקרוב לבדוק מבצעים חדשים!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Deals;
