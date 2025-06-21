
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Phone, MessageSquare, Calendar, Weight, Star, Camera } from 'lucide-react';

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
  animal?: {
    photo_url?: string;
    name?: string;
    breed?: string;
    type?: string;
  };
}

interface MarketListingDetailsProps {
  listing: MarketListing;
  language: 'am' | 'en';
  onClose: () => void;
  onContact: (contactMethod: string, contactValue: string) => void;
}

export const MarketListingDetails: React.FC<MarketListingDetailsProps> = ({
  listing,
  language,
  onClose,
  onContact
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);

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
        return <MessageSquare className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const getContactLabel = () => {
    switch (listing.contact_method) {
      case 'telegram':
        return 'Telegram';
      case 'sms':
        return 'SMS';
      default:
        return language === 'am' ? 'ስልክ' : 'Phone';
    }
  };

  // Combine listing photos with animal photo
  const allPhotos = [
    ...(listing.photos || []),
    ...(listing.animal?.photo_url ? [listing.animal.photo_url] : [])
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">{listing.title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Photo Gallery */}
          {allPhotos && allPhotos.length > 0 && (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={allPhotos[currentPhotoIndex]}
                  alt={`${listing.title} - ${currentPhotoIndex + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                
                {listing.is_vet_verified && (
                  <Badge className="absolute top-3 right-3 bg-green-100 text-green-800">
                    <Star className="w-3 h-3 mr-1" />
                    {language === 'am' ? 'ዶክተር ማረጋገጫ' : 'Vet Verified'}
                  </Badge>
                )}
              </div>
              
              {allPhotos.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {allPhotos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        currentPhotoIndex === index ? 'border-green-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!allPhotos || allPhotos.length === 0 && (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">
                  {language === 'am' ? 'ምንም ፎቶ የለም' : 'No photos available'}
                </p>
              </div>
            </div>
          )}

          {/* Animal Details */}
          {listing.animal && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">
                {language === 'am' ? 'የእንስሳ መረጃ' : 'Animal Information'}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {listing.animal.name && (
                  <div>
                    <span className="text-gray-600">{language === 'am' ? 'ስም:' : 'Name:'}</span>
                    <span className="ml-2 font-medium">{listing.animal.name}</span>
                  </div>
                )}
                {listing.animal.type && (
                  <div>
                    <span className="text-gray-600">{language === 'am' ? 'አይነት:' : 'Type:'}</span>
                    <span className="ml-2 font-medium capitalize">{listing.animal.type}</span>
                  </div>
                )}
                {listing.animal.breed && (
                  <div>
                    <span className="text-gray-600">{language === 'am' ? 'ዝርያ:' : 'Breed:'}</span>
                    <span className="ml-2 font-medium">{listing.animal.breed}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              ₹{formatPrice(listing.price)}
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            {listing.weight && (
              <div className="flex items-center space-x-2">
                <Weight className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'am' ? 'ክብደት' : 'Weight'}
                  </p>
                  <p className="font-medium">{listing.weight}kg</p>
                </div>
              </div>
            )}
            
            {listing.age && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'am' ? 'እድሜ' : 'Age'}
                  </p>
                  <p className="font-medium">{listing.age} {language === 'am' ? 'ዓመት' : 'years'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h3 className="font-semibold mb-2">
                {language === 'am' ? 'መግለጫ' : 'Description'}
              </h3>
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'አካባቢ' : 'Location'}
              </p>
              <p className="font-medium">{listing.location}</p>
            </div>
          </div>

          {/* Posted Date */}
          <div className="text-center text-sm text-gray-500">
            {language === 'am' ? 'የተለጠፈ' : 'Posted'}: {formatDate(listing.created_at)}
          </div>

          {/* Contact Button */}
          <Button
            onClick={() => onContact(listing.contact_method, listing.contact_value)}
            className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center space-x-2 py-3"
            size="lg"
          >
            {getContactIcon()}
            <span>
              {language === 'am' ? 'በ' : 'Contact via'} {getContactLabel()}
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
