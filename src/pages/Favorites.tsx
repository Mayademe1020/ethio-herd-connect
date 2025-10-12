import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { useSecurePublicMarketplace } from '@/hooks/useSecurePublicMarketplace';
import { useListingFavorites } from '@/hooks/useListingFavorites';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, MapPin, Scale, Calendar } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MarketListingDetails } from '@/components/MarketListingDetails';
import { ContactSellerModal } from '@/components/ContactSellerModal';

const Favorites = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslations();
  const { listings, loading: isLoading } = useSecurePublicMarketplace();
  const { favorites, toggleFavorite, isLoading: favoritesLoading } = useListingFavorites();

  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [contactListing, setContactListing] = useState<any>(null);

  // Filter to only favorited listings
  const favoriteListings = listings?.filter(l => favorites.includes(l.id)) || [];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('favorites.loginRequired') || 'Login Required'}</h2>
          <p className="text-gray-600 mb-6">{t('favorites.loginMessage') || 'Please login to view your favorites'}</p>
          <Button onClick={() => window.location.href = '/auth'}>
            {t('common.login') || 'Login'}
          </Button>
        </div>
        <BottomNavigation language={language} />
      </div>
    );
  }

  if (isLoading || favoritesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedHeader />
        <LoadingSpinner />
        <BottomNavigation language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 pb-20">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-rose-900 flex items-center gap-3">
              <Heart className="w-8 h-8 fill-rose-600 text-rose-600" />
              {t('favorites.title') || 'My Favorites'}
            </h1>
            <p className="text-rose-600 mt-1">
              {t('favorites.subtitle') || 'Your saved marketplace listings'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <Card className="p-6 mb-6 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('favorites.totalSaved') || 'Total Saved'}</p>
              <p className="text-3xl font-bold text-rose-600">{favoriteListings.length}</p>
            </div>
            <Heart className="w-12 h-12 text-rose-600 fill-rose-600" />
          </div>
        </Card>

        {/* Favorites Grid */}
        {favoriteListings.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('favorites.noFavorites') || 'No favorites yet'}</h3>
            <p className="text-gray-600 mb-6">{t('favorites.startSaving') || 'Start saving listings to view them here'}</p>
            <Button onClick={() => window.location.href = '/marketplace'}>
              {t('favorites.browseListing') || 'Browse Listings'}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteListings.map((listing: any) => (
              <Card key={listing.id} className="overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {listing.photos?.[0] ? (
                    <img 
                      src={listing.photos[0]} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Scale className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 rounded-full w-10 h-10 p-0"
                    onClick={() => toggleFavorite(listing.id)}
                  >
                    <Heart className="w-5 h-5 fill-rose-600 text-rose-600" />
                  </Button>

                  {/* Verification Badge */}
                  {listing.is_vet_verified && (
                    <Badge className="absolute top-2 left-2 bg-emerald-600">
                      ✓ {t('common.verified') || 'Verified'}
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
                  
                  <p className="text-2xl font-bold text-emerald-600 mb-3">
                    ETB {listing.price?.toLocaleString()}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    {listing.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{listing.location}</span>
                      </div>
                    )}
                    {listing.weight && (
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        <span>{listing.weight} kg</span>
                      </div>
                    )}
                    {listing.age && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{listing.age} {t('common.months') || 'months'}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="default"
                      size="sm"
                      onClick={() => setContactListing(listing)}
                      className="flex-1"
                    >
                      {t('common.contact') || 'Contact Seller'}
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedListing(listing)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedListing && (
        <MarketListingDetails
          listing={selectedListing}
          language={language}
          currentUserId={user?.id}
          onClose={() => setSelectedListing(null)}
          onContact={() => {
            setContactListing(selectedListing);
            setSelectedListing(null);
          }}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      )}

      {contactListing && (
        <ContactSellerModal
          isOpen={!!contactListing}
          listing={contactListing}
          language={language}
          isAuthenticated={!!user}
          onClose={() => setContactListing(null)}
        />
      )}

      <BottomNavigation language={language} />
    </div>
  );
};

export default Favorites;
