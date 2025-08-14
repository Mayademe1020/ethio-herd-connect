
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurePublicMarketplace } from '@/hooks/useSecurePublicMarketplace';
import { useViewTracking } from '@/hooks/useViewTracking';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { PublicMarketListingCard } from '@/components/PublicMarketListingCard';
import { AuthGateModal } from '@/components/AuthGateModal';
import { MarketplaceSidebar } from '@/components/MarketplaceSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Search, 
  Filter, 
  MapPin, 
  Shield, 
  Eye,
  Users,
  TrendingUp,
  AlertCircle,
  SlidersHorizontal,
  Plus
} from 'lucide-react';

const PublicMarketplace = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { listings, loading, error } = useSecurePublicMarketplace();
  const { trackView, viewCount, shouldShowAuthGate } = useViewTracking();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    verifiedOnly: false
  });

  const translations = {
    am: {
      title: 'የህዝብ ገበያ',
      subtitle: 'የእንስሳት ገበያ - ግዙ እና ይሽጡ',
      search: 'ፈልግ...',
      location: 'አካባቢ',
      verified: 'የተረጋገጠ',
      totalListings: 'ጠቅላላ ዝርዝሮች',
      verifiedListings: 'የተረጋገጡ ዝርዝሮች',
      avgPrice: 'አማካይ ዋጋ',
      recentViews: 'የቅርብ ጊዜ እይታዎች',
      noListings: 'ምንም ዝርዝሮች አልተገኙም',
      filterByLocation: 'በአካባቢ ማጣሪያ',
      clearFilters: 'ማጣሪያዎችን አጽዳ',
      loginRequired: 'መግቢያ ያስፈልጋል',
      secureMarketplace: 'ደህንነቱ የተጠበቀ ገበያ',
      protectedData: 'የተጠበቀ መረጃ',
      showFilters: 'ማጣሪያዎች አሳይ',
      postListing: 'ዝርዝር ይለጥፉ'
    },
    en: {
      title: 'Public Marketplace',
      subtitle: 'Animal Market - Buy and Sell',
      search: 'Search...',
      location: 'Location',
      verified: 'Verified',
      totalListings: 'Total Listings',
      verifiedListings: 'Verified Listings',
      avgPrice: 'Average Price',
      recentViews: 'Recent Views',
      noListings: 'No listings found',
      filterByLocation: 'Filter by Location',
      clearFilters: 'Clear Filters',
      loginRequired: 'Login Required',
      secureMarketplace: 'Secure Marketplace',
      protectedData: 'Protected Data',
      showFilters: 'Show Filters',
      postListing: 'Post Listing'
    },
    or: {
      title: 'Gabaa Uumamaa',
      subtitle: 'Gabaa Bineensotaa - Bituu fi Gurguruu',
      search: 'Barbaadi...',
      location: 'Bakka',
      verified: 'Mirkaneeffame',
      totalListings: 'Tarreewwan Waliigalaa',
      verifiedListings: 'Tarreewwan Mirkaneeffaman',
      avgPrice: 'Gatii Giddugaleessaa',
      recentViews: 'Mul\'ata Dhihoo',
      noListings: 'Tarreewwan hin argamne',
      filterByLocation: 'Bakkaatti Calaluu',
      clearFilters: 'Calaltoota Qulqulleessuu',
      loginRequired: 'Seenuun Barbaachisaa',
      secureMarketplace: 'Gabaa Nageenya',
      protectedData: 'Daataa Eegame',
      showFilters: 'Calaltoota Agarsiisi',
      postListing: 'Tarree Maxxansi'
    },
    sw: {
      title: 'Soko la Umma',
      subtitle: 'Soko la Wanyamapori - Nunua na Uza',
      search: 'Tafuta...',
      location: 'Mahali',
      verified: 'Imethibitishwa',
      totalListings: 'Orodha Zote',
      verifiedListings: 'Orodha Zilizothibitishwa',
      avgPrice: 'Bei ya Wastani',
      recentViews: 'Mionekano ya Hivi Karibuni',
      noListings: 'Hakuna orodha zilizopatikana',
      filterByLocation: 'Chuja kwa Mahali',
      clearFilters: 'Futa Vichungi',
      loginRequired: 'Kuingia Kunahitajika',
      secureMarketplace: 'Soko Salama',
      protectedData: 'Data Iliyolindwa',
      showFilters: 'Onyesha Vichungi',
      postListing: 'Chapisha Orodha'
    }
  };

  const t = translations[language];

  const handleViewDetails = (listingId: string) => {
    if (!user && shouldShowAuthGate()) {
      setSelectedListing(listingId);
      setShowAuthModal(true);
      return;
    }
    
    trackView(listingId);
    console.log('Viewing listing:', listingId);
  };

  const handleLoginPrompt = () => {
    setShowAuthModal(true);
  };

  const handlePostListing = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    // Navigate to listing creation form
    console.log('Navigate to post listing form');
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filters.location || 
                           listing.location?.toLowerCase().includes(filters.location.toLowerCase());
    const matchesCategory = !filters.category || 
                           listing.title.toLowerCase().includes(filters.category.toLowerCase());
    const matchesMinPrice = !filters.minPrice || 
                           (listing.price && listing.price >= parseFloat(filters.minPrice));
    const matchesMaxPrice = !filters.maxPrice || 
                           (listing.price && listing.price <= parseFloat(filters.maxPrice));
    const matchesVerified = !filters.verifiedOnly || listing.is_vet_verified;
    
    return matchesSearch && matchesLocation && matchesCategory && 
           matchesMinPrice && matchesMaxPrice && matchesVerified;
  });

  const stats = {
    total: listings.length,
    verified: listings.filter(l => l.is_vet_verified).length,
    avgPrice: listings.length > 0 ? 
      listings.reduce((sum, l) => sum + (l.price || 0), 0) / listings.length : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 pb-16 sm:pb-20 lg:pb-24">
        <EnhancedHeader />
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
        <BottomNavigation language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />

      <div className="flex">
        <main className="flex-1 container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Page Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-green-600" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                {t.title}
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">{t.subtitle}</p>
            
            <div className="flex items-center justify-center mt-2 gap-2">
              <Badge variant="outline" className="text-green-700 border-green-300">
                <Shield className="w-3 h-3 mr-1" />
                {t.secureMarketplace}
              </Badge>
              {!user && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLoginPrompt}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>

          {/* Post Listing Button - Prominent */}
          <div className="flex justify-center">
            <Button
              onClick={handlePostListing}
              className="bg-orange-600 hover:bg-orange-700 h-12 px-6 text-base shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t.postListing}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                  {t.totalListings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  {t.verifiedListings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="w-4 h-4 mr-2 text-purple-600" />
                  {t.avgPrice}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {user ? `${stats.avgPrice.toFixed(0)} ETB` : '***'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Controls */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowSidebar(true)}
                className="lg:hidden h-12 px-4"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {t.showFilters}
              </Button>
            </div>
          </div>

          {/* View Counter for Non-Authenticated Users */}
          {!user && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Views: {viewCount}/3 - {3 - viewCount} remaining before login required
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Listings Grid */}
          {error ? (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">Error: {error}</span>
                </div>
              </CardContent>
            </Card>
          ) : filteredListings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings Found</h3>
                    <p className="text-gray-500 mb-4">{t.noListings}</p>
                    <Button onClick={handlePostListing} className="bg-orange-600 hover:bg-orange-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Be the first to post!
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredListings.map((listing) => (
                <div 
                  key={listing.id}
                  onClick={() => handleViewDetails(listing.id)}
                  className="cursor-pointer"
                >
                  <PublicMarketListingCard
                    listing={listing}
                    language={language}
                    isAuthenticated={!!user}
                    onLoginPrompt={handleLoginPrompt}
                    onViewDetails={handleViewDetails}
                  />
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Sidebar for Desktop */}
        <div className="hidden lg:block w-80">
          <MarketplaceSidebar
            language={language}
            isOpen={true}
            onClose={() => {}}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MarketplaceSidebar
        language={language}
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Auth Gate Modal */}
      {showAuthModal && (
        <AuthGateModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={() => {
            window.location.href = '/auth';
          }}
          viewCount={viewCount}
          language={language}
        />
      )}

      <BottomNavigation language={language} />
    </div>
  );
};

export default PublicMarketplace;
