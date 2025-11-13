import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';

interface FeedModeSelectorProps {
  onModeSelect: (mode: 'user_feeds' | 'recommendations') => void;
}

export const FeedModeSelector: React.FC<FeedModeSelectorProps> = ({ onModeSelect }) => {
  const { t } = useTranslations();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center mb-6">
        🥛 {t('feed.rationing') || 'Feed Rationing'}
      </h2>

      <div className="grid gap-4">
        {/* Mode A: I Have These Feeds */}
        <button
          onClick={() => onModeSelect('user_feeds')}
          className="bg-white border-2 border-green-200 rounded-lg p-6 hover:border-green-400 hover:bg-green-50 transition-colors text-left"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">🌾</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-green-800">
                {t('feed.iHaveFeeds') || 'I Have These Feeds'}
              </h3>
              <p className="text-green-700 text-sm mt-1">
                {t('feed.useExisting') || 'Use what you already have for optimal nutrition'}
              </p>
            </div>
            <div className="text-green-500 text-2xl">→</div>
          </div>
        </button>

        {/* Mode B: Get Best Recommendations */}
        <button
          onClick={() => onModeSelect('recommendations')}
          className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">⭐</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-blue-800">
                {t('feed.bestRecommendations') || 'Get Best Recommendations'}
              </h3>
              <p className="text-blue-700 text-sm mt-1">
                {t('feed.scientificOptimal') || 'ILRI scientific formulas for maximum production'}
              </p>
            </div>
            <div className="text-blue-500 text-2xl">→</div>
          </div>
        </button>
      </div>

      <div className="text-center text-sm text-gray-600 mt-6">
        <p>⚠️ {t('feed.disclaimer') || 'Consult veterinarian before making feed changes'}</p>
      </div>
    </div>
  );
};