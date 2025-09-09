
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Lightbulb, Heart, User, LogIn } from 'lucide-react';
import { useGuestMode } from '@/hooks/useGuestMode';
import { LoginModal } from '@/components/modals/LoginModal';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { isGuestMode } = useGuestMode();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Base navigation items for public access
  const baseNavItems = [
    {
      path: '/',
      icon: Home,
      label: 'בית',
      exact: true,
      public: true
    },
    {
      path: '/search',
      icon: Search,
      label: 'חיפוש',
      public: true
    },
    {
      path: '/inspiration',
      icon: Lightbulb,
      label: 'השראה',
      public: true
    }
  ];

  // Account-specific items
  const accountNavItems = [
    {
      path: '/favorites',
      icon: Heart,
      label: 'מועדפים',
      public: false
    },
    {
      path: '/profile',
      icon: User,
      label: 'פרופיל',
      public: false
    }
  ];

  // Guest mode login item
  const loginItem = {
    path: '/auth',
    icon: LogIn,
    label: 'התחבר',
    action: () => setShowLoginModal(true)
  };

  const navItems = isGuestMode 
    ? [...baseNavItems, loginItem]
    : [...baseNavItems, ...accountNavItems];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (item?: any) => {
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Handle login action for guest mode
    if (item?.action) {
      item.action();
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pb-4">
        <nav className="bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-3xl px-2 py-3 shadow-lg shadow-black/10 max-w-md w-full">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = !item.action && isActive(item.path, item.exact);
              
              if (item.action) {
                // Login button for guest mode
                return (
                  <button
                    key="login-button"
                    onClick={() => handleNavClick(item)}
                    className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[60px] min-h-[44px] rounded-xl transition-all duration-200 active:scale-95"
                    aria-label={item.label}
                  >
                    <div className="p-2 rounded-full transition-all duration-200 text-gray-500 hover:text-primary hover:bg-primary/5">
                      <Icon 
                        size={20}
                        className="transition-colors duration-200"
                      />
                    </div>
                    <span className="text-xs font-medium transition-colors duration-200 text-center text-gray-500">
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
                  onClick={() => handleNavClick()}
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

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};
