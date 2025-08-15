
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Share2, 
  Shield, 
  Award,
  Eye,
  Star,
  Camera,
  Play,
  Calendar,
  Weight
} from 'lucide-react';
import { Language } from '@/types';

interface ProfessionalAnimalCardProps {
  listing: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    photos: string[] | null;
    price: number | null;
    weight: number | null;
    age: number | null;
    is_vet_verified: boolean | null;
    created_at: string;
  };
  language: Language;
  isAuthenticated: boolean;
  onViewDetails: (listingId: string) => void;
  onContact: (listingId: string) => void;
  onFavorite?: (listingId: string) => void;
  onShare?: (listingId: string) => void;
}

export const ProfessionalAnimalCard = ({
  listing,
  language,
  isAuthenticated,
  onViewDetails,
  onContact,
  onFavorite,
  onShare
}: ProfessionalAnimalCardProps) => {
  const translations = {
    am: {
      priceOnRequest: 'ዋጋ በጥያቄ',
      trustedSeller: 'የታመነ ሻጭ',
      verified: 'የተረጋገጠ',
      healthCertified: 'ጤና የተረጋገጠ',
      viewDetails: 'ዝርዝሮች ይመልከቱ',
      contactSeller: 'ሻጭን ያነጋግሩ',
      loginToContact: 'ለመገናኘት ይግቡ',
      memberSince: 'አባል ከ',
      kg: 'ኪ.ግ',
      months: 'ወራት',
      years: 'ዓመታት',
      excellentHealth: 'በጣም ጤናማ',
      goodHealth: 'ጤናማ',
      needsAttention: 'ትኩረት ይፈልጋል'
    },
    en: {
      priceOnRequest: 'Price on Request',
      trustedSeller: 'Trusted Seller',
      verified: 'Verified',
      healthCertified: 'Health Certified',
      viewDetails: 'View Details',
      contactSeller: 'Contact Seller',
      loginToContact: 'Login to Contact',
      memberSince: 'Member since',
      kg: 'kg',
      months: 'months',
      years: 'years',
      excellentHealth: 'Excellent Health',
      goodHealth: 'Good Health',
      needsAttention: 'Needs Attention'
    },
    or: {
      priceOnRequest: 'Gatiin Gaafatamaan',
      trustedSeller: 'Gurgurtaa Amanamaa',
      verified: 'Mirkaneeffame',
      healthCertified: 'Fayyaa Mirkaneeffame',
      viewDetails: 'Bal\'inaa Ilaali',
      contactSeller: 'Gurgurtaa Qunnamuu',
      loginToContact: 'Qunnamuuf Seeni',
      memberSince: 'Miseensa Erga',
      kg: 'kg',
      months: 'ji\'oota',
      years: 'waggaalee',
      excellentHealth: 'Fayyaa Gaarii',
      goodHealth: 'Fayyaa',
      needsAttention: 'Xiyyeeffannoo Barbaada'
    },
    sw: {
      priceOnRequest: 'Bei kwa Maombi',
      trustedSeller: 'Muuzaji wa Kuaminika',
      verified: 'Imethibitishwa',
      healthCertified: 'Afya Imethibitishwa',
      viewDetails: 'Ona Maelezo',
      contactSeller: 'Wasiliana na Muuzaji',
      loginToContact: 'Ingia Kuwasiliana',
      memberSince: 'Mwanachama tangu',
      kg: 'kg',
      months: 'miezi',
      years: 'miaka',
      excellentHealth: 'Afya Bora',
      goodHealth: 'Afya Nzuri',
      needsAttention: 'Inahitaji Uangalifu'
    }
  };

  const t = translations[language];

  // Mock seller data - in real app this would come from the API
  const sellerRating = 4.8;
  const sellerSales = 23;
  const memberSince = '2022';

  const getHealthStatusText = () => {
    if (listing.is_vet_verified) return t.excellentHealth;
    return t.goodHealth;
  };

  const getHealthStatusColor = () => {
    if (listing.is_vet_verified) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  const formatAge = (age: number) => {
    if (age < 12) return `${age} ${t.months}`;
    const years = Math.floor(age / 12);
    const remainingMonths = age % 12;
    if (remainingMonths === 0) return `${years} ${t.years}`;
    return `${years} ${t.years} ${remainingMonths} ${t.months}`;
  };

  return (
    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white border-0 shadow-md overflow-hidden">
      <div className="relative">
        {/* Image/Video Container */}
        <div className="aspect-[4/3] bg-gradient-to-br from-green-50 to-emerald-100 relative overflow-hidden">
          {listing.photos && listing.photos.length > 0 ? (
            <img 
              src={listing.photos[0]} 
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-green-300">
                <Camera className="w-16 h-16 mx-auto mb-2" />
                <p className="text-sm">Photo coming soon</p>
              </div>
            </div>
          )}
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {listing.is_vet_verified && (
              <Badge className="bg-green-600 text-white border-0 shadow-lg">
                <Shield className="w-3 h-3 mr-1" />
                {t.verified}
              </Badge>
            )}
            <Badge className="bg-blue-600 text-white border-0 shadow-lg">
              <Award className="w-3 h-3 mr-1" />
              {t.healthCertified}
            </Badge>
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            {isAuthenticated && listing.price ? (
              <Badge className="bg-orange-600 text-white border-0 shadow-lg text-sm px-3 py-1 font-bold">
                {listing.price.toLocaleString()} ETB
              </Badge>
            ) : (
              <Badge className="bg-slate-800 text-white border-0 shadow-lg text-sm px-3 py-1">
                {t.priceOnRequest}
              </Badge>
            )}
          </div>

          {/* Action Buttons Overlay */}
          <div className="absolute top-3 right-3 mr-24 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onFavorite && (
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 bg-white/90 hover:bg-white shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(listing.id);
                }}
              >
                <Heart className="w-4 h-4" />
              </Button>
            )}
            {onShare && (
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 bg-white/90 hover:bg-white shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(listing.id);
                }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Photo Count Indicator */}
          {listing.photos && listing.photos.length > 1 && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-black/60 text-white border-0">
                <Camera className="w-3 h-3 mr-1" />
                {listing.photos.length}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title and Location */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">
              {listing.title}
            </h3>
            {listing.location && (
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                {listing.location}
              </div>
            )}
          </div>

          {/* Seller Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.floor(sellerRating)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {t.trustedSeller} ({sellerRating})
              </span>
            </div>
          </div>

          {/* Animal Details */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {listing.weight && (
              <div className="flex items-center text-gray-600">
                <Weight className="w-3 h-3 mr-1" />
                {listing.weight}{t.kg}
              </div>
            )}
            {listing.age && (
              <div className="flex items-center text-gray-600">
                <Calendar className="w-3 h-3 mr-1" />
                {formatAge(listing.age)}
              </div>
            )}
            <div className="col-span-2">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${getHealthStatusColor()} mr-2`} />
                <span className="text-sm font-medium text-gray-700">
                  {getHealthStatusText()}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {listing.description}
            </p>
          )}

          {/* Seller Info */}
          <div className="text-xs text-gray-500 border-t pt-2">
            <div className="flex items-center justify-between">
              <span>{t.memberSince} {memberSince}</span>
              <span>Sold {sellerSales} animals</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(listing.id);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              {t.viewDetails}
            </Button>
            
            <Button
              variant={isAuthenticated ? "default" : "outline"}
              className={`flex-1 ${
                isAuthenticated 
                  ? "bg-orange-600 hover:bg-orange-700 text-white" 
                  : "border-orange-200 text-orange-600 hover:bg-orange-50"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onContact(listing.id);
              }}
            >
              {isAuthenticated ? (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  {t.contactSeller}
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t.loginToContact}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
