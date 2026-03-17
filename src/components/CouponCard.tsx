import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, Clock, Percent, DollarSign, Gift, Truck } from 'lucide-react';
import { Coupon } from '@/hooks/useCoupons';
import { showToast } from '@/utils/toast';

interface CouponCardProps {
  coupon: Coupon;
}

const discountIcons = {
  percentage: Percent,
  fixed: DollarSign,
  free_shipping: Truck,
  gift: Gift,
};

const discountLabels: Record<string, string> = {
  percentage: 'הנחה',
  fixed: '₪ הנחה',
  free_shipping: 'משלוח חינם',
  gift: 'מתנה',
};

function getTimeLeft(endsAt: string | null): string | null {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'פג תוקף';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days} ימים`;
  return `${hours} שעות`;
}

function getDiscountDisplay(coupon: Coupon): string {
  if (coupon.discount_type === 'percentage') return `${coupon.discount_value}%`;
  if (coupon.discount_type === 'fixed') return `₪${coupon.discount_value}`;
  if (coupon.discount_type === 'free_shipping') return 'חינם';
  return 'מתנה';
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon }) => {
  const [copied, setCopied] = useState(false);
  const Icon = discountIcons[coupon.discount_type];
  const timeLeft = getTimeLeft(coupon.ends_at);

  const handleCopy = async () => {
    if (!coupon.coupon_code) return;
    await navigator.clipboard.writeText(coupon.coupon_code);
    setCopied(true);
    showToast.success('הקוד הועתק!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex-shrink-0 w-64 md:w-72 overflow-hidden border-border/50 hover:shadow-lg transition-shadow group">
      {coupon.image_url && (
        <div className="h-32 overflow-hidden">
          <img src={coupon.image_url} alt={coupon.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        </div>
      )}
      <CardContent className="p-4 space-y-3" dir="rtl">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-foreground line-clamp-1">{coupon.title}</h3>
          <Badge variant="secondary" className="flex items-center gap-1 shrink-0 bg-primary/10 text-primary">
            <Icon className="h-3 w-3" />
            {getDiscountDisplay(coupon)}
          </Badge>
        </div>

        {coupon.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{coupon.description}</p>
        )}

        {coupon.company_name && (
          <p className="text-xs text-muted-foreground">מאת: {coupon.company_name}</p>
        )}

        {timeLeft && (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <Clock className="h-3 w-3" />
            <span>נותרו {timeLeft}</span>
          </div>
        )}

        {coupon.coupon_code ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full font-mono text-sm border-dashed border-2"
            onClick={handleCopy}
          >
            {copied ? (
              <><Check className="h-3 w-3 ml-1" /> הועתק!</>
            ) : (
              <><Copy className="h-3 w-3 ml-1" /> {coupon.coupon_code}</>
            )}
          </Button>
        ) : (
          <Badge variant="outline" className="w-full justify-center py-1.5">
            {discountLabels[coupon.discount_type]}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};
