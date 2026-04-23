// src/pages/TransactionHistory.tsx - Transaction History Page

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useSellerRatings, useSubmitRating } from '@/hooks/useSellerRatings';
import { BackButton } from '@/components/BackButton';

type TabType = 'sold' | 'bought';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('sold');

  // Fetch sold transactions (listings that were marked as sold)
  const { data: soldTransactions, isLoading: loadingSold } = useQuery<any[]>({
    queryKey: ['transactions-sold', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('market_listings')
        .select(`
          id,
          price,
          status,
          created_at,
          updated_at,
          animal:animals(name, type, photo_url),
          buyer_interests!inner(
            id,
            buyer_id,
            status,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'sold')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching sold transactions:', error);
        return [];
      }

      // Flatten the data
      return (data || []).map((listing: any) => ({
        id: listing.id,
        listingId: listing.id,
        price: listing.price,
        animal: listing.animal,
        status: listing.status,
        createdAt: listing.created_at,
        completedAt: listing.updated_at,
        buyer: listing.buyer_interests?.[0] || null
      })).filter(t => t.buyer);
    },
    enabled: !!user,
  });

  // Fetch bought transactions (where user expressed interest and it was marked sold)
  const { data: boughtTransactions, isLoading: loadingBought } = useQuery<any[]>({
    queryKey: ['transactions-bought', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('buyer_interests')
        .select(`
          id,
          status,
          created_at,
          listing:market_listings(
            id,
            price,
            status,
            updated_at,
            animal:animals(name, type, photo_url),
            user_id,
            location
          )
        `)
        .eq('buyer_id', user.id)
        .in('status', ['accepted', 'completed'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bought transactions:', error);
        return [];
      }

      return (data || []).map((interest: any) => ({
        id: interest.id,
        interestId: interest.id,
        price: interest.listing?.price,
        animal: interest.listing?.animal,
        status: interest.status,
        createdAt: interest.created_at,
        completedAt: interest.listing?.updated_at,
        sellerId: interest.listing?.user_id,
        sellerLocation: interest.listing?.location
      }));
    },
    enabled: !!user,
  });

  const { ratingStats, ratingsReceived } = useSellerRatings(user?.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAnimalIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'cattle': return '🐄';
      case 'goat': return '🐐';
      case 'sheep': return '🐑';
      default: return '🐄';
    }
  };

  const transactions = activeTab === 'sold' ? soldTransactions : boughtTransactions;
  const isLoading = activeTab === 'sold' ? loadingSold : loadingBought;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <BackButton />
        
        <h1 className="text-2xl font-bold mt-4 mb-4">Transaction History</h1>

        {/* Rating Stats */}
        {ratingStats && ratingStats.total > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Your Rating Score</p>
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-bold ${ratingStats.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {ratingStats.score > 0 ? '+' : ''}{ratingStats.score}
              </div>
              <div className="flex gap-3 text-sm">
                <span className="text-green-600">👍 {ratingStats.positive}</span>
                <span className="text-red-600">👎 {ratingStats.negative}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('sold')}
            className={`flex-1 py-3 rounded-lg font-medium ${
              activeTab === 'sold' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Animals I Sold ({soldTransactions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('bought')}
            className={`flex-1 py-3 rounded-lg font-medium ${
              activeTab === 'bought' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Animals I Bought ({boughtTransactions?.length || 0})
          </button>
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : transactions?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-2">
              {activeTab === 'sold' 
                ? 'When you sell animals, they will appear here'
                : 'When you buy animals, they will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions?.map((transaction: any) => (
              <TransactionCard 
                key={transaction.id}
                transaction={transaction}
                type={activeTab}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Transaction Card Component
const TransactionCard = ({ transaction, type }: { transaction: any; type: 'sold' | 'bought' }) => {
  const navigate = useNavigate();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAnimalIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'cattle': return '🐄';
      case 'goat': return '🐐';
      case 'sheep': return '🐑';
      default: return '🐄';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex gap-4">
        <div 
          className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer"
          onClick={() => navigate(`/marketplace/${transaction.listingId}`)}
        >
          {transaction.animal?.photo_url ? (
            <img 
              src={transaction.animal.photo_url} 
              alt={transaction.animal?.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-2xl">{getAnimalIcon(transaction.animal?.type)}</span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {transaction.animal?.name || 'Animal'}
              </h3>
              <p className="text-sm text-gray-500">
                {transaction.animal?.type || 'Livestock'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">{formatPrice(transaction.price)}</p>
              <p className="text-xs text-gray-500">
                {formatDate(transaction.completedAt || transaction.createdAt)}
              </p>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              transaction.status === 'completed' || transaction.status === 'sold'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {transaction.status === 'completed' ? '✓ Completed' : '✓ Sold'}
            </span>
          </div>

          {/* Rating Button for completed transactions */}
          {type === 'sold' && transaction.buyer?.buyer_id && (
            <RatingButton 
              transactionId={transaction.id}
              ratedUserId={transaction.buyer.buyer_id}
              otherPartyName="Buyer"
            />
          )}

          {type === 'bought' && transaction.sellerId && (
            <RatingButton 
              transactionId={transaction.id}
              ratedUserId={transaction.sellerId}
              otherPartyName="Seller"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Rating Button Component
const RatingButton = ({ transactionId, ratedUserId, otherPartyName }: { 
  transactionId: string; 
  ratedUserId: string;
  otherPartyName: string;
}) => {
  const { canRate, hasRated } = useCanRate(transactionId, ratedUserId);
  const { submitRating, isSubmitting } = useSubmitRating();
  const [showRating, setShowRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState<'positive' | 'negative' | 'neutral' | null>(null);

  const handleSubmit = async () => {
    if (!selectedRating) return;
    try {
      await submitRating({
        transactionId,
        ratedUserId,
        rating: selectedRating,
      });
      setShowRating(false);
      alert('Thank you for your feedback!');
    } catch (error) {
      alert('Failed to submit rating');
    }
  };

  if (hasRated) {
    return (
      <div className="mt-2 text-sm text-gray-500">
        ✓ You rated this {otherPartyName.toLowerCase()}
      </div>
    );
  }

  if (!canRate) {
    return null;
  }

  if (showRating) {
    return (
      <div className="mt-2">
        <p className="text-sm text-gray-600 mb-2">Rate this {otherPartyName.toLowerCase()}:</p>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedRating('positive')}
            disabled={isSubmitting}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              selectedRating === 'positive'
                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            👍 Thumbs Up
          </button>
          <button
            onClick={() => setSelectedRating('negative')}
            disabled={isSubmitting}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              selectedRating === 'negative'
                ? 'bg-red-100 text-red-700 border-2 border-red-500'
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            👎 Thumbs Down
          </button>
        </div>
        {selectedRating && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowRating(true)}
      className="mt-2 text-sm text-blue-600 hover:text-blue-700"
    >
      Rate this {otherPartyName.toLowerCase()}
    </button>
  );
};

export default TransactionHistory;
