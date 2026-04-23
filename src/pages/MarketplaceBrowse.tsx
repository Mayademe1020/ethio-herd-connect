// src/pages/MarketplaceBrowse.tsx - MVP Marketplace Browse

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ListingCard from '@/components/ListingCard';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { MarketplaceBrowseSkeleton } from '@/components/MarketplaceBrowseSkeleton';
import { ArrowLeft } from 'lucide-react';

type AnimalType = 'all' | 'cattle' | 'goat' | 'sheep';
type SortOption = 'newest' | 'price_low' | 'price_high';

const MarketplaceBrowse = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<AnimalType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [page, setPage] = useState(0);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Fetch active listings with animal data (with pagination)
  const { data: listings, isLoading, error, refetch } = useQuery({
    queryKey: ['marketplace-listings', filterType, sortOption, page],
    queryFn: async () => {
      if (!isOnline) return [];
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

      // Note: Type filtering is done client-side after fetching
      // because Supabase join filtering has limitations

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

      if (error) {
        const msg = String(error?.message || '').toLowerCase();
        const isAborted = error?.name === 'AbortError' || msg.includes('abort') || msg.includes('cancel');
        if (!isAborted) {
          throw error;
        }
        return [];
      }

      // Filter by animal type if needed (since join filter might not work)
      let filteredData = data || [];
      if (filterType !== 'all') {
        filteredData = filteredData.filter(
          (listing: any) => listing.animal?.type?.toLowerCase() === filterType
        );
      }

      return filteredData;
    },
    enabled: isOnline,
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Marketplace</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        {/* Animal Type Filter - Scrollable tabs */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Animal Type</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <FilterTab
              active={filterType === 'all'}
              onClick={() => setFilterType('all')}
              label="All"
            />
            <FilterTab
              active={filterType === 'cattle'}
              onClick={() => setFilterType('cattle')}
              label="🐄 Cattle"
            />
            <FilterTab
              active={filterType === 'goat'}
              onClick={() => setFilterType('goat')}
              label="🐐 Goats"
            />
            <FilterTab
              active={filterType === 'sheep'}
              onClick={() => setFilterType('sheep')}
              label="🐑 Sheep"
            />
          </div>
        </div>

        {/* Sort Dropdown */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Sort</p>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          >
            <option value="newest">Newest First ▼</option>
            <option value="price_low">Lowest Price ▼</option>
            <option value="price_high">Highest Price ▼</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-4xl mx-auto p-4">
        {isLoading && <MarketplaceBrowseSkeleton />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 mb-2">
              Failed to load listings. Please try again.
              <span className="block text-sm text-red-700 mt-1">ዝርዝሮች መጫን አልተሳካም። እባክዎ ይሞክሩ እንደገና።</span>
            </p>
            <EnhancedButton
              onClick={() => refetch()}
              variant="destructive"
              size="sm"
              aria-label="Retry loading listings"
              title="Retry"
            >
              Retry
            </EnhancedButton>
          </div>
        )}

        {!isLoading && !error && listings && listings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-4xl">📭</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              No Animals Listed Yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-sm leading-relaxed">
              Be the first to list your animals in the marketplace and connect with buyers in your area!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <EnhancedButton
                onClick={() => navigate('/create-listing')}
                variant="success"
                className="flex-1 flex items-center justify-center gap-2"
                aria-label="Post Your First Animal"
                title="Post Your First Animal"
              >
                <span>➕</span>
                <span>Post Your First Animal</span>
              </EnhancedButton>
              <EnhancedButton
                onClick={() => navigate('/my-animals')}
                variant="secondary"
                className="flex-1 flex items-center justify-center gap-2"
                aria-label="Browse My Animals"
                title="Browse My Animals"
              >
                <span>📋</span>
                <span>Browse My Animals</span>
              </EnhancedButton>
            </div>
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

// Filter Tab Component
interface FilterTabProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const FilterTab = ({ active, onClick, label }: FilterTabProps) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
      active
        ? 'bg-emerald-500 text-white shadow-sm'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

export default MarketplaceBrowse;
