
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Lightbulb, Heart, User, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isGuestMode, setShowLoginModal, setAttemptedAction } = useGuestMode();

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'בית',
      exact: true,
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

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (item: typeof navItems[0]) => {
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // If guest mode and trying to access gated content, show login modal
    if (isGuestMode && !item.isPublic && item.gatedAction) {
      setAttemptedAction(item.gatedAction);
      setShowLoginModal(true);
      return false; // Prevent navigation
    }
    
    return true; // Allow navigation
  };

  return (
    <div 
      className="md:hidden fixed inset-x-0 z-50 flex justify-center px-4" 
      style={{
        bottom: "calc(var(--footer-h, 0px) + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <nav className="bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-3xl px-2 py-3 shadow-lg shadow-black/10 max-w-md w-full">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            const isGated = isGuestMode && !item.isPublic;
            
            // For gated items in guest mode, render as button instead of NavLink
            if (isGated) {
              return (
                <button
                  key={item.path}
                  className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[60px] min-h-[44px] rounded-xl transition-all duration-200 active:scale-95 relative"
                  onClick={() => handleNavClick(item)}
                  aria-label={`${item.label} - נדרש חשבון`}
                >
                  <div className="p-2 rounded-full transition-all duration-200 text-gray-400 relative">
                    <Icon 
                      size={20}
                      className="transition-colors duration-200"
                    />
                    <Lock className="absolute -top-1 -right-1 h-3 w-3 text-gray-400" />
                  </div>
                  <span className="text-xs font-medium transition-colors duration-200 text-center text-gray-400">
                    {item.label}
                  </span>
                </button>
              );
            }
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[60px] min-h-[44px] rounded-xl transition-all duration-200 active:scale-95"
                onClick={() => handleNavClick(item)}
                aria-label={item.label}
              >
                <div className={`p-2 rounded-full transition-all duration-200 ${
                  active 
                    ? 'bg-primary/15 text-primary scale-110' 
                    : 'text-gray-500 hover:text-primary hover:bg-primary/5'
                }`}>
                  <Icon 
                    size={20}
                    className="transition-colors duration-200"
                  />
                </div>
                <span 
                  className={`text-xs font-medium transition-colors duration-200 text-center ${
                    active ? 'text-primary' : 'text-gray-500'
                  }`}
                >
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
