
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Plus, Package, User, Upload, MessageCircle, Briefcase, Palette, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

export const SupplierBottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const navItems = [
    {
      path: '/supplier/dashboard',
      icon: Home,
      label: 'בית'
    },
    {
      path: '/supplier/leads',
      icon: Users,
      label: 'לידים'
    },
    {
      path: '/supplier/catalog',
      icon: Package,
      label: 'הקטלוג שלי'
    },
    {
      path: '/supplier/profile',
      icon: User,
      label: 'הפרופיל שלי'
    }
  ];

  const quickActions = [
    {
      icon: Briefcase,
      label: 'צור הצעת מחיר',
      path: '/supplier/quotes'
    },
    {
      icon: Upload,
      label: 'ספריית קבצים',
      path: '/supplier/files'
    },
    {
      icon: Package,
      label: 'ניהול הזמנות',
      path: '/supplier/orders'
    },
    {
      icon: MessageCircle,
      label: 'התראות',
      path: '/supplier/notifications'
    },
    {
      icon: Palette,
      label: 'לוחות השראה',
      path: '/supplier/moodboards'
    },
    {
      icon: FileCheck,
      label: 'בונה הצעות',
      path: '/supplier/proposal-builder'
    },
    {
      icon: Users,
      label: 'CRM',
      path: '/supplier/crm'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleQuickAction = (path: string) => {
    navigate(path);
    setIsQuickActionsOpen(false);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleNavClick = () => {
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleFabClick = () => {
    // Stronger haptic feedback for the main action
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
  };

  return (
    <div 
      className="fixed inset-x-0 z-50 flex justify-center px-4" 
      style={{
        bottom: "calc(var(--footer-h, 0px) + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <nav className="bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-3xl px-4 py-3 shadow-lg shadow-black/10 max-w-sm w-full">
        <div className="flex items-center justify-between gap-4">
          {/* First two nav items */}
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-1 min-h-[44px] transition-all duration-200 active:scale-95"
                onClick={handleNavClick}
                aria-label={item.label}
              >
                <div className={`p-2 rounded-full transition-all duration-200 ${
                  active 
                    ? 'bg-primary/15 text-primary scale-110' 
                    : 'text-gray-500 hover:text-primary hover:bg-primary/5'
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`text-xs font-medium transition-colors duration-200 text-center ${
                  active ? 'text-primary' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          {/* Center FAB */}
          <Drawer open={isQuickActionsOpen} onOpenChange={setIsQuickActionsOpen}>
            <DrawerTrigger asChild>
              <Button
                size="lg"
                className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 relative"
                onClick={handleFabClick}
                aria-label="פעולות מהירות"
              >
                <Plus size={24} className="text-white" />
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="mx-4 rounded-t-2xl" style={{ marginBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
              <DrawerHeader className="text-center pb-2">
                <DrawerTitle className="text-lg font-semibold">פעולות מהירות</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-6">
                <div className="grid grid-cols-1 gap-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-14 justify-between text-right hover:bg-primary/5 transition-all duration-200 active:scale-98"
                        onClick={() => handleQuickAction(action.path)}
                      >
                        <span className="font-medium">{action.label}</span>
                        <Icon size={20} className="text-primary" />
                      </Button>
                    );
                  })}
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Last two nav items */}
          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-1 min-h-[44px] transition-all duration-200 active:scale-95"
                onClick={handleNavClick}
                aria-label={item.label}
              >
                <div className={`p-2 rounded-full transition-all duration-200 ${
                  active 
                    ? 'bg-primary/15 text-primary scale-110' 
                    : 'text-gray-500 hover:text-primary hover:bg-primary/5'
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`text-xs font-medium transition-colors duration-200 text-center ${
                  active ? 'text-primary' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
