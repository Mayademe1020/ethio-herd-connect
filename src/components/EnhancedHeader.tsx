
import React, { useState } from 'react';
import { Bell, Menu, Globe, X, MessageSquare, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const EnhancedHeader: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, setLanguage } = useLanguage();

  // Mock notifications data
  const notifications = [
    {
      id: '1',
      title: language === 'am' ? 'ክትባት አስታዋሽ' : 'Vaccination Reminder',
      message: language === 'am' ? 'ሞላ ክትባት ያስፈልጋል' : 'Mola needs vaccination',
      time: language === 'am' ? '2 ሰዓት በፊት' : '2 hours ago',
      type: 'health'
    },
    {
      id: '2',
      title: language === 'am' ? 'ክብደት መዝገብ' : 'Weight Record',
      message: language === 'am' ? 'ወይዘሮ ማርታ - ክብደት ይመዝገብ' : 'Mrs. Marta - Record weight',
      time: language === 'am' ? '1 ቀን በፊት' : '1 day ago',
      type: 'growth'
    },
    {
      id: '3',
      title: language === 'am' ? 'የገበያ ዝርዝር' : 'Market Update',
      message: language === 'am' ? 'አዲስ ደንበኛ ፍላጎት' : 'New buyer interest',
      time: language === 'am' ? '3 ቀን በፊት' : '3 days ago',
      type: 'market'
    }
  ];

  const menuItems = [
    {
      id: 'profile',
      title: language === 'am' ? 'መገለጫ' : 'Profile',
      icon: <User className="w-4 h-4" />,
      action: () => navigate('/profile')
    },
    {
      id: 'settings',
      title: language === 'am' ? 'ቅንብሮች' : 'Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => navigate('/profile?tab=settings')
    },
    {
      id: 'feedback',
      title: language === 'am' ? 'አስተያየት' : 'Feedback',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => navigate('/profile?tab=feedback')
    },
    {
      id: 'logout',
      title: language === 'am' ? 'ውጣ' : 'Logout',
      icon: <LogOut className="w-4 h-4" />,
      action: () => signOut()
    }
  ];

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowMenu(false);
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
    setShowNotifications(false);
  };

  const NotificationPanel = () => (
    <Card className="absolute top-full right-0 mt-2 w-80 max-w-[90vw] z-50 shadow-xl border-2 border-green-100">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {language === 'am' ? 'ማሳወቂያዎች' : 'Notifications'}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div key={notification.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">{notification.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                </div>
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === 'health' ? 'bg-red-400' :
                  notification.type === 'growth' ? 'bg-blue-400' :
                  'bg-green-400'
                }`} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={() => {
              setShowNotifications(false);
              navigate('/notifications');
            }}
          >
            {language === 'am' ? 'ሁሉንም ይመልከቱ' : 'View All Notifications'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const MenuPanel = () => (
    <Card className="absolute top-full right-0 mt-2 w-64 max-w-[90vw] z-50 shadow-xl border-2 border-green-100">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {language === 'am' ? 'ዝርዝር' : 'Menu'}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setShowMenu(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start text-left hover:bg-green-50 transition-colors"
              onClick={() => {
                item.action();
                setShowMenu(false);
              }}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <header className="bg-white shadow-sm border-b border-green-100 relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">🐄</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ቤት-ግጦሽ</h1>
              <p className="text-sm text-gray-600">Bet-Gitosa</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 relative">
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'am' ? 'en' : 'am')}
              className="flex items-center space-x-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'am' ? 'English' : 'አማርኛ'}</span>
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                className="relative transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-green-50"
                onClick={handleNotificationClick}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </span>
              </Button>
              {showNotifications && <NotificationPanel />}
            </div>

            {/* Menu */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm"
                className="transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-green-50"
                onClick={handleMenuClick}
              >
                <Menu className="w-4 h-4" />
              </Button>
              {showMenu && <MenuPanel />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
