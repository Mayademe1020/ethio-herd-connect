
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Phone, Shield } from 'lucide-react';
import { Language } from '@/types';

interface MarketListingCardProps {
  listing: {
    id: string;
    title: string;
    category: string;
    price: number;
    location: string;
    description: string;
    photo: string;
    isFeatured: boolean;
    isFavorite: boolean;
    is_vet_verified?: boolean;
  };
  language: Language;
  onContact: (listing: any) => void;
  onFavorite: (listing: any) => void;
  onClick: (listing: any) => void;
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
      contact: 'ያነጋግሩ',
      favorite: 'ወደ ተወዳጅ ጨምር',
      verified: 'የተረጋገጠ'
    },
    en: {
      contact: 'Contact',
      favorite: 'Add to Favorites',
      verified: 'Verified'
    },
    or: {
      contact: 'Qunnamtii',
      favorite: 'Gara Jaallattootatti Dabaluu',
      verified: 'Mirkaneeffame'
    },
    sw: {
      contact: 'Wasiliana',
      favorite: 'Ongeza kwenye Vipendwa',
      verified: 'Imethibitishwa'
    }
  };

  const t = translations[language];

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onClick(listing)}>
      <CardContent className="p-3 sm:p-4">
        <div className="aspect-video bg-gray-200 rounded-lg mb-3 relative overflow-hidden">
          {listing.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-orange-500">
              Featured
            </Badge>
          )}
          {listing.is_vet_verified && (
            <Badge className="absolute top-2 right-2 bg-green-500">
              <Shield className="w-3 h-3 mr-1" />
              {t.verified}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-1">
            {listing.title}
          </h3>
          
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
            {listing.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-green-600 text-sm sm:text-base">
              {listing.price.toLocaleString()} ETB
            </span>
            
            {listing.location && (
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {listing.location}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onContact(listing);
              }}
            >
              <Phone className="w-3 h-3 mr-1" />
              {t.contact}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(listing);
              }}
            >
              <Heart className={`w-3 h-3 ${listing.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
