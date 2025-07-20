
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'בית',
      exact: true
    },
    {
      path: '/search',
      icon: Search,
      label: 'חיפוש'
    },
    {
      path: '/favorites',
      icon: Heart,
      label: 'מועדפים'
    },
    {
      path: '/orders',
      icon: ShoppingBag,
      label: 'הזמנות'
    },
    {
      path: '/profile',
      icon: User,
      label: 'פרופיל'
    }
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 py-2 px-3 min-w-[60px]"
            >
              <Icon 
                size={24}
                className={`${active ? 'text-primary' : 'text-gray-500'} transition-colors`}
              />
              <span 
                className={`text-xs font-medium ${active ? 'text-primary' : 'text-gray-500'} transition-colors`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
