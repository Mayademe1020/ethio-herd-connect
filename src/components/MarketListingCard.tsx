
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Phone, Star } from 'lucide-react';
import { Language } from '@/types';

interface MarketListing {
  id: string;
  title: string;
  category: string;
  price: number;
  location: string;
  description: string;
  photo: string;
  isFeatured: boolean;
  isFavorite: boolean;
  contact_method?: string;
  contact_value?: string;
  is_vet_verified?: boolean;
  photos?: string[];
  created_at?: string;
}

interface MarketListingCardProps {
  listing: MarketListing;
  language: Language;
  onContact: (listing: MarketListing) => void;
  onFavorite: (listing: MarketListing) => void;
  onClick: (listing: MarketListing) => void;
}

export const MarketListingCard = ({
  listing,
  language,
  onContact,
  onFavorite,
  onClick
}: MarketListingCardProps) => {
  const translations = {
    am: {
      contact: 'አገናኝ',
      featured: 'የተመረጠ',
      verified: 'የተረጋገጠ'
    },
    en: {
      contact: 'Contact',
      featured: 'Featured',
      verified: 'Verified'
    },
    or: {
      contact: 'Qunnamuu',
      featured: 'Filatamaa',
      verified: 'Mirkaneeffame'
    },
    sw: {
      contact: 'Wasiliana',
      featured: 'Iliyoangaziwa',
      verified: 'Imethibitishwa'
    }
  };

  const t = translations[language];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
      <div onClick={() => onClick(listing)}>
        {/* Image */}
        <div className="relative h-32 sm:h-40 bg-gray-200">
          {listing.photo ? (
            <img
              src={listing.photo}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🐄
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 space-y-1">
            {listing.isFeatured && (
              <Badge className="bg-orange-500 text-white text-xs">
                <Star className="w-3 h-3 mr-1" />
                {t.featured}
              </Badge>
            )}
            {listing.is_vet_verified && (
              <Badge className="bg-green-500 text-white text-xs">
                {t.verified}
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(listing);
            }}
            className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                listing.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>

        <CardContent className="p-3 sm:p-4">
          {/* Title and Price */}
          <div className="mb-2">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 line-clamp-2">
              {listing.title}
            </h3>
            <p className="text-lg sm:text-xl font-bold text-green-600">
              {listing.price.toLocaleString()} ETB
            </p>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="text-xs sm:text-sm">{listing.location}</span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
            {listing.description}
          </p>
        </CardContent>
      </div>

      {/* Contact Button */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onContact(listing);
          }}
          className="w-full h-8 sm:h-9 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
        >
          <Phone className="w-3 h-3 mr-1 sm:mr-2" />
          {t.contact}
        </Button>
      </div>
    </Card>
  );
};
