import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Syringe, TrendingUp, ShoppingCart, Calendar, Scale, Droplets, Heart, MapPin, Phone, Eye, Share2 } from 'lucide-react';
import { Language, AnimalData } from '@/types';
import { useDateDisplay } from '@/hooks/useDateDisplay';
import { BreedRegistryService } from '@/utils/breedRegistry';
import { OptimizedImage } from '@/components/OptimizedImage';

export type AnimalCardVariant = 'compact' | 'full' | 'list' | 'marketplace';

interface EnhancedAnimalCardProps {
  animal: AnimalData;
  language: Language;
  variant?: AnimalCardVariant;
  onEdit?: (animal: AnimalData) => void;
  onDelete?: (animalId: string) => void;
  onVaccinate?: (animal: AnimalData) => void;
  onTrack?: (animal: AnimalData) => void;
  onSell?: (animal: AnimalData) => void;
  onMilkRecord?: (animal: AnimalData) => void;
  // Marketplace-specific props
  onViewDetails?: (animalId: string) => void;
  onContact?: (animalId: string) => void;
  onFavorite?: (animalId: string) => void;
  onShare?: (animalId: string) => void;
  isFavorite?: boolean;
  isAuthenticated?: boolean;
  price?: number | null;
  location?: string | null;
  photos?: string[] | null;
}

export const EnhancedAnimalCard = React.memo(({
  animal,
  language,
  variant = 'full',
  onEdit,
  onDelete,
  onVaccinate,
  onTrack,
  onSell,
  onMilkRecord,
  onViewDetails,
  onContact,
  onFavorite,
  onShare,
  isFavorite = false,
  isAuthenticated = true,
  price,
  location,
  photos
}: EnhancedAnimalCardProps) => {
  const { formatDateShort } = useDateDisplay();
  
  const translations = {
    am: {
      healthy: 'ጤናማ',
      sick: 'ታሞ',
      attention: 'ትኩረት ያስፈልጋል',
      critical: 'ወሳኝ',
      edit: 'ቀይር',
      delete: 'ሰርዝ',
      vaccinate: 'ክትባት',
      track: 'ክትትል',
      sell: 'ሽጥ',
      weight: 'ክብደት',
      age: 'እድሜ',
      lastVaccination: 'የመጨረሻ ክትባት',
      verified: 'የተረጋገጠ',
      recordMilk: 'ወተት መዝግብ',
      priceOnRequest: 'ዋጋ በጥያቄ',
      details: 'ዝርዝሮች',
      contact: 'ያነጋግሩ'
    },
    en: {
      healthy: 'Healthy',
      sick: 'Sick',
      attention: 'Needs Attention',
      critical: 'Critical',
      edit: 'Edit',
      delete: 'Delete',
      vaccinate: 'Vaccinate',
      track: 'Track',
      sell: 'Sell',
      weight: 'Weight',
      age: 'Age',
      lastVaccination: 'Last Vaccination',
      verified: 'Verified',
      recordMilk: 'Record Milk',
      priceOnRequest: 'Price on Request',
      details: 'Details',
      contact: 'Contact'
    },
    or: {
      healthy: 'Fayyaa',
      sick: 'Dhukkuba',
      attention: 'Xiyyeeffannaa Barbaada',
      critical: 'Murteessaa',
      edit: 'Jijjiiri',
      delete: 'Haqi',
      vaccinate: 'Walaloo',
      track: 'Hordofi',
      sell: 'Gurguri',
      weight: 'Ulfaatina',
      age: 'Umurii',
      lastVaccination: 'Walaloo Dhumaa',
      verified: 'Mirkaneeffame',
      recordMilk: 'Aannan Galmeessi',
      priceOnRequest: 'Gatii Gaafatameen',
      details: 'Bal\'ina',
      contact: 'Quunnamuu'
    },
    sw: {
      healthy: 'Mzuri',
      sick: 'Mgonjwa',
      attention: 'Inahitaji Umakini',
      critical: 'Hatari',
      edit: 'Hariri',
      delete: 'Futa',
      vaccinate: 'Chanjo',
      track: 'Fuatilia',
      sell: 'Uza',
      weight: 'Uzito',
      age: 'Umri',
      lastVaccination: 'Chanjo ya Mwisho',
      verified: 'Imethibitishwa',
      recordMilk: 'Rekodi Maziwa',
      priceOnRequest: 'Bei kwa Ombi',
      details: 'Maelezo',
      contact: 'Wasiliana'
    }
  };

  const t = translations[language];

  const getHealthBadgeColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'sick': return 'bg-red-100 text-red-800 border-red-200';
      case 'attention': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canProduceMilk = animal.type.toLowerCase() === 'cattle' && animal.gender === 'female';

  // Get breed display text
  const getBreedDisplay = () => {
    if (animal.is_custom_breed && animal.breed_custom) {
      return animal.breed_custom;
    }
    return BreedRegistryService.getBreedDisplayName(animal.breed, language) || animal.breed;
  };

  const breedDisplay = getBreedDisplay();

  // Marketplace variant - similar to ProfessionalAnimalCard
  if (variant === 'marketplace') {
    return (
      <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white border-0 shadow-md overflow-hidden">
        <div className="relative">
          {/* Image Container */}
          <div className="aspect-[4/3] sm:aspect-[3/2] bg-gradient-to-br from-green-50 to-emerald-100 relative overflow-hidden">
            {photos && photos.length > 0 ? (
              <OptimizedImage 
                src={photos[0]} 
                alt={animal.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                fallbackIcon="🐄"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-green-300">
                <Heart className="w-12 h-12 sm:w-16 sm:h-16" />
              </div>
            )}
            
            {/* Top Badges */}
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1">
              {animal.is_vet_verified && (
                <Badge className="bg-green-600 text-white border-0 shadow-lg text-xs">
                  ✓ {t.verified}
                </Badge>
              )}
            </div>

            {/* Price Badge */}
            {price !== undefined && (
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                {isAuthenticated && price ? (
                  <Badge className="bg-orange-600 text-white border-0 shadow-lg text-xs sm:text-sm px-2 sm:px-3 py-1 font-bold">
                    {price.toLocaleString()} ETB
                  </Badge>
                ) : (
                  <Badge className="bg-slate-800 text-white border-0 shadow-lg text-xs sm:text-sm px-2 sm:px-3 py-1">
                    {t.priceOnRequest || 'Price on Request'}
                  </Badge>
                )}
              </div>
            )}

            {/* Action Buttons Overlay */}
            {(onFavorite || onShare) && (
              <div className="absolute top-2 right-16 sm:right-24 hidden sm:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onFavorite && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className={`w-8 h-8 bg-white/90 hover:bg-white shadow-lg ${isFavorite ? 'text-red-500' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavorite(animal.id);
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
                      onShare(animal.id);
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            {/* Title and Location */}
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-1 mb-1">
                {animal.name}
              </h3>
              {location && (
                <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                  <MapPin className="w-3 h-3 mr-1" />
                  {location}
                </div>
              )}
            </div>

            {/* Animal Details */}
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              {animal.weight && (
                <div className="flex items-center text-gray-600">
                  <Scale className="w-3 h-3 mr-1" />
                  {animal.weight}kg
                </div>
              )}
              {animal.age && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-3 h-3 mr-1" />
                  {animal.age}y
                </div>
              )}
            </div>

            {/* Health Status */}
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${animal.health_status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'} mr-2`} />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {t[animal.health_status as keyof typeof t] || animal.health_status}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {onViewDetails && (
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white min-h-[44px] text-xs sm:text-sm font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(animal.id);
                  }}
                >
                  <Eye className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                  {t.details || 'Details'}
                </Button>
              )}
              
              {onContact && (
                <Button
                  size="sm"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white min-h-[44px] text-xs sm:text-sm font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContact(animal.id);
                  }}
                >
                  <Phone className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                  {t.contact || 'Contact'}
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Compact variant - minimal information
  if (variant === 'compact') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 border hover:border-primary/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{animal.name}</h3>
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground truncate">{animal.type} • {breedDisplay}</p>
                {animal.is_custom_breed && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                    {language === 'am' ? 'ብጁ' : 'Custom'}
                  </Badge>
                )}
              </div>
            </div>
            <Badge className={`${getHealthBadgeColor(animal.health_status)} text-xs flex-shrink-0`}>
              <Heart className="w-3 h-3" />
            </Badge>
          </div>
          {(animal.weight || animal.age) && (
            <div className="flex gap-2 mt-2 text-xs">
              {animal.weight && (
                <span className="flex items-center text-muted-foreground">
                  <Scale className="w-3 h-3 mr-1" />
                  {animal.weight}kg
                </span>
              )}
              {animal.age && (
                <span className="flex items-center text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  {animal.age}y
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // List variant - horizontal layout
  if (variant === 'list') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 border hover:border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base truncate">{animal.name}</h3>
                <Badge className={`${getHealthBadgeColor(animal.health_status)} text-xs`}>
                  {t[animal.health_status as keyof typeof t] || animal.health_status}
                </Badge>
                {animal.is_vet_verified && (
                  <Badge variant="outline" className="text-xs">
                    ✓ {t.verified}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{animal.animal_code} • {animal.type} • {breedDisplay}</p>
                {animal.is_custom_breed && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                    {language === 'am' ? 'ብጁ' : 'Custom'}
                  </Badge>
                )}
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                {animal.weight && (
                  <span className="flex items-center text-muted-foreground">
                    <Scale className="w-4 h-4 mr-1" />
                    {animal.weight}kg
                  </span>
                )}
                {animal.age && (
                  <span className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {animal.age}y
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(animal)}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onVaccinate && (
                <Button variant="outline" size="sm" onClick={() => onVaccinate(animal)}>
                  <Syringe className="w-4 h-4" />
                </Button>
              )}
              {onTrack && (
                <Button variant="outline" size="sm" onClick={() => onTrack(animal)}>
                  <TrendingUp className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant (default) - complete feature set
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.01] border hover:border-primary/30 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base lg:text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {animal.name}
            </CardTitle>
            <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">{animal.animal_code}</p>
            <div className="flex items-center gap-1.5">
              <p className="text-xs md:text-sm text-muted-foreground truncate">{animal.type} • {breedDisplay}</p>
              {animal.is_custom_breed && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                  {language === 'am' ? 'ብጁ' : 'Custom'}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end flex-shrink-0">
            <Badge className={`${getHealthBadgeColor(animal.health_status)} transition-all duration-200 text-xs`}>
              <Heart className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">{t[animal.health_status as keyof typeof t] || animal.health_status}</span>
              <span className="sm:hidden">●</span>
            </Badge>
            {animal.is_vet_verified && (
              <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                ✓ <span className="hidden sm:inline ml-1">{t.verified}</span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-responsive flex-1 flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm flex-1">
          {animal.weight && (
            <div className="flex items-center space-x-2 p-2 bg-primary/5 rounded-lg">
              <Scale className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="font-medium text-primary truncate">{animal.weight}kg</span>
            </div>
          )}
          
          {animal.age && (
            <div className="flex items-center space-x-2 p-2 bg-secondary/10 rounded-lg">
              <Calendar className="w-4 h-4 text-secondary flex-shrink-0" />
              <span className="font-medium text-secondary truncate">{animal.age}y</span>
            </div>
          )}
        </div>

        {animal.last_vaccination && (
          <div className="text-sm p-2 bg-accent/10 rounded-lg">
            <span className="font-medium text-accent">{t.lastVaccination}:</span>
            <span className="text-accent/80 ml-1 text-xs">{formatDateShort(animal.last_vaccination)}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1 md:gap-2 pt-2 mt-auto">
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(animal)}
              className="hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 flex-1 sm:flex-none"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">{t.edit}</span>
            </Button>
          )}
          
          {onVaccinate && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onVaccinate(animal)}
              className="hover:bg-accent/10 hover:border-accent/30 transition-all duration-200 flex-1 sm:flex-none"
            >
              <Syringe className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">{t.vaccinate}</span>
            </Button>
          )}
          
          {onTrack && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onTrack(animal)}
              className="hover:bg-secondary/10 hover:border-secondary/30 transition-all duration-200 flex-1 sm:flex-none"
            >
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">{t.track}</span>
            </Button>
          )}

          {canProduceMilk && onMilkRecord && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onMilkRecord(animal)}
              className="hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 flex-1 sm:flex-none"
            >
              <Droplets className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">{t.recordMilk}</span>
            </Button>
          )}
          
          {onSell && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSell(animal)}
              className="hover:bg-secondary/10 hover:border-secondary/30 transition-all duration-200 flex-1 sm:flex-none"
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">{t.sell}</span>
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDelete(animal.id)}
              className="transition-all duration-200 flex-1 sm:flex-none"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">{t.delete}</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
