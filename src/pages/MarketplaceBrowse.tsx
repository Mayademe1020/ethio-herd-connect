// src/pages/MarketplaceBrowse.tsx - MVP Marketplace Browse

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ListingCard from '@/components/ListingCard';

type AnimalType = 'all' | 'cattle' | 'goat' | 'sheep';
type SortOption = 'newest' | 'price_low' | 'price_high';

const MarketplaceBrowse = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<AnimalType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // Fetch active listings with animal data (with pagination)
  const { data: listings, isLoading, error, refetch } = useQuery({
    queryKey: ['marketplace-listings', filterType, sortOption, page],
    queryFn: async () => {
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('market_listings')
        .select(`
          id,
          user_id,
          animal_id,
          price,
          is_negotiable,
          location,
          status,
          views_count,
          created_at,
          animal:animals(id, name, type, subtype, photo_url)
        `)
        .eq('status', 'active');

      // Apply type filter
      if (filterType !== 'all') {
        query = query.eq('animals.type', filterType);
      }

      // Apply sorting
      switch (sortOption) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      // Filter by animal type if needed (since join filter might not work)
      let filteredData = data || [];
      if (filterType !== 'all') {
        filteredData = filteredData.filter(
          (listing: any) => listing.animal?.type?.toLowerCase() === filterType
        );
      }

      return filteredData;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold">Marketplace</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>

          {/* Filters */}
          <div className="space-y-3">
            {/* Animal Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animal Type
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    filterType === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('cattle')}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    filterType === 'cattle'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  🐄 Cattle
                </button>
                <button
                  onClick={() => setFilterType('goat')}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    filterType === 'goat'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  🐐 Goats
                </button>
                <button
                  onClick={() => setFilterType('sheep')}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    filterType === 'sheep'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  🐑 Sheep
                </button>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Lowest Price</option>
                <option value="price_high">Highest Price</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-4xl mx-auto p-4">
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading listings...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">Failed to load listings. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-red-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && listings && listings.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-bold mb-2">No Listings Found</h2>
            <p className="text-gray-600 mb-4">
              {filterType === 'all'
                ? 'No animals are currently listed for sale.'
                : `No ${filterType} listings available.`}
            </p>
            <button
              onClick={() => navigate('/create-listing')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Create First Listing
            </button>
          </div>
        )}

        {!isLoading && !error && listings && listings.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {listings.length} {listings.length === 1 ? 'listing' : 'listings'} found
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketplaceBrowse;
