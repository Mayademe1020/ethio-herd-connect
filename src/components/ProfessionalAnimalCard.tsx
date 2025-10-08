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
  Eye,
  Calendar,
  Weight
} from 'lucide-react';
import { Language, AnimalData } from '@/types';
import { useTranslations } from '@/hooks/useTranslations';

interface ProfessionalAnimalCardProps {
  listing: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    photos: string[] | null;
    price: number | null;
    is_vet_verified: boolean | null;
    created_at: string;
    animals: AnimalData;
  };
  language: Language;
  isAuthenticated: boolean;
  isFavorite?: boolean;
  onViewDetails: (listingId: string) => void;
  onContact: (listingId: string) => void;
  onFavorite?: (listingId: string) => void;
  onShare?: (listingId: string) => void;
}

export const ProfessionalAnimalCard = ({
  listing,
  language,
  isAuthenticated,
  isFavorite = false,
  onViewDetails,
  onContact,
  onFavorite,
  onShare
}: ProfessionalAnimalCardProps) => {
  const { t } = useTranslations();
  const animal = listing.animals;

  const getHealthStatusText = () => {
    if (animal.is_vet_verified) return t('common.excellentHealth');
    return t('common.goodHealth');
  };

  const getHealthStatusColor = () => {
    if (animal.is_vet_verified) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  const formatAge = (age: number) => {
    if (age < 12) return `${age} ${t('animals.ageMonths')}`;
    const years = Math.floor(age / 12);
    const remainingMonths = age % 12;
    if (remainingMonths === 0) return `${years} ${t('animals.ageYears')}`;
    return `${years} ${t('animals.ageYears')} ${remainingMonths} ${t('animals.ageMonths')}`;
  };

  return (
    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white border-0 shadow-md overflow-hidden" onClick={() => onViewDetails(listing.id)}>
      <div className="relative">
        <div className="aspect-[4/3] sm:aspect-[3/2] bg-gradient-to-br from-green-50 to-emerald-100 relative overflow-hidden">
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
                <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2" />
                <p className="text-xs sm:text-sm">Photo coming soon</p>
              </div>
            </div>
          )}

          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1">
            {animal.is_vet_verified && (
              <Badge className="bg-green-600 text-white border-0 shadow-lg text-xs">
                <Shield className="w-3 h-3 mr-1" />
                {t('common.verified')}
              </Badge>
            )}
          </div>

          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            {isAuthenticated && listing.price ? (
              <Badge className="bg-orange-600 text-white border-0 shadow-lg text-xs sm:text-sm px-2 sm:px-3 py-1 font-bold">
                {listing.price.toLocaleString()} ETB
              </Badge>
            ) : (
              <Badge className="bg-slate-800 text-white border-0 shadow-lg text-xs sm:text-sm px-2 sm:px-3 py-1">
                {t('marketplace.priceOnRequest')}
              </Badge>
            )}
          </div>

          <div className="absolute top-2 right-16 sm:right-24 hidden sm:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onFavorite && (
              <Button
                size="icon"
                variant="secondary"
                className={`w-8 h-8 bg-white/90 hover:bg-white shadow-lg ${isFavorite ? 'text-red-500' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(listing.id);
                }}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
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
        </div>

        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-1 mb-1">
              {listing.title}
            </h3>
            {listing.location && (
              <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                {listing.location}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            {animal.weight && (
              <div className="flex items-center text-gray-600">
                <Weight className="w-3 h-3 mr-1" />
                {animal.weight}kg
              </div>
            )}
            {animal.age && (
              <div className="flex items-center text-gray-600">
                <Calendar className="w-3 h-3 mr-1" />
                {formatAge(animal.age)}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${getHealthStatusColor()} mr-2`} />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {getHealthStatusText()}
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white min-h-[44px] text-xs sm:text-sm font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(listing.id);
              }}
            >
              <Eye className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              {t('common.details')}
            </Button>

            <Button
              size="sm"
              variant={isAuthenticated ? "default" : "outline"}
              className={`flex-1 min-h-[44px] text-xs sm:text-sm font-semibold ${
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
                  <Phone className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                  {t('common.contact')}
                </>
              ) : (
                <>
                  <MessageSquare className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                  {t('common.loginToContact')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </div>
    </>
  );
};