import React from 'react';
import { Bell, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BottomNavigation from '@/components/BottomNavigation';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const { language } = useLanguage();
  const { 
    notifications, 
    isLoading, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const getIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const translations = {
    am: { title: 'ማሳወቂያዎች', markAllRead: 'ሁሉንም እንደተነበበ ምልክት አድርግ', noNotifications: 'ማሳወቂያዎች የሉም', unread: 'ያልተነበቡ' },
    en: { title: 'Notifications', markAllRead: 'Mark all as read', noNotifications: 'No notifications', unread: 'Unread' },
    or: { title: 'Beeksisa', markAllRead: 'Hunda akka dubbifametti mallattessi', noNotifications: 'Beeksisa hin jiru', unread: 'Hin dubbifamne' },
    sw: { title: 'Arifa', markAllRead: 'Weka zote kama zimesomwa', noNotifications: 'Hakuna arifa', unread: 'Haijasomwa' }
  };

  const t = translations[language];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} {t.unread}</Badge>}
        </div>

        {notifications.length > 0 && unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
            <CheckCircle className="w-4 h-4 mr-2" />
            {t.markAllRead}
          </Button>
        )}

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>{t.noNotifications}</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id} 
                    className={`border rounded-md p-4 transition-colors cursor-pointer ${
                      notification.is_read ? 'bg-gray-50' : 'bg-white border-blue-200'
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.is_read && <Badge variant="secondary" className="text-xs">{t.unread}</Badge>}
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}>
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Notifications;
