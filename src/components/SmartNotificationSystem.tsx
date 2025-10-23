
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Heart, TrendingUp, AlertTriangle, Syringe, Scale, DollarSign, X, CheckCircle } from 'lucide-react';
import { Language } from '@/types';
import { useDateDisplay } from '@/hooks/useDateDisplay';

interface Notification {
  id: string;
  type: 'vaccination' | 'health' | 'market' | 'feed' | 'breeding' | 'weather';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  date: string;
  actionRequired: boolean;
  animalId?: string;
  isRead: boolean;
}

interface SmartNotificationSystemProps {
  language: Language;
}

export const SmartNotificationSystem = ({ language }: SmartNotificationSystemProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const { formatDateShort } = useDateDisplay();

  const translations = {
    am: {
      title: 'ብልሃተኛ ማስታወሻዎች',
      subtitle: 'AI የተደገፈ የእርሻ ማስታወሻዎች',
      all: 'ሁሉም',
      unread: 'ያልተነበቡ',
      highPriority: 'ቀዳሚ',
      markAllRead: 'ሁሉንም ተነብቧል ብላቸው',
      dismiss: 'አጥፋ',
      viewDetails: 'ዝርዝር ይመልከቱ',
      vaccination: 'ክትባት',
      health: 'ጤንነት',
      market: 'ገበያ',
      feed: 'መኖ',
      breeding: 'እርባታ',
      weather: 'የአየር ንብረት',
      actionRequired: 'እርምጃ ያስፈልጋል',
      today: 'ዛሬ',
      yesterday: 'ትናንት',
      thisWeek: 'በዚህ ሳምንት'
    },
    en: {
      title: 'Smart Notifications',
      subtitle: 'AI-powered farming alerts',
      all: 'All',
      unread: 'Unread',
      highPriority: 'High Priority',
      markAllRead: 'Mark All Read',
      dismiss: 'Dismiss',
      viewDetails: 'View Details',
      vaccination: 'Vaccination',
      health: 'Health',
      market: 'Market',
      feed: 'Feed',
      breeding: 'Breeding',
      weather: 'Weather',
      actionRequired: 'Action Required',
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This Week'
    },
    or: {
      title: 'Beeksisa Sammuu',
      subtitle: 'Akeekkachiisa qonnaa AI kan deeggaru',
      all: 'Hundaa',
      unread: 'Hin Dubbifamne',
      highPriority: 'Dursa Olaanaa',
      markAllRead: 'Hunda Dubbifameeti Mallatteessi',
      dismiss: 'Balleessi',
      viewDetails: 'Bal\'ina Ilaali',
      vaccination: 'Talallii',
      health: 'Fayyaa',
      market: 'Gabaa',
      feed: 'Nyaata',
      breeding: 'Hormaata',
      weather: 'Haala Qilleensaa',
      actionRequired: 'Tarkaanfiin Barbaachisa',
      today: 'Har\'a',
      yesterday: 'Kaleessa',
      thisWeek: 'Torban Kana'
    },
    sw: {
      title: 'Arifa za Akili',
      subtitle: 'Tahadhari za kilimo zinazotumia AI',
      all: 'Zote',
      unread: 'Hazijasomwa',
      highPriority: 'Kipaumbele Kikuu',
      markAllRead: 'Alama Zote Zimesomwa',
      dismiss: 'Ondoa',
      viewDetails: 'Ona Maelezo',
      vaccination: 'Chanjo',
      health: 'Afya',
      market: 'Soko',
      feed: 'Chakula',
      breeding: 'Uzazi',
      weather: 'Hali ya Hewa',
      actionRequired: 'Hatua Inahitajika',
      today: 'Leo',
      yesterday: 'Jana',
      thisWeek: 'Wiki Hii'
    }
  };

  const t = translations[language];

  // Generate smart notifications based on Ethiopian farming context
  useEffect(() => {
    const generateNotifications = () => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'vaccination',
          priority: 'high',
          title: language === 'am' ? 'ክትባት ጊዜ ደርሷል' : 'Vaccination Due',
          message: language === 'am' ? 'ማርታ (COW-001) የFMD ክትባት ያስፈልጋታል' : 'Marta (COW-001) needs FMD vaccination',
          date: new Date().toISOString(),
          actionRequired: true,
          animalId: 'COW-001',
          isRead: false
        },
        {
          id: '2',
          type: 'market',
          priority: 'medium',
          title: language === 'am' ? 'የገበያ ዋጋ ጭማሪ' : 'Market Price Increase',
          message: language === 'am' ? 'የከብት ዋጋ 8% ጨምሯል - የመሸጥ ጊዜ ነው' : 'Cattle prices up 8% - Good time to sell',
          date: new Date(Date.now() - 86400000).toISOString(),
          actionRequired: false,
          isRead: false
        },
        {
          id: '3',
          type: 'weather',
          priority: 'high',
          title: language === 'am' ? 'የአየር ንብረት ማስጠንቀቂያ' : 'Weather Alert',
          message: language === 'am' ? 'የብርድ ሞገድ ይጠበቃል - እንስሶችን ይጠብቁ' : 'Cold wave expected - Protect animals',
          date: new Date(Date.now() - 172800000).toISOString(),
          actionRequired: true,
          isRead: true
        },
        {
          id: '4',
          type: 'feed',
          priority: 'medium',
          title: language === 'am' ? 'የመኖ ክምችት ዝቅተኛ' : 'Feed Stock Low',
          message: language === 'am' ? 'የሳር መኖ ለ2 ሳምንት ብቻ ይቆያል' : 'Hay supply will last only 2 weeks',
          date: new Date(Date.now() - 259200000).toISOString(),
          actionRequired: true,
          isRead: false
        },
        {
          id: '5',
          type: 'health',
          priority: 'low',
          title: language === 'am' ? 'የጤንነት ቼክ-አፕ' : 'Health Check-up',
          message: language === 'am' ? '3 እንስሳት የወር ቶሎ ጤንነት ፍተሻ ያስፈልጋቸዋል' : '3 animals due for monthly health check',
          date: new Date(Date.now() - 345600000).toISOString(),
          actionRequired: false,
          isRead: true
        }
      ];
      setNotifications(mockNotifications);
    };

    generateNotifications();
  }, [language]);

  const getIcon = (type: Notification['type']) => {
    const iconMap = {
      vaccination: Syringe,
      health: Heart,
      market: DollarSign,
      feed: Scale,
      breeding: TrendingUp,
      weather: AlertTriangle
    };
    return iconMap[type];
  };

  const getTypeColor = (type: Notification['type']) => {
    const colorMap = {
      vaccination: 'bg-blue-100 text-blue-800',
      health: 'bg-red-100 text-red-800',
      market: 'bg-green-100 text-green-800',
      feed: 'bg-yellow-100 text-yellow-800',
      breeding: 'bg-purple-100 text-purple-800',
      weather: 'bg-orange-100 text-orange-800'
    };
    return colorMap[type];
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    const colorMap = {
      high: 'border-red-400 bg-red-50',
      medium: 'border-yellow-400 bg-yellow-50',
      low: 'border-gray-300 bg-gray-50'
    };
    return colorMap[priority];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return t.today;
    if (diffDays === 2) return t.yesterday;
    if (diffDays <= 7) return t.thisWeek;
    return formatDateShort(date);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'high') return notification.priority === 'high';
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card className="border-ethiopia-green-200">
      <CardHeader className="bg-gradient-to-r from-ethiopia-green-600 to-ethiopia-green-700 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5" />
            <div>
              <CardTitle className="text-lg font-semibold">
                {t.title}
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-green-100 mt-1">{t.subtitle}</p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={markAllAsRead}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            {t.markAllRead}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Filter Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { key: 'all', label: t.all },
            { key: 'unread', label: t.unread },
            { key: 'high', label: t.highPriority }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                filter === tab.key
                  ? 'border-ethiopia-green-500 text-ethiopia-green-600 bg-ethiopia-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{language === 'am' ? 'ማስታወሻ የለም' : 'No notifications'}</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    getPriorityColor(notification.priority)
                  } ${!notification.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                          {notification.actionRequired && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              {t.actionRequired}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {formatDate(notification.date)}
                          </p>
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs h-6 px-2"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {language === 'am' ? 'ተነብቧል' : 'Mark Read'}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissNotification(notification.id)}
                              className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
