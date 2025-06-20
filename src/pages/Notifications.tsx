
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { Bell, Check, Trash2, Filter, Calendar, Heart, TrendingUp, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Notifications = () => {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'health' | 'growth' | 'market' | 'general'>('all');

  const notifications = [
    {
      id: '1',
      title: language === 'am' ? 'ክትባት አስታዋሽ - ሞላ' : 'Vaccination Reminder - Mola',
      message: language === 'am' ? 'FMD ክትባት ማድረግ ያስፈልጋል' : 'FMD vaccination due',
      time: language === 'am' ? '2 ሰዓት በፊት' : '2 hours ago',
      type: 'health' as const,
      priority: 'high',
      read: false,
      actionRequired: true
    },
    {
      id: '2',
      title: language === 'am' ? 'ክብደት መዝገብ - ወይዘሮ ማርታ' : 'Weight Record - Mrs. Marta',
      message: language === 'am' ? 'የሳምንት ክብደት መዝገብ ጊዜ ደርሷል' : 'Weekly weight recording due',
      time: language === 'am' ? '1 ቀን በፊት' : '1 day ago',
      type: 'growth' as const,
      priority: 'medium',
      read: false,
      actionRequired: true
    },
    {
      id: '3',
      title: language === 'am' ? 'አዲስ ደንበኛ ፍላጎት' : 'New Buyer Interest',
      message: language === 'am' ? 'አንድ ደንበኛ በላምዎ ላይ ፍላጎት አሳይቷል' : 'A buyer is interested in your cattle',
      time: language === 'am' ? '3 ቀን በፊት' : '3 days ago',
      type: 'market' as const,
      priority: 'medium',
      read: true,
      actionRequired: false
    },
    {
      id: '4',
      title: language === 'am' ? 'የጤንነት ምርመራ ቀጠሮ' : 'Health Checkup Appointment',
      message: language === 'am' ? 'የእርስዎ እንስሳት ጤንነት ምርመራ በነገ ነው' : 'Your animals health checkup is tomorrow',
      time: language === 'am' ? '5 ቀን በፊት' : '5 days ago',
      type: 'health' as const,
      priority: 'high',
      read: true,
      actionRequired: false
    },
    {
      id: '5',
      title: language === 'am' ? 'መተግበሪያ ዝማኔ' : 'App Update',
      message: language === 'am' ? 'አዲስ ባህሪዎች ተጨምረዋል' : 'New features have been added',
      time: language === 'am' ? '1 ሳምንት በፊት' : '1 week ago',
      type: 'general' as const,
      priority: 'low',
      read: true,
      actionRequired: false
    }
  ];

  const filteredNotifications = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'health': return <Heart className="w-4 h-4 text-red-500" />;
      case 'growth': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'market': return <ShoppingCart className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-orange-500 bg-orange-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const filterOptions = [
    { value: 'all', label: language === 'am' ? 'ሁሉም' : 'All' },
    { value: 'health', label: language === 'am' ? 'ጤንነት' : 'Health' },
    { value: 'growth', label: language === 'am' ? 'እድገት' : 'Growth' },
    { value: 'market', label: language === 'am' ? 'ገበያ' : 'Market' },
    { value: 'general', label: language === 'am' ? 'አጠቃላይ' : 'General' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <EnhancedHeader />
      <OfflineIndicator />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center space-x-2">
            <Bell className="w-6 h-6 text-green-600" />
            <span>{language === 'am' ? 'ማሳወቂያዎች' : 'Notifications'}</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-gray-600">
            {language === 'am' 
              ? 'የእርስዎ አስተያየቶች እና አስታዋሾች'
              : 'Your alerts and reminders'
            }
          </p>
        </div>

        {/* Filter Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>{language === 'am' ? 'ማጣሪያ' : 'Filter'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(option.value as any)}
                  className="transition-all duration-200 hover:scale-105"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  {language === 'am' ? 'ማሳወቂያ የለም' : 'No Notifications'}
                </h3>
                <p className="text-gray-500">
                  {language === 'am' 
                    ? 'በዚህ ምድብ ውስጥ ማሳወቂያ የለም'
                    : 'No notifications in this category'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`
                  border-l-4 transition-all duration-300 hover:shadow-lg cursor-pointer
                  ${getPriorityColor(notification.priority)}
                  ${!notification.read ? 'ring-2 ring-blue-200' : ''}
                `}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getTypeIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          {notification.actionRequired && (
                            <Badge variant="secondary" className="text-xs">
                              {language === 'am' ? 'እርምጃ ያስፈልጋል' : 'Action Required'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{notification.time}</span>
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              notification.priority === 'high' ? 'border-red-300 text-red-600' :
                              notification.priority === 'medium' ? 'border-orange-300 text-orange-600' :
                              'border-blue-300 text-blue-600'
                            }`}
                          >
                            {language === 'am' ? 
                              (notification.priority === 'high' ? 'ከፍተኛ' : 
                               notification.priority === 'medium' ? 'መካከለኛ' : 'ዝቅተኛ') :
                              notification.priority
                            }
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Action Buttons */}
        {filteredNotifications.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 hover:bg-green-50"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'am' ? 'ሁሉንም አንብቤያለሁ ያርጉ' : 'Mark All as Read'}</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 hover:bg-red-50 text-red-600 border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'am' ? 'ሁሉንም ያጽዱ' : 'Clear All'}</span>
            </Button>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Notifications;
