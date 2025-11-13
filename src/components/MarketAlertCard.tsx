import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/services/notificationService';
import { useTranslation } from '@/hooks/useTranslation';
import { TrendingUp, TrendingDown, MapPin, DollarSign, Eye } from 'lucide-react';

interface MarketAlertCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

export const MarketAlertCard: React.FC<MarketAlertCardProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const metadata = notification.metadata || {};
  const alertType = metadata.alert_type as 'new_listing' | 'price_change' | 'opportunity';
  const priceData = metadata.price_data;

  const handleViewListing = () => {
    if (notification.action_url) {
      navigate(notification.action_url);
      if (onMarkAsRead && !notification.is_read) {
        onMarkAsRead(notification.id);
      }
    }
  };

  const handleCreateListing = () => {
    navigate('/create-listing');
    if (onMarkAsRead && !notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  const getAlertIcon = () => {
    switch (alertType) {
      case 'new_listing':
        return <MapPin className="w-5 h-5 text-blue-500" />;
      case 'price_change':
        return priceData?.change_percentage > 0 ? (
          <TrendingUp className="w-5 h-5 text-green-500" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-500" />
        );
      case 'opportunity':
        return <DollarSign className="w-5 h-5 text-yellow-500" />;
      default:
        return <Eye className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-4 mb-3 ${
        !notification.is_read ? 'border-l-4 border-l-blue-500' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getAlertIcon()}
          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
        </div>
        <span className="text-xs text-gray-500">{getTimeAgo(notification.created_at)}</span>
      </div>

      {/* Message */}
      <p className="text-sm text-gray-700 mb-3">{notification.message}</p>

      {/* Price Data Chart (if available) */}
      {priceData && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                {t('marketAlerts.currentPrice', 'Current Price')}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {formatPrice(priceData.current)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">
                {t('marketAlerts.previousPrice', 'Previous Price')}
              </p>
              <p className="text-lg font-semibold text-gray-600">
                {formatPrice(priceData.previous)}
              </p>
            </div>
          </div>
          
          {/* Trend Indicator */}
          <div className="mt-2 flex items-center gap-2">
            {priceData.change_percentage > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${
                priceData.change_percentage > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatPercentage(priceData.change_percentage)}
            </span>
            <span className="text-xs text-gray-500">
              {t('marketAlerts.weekOverWeek', 'week-over-week')}
            </span>
          </div>
        </div>
      )}

      {/* Location Data (if available) */}
      {metadata.distance_km && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>
            {metadata.distance_km.toFixed(1)} km {t('marketAlerts.away', 'away')}
          </span>
          {metadata.location && <span className="text-gray-400">• {metadata.location}</span>}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {alertType === 'new_listing' && notification.action_url && (
          <button
            onClick={handleViewListing}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            {t('marketAlerts.viewListing', 'View Listing')}
          </button>
        )}

        {alertType === 'opportunity' && (
          <button
            onClick={handleCreateListing}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            {t('marketAlerts.createListing', 'Create Listing')}
          </button>
        )}

        {alertType === 'price_change' && (
          <button
            onClick={handleViewListing}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            {t('marketAlerts.viewMarket', 'View Market')}
          </button>
        )}
      </div>
    </div>
  );
};
