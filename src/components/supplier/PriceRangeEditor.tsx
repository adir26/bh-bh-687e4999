import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

interface PriceRangeEditorProps {
  value: PriceRange;
  onChange: (value: PriceRange) => void;
}

export function PriceRangeEditor({ value, onChange }: PriceRangeEditorProps) {
  const priceRange = value || {
    min: 0,
    max: 0,
    currency: 'ILS',
  };

  const handleMinChange = (min: number) => {
    onChange({
      ...priceRange,
      min,
    });
  };

  const handleMaxChange = (max: number) => {
    onChange({
      ...priceRange,
      max,
    });
  };

  const handleCurrencyChange = (currency: string) => {
    onChange({
      ...priceRange,
      currency,
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <Label className="text-base font-semibold">טווח מחירים</Label>
        <p className="text-sm text-muted-foreground">
          הגדר את טווח המחירים המשוער לשירותים שלך
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price-min" className="text-sm mb-2 block">
              מחיר מינימום
            </Label>
            <div className="flex gap-2">
              <Input
                id="price-min"
                type="number"
                min="0"
                value={priceRange.min}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className="flex-1"
                placeholder="0"
              />
              <div className="w-16 flex items-center justify-center border rounded-md bg-muted text-sm">
                ₪
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="price-max" className="text-sm mb-2 block">
              מחיר מקסימום
            </Label>
            <div className="flex gap-2">
              <Input
                id="price-max"
                type="number"
                min="0"
                value={priceRange.max}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                className="flex-1"
                placeholder="0"
              />
              <div className="w-16 flex items-center justify-center border rounded-md bg-muted text-sm">
                ₪
              </div>
            </div>
          </div>
        </div>

        {priceRange.min > 0 && priceRange.max > 0 && (
          <div className="p-3 bg-muted rounded-lg text-sm">
            <strong>תצוגה:</strong> ₪{priceRange.min.toLocaleString()} - ₪{priceRange.max.toLocaleString()}
          </div>
        )}
      </div>
    </Card>
  );
}
