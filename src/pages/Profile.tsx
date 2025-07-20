
import React from 'react';
import { User, Settings, Bell, CreditCard, HelpCircle, LogOut, ChevronLeft, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Profile = () => {
  const userStats = [
    { label: 'הזמנות', value: '12', color: 'text-blue-600' },
    { label: 'ביקורות', value: '8', color: 'text-green-600' },
    { label: 'דירוג ממוצע', value: '4.9', color: 'text-yellow-600' }
  ];

  const menuItems = [
    {
      id: 'personal-info',
      icon: User,
      title: 'פרטים אישיים',
      subtitle: 'עדכן את הפרטים שלך',
      href: '/profile/personal-info'
    },
    {
      id: 'addresses',
      icon: MapPin,
      title: 'כתובות',
      subtitle: 'נהל את הכתובות שלך',
      href: '/profile/addresses'
    },
    {
      id: 'payment',
      icon: CreditCard,
      title: 'אמצעי תשלום',
      subtitle: 'כרטיסי אשראי וחשבונות בנק',
      href: '/profile/payment'
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'התראות',
      subtitle: 'נהל העדפות התראות',
      href: '/profile/notifications'
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'הגדרות',
      subtitle: 'הגדרות כלליות של האפליקציה',
      href: '/profile/settings'
    },
    {
      id: 'help',
      icon: HelpCircle,
      title: 'עזרה ותמיכה',
      subtitle: 'שאלות נפוצות וצור קשר',
      href: '/profile/help'
    }
  ];

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white pb-20">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 text-right">
            <h1 className="text-xl font-bold">איתן כהן</h1>
            <p className="text-blue-100">eitan.cohen@email.com</p>
            <p className="text-blue-100 text-sm">חבר מאז ינואר 2023</p>
          </div>
        </div>

        {/* User Stats */}
        <div className="flex justify-between mt-6 bg-white/10 rounded-lg p-4">
          {userStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-blue-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.subtitle}</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Logout Button */}
        <Card className="mt-6 border-red-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 text-right">
                <h3 className="font-medium text-red-600">התנתק</h3>
                <p className="text-sm text-red-400">התנתק מהחשבון שלך</p>
              </div>
              <ChevronLeft className="w-5 h-5 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* App Version */}
      <div className="text-center text-xs text-gray-400 pb-4">
        גרסה 1.0.0
      </div>
    </div>
  );
};

export default Profile;
