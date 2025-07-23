import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, ArrowLeft } from 'lucide-react';

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
          
          {showNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/supplier/notifications')}
              className="relative"
              aria-label="התראות"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};