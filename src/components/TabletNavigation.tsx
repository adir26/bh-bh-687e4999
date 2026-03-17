import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Lightbulb, Heart, User, Lock, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';

export const TabletNavigation: React.FC = () => {
  const { user, profile } = useAuth();
  const { isGuestMode, setShowLoginModal, setAttemptedAction } = useGuestMode();
  const isSupplier = profile?.role === 'supplier';

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'בית',
      isPublic: true
    },
    {
      path: '/search',
      icon: Search,
      label: 'חיפוש',
      isPublic: true
    },
    {
      path: '/inspiration',
      icon: Lightbulb,
      label: 'השראה',
      isPublic: true
    },
    {
      path: '/favorites',
      icon: Heart,
      label: 'מועדפים',
      isPublic: false,
      gatedAction: 'save_favorite'
    },
    {
      path: '/profile',
      icon: User,
      label: 'פרופיל',
      isPublic: false,
      gatedAction: 'view_profile'
    }
  ];

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (isGuestMode && !item.isPublic && item.gatedAction) {
      e.preventDefault();
      setAttemptedAction(item.gatedAction);
    }
  };

  return (
    <nav className="hidden md:flex md:flex-col md:w-56 lg:w-64 md:border-s md:border-border/60 md:bg-card/50 md:backdrop-blur-sm md:p-3 lg:p-4 md:gap-1.5 md:shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
      <div className="mb-8 pt-2">
        <h1 className="text-2xl font-bold text-primary px-3 tracking-tight">Bonimpo</h1>
        <p className="text-xs text-muted-foreground px-3 mt-1">בונים פה</p>
      </div>
      
      {navItems.map((item) => {
        const Icon = item.icon;
        const isGated = isGuestMode && !item.isPublic;
        
        if (isGated) {
          return (
            <button
              key={item.path}
              className="flex items-center gap-3 py-3 px-4 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors min-h-[44px]"
              onClick={(e) => handleNavClick(item, e)}
              aria-label={`${item.label} - נדרש חשבון`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
              <Lock className="ms-auto h-4 w-4" />
            </button>
          );
        }
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 py-3 px-4 rounded-lg transition-colors min-h-[44px]
              ${isActive 
                ? 'bg-primary/10 text-primary font-semibold' 
                : 'text-muted-foreground hover:bg-muted/50'
              }
            `}
            onClick={(e) => handleNavClick(item, e)}
            aria-label={item.label}
          >
            <Icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        );
      })}

      {/* Supplier dashboard link - only visible to suppliers */}
      {isSupplier && user && (
        <>
          <div className="my-3 border-t border-border" />
          <NavLink
            to="/supplier/dashboard"
            className={({ isActive }) => `
              flex items-center gap-3 py-3 px-4 rounded-lg transition-colors min-h-[44px]
              ${isActive 
                ? 'bg-primary/10 text-primary font-semibold' 
                : 'text-muted-foreground hover:bg-muted/50'
              }
            `}
            aria-label="דשבורד ספק"
          >
            <LayoutDashboard size={20} />
            <span className="text-sm font-medium">דשבורד ספק</span>
          </NavLink>
        </>
      )}
    </nav>
  );
};
