
import React from 'react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Calendar, Plus, MoreHorizontal } from 'lucide-react';
import { AnimalData, Language } from '@/types';
import { cn } from '@/lib/utils';
import { useDateDisplay } from '@/hooks/useDateDisplay';
import { OfflineFirstImage } from '@/components/OfflineFirstImage';

interface EnhancedAnimalGridProps {
  animals: AnimalData[];
  language: Language;
  loading?: boolean;
  onAnimalClick?: (animal: AnimalData) => void;
  onAddAnimal?: () => void;
}

export const EnhancedAnimalGrid: React.FC<EnhancedAnimalGridProps> = ({
  animals,
  language,
  loading = false,
  onAnimalClick,
  onAddAnimal
}) => {
  const translations = {
    am: {
      addAnimal: 'እንስሳ አክል',
      healthy: 'ጤናማ',
      needsAttention: 'ትኩረት ይፈልጋል',
      age: 'እድሜ',
      months: 'ወር',
      years: 'አመት',
      viewDetails: 'ዝርዝሮች ይመልከቱ',
      noAnimals: 'ምንም እንስሳት አልተገኙም',
      addFirst: 'የመጀመሪያ እንስሳዎን ያክሉ'
    },
    en: {
      addAnimal: 'Add Animal',
      healthy: 'Healthy',
      needsAttention: 'Needs Attention',
      age: 'Age',
      months: 'months',
      years: 'years',
      viewDetails: 'View Details',
      noAnimals: 'No animals found',
      addFirst: 'Add your first animal'
    },
    or: {
      addAnimal: 'Horii Dabaluu',
      healthy: 'Fayyaa',
      needsAttention: 'Xiyyeeffannoo Barbaada',
      age: 'Umurii',
      months: 'ji\'oota',
      years: 'waggaa',
      viewDetails: 'Bal\'inaa Ilaali',
      noAnimals: 'Horii hin argamne',
      addFirst: 'Horii jalqabaa kee dabaluu'
    },
    sw: {
      addAnimal: 'Ongeza Mnyama',
      healthy: 'Mwenye Afya',
      needsAttention: 'Anahitaji Uangalifu',
      age: 'Umri',
      months: 'miezi',
      years: 'miaka',
      viewDetails: 'Ona Maelezo',
      noAnimals: 'Hakuna wanyama waliopatikana',
      addFirst: 'Ongeza mnyama wako wa kwanza'
    }
  };

  const t = translations[language];

  const formatAge = (ageInMonths?: number) => {
    if (!ageInMonths) return '';
    if (ageInMonths < 12) {
      return `${ageInMonths} ${t.months}`;
    }
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    if (months === 0) {
      return `${years} ${t.years}`;
    }
    return `${years}y ${months}m`;
  };

  const getHealthStatus = (animal: AnimalData) => {
    return animal.health_status === 'healthy' ? 'healthy' : 'needsAttention';
  };

  if (loading) {
    return <LoadingSkeleton variant="card" count={6} />;
  }

  if (animals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <Heart className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{t.noAnimals}</h3>
        <p className="text-muted-foreground mb-6">{t.addFirst}</p>
        <EnhancedButton onClick={onAddAnimal} variant="gradient" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          {t.addAnimal}
        </EnhancedButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Animal Button */}
      <div className="flex justify-end">
        <EnhancedButton onClick={onAddAnimal} variant="success" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          {t.addAnimal}
        </EnhancedButton>
      </div>

      {/* Animals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {animals.map((animal, index) => {
          const healthStatus = getHealthStatus(animal);
          const isHealthy = healthStatus === 'healthy';
          
          return (
            <EnhancedCard
              key={animal.id}
              className={cn(
                "overflow-hidden group cursor-pointer",
                "animate-slideInUp"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => onAnimalClick?.(animal)}
            >
              {/* Animal Image */}
              <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden">
                {animal.photos && animal.photos.length > 0 ? (
                  <OfflineFirstImage
                    src={animal.photos[0]}
                    alt={animal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackIcon="🐄"
                  />
                ) : animal.photo_url ? (
                  <OfflineFirstImage
                    src={animal.photo_url}
                    alt={animal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackIcon="🐄"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart className="w-16 h-16 text-green-300" />
                  </div>
                )}
                
                {/* Health Status Badge */}
                <Badge
                  className={cn(
                    "absolute top-2 right-2",
                    isHealthy 
                      ? "bg-green-500 text-white hover:bg-green-600" 
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  )}
                >
                  {isHealthy ? t.healthy : t.needsAttention}
                </Badge>

                {/* Action Button */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EnhancedButton size="icon" variant="outline" className="bg-white/80 backdrop-blur-sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </EnhancedButton>
                </div>
              </div>

              {/* Animal Info */}
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <h4 className="font-semibold text-lg text-foreground">
                    {animal.name}
                  </h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {animal.type} • {animal.breed || 'Mixed'}
                  </p>
                </div>

                <div className="space-y-2">
                  {animal.age && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {t.age}: {formatAge(animal.age)}
                    </div>
                  )}
                  
                  {animal.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {animal.location}
                    </div>
                  )}
                </div>

                <EnhancedButton 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {t.viewDetails}
                </EnhancedButton>
              </div>
            </EnhancedCard>
          );
        })}
      </div>
    </div>
  );
};
