
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, Lock, Eye } from 'lucide-react';
import { Language } from '@/types';

interface PublicMarketListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    photos: string[] | null;
    is_vet_verified: boolean | null;
    price: number | null;
  };
  language: Language;
  isAuthenticated: boolean;
  onLoginPrompt: () => void;
  onViewDetails: (listingId: string) => void;
}

export const PublicMarketListingCard = ({ 
  listing, 
  language, 
  isAuthenticated,
  onLoginPrompt,
  onViewDetails
}: PublicMarketListingCardProps) => {
  const translations = {
    am: {
      loginToSeePrice: 'ዋጋ ለማየት ይግቡ',
      viewDetails: 'ዝርዝሮች ይመልከቱ',
      verified: 'የተረጋገጠ',
      priceHidden: 'ዋጋ ተደብቋል'
    },
    en: {
      loginToSeePrice: 'Log in to see price',
      viewDetails: 'View Details',
      verified: 'Verified',
      priceHidden: 'Price hidden'
    },
    or: {
      loginToSeePrice: 'Gatii ilaaluuf seeni',
      viewDetails: 'Bal\'inaa Ilaali',
      verified: 'Mirkaneeffame',
      priceHidden: 'Gatiin dhokfame'
    },
    sw: {
      loginToSeePrice: 'Ingia kuona bei',
      viewDetails: 'Ona Maelezo',
      verified: 'Imethibitishwa',
      priceHidden: 'Bei imefichwa'
    }
  };

  const t = translations[language];

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-3 sm:p-4">
        <div className="aspect-video bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg mb-3 relative overflow-hidden">
          {listing.is_vet_verified && (
            <Badge className="absolute top-2 right-2 bg-green-500 text-white">
              <Shield className="w-3 h-3 mr-1" />
              {t.verified}
            </Badge>
          )}
          {listing.photos && listing.photos.length > 0 ? (
            <img 
              src={listing.photos[0]} 
              alt={listing.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Eye className="w-8 h-8" />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
            {listing.title}
          </h3>
          
          {listing.description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
              {listing.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            {isAuthenticated && listing.price ? (
              <span className="font-bold text-green-600 text-sm sm:text-base">
                {listing.price.toLocaleString()} ETB
              </span>
            ) : (
              <div className="flex items-center space-x-1 text-gray-500">
                <Lock className="w-3 h-3" />
                <span className="text-xs font-medium">{t.priceHidden}</span>
              </div>
            )}
            
            {listing.location && (
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {listing.location}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2 pt-2">
            {isAuthenticated ? (
              <Button 
                size="sm" 
                className="flex-1 text-xs bg-orange-600 hover:bg-orange-700"
                onClick={() => onViewDetails(listing.id)}
              >
                {t.viewDetails}
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 text-xs border-orange-200 hover:bg-orange-50 text-orange-600 hover:text-orange-700"
                onClick={onLoginPrompt}
              >
                <Lock className="w-3 h-3 mr-1" />
                {t.loginToSeePrice}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
