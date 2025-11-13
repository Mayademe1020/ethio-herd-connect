// src/components/InterestsList.tsx - Component to display buyer interests for sellers

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBuyerInterest } from '@/hooks/useBuyerInterest';
import { useTranslations } from '@/hooks/useTranslations';
import { Loader2 } from 'lucide-react';

interface BuyerInterest {
  id: string;
  listing_id: string;
  buyer_id: string;
  message?: string;
  status: 'pending' | 'contacted' | 'closed';
  created_at: string;
}

interface InterestsListProps {
  interests: BuyerInterest[];
}

const InterestsList: React.FC<InterestsListProps> = ({ interests }) => {
  const { markAsContacted, isUpdating } = useBuyerInterest();
  const { t } = useTranslations();

  // Fetch buyer phone numbers
  const { data: buyerPhones, isLoading: isLoadingPhones } = useQuery({
    queryKey: ['buyer-phones', interests.map(i => i.buyer_id)],
    queryFn: async () => {
      if (interests.length === 0) return {};
      
      const buyerIds = [...new Set(interests.map(i => i.buyer_id))];
      
      // Fetch user data from auth.users (phone is stored there)
      const phones: Record<string, string> = {};
      
      for (const buyerId of buyerIds) {
        const { data } = await supabase.auth.admin.getUserById(buyerId);
        if (data?.user?.phone) {
          phones[buyerId] = data.user.phone;
        }
      }
      
      return phones;
    },
    enabled: interests.length > 0
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-ET', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleMarkAsContacted = async (interestId: string) => {
    try {
      await markAsContacted(interestId);
    } catch (error) {
      console.error('Failed to update interest status:', error);
    }
  };

  if (isLoadingPhones) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
      </div>
    );
  }

  if (interests.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-gray-600">{t('marketplace.noInterests')}</p>
        <p className="text-sm text-gray-500 mt-1">
          {t('marketplace.buyersWillAppear')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interests.map((interest) => {
        const buyerPhone = buyerPhones?.[interest.buyer_id];
        
        return (
          <div
            key={interest.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">👤</span>
                  <p className="font-medium text-gray-900">
                    {t('marketplace.buyer')} #{interest.buyer_id.substring(0, 8)}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  🕐 {formatDate(interest.created_at)}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  interest.status === 'contacted'
                    ? 'bg-blue-100 text-blue-800'
                    : interest.status === 'closed'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {interest.status === 'contacted'
                  ? `✓ ${t('marketplace.contacted')}`
                  : interest.status === 'closed'
                  ? `✕ ${t('marketplace.closed')}`
                  : `⏳ ${t('marketplace.pending')}`}
              </span>
            </div>

            {/* Message */}
            {interest.message && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-500 mb-1">{t('marketplace.message')}:</p>
                <p className="text-gray-700">"{interest.message}"</p>
              </div>
            )}

            {/* Phone Number */}
            {buyerPhone && (
              <div className="bg-green-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-500 mb-1">{t('marketplace.contact')}:</p>
                <p className="text-lg font-medium text-gray-900">📞 {buyerPhone}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {t('marketplace.canUseWhatsApp')}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {buyerPhone && (
                <a
                  href={`tel:${buyerPhone}`}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium text-center hover:bg-green-700 transition-colors"
                >
                  📞 {t('marketplace.callSeller')}
                </a>
              )}
              
              {interest.status === 'pending' && (
                <button
                  onClick={() => handleMarkAsContacted(interest.id)}
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {isUpdating ? t('common.loading') : `✓ ${t('marketplace.markContacted')}`}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InterestsList;
