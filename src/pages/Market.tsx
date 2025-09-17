import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import { usePublicMarketplace } from '@/hooks/usePublicMarketplace';
import { useSecureMarketListing } from '@/hooks/useSecureMarketListing';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { MarketListingCard } from '@/components/MarketListingCard';
import { MarketListingForm } from '@/components/MarketListingForm';
import { MarketListingDetails } from '@/components/MarketListingDetails';
import { InterestExpressionDialog } from '@/components/InterestExpressionDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Shield, 
  Eye,
  Users,
  TrendingUp
} from 'lucide-react';

const Market = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { listings, loading, error, refetch } = usePublicMarketplace();
  const { createListing, loading: creatingListing } = useSecureMarketListing();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showInterestDialog, setShowInterestDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  const { t } = useTranslations();

  const handleCreateListing = async (listingData: any) => {
    if (!user) {
      alert(t('marketplace.loginRequired'));
      return;
    }

    const result = await createListing(listingData);
    if (result.data) {
      setShowForm(false);
      refetch();
    }
  };

  const handleViewDetails = (listing: any) => {
    setSelectedListing(listing);
  };

  const handleExpressInterest = (listing: any) => {
    if (!user) {
      alert(t('marketplace.loginRequired'));
      return;
    }
    setSelectedListing(listing);
    setShowInterestDialog(true);
  };

  const handleContactListing = (listing: any) => {
    if (!user) {
      alert(t('marketplace.loginRequired'));
      return;
    }
    setSelectedListing(listing);
    setShowInterestDialog(true);
  };

  const handleEditListing = (listing: any) => {
    if (!user) {
      alert(t('marketplace.loginRequired'));
      return;
    }
    // For now, just close the modal - edit functionality can be implemented later
    setSelectedListing(null);
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || 
                           listing.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesPrice = !priceFilter || 
                        (listing.price && listing.price <= parseFloat(priceFilter));
    return matchesSearch && matchesLocation && matchesPrice;
  });

  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    verified: listings.filter(l => l.is_vet_verified).length,
    avgPrice: listings.length > 0 ? 
      listings.reduce((sum, l) => sum + (l.price || 0), 0) / listings.length : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50">
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

      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-green-600" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              {t('marketplace.title')}
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">{t('marketplace.subtitle')}</p>
          
          {/* Security Badge */}
          <div className="flex items-center justify-center mt-2">
            <Badge variant="outline" className="text-green-700 border-green-300">
              <Shield className="w-3 h-3 mr-1" />
              {t('marketplace.secureMarket')}
            </Badge>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-600 hover:bg-orange-700 min-h-[48px] px-6 text-base touch-manipulation"
            disabled={creatingListing}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('marketplace.postAnimal')}
          </Button>
        </div>

        {/* Listing Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{t('marketplace.postAnimal')}</CardTitle>
            </CardHeader>
            <CardContent>
              <MarketListingForm
                onSubmit={handleCreateListing}
                onClose={() => setShowForm(false)}
                language={language}
              />
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('marketplace.totalListings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('marketplace.activeListings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('marketplace.verifiedSellers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.verified}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('marketplace.avgRating')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.avgPrice.toFixed(0)} ETB
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 min-h-[48px] touch-manipulation"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('marketplace.location')}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 min-h-[48px] touch-manipulation"
              />
            </div>
            <div className="flex-1 relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                placeholder={t('marketplace.price')}
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="pl-10 min-h-[48px] touch-manipulation"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('');
                setPriceFilter('');
              }}
              className="min-h-[48px] px-4 touch-manipulation"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('common.clear')}
            </Button>
          </div>
        </div>

        {/* Listings Grid */}
        {error ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center text-red-600">
              Error: {error}
            </CardContent>
          </Card>
        ) : filteredListings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">{t('marketplace.noListings')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredListings.map((listing) => (
              <MarketListingCard
                key={listing.id}
                listing={{
                  id: listing.id,
                  title: listing.title || '',
                  category: 'Animal', // Default category
                  price: listing.price,
                  location: listing.location,
                  description: listing.description,
                  photos: listing.photos,
                  isFeatured: false, // Default value
                  isFavorite: false, // Default value
                  is_vet_verified: listing.is_vet_verified
                }}
                language={language}
                onViewDetails={handleViewDetails}
                onExpressInterest={handleExpressInterest}
              />
            ))}
          </div>
        )}
      </main>

      {/* Listing Details Modal */}
      {selectedListing && !showInterestDialog && (
        <MarketListingDetails
          listing={{
            ...selectedListing,
            category: 'Animal' // Add required category field
          }}
          language={language}
          onClose={() => setSelectedListing(null)}
          onContact={handleContactListing}
          onEdit={handleEditListing}
        />
      )}

      {/* Interest Expression Dialog */}
      {showInterestDialog && selectedListing && (
        <InterestExpressionDialog
          isOpen={showInterestDialog}
          listing={selectedListing}
          language={language}
          onClose={() => {
            setShowInterestDialog(false);
            setSelectedListing(null);
          }}
        />
      )}

      <BottomNavigation language={language} />
    </div>
  );
};

export default Market;
