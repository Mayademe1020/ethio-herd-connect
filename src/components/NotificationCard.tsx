import { formatDistanceToNow } from 'date-fns';
import { Phone, MessageCircle, Check, X, Clock } from 'lucide-react';
import { Notification } from '@/services/notificationService';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { snoozeReminder } from '@/services/reminderService';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useToast } from '@/hooks/useToast';
import { MarketAlertCard } from './MarketAlertCard';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'buyer_interest':
      return '💰';
    case 'milk_reminder':
      return '🥛';
    case 'market_alert':
      return '📊';
    case 'pregnancy_alert':
      return '🤰';
    default:
      return '🔔';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500 bg-red-50';
    case 'medium':
      return 'border-l-orange-500 bg-orange-50';
    case 'low':
      return 'border-l-blue-500 bg-blue-50';
    default:
      return 'border-l-gray-500 bg-gray-50';
  }
};

export function NotificationCard({ notification, onMarkAsRead, onDelete }: NotificationCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Use MarketAlertCard for market alerts
  if (notification.type === 'market_alert') {
    return <MarketAlertCard notification={notification} onMarkAsRead={onMarkAsRead} />;
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone: string) => {
    // Remove any non-digit characters and ensure it starts with country code
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSnooze = async () => {
    if (!user?.id || !notification.metadata?.reminder_id) return;

    try {
      const result = await snoozeReminder(
        user.id,
        notification.id,
        notification.metadata.reminder_id
      );

      if (result.success) {
        showToast(t('reminders.snoozed'), 'success');
        onMarkAsRead(notification.id);
      } else {
        showToast(result.error || t('reminders.snoozeFailed'), 'error');
      }
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      showToast(t('reminders.snoozeFailed'), 'error');
    }
  };

  const handleCardClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <div
      className={`border-l-4 rounded-lg p-4 mb-3 shadow-sm transition-all ${
        notification.is_read ? 'bg-white border-l-gray-300' : getPriorityColor(notification.priority)
      } ${notification.action_url ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={notification.action_url ? handleCardClick : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <span className="text-2xl mr-3">{getNotificationIcon(notification.type)}</span>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900">
                {notification.title}
              </h3>
              {!notification.is_read && (
                <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {notification.message}
            </p>
            
            <p className="text-xs text-gray-400">
              {timeAgo}
            </p>

            {/* Milk Reminder Actions */}
            {notification.type === 'milk_reminder' && !notification.is_read && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSnooze();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  {t('reminders.snooze')}
                </button>
              </div>
            )}

            {/* Display snooze count if snoozed */}
            {notification.type === 'milk_reminder' && notification.metadata?.snooze_count && (
              <p className="text-xs text-orange-600 mt-2">
                {t('reminders.snoozedCount', { count: notification.metadata.snooze_count })}
              </p>
            )}

            {/* Buyer Interest Actions */}
            {notification.type === 'buyer_interest' && notification.metadata?.buyer_phone && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCall(notification.metadata.buyer_phone);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {t('notifications.call')}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWhatsApp(notification.metadata.buyer_phone);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('notifications.whatsapp')}
                </button>
              </div>
            )}

            {/* Display buyer message if available */}
            {notification.type === 'buyer_interest' && notification.metadata?.buyer_message && (
              <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">{t('notifications.buyerMessage')}:</p>
                <p className="text-sm text-gray-700">{notification.metadata.buyer_message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1 ml-2">
          {!notification.is_read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title={t('notifications.markAsRead')}
            >
              <Check className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title={t('notifications.delete')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
