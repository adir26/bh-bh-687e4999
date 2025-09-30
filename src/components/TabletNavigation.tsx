import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Lightbulb, Heart, User, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';

export const TabletNavigation: React.FC = () => {
  const { user } = useAuth();
  const { isGuestMode, setShowLoginModal, setAttemptedAction } = useGuestMode();

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
    // If guest mode and trying to access gated content, show login modal
    if (isGuestMode && !item.isPublic && item.gatedAction) {
      e.preventDefault();
      setAttemptedAction(item.gatedAction);
      setShowLoginModal(true);
    }
  };

  return (
    <nav className="hidden md:flex md:flex-col md:w-64 md:border-l md:bg-white md:p-4 md:gap-2 md:shrink-0">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-primary px-3">Bonimpo</h1>
      </div>
      
      {navItems.map((item) => {
        const Icon = item.icon;
        const isGated = isGuestMode && !item.isPublic;
        
        if (isGated) {
          return (
            <button
              key={item.path}
              className="flex items-center gap-3 py-3 px-4 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
              onClick={(e) => handleNavClick(item, e)}
              aria-label={`${item.label} - נדרש חשבון`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
              <Lock className="mr-auto h-4 w-4" />
            </button>
          );
        }
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 py-3 px-4 rounded-lg transition-colors
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
    </nav>
  );
};
