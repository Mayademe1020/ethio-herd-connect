import React, { useState, useEffect } from 'react';
import { FeedIngredient } from '@/services/feedService';
import { useTranslations } from '@/hooks/useTranslations';

interface FeedSelectorProps {
  feeds: FeedIngredient[];
  selectedFeedIds: string[];
  onSelectionChange: (feedIds: string[]) => void;
  maxSelections?: number;
}

export const FeedSelector: React.FC<FeedSelectorProps> = ({
  feeds,
  selectedFeedIds,
  onSelectionChange,
  maxSelections = 10
}) => {
  const { t } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter feeds based on search
  const filteredFeeds = feeds.filter(feed =>
    feed.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feed.name_am.includes(searchTerm)
  );

  // Group feeds by category
  const groupedFeeds = filteredFeeds.reduce((acc, feed) => {
    if (!acc[feed.category]) {
      acc[feed.category] = [];
    }
    acc[feed.category].push(feed);
    return acc;
  }, {} as Record<string, FeedIngredient[]>);

  const handleFeedToggle = (feedId: string) => {
    if (selectedFeedIds.includes(feedId)) {
      // Remove feed
      onSelectionChange(selectedFeedIds.filter(id => id !== feedId));
    } else {
      // Add feed (check limit)
      if (selectedFeedIds.length < maxSelections) {
        onSelectionChange([...selectedFeedIds, feedId]);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy': return '⚡';
      case 'protein': return '🥩';
      case 'mineral': return '🧱';
      case 'roughage': return '🌿';
      default: return '📦';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'energy': return t('feed.energy') || 'Energy';
      case 'protein': return t('feed.protein') || 'Protein';
      case 'mineral': return t('feed.mineral') || 'Mineral';
      case 'roughage': return t('feed.roughage') || 'Roughage';
      default: return category;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-center">
        🌾 {t('feed.selectAvailable') || 'Select Available Feeds'}
      </h3>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder={t('feed.searchFeeds') || 'Search feeds...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <div className="absolute right-3 top-3 text-gray-400">🔍</div>
      </div>

      {/* Selection counter */}
      <div className="text-sm text-gray-600 text-center">
        {selectedFeedIds.length} / {maxSelections} {t('feed.selected') || 'selected'}
      </div>

      {/* Feed categories */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedFeeds).map(([category, categoryFeeds]) => (
          <div key={category} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">{getCategoryIcon(category)}</span>
              {getCategoryName(category)}
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {categoryFeeds.map(feed => {
                const isSelected = selectedFeedIds.includes(feed.id);
                const isDisabled = !isSelected && selectedFeedIds.length >= maxSelections;

                return (
                  <button
                    key={feed.id}
                    onClick={() => !isDisabled && handleFeedToggle(feed.id)}
                    disabled={isDisabled}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{feed.icon_emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {feed.name_en}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {feed.name_am}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-green-600 text-lg">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredFeeds.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>{t('feed.noFeedsFound') || 'No feeds found matching your search'}</p>
        </div>
      )}
    </div>
  );
};