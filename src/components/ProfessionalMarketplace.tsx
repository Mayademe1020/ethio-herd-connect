import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurePublicMarketplace } from '@/hooks/useSecurePublicMarketplace';
import { useListingFavorites } from '@/hooks/useListingFavorites';
import { useTranslations } from '@/hooks/useTranslations';
import { ProfessionalAnimalCard } from '@/components/ProfessionalAnimalCard';
import { MarketplaceFilters } from '@/components/MarketplaceFilters';
import { ContactSellerModal } from '@/components/ContactSellerModal';
import { AnimalListingForm } from '@/components/AnimalListingForm';
import { ShareListingDialog } from '@/components/ShareListingDialog';
import { AnimalDetailModal } from '@/components/AnimalDetailModal';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, Users, Star, Filter, Grid, List, Plus, MapPin, Eye } from 'lucide-react';

export const ProfessionalMarketplace = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { listings, loading, error } = useSecurePublicMarketplace();
  const { favorites, toggleFavorite, isFavorite } = useListingFavorites();
  const { t } = useTranslations();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showListingForm, setShowListingForm] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [listingToShare, setListingToShare] = useState<any>(null);
  const [filters, setFilters] = useState({
    animalType: '',
    location: '',
    minPrice: 0,
    maxPrice: 1000000,
    ageRange: [0, 120] as [number, number],
    weightRange: [0, 1000] as [number, number],
    healthStatus: '',
    verifiedOnly: false,
    sellerRating: 0,
  });

  // Filter listings based on search and filters
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) || listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filters.animalType || (listing.animals && listing.animals.type.toLowerCase().includes(filters.animalType.toLowerCase()));
    const matchesLocation = !filters.location || listing.location?.toLowerCase().includes(filters.location.toLowerCase());
    const matchesPrice = !user || (!filters.minPrice || listing.price && listing.price >= filters.minPrice) && (!filters.maxPrice || listing.price && listing.price <= filters.maxPrice);
    const matchesAge = !filters.ageRange || !listing.animals.age || listing.animals.age >= filters.ageRange[0] && listing.animals.age <= filters.ageRange[1];
    const matchesWeight = !filters.weightRange || !listing.animals.weight || listing.animals.weight >= filters.weightRange[0] && listing.animals.weight <= filters.weightRange[1];
    const matchesVerified = !filters.verifiedOnly || listing.animals.is_vet_verified;
    return matchesSearch && matchesType && matchesLocation && matchesPrice && matchesAge && matchesWeight && matchesVerified;
  });

  // Calculate stats
  const stats = {
    total: listings.length,
    verified: listings.filter(l => l.is_vet_verified).length,
    avgRating: 4.6,
    // Mock data
    newToday: 12 // Mock data
  };

  const handleViewDetails = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      setSelectedListing(listing);
      setShowDetailModal(true);
    }
  };

  const handleContact = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      setSelectedListing(listing);
      setShowContactModal(true);
    }
  };
  const handleFavorite = (listingId: string) => {
    toggleFavorite(listingId);
  };
  
  const handleShare = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      setListingToShare(listing);
      setShowShareDialog(true);
    }
  };
  const handlePostAnimal = () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    setShowListingForm(true);
  };
  const handleSubmitListing = async (formData: any) => {
    // TODO: Implement actual submission to backend
    console.log('Submitting listing:', formData);
    // This would call the backend API to create the listing
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <LoadingSkeleton className="h-96" />
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <LoadingSkeleton key={i} className="h-96" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-sm">
          <Button onClick={handlePostAnimal} className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[56px] touch-target-large">
            <Plus className="w-6 h-6 mr-3" />
            {t('marketplace.postYourAnimal')}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t('marketplace.totalListings')} value={stats.total} icon={TrendingUp} color="primary" trend="up" trendValue="+12%" />
          <StatCard title={t('marketplace.verifiedSellers')} value={stats.verified} icon={Shield} color="success" trend="up" trendValue="+8%" />
          <StatCard title={t('marketplace.avgRating')} value={stats.avgRating} icon={Star} color="warning" trend="up" trendValue="4.6★" />
          <StatCard title={t('marketplace.newToday')} value={stats.newToday} icon={Users} color="info" trend="up" trendValue="Today" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <MarketplaceFilters language={language} searchTerm={searchTerm} onSearchChange={setSearchTerm} filters={filters} onFiltersChange={setFilters} isAuthenticated={!!user} />
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden flex justify-between items-center">
            <Button variant="outline" onClick={() => setShowMobileFilters(true)} className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {t('marketplace.filterResults')}
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {t('marketplace.showingResults')} {filteredListings.length} {t('marketplace.of')} {listings.length} {t('marketplace.results')}
              </div>
              
            {/* Desktop View Toggle - Larger Touch Targets */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="lg" onClick={() => setViewMode('grid')} className="min-h-[48px] px-6 font-semibold touch-target-large transition-all duration-200">
                <Grid className="w-5 h-5 mr-2" />
                {t('marketplace.gridView')}
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="lg" onClick={() => setViewMode('list')} className="min-h-[48px] px-6 font-semibold touch-target-large transition-all duration-200">
                <List className="w-5 h-5 mr-2" />
                {t('marketplace.listView')}
              </Button>
            </div>
            </div>

            {/* Listings */}
            {error ? <div className="text-center py-12">
                <div className="text-red-600 mb-4">Error loading listings</div>
                <p className="text-gray-600">{error}</p>
              </div> : filteredListings.length === 0 ? <div className="text-center py-12">
                <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('marketplace.noListings')}
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters
                </p>
                <Button onClick={handlePostAnimal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Be the first to post!
                </Button>
              </div> : <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredListings.map(listing => <ProfessionalAnimalCard key={listing.id} listing={listing} language={language} isAuthenticated={!!user} isFavorite={isFavorite(listing.id)} onViewDetails={handleViewDetails} onContact={handleContact} onFavorite={handleFavorite} onShare={handleShare} />)}
              </div>}
          </div>
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && <MarketplaceFilters language={language} searchTerm={searchTerm} onSearchChange={setSearchTerm} filters={filters} onFiltersChange={setFilters} showMobileFilters={showMobileFilters} onToggleMobileFilters={() => setShowMobileFilters(false)} isAuthenticated={!!user} />}

        {/* Contact Seller Modal */}
        {selectedListing && <ContactSellerModal isOpen={showContactModal} onClose={() => {
        setShowContactModal(false);
        setSelectedListing(null);
      }} listing={selectedListing} language={language} isAuthenticated={!!user} />}

        {/* Animal Listing Form */}
        <AnimalListingForm isOpen={showListingForm} onClose={() => setShowListingForm(false)} language={language} onSubmit={handleSubmitListing} />

        {/* Share Listing Dialog */}
        {listingToShare && (
          <ShareListingDialog
            isOpen={showShareDialog}
            onClose={() => {
              setShowShareDialog(false);
              setListingToShare(null);
            }}
            listing={listingToShare}
            language={language}
          />
        )}

        {/* Animal Detail Modal */}
        {selectedListing && (
          <AnimalDetailModal
            listing={selectedListing}
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </div>
    </div>
  );
};