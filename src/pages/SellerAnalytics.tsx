import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { BarChart3, Eye, TrendingUp, MessageCircle, DollarSign, Package } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const SellerAnalytics = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslations();

  // Fetch user's listings
  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['seller-listings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('market_listings')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch listing views for user's listings
  const { data: views, isLoading: viewsLoading } = useQuery({
    queryKey: ['listing-views', user?.id],
    queryFn: async () => {
      if (!user || !listings?.length) return [];
      const listingIds = listings.map(l => l.id);
      const { data, error } = await supabase
        .from('listing_views')
        .select('*')
        .in('listing_id', listingIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!listings?.length,
  });

  // Fetch buyer interests
  const { data: interests, isLoading: interestsLoading } = useQuery({
    queryKey: ['seller-interests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('buyer_interests')
        .select('*')
        .eq('seller_user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch seller rating
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['seller-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('farm_profiles')
        .select('seller_rating, total_ratings')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl">{t('common.loginRequired')}</p>
        </div>
        <BottomNavigation language={language} />
      </div>
    );
  }

  if (listingsLoading || viewsLoading || interestsLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedHeader />
        <LoadingSpinner />
        <BottomNavigation language={language} />
      </div>
    );
  }

  const activeListings = listings?.filter(l => l.status === 'active').length || 0;
  const soldListings = listings?.filter(l => l.status === 'sold').length || 0;
  const totalViews = views?.length || 0;
  const totalInterests = interests?.length || 0;
  const pendingInterests = interests?.filter(i => i.status === 'pending').length || 0;
  const avgViews = listings?.length ? Math.round(totalViews / listings.length) : 0;
  
  const totalRevenue = listings
    ?.filter(l => l.status === 'sold')
    .reduce((sum, l) => sum + (Number(l.price) || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 pb-20">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-violet-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-violet-600" />
              {t('analytics.title') || 'Seller Analytics'}
            </h1>
            <p className="text-violet-600 mt-1">
              {t('analytics.subtitle') || 'Track your marketplace performance'}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Views */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">{t('analytics.totalViews') || 'Total Views'}</p>
                <p className="text-3xl font-bold text-violet-600">{totalViews}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {avgViews} {t('analytics.avgPerListing') || 'avg per listing'}
                </p>
              </div>
              <Eye className="w-12 h-12 text-violet-600" />
            </div>
          </Card>

          {/* Active Listings */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">{t('analytics.activeListings') || 'Active Listings'}</p>
                <p className="text-3xl font-bold text-emerald-600">{activeListings}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {soldListings} {t('analytics.sold') || 'sold'}
                </p>
              </div>
              <Package className="w-12 h-12 text-emerald-600" />
            </div>
          </Card>

          {/* Buyer Interests */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">{t('analytics.buyerInterests') || 'Buyer Interests'}</p>
                <p className="text-3xl font-bold text-blue-600">{totalInterests}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {pendingInterests} {t('analytics.pending') || 'pending'}
                </p>
              </div>
              <MessageCircle className="w-12 h-12 text-blue-600" />
            </div>
          </Card>

          {/* Revenue */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">{t('analytics.totalRevenue') || 'Total Revenue'}</p>
                <p className="text-3xl font-bold text-green-600">
                  ETB {totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('analytics.fromSales') || 'from sold listings'}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-600" />
            </div>
          </Card>

          {/* Seller Rating */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">{t('analytics.sellerRating') || 'Seller Rating'}</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {profile?.seller_rating?.toFixed(1) || 'N/A'}
                  {profile?.seller_rating && <span className="text-xl"> ★</span>}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {profile?.total_ratings || 0} {t('analytics.ratings') || 'ratings'}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-yellow-600" />
            </div>
          </Card>

          {/* Conversion Rate */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">{t('analytics.conversionRate') || 'Conversion Rate'}</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {totalViews > 0 ? ((totalInterests / totalViews) * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('analytics.viewsToInterests') || 'views to interests'}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-indigo-600" />
            </div>
          </Card>
        </div>

        {/* Detailed Listings Performance */}
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">{t('analytics.listingsPerformance') || 'Listings Performance'}</h2>
          <div className="space-y-4">
            {listings?.slice(0, 5).map((listing: any) => {
              const listingViews = views?.filter(v => v.listing_id === listing.id).length || 0;
              const listingInterests = interests?.filter(i => i.listing_id === listing.id).length || 0;
              
              return (
                <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{listing.title}</h3>
                    <p className="text-sm text-gray-600">ETB {listing.price?.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-violet-600">{listingViews}</p>
                      <p className="text-xs text-gray-600">{t('analytics.views') || 'views'}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{listingInterests}</p>
                      <p className="text-xs text-gray-600">{t('analytics.interests') || 'interests'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <BottomNavigation language={language} />
    </div>
  );
};

export default SellerAnalytics;
