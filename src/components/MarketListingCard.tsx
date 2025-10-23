
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, MessageSquare, Shield } from 'lucide-react';
import { Language } from '@/types';
import { useDateDisplay } from '@/hooks/useDateDisplay';
import { useMarketListingManagement } from '@/hooks/useMarketListingManagement';

interface MarketListingCardProps {
  listing: {
    id: string;
    title: string;
    category?: string;
    price: number | null;
    location: string | null;
    description: string | null;
    photo?: string;
    photos?: string[] | null;
    isFeatured?: boolean;
    isFavorite?: boolean;
    is_vet_verified?: boolean;
    user_id?: string;
    status?: 'active' | 'inactive' | 'sold';
  };
  language: Language;
  currentUserId?: string;
  onViewDetails: (listing: any) => void;
  onExpressInterest: (listing: any) => void;
  onToggleFavorite?: (listingId: string) => void;
}

export const MarketListingCard = ({ 
  listing, 
  language, 
  currentUserId,
  onViewDetails, 
  onExpressInterest,
  onToggleFavorite
}: MarketListingCardProps) => {
  const isOwner = currentUserId && listing.user_id === currentUserId;
+  const { updateStatus, isUpdating } = useMarketListingManagement();
  const translations = {
    am: {
      contact: 'ፍላጎት ያሳዩ',
      favorite: 'ወደ ተወዳጅ ጨምር',
      verified: 'የተረጋገጠ',
      viewDetails: 'ዝርዝሮች ይመልከቱ',
      priceHidden: 'ዋጋ ተደብቋል',
      yourListing: 'የእርስዎ ዝርዝር'
    },
    en: {
      contact: 'Show Interest',
      favorite: 'Add to Favorites',
      verified: 'Verified',
      viewDetails: 'View Details',
      priceHidden: 'Price hidden',
      yourListing: 'Your Listing'
    },
    or: {
      contact: 'Fedhii Agarsiisi',
      favorite: 'Gara Jaallattootatti Dabaluu',
      verified: 'Mirkaneeffame',
      viewDetails: "Bal'inaa Ilaali",
      priceHidden: 'Gatiin dhokfame',
      yourListing: 'Tarree Kee'
    },
    sw: {
      contact: 'Onyesha Hamu',
      favorite: 'Ongeza kwenye Vipendwa',
      verified: 'Imethibitishwa',
      viewDetails: 'Ona Maelezo',
      priceHidden: 'Bei imefichwa',
      yourListing: 'Orodha Yako'
    }
  };

  const t = translations[language];

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onViewDetails(listing)}>
      <CardContent className="p-3 sm:p-4">
        <div className="aspect-video bg-gray-200 rounded-lg mb-3 relative overflow-hidden">
          {isOwner && (
            <Badge className="absolute top-2 left-2 bg-blue-500">
              {t.yourListing}
            </Badge>
          )}
          {listing.isFeatured && !isOwner && (
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
          {isOwner && (
            <div className="absolute bottom-2 left-2 flex gap-1">
              {(['active','inactive','sold'] as const).map((s) => (
                <Button
                  key={s}
                  variant={listing.status === s ? 'default' : 'outline'}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={isUpdating}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (listing.status === s) return;
                    updateStatus(listing.id, s);
                  }}
                >
                  {s}
                </Button>
              ))}
            </div>
          )}
          {onToggleFavorite && !isOwner && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(listing.id);
              }}
            >
              <Heart 
                className={`w-4 h-4 ${listing.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </Button>
          )}
          {listing.photos && listing.photos.length > 0 ? (
            <img 
              src={listing.photos[0]} 
              alt={listing.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : listing.photo ? (
            <img 
              src={listing.photo} 
              alt={listing.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-1">
            {listing.title}
          </h3>
          
          {listing.description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
              {listing.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            {listing.price !== null && listing.price !== undefined ? (
              <span className="font-bold text-green-600 text-sm sm:text-base">
                {listing.price.toLocaleString()} ETB
              </span>
            ) : (
              <span className="text-xs text-gray-500">{t.priceHidden}</span>
            )}
            
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
              className="flex-1 text-xs bg-orange-600 hover:bg-orange-700 transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                onExpressInterest(listing);
              }}
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              {t.contact}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(listing);
              }}
            >
              {t.viewDetails}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
