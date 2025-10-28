// src/components/InterestsList.tsx - Component to display buyer interests for sellers

import React from 'react';
import { useBuyerInterest } from '@/hooks/useBuyerInterest';

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
  buyerPhones?: Record<string, string>; // Map of buyer_id to phone number
}

const InterestsList: React.FC<InterestsListProps> = ({ interests, buyerPhones = {} }) => {
  const { updateInterestStatus } = useBuyerInterest();

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
      await updateInterestStatus.mutateAsync({
        interestId,
        status: 'contacted',
      });
    } catch (error) {
      console.error('Failed to update interest status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleMarkAsClosed = async (interestId: string) => {
    try {
      await updateInterestStatus.mutateAsync({
        interestId,
        status: 'closed',
      });
    } catch (error) {
      console.error('Failed to update interest status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  if (interests.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-gray-600">No interests yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Buyers will appear here when they express interest
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interests.map((interest) => {
        const buyerPhone = buyerPhones[interest.buyer_id];
        
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
                    Buyer #{interest.buyer_id.substring(0, 8)}
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
                  ? '✓ Contacted'
                  : interest.status === 'closed'
                  ? '✕ Closed'
                  : '⏳ Pending'}
              </span>
            </div>

            {/* Message */}
            {interest.message && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-500 mb-1">Message:</p>
                <p className="text-gray-700">"{interest.message}"</p>
              </div>
            )}

            {/* Phone Number */}
            {buyerPhone && (
              <div className="bg-green-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-500 mb-1">Contact:</p>
                <p className="text-lg font-medium text-gray-900">📞 {buyerPhone}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {buyerPhone && (
                <a
                  href={`tel:${buyerPhone}`}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium text-center hover:bg-green-700 transition-colors"
                >
                  📞 Call
                </a>
              )}
              
              {interest.status === 'pending' && (
                <button
                  onClick={() => handleMarkAsContacted(interest.id)}
                  disabled={updateInterestStatus.isPending}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {updateInterestStatus.isPending ? 'Updating...' : '✓ Mark Contacted'}
                </button>
              )}
              
              {interest.status !== 'closed' && (
                <button
                  onClick={() => handleMarkAsClosed(interest.id)}
                  disabled={updateInterestStatus.isPending}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:bg-gray-100"
                >
                  ✕ Close
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
