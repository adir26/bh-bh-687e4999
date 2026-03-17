import React from 'react';
import { useActiveCoupons } from '@/hooks/useCoupons';
import { CouponCard } from '@/components/CouponCard';
import { SectionTitleWithButton } from '@/components/SectionTitleWithButton';
import { useNavigate } from 'react-router-dom';

export const CouponsSection: React.FC = () => {
  const { data: coupons = [], isLoading } = useActiveCoupons();
  const navigate = useNavigate();

  if (isLoading || coupons.length === 0) return null;

  return (
    <div className="w-full">
      <SectionTitleWithButton title="מבצעים והנחות 🔥" onButtonClick={() => navigate('/deals')} />
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" dir="rtl">
        {coupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>
    </div>
  );
};
