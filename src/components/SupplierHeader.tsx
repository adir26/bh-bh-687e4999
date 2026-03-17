import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, ArrowLeft } from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';

interface SupplierHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
  showNotifications?: boolean;
}

export const SupplierHeader: React.FC<SupplierHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backUrl = '/supplier/dashboard',
  showNotifications = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-background border-b border-border sticky top-0 z-10 pt-[max(env(safe-area-inset-top),12px)]">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(backUrl)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                חזור
              </Button>
            )}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>
          
          {showNotifications && <NotificationBell />}
        </div>
      </div>
    </div>
  );
};