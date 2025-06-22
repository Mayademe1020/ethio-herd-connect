
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, MessageSquare, Calendar, Weight, Star } from 'lucide-react';

interface MarketListing {
  id: string;
  title: string;
  description?: string;
  price: number;
  weight?: number;
  age?: number;
  location: string;
  contact_method: 'phone' | 'telegram' | 'sms';
  contact_value: string;
  is_vet_verified: boolean;
  photos: string[];
  created_at: string;
}

interface MarketListingCardProps {
  listing: MarketListing;
  language: 'am' | 'en';
  onContact: (contactMethod: string, contactValue: string) => void;
  onViewDetails: (listing: MarketListing) => void;
}

export const MarketListingCard: React.FC<MarketListingCardProps> = ({
  listing,
  language,
  onContact,
  onViewDetails
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US');
  };

  const getContactIcon = () => {
    switch (listing.contact_method) {
      case 'telegram':
        return <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'sms':
        return <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <Phone className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 mx-2 sm:mx-0">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative">
          {listing.photos && listing.photos.length > 0 ? (
            <img
              src={listing.photos[0]}
              alt={listing.title}
              className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-32 sm:h-40 lg:h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
              <span className="text-2xl sm:text-3xl lg:text-4xl">🐄</span>
            </div>
          )}
          
          {listing.photos && listing.photos.length > 1 && (
            <Badge className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-black bg-opacity-70 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1">
              +{listing.photos.length - 1} {language === 'am' ? 'ፎቶዎች' : 'more'}
            </Badge>
          )}
          
          {listing.is_vet_verified && (
            <Badge className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-green-100 text-green-800 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1">
              <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              {language === 'am' ? 'ዶክተር ማረጋገጫ' : 'Vet Verified'}
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <div className="p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3">
          {/* Title and Price */}
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-sm sm:text-base lg:text-lg line-clamp-2 flex-1 mr-2">
              {listing.title}
            </h3>
            <div className="text-right">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                ₹{formatPrice(listing.price)}
              </p>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
              {listing.description}
            </p>
          )}

          {/* Details */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {listing.weight && (
              <Badge variant="outline" className="flex items-center space-x-0.5 sm:space-x-1 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1">
                <Weight className="w-2 h-2 sm:w-3 sm:h-3" />
                <span>{listing.weight}kg</span>
              </Badge>
            )}
            {listing.age && (
              <Badge variant="outline" className="flex items-center space-x-0.5 sm:space-x-1 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1">
                <Calendar className="w-2 h-2 sm:w-3 sm:h-3" />
                <span>{listing.age} {language === 'am' ? 'ዓመት' : 'years'}</span>
              </Badge>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">{listing.location}</span>
          </div>

          {/* Posted Date */}
          <p className="text-[10px] sm:text-xs text-gray-500">
            {language === 'am' ? 'የተለጠፈ' : 'Posted'}: {formatDate(listing.created_at)}
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-1 sm:space-x-2 pt-1 sm:pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(listing)}
              className="flex-1 text-xs sm:text-sm h-7 sm:h-8 lg:h-9 px-2 sm:px-3"
            >
              {language === 'am' ? 'ዝርዝር ይመልከቱ' : 'View Details'}
            </Button>
            <Button
              size="sm"
              onClick={() => onContact(listing.contact_method, listing.contact_value)}
              className="bg-green-600 hover:bg-green-700 flex items-center space-x-0.5 sm:space-x-1 text-xs sm:text-sm h-7 sm:h-8 lg:h-9 px-2 sm:px-3"
            >
              {getContactIcon()}
              <span>{language === 'am' ? 'ያነጋግሩ' : 'Contact'}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
