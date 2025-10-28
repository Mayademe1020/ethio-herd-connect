// src/pages/ListingDetail.tsx - Marketplace Listing Detail Page

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import InterestsList from '@/components/InterestsList';

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');

  // Fetch listing details
  const { data: listing, isLoading, error } = useQuery<any>({
    queryKey: ['listing-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_listings')
        .select(`
          *,
          animal:animals(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Increment views count
      await supabase
        .from('market_listings')
        .update({ views_count: ((data as any).views_count || 0) + 1 } as any)
        .eq('id', id);

      return data as any;
    },
    enabled: !!id,
  });

  // Fetch buyer interests if user is the seller
  const { data: interests } = useQuery<any>({
    queryKey: ['listing-interests', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_interests')
        .select('*')
        .eq('listing_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any;
    },
    enabled: !!id && !!user && (listing as any)?.user_id === user.id,
  });

  // Check if current user has already expressed interest
  const { data: userInterest } = useQuery<any>({
    queryKey: ['user-interest', id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const query: any = supabase
        .from('buyer_interests')
        .select('*')
        .eq('listing_id', id)
        .eq('buyer_id', user.id);
      
      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user && (listing as any)?.user_id !== user?.id,
  });

  // Express interest mutation
  const expressInterestMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('buyer_interests')
        .insert({
          listing_id: id,
          buyer_id: user.id,
          message: message || null,
          status: 'pending',
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-interest', id, user?.id] });
      setShowInterestForm(false);
      setInterestMessage('');
      alert('Interest expressed successfully! The seller will contact you.');
    },
    onError: (error: any) => {
      alert('Failed to express interest: ' + error.message);
    },
  });

  const handleExpressInterest = () => {
    if (!user) {
      alert('Please log in to express interest');
      navigate('/login');
      return;
    }
    expressInterestMutation.mutate(interestMessage);
  };

  // Get animal type icon
  const getAnimalIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'cattle':
        return '🐄';
      case 'goat':
        return '🐐';
      case 'sheep':
        return '🐑';
      default:
        return '🐄';
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">Failed to load listing</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === (listing as any)?.user_id;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <button
            onClick={() => navigate('/marketplace')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Marketplace
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Owner Banner */}
        {isOwner && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 font-medium">📋 Your Listing</p>
            <p className="text-sm text-blue-600 mt-1">
              {interests && interests.length > 0
                ? `${interests.length} ${interests.length === 1 ? 'person has' : 'people have'} expressed interest`
                : 'No interests yet'}
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Photo */}
          <div className="relative h-64 md:h-96 bg-gray-200">
            {(listing as any).animal?.photo_url ? (
              <img
                src={(listing as any).animal.photo_url}
                alt={(listing as any).animal.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {getAnimalIcon((listing as any).animal?.type || '')}
              </div>
            )}
            {(listing as any).is_negotiable && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full font-bold">
                Negotiable
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6">
            {/* Animal Name and Type */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{getAnimalIcon((listing as any).animal?.type || '')}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {(listing as any).animal?.name || 'Unnamed'}
                </h1>
                <p className="text-lg text-gray-600">{(listing as any).animal?.subtype || (listing as any).animal?.type}</p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-green-600">
                {formatPrice((listing as any).price)}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">📍 {(listing as any).location || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Listed</p>
                <p className="font-medium">📅 {formatDate((listing as any).created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Views</p>
                <p className="font-medium">👁️ {(listing as any).views_count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">✓ {(listing as any).status}</p>
              </div>
            </div>

            {/* Seller Contact (only for non-owners) */}
            {!isOwner && (listing as any).contact_phone && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-2">Seller Contact</p>
                <p className="font-medium text-lg">📞 {(listing as any).contact_phone}</p>
              </div>
            )}

            {/* Action Buttons */}
            {!isOwner && (
              <div className="space-y-3">
                {userInterest ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 font-medium">✓ You've expressed interest</p>
                    <p className="text-sm text-green-600 mt-1">The seller will contact you soon</p>
                  </div>
                ) : (
                  <>
                    {!showInterestForm ? (
                      <button
                        onClick={() => setShowInterestForm(true)}
                        className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700"
                      >
                        Express Interest
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={interestMessage}
                          onChange={(e) => setInterestMessage(e.target.value)}
                          placeholder="Optional: Add a message for the seller..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          rows={4}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleExpressInterest}
                            disabled={expressInterestMutation.isPending}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
                          >
                            {expressInterestMutation.isPending ? 'Sending...' : 'Send Interest'}
                          </button>
                          <button
                            onClick={() => {
                              setShowInterestForm(false);
                              setInterestMessage('');
                            }}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {(listing as any).contact_phone && (
                  <a
                    href={`tel:${(listing as any).contact_phone}`}
                    className="block w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg text-center hover:bg-blue-700"
                  >
                    📞 Call Seller
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Interests List (for owner) */}
        {isOwner && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">
              Interested Buyers {interests && interests.length > 0 && `(${interests.length})`}
            </h2>
            <InterestsList interests={interests || []} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDetail;
