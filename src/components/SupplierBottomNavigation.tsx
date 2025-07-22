import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Plus, Package, User, ShoppingBag, Upload, MessageCircle, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const SupplierBottomNavigation: React.FC = () => {
  const location = useLocation();
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
      path: '/supplier/1',
      icon: User,
      label: 'הפרופיל שלי'
    }
  ];

  const quickActions = [
    {
      icon: Package,
      label: 'הוסף מוצר/שירות',
      action: () => console.log('Add product/service')
    },
    {
      icon: Upload,
      label: 'העלה תמונה',
      action: () => console.log('Upload image')
    },
    {
      icon: Briefcase,
      label: 'צור הצעה',
      action: () => console.log('Create offer')
    },
    {
      icon: MessageCircle,
      label: 'צור קשר עם התמיכה',
      action: () => console.log('Contact support')
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleQuickAction = (action: () => void) => {
    action();
    setIsQuickActionsOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <nav className="bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-full px-6 py-3 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between gap-8 max-w-sm">
          {/* First two nav items */}
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1"
              >
                <div className={`p-2 rounded-full transition-all duration-200 ${
                  active 
                    ? 'bg-primary/10 text-primary scale-110' 
                    : 'text-gray-500 hover:text-primary hover:bg-primary/5'
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  active ? 'text-primary' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          {/* Center FAB */}
          <Dialog open={isQuickActionsOpen} onOpenChange={setIsQuickActionsOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 animate-pulse"
              >
                <Plus size={24} className="text-white" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm mx-auto bottom-20 top-auto transform-none">
              <DialogHeader>
                <DialogTitle className="text-right">פעולות מהירות</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 mt-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-12 justify-start gap-3 text-right"
                      onClick={() => handleQuickAction(action.action)}
                    >
                      <span className="flex-1 text-right">{action.label}</span>
                      <Icon size={18} />
                    </Button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>

          {/* Last two nav items */}
          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1"
              >
                <div className={`p-2 rounded-full transition-all duration-200 ${
                  active 
                    ? 'bg-primary/10 text-primary scale-110' 
                    : 'text-gray-500 hover:text-primary hover:bg-primary/5'
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`text-xs font-medium transition-colors ${
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