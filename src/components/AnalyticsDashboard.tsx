// src/components/AnalyticsDashboard.tsx - Analytics Dashboard Component

import { useAnalytics } from '@/hooks/useAnalytics';
import { useTranslation } from '@/hooks/useTranslation';

const AnalyticsDashboard = () => {
  const { summary, isLoading } = useAnalytics();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const eventNameMap: Record<string, { label: string; emoji: string }> = {
    animal_registered: { label: t('analytics.animalRegistered') || 'Animals Registered', emoji: '🐄' },
    milk_recorded: { label: t('analytics.milkRecorded') || 'Milk Recorded', emoji: '🥛' },
    listing_created: { label: t('analytics.listingCreated') || 'Listings Created', emoji: '🛒' },
    listing_viewed: { label: t('analytics.listingViewed') || 'Listings Viewed', emoji: '👀' },
    interest_expressed: { label: t('analytics.interestExpressed') || 'Interests Expressed', emoji: '💬' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {t('analytics.title') || 'የእንቅስቃሴ ትንተና / Activity Analytics'}
        </h2>
        <p className="text-sm text-gray-600">
          {t('analytics.subtitle') || 'የእርስዎ የእንቅስቃሴ ማጠቃለያ / Your activity summary'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-3xl font-bold text-blue-600">{summary.totalEvents}</div>
          <div className="text-xs text-gray-700 font-medium mt-1">
            {t('analytics.totalEvents') || 'ጠቅላላ / Total'}
          </div>
        </div>

        {/* 24h Events */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
          <div className="text-2xl mb-1">⏰</div>
          <div className="text-3xl font-bold text-green-600">{summary.events24h}</div>
          <div className="text-xs text-gray-700 font-medium mt-1">
            {t('analytics.last24h') || 'ባለፉት 24 ሰዓታት / Last 24h'}
          </div>
        </div>

        {/* 7d Events */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
          <div className="text-2xl mb-1">📅</div>
          <div className="text-3xl font-bold text-purple-600">{summary.events7d}</div>
          <div className="text-xs text-gray-700 font-medium mt-1">
            {t('analytics.last7days') || 'ባለፉት 7 ቀናት / Last 7 days'}
          </div>
        </div>

        {/* Pending Queue */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-2 border-orange-200">
          <div className="text-2xl mb-1">⏳</div>
          <div className="text-3xl font-bold text-orange-600">0</div>
          <div className="text-xs text-gray-700 font-medium mt-1">
            {t('analytics.pending') || 'በመጠባበቅ ላይ / Pending'}
          </div>
        </div>
      </div>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Animals Registered */}
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-green-300 transition-colors">
          <div className="text-3xl mb-2">🐄</div>
          <div className="text-2xl font-bold text-gray-800">{summary.animalRegistrations}</div>
          <div className="text-xs text-gray-600 mt-1">
            {t('analytics.animalsRegistered') || 'እንስሳት ተመዝግበዋል'}
          </div>
        </div>

        {/* Milk Recorded */}
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-colors">
          <div className="text-3xl mb-2">🥛</div>
          <div className="text-2xl font-bold text-gray-800">{summary.milkRecordings}</div>
          <div className="text-xs text-gray-600 mt-1">
            {t('analytics.milkRecorded') || 'ወተት ተመዝግቧል'}
          </div>
        </div>

        {/* Listings Created */}
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-orange-300 transition-colors">
          <div className="text-3xl mb-2">🛒</div>
          <div className="text-2xl font-bold text-gray-800">{summary.listingsCreated}</div>
          <div className="text-xs text-gray-600 mt-1">
            {t('analytics.listingsCreated') || 'ዝርዝሮች ተፈጥረዋል'}
          </div>
        </div>

        {/* Interests Expressed */}
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors">
          <div className="text-3xl mb-2">💬</div>
          <div className="text-2xl font-bold text-gray-800">{summary.interestsExpressed}</div>
          <div className="text-xs text-gray-600 mt-1">
            {t('analytics.interestsExpressed') || 'ፍላጎቶች ተገልጸዋል'}
          </div>
        </div>
      </div>

      {/* Top Actions */}
      {summary.topActions.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {t('analytics.topActions') || 'ከፍተኛ እንቅስቃሴዎች / Top Actions'}
          </h3>
          <div className="space-y-3">
            {summary.topActions.map((action, index) => {
              const eventInfo = eventNameMap[action.event_name] || { 
                label: action.event_name, 
                emoji: '📌' 
              };
              
              return (
                <div key={action.event_name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{eventInfo.emoji}</span>
                      <span className="font-medium text-gray-700">{eventInfo.label}</span>
                    </div>
                    <span className="text-gray-600 font-bold">
                      {action.count} ({action.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-purple-500' :
                        index === 3 ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${action.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {t('analytics.noData') || 'ገና ምንም መረጃ የለም / No Data Yet'}
          </h3>
          <p className="text-sm text-gray-600">
            {t('analytics.noDataDesc') || 'እንቅስቃሴዎችዎን ይጀምሩ እና እዚህ ያዩዋቸዋል / Start your activities and see them here'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
