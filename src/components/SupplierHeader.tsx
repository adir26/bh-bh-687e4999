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
  
  // Mock notification count - in real app this would come from context/API
  const unreadNotifications = 3;

  return (
    <div className="bg-white border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
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
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          
          {showNotifications && <NotificationBell />}
        </div>
      </div>
    </div>
  );
};