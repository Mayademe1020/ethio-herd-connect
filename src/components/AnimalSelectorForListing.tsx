import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { ANIMAL_TYPE_ICONS } from '@/utils/animalTypes';
import { OfflineFirstImage } from '@/components/OfflineFirstImage';

interface Animal {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  photo_url?: string;
}

interface AnimalSelectorForListingProps {
  selectedAnimalId?: string;
  onSelect: (animal: Animal) => void;
}

export const AnimalSelectorForListing: React.FC<AnimalSelectorForListingProps> = ({
  selectedAnimalId,
  onSelect
}) => {
  const { user } = useAuth();
  const { t, getAnimalTypeTranslation } = useTranslations();

  // Fetch user's animals that are not already listed
  const { data: animals, isLoading, error } = useQuery({
    queryKey: ['animals-for-listing', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all user's active animals
      const { data: allAnimals, error: animalsError } = await supabase
        .from('animals')
        .select('id, name, type, subtype, photo_url')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (animalsError) throw animalsError;

      // Get animals that already have active listings
      const { data: activeListings, error: listingsError } = await supabase
        .from('market_listings')
        .select('animal_id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (listingsError) throw listingsError;

      // Filter out animals that are already listed
      const listedAnimalIds = new Set(activeListings?.map(l => l.animal_id) || []);
      return allAnimals?.filter(animal => !listedAnimalIds.has(animal.id)) || [];
    },
    enabled: !!user
  });

  // Determine if animal is female based on subtype
  const isFemaleAnimal = (subtype?: string): boolean => {
    if (!subtype) return false;
    const femaleSubtypes = ['Cow', 'Female Goat', 'Ewe', 'Female', 'Hen'];
    return femaleSubtypes.includes(subtype);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{t('common.error')}</p>
      </div>
    );
  }

  if (!animals || animals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">{t('marketplace.noAnimalsToList')}</p>
        <p className="text-sm text-gray-500">{t('marketplace.registerAnimalFirst')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{t('marketplace.selectAnimal')}</h3>
      <div className="grid grid-cols-1 gap-3">
        {animals.map((animal) => {
          const isSelected = selectedAnimalId === animal.id;
          const isFemale = isFemaleAnimal(animal.subtype);
          
          return (
            <Card
              key={animal.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-orange-600 bg-orange-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect(animal)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Animal Photo */}
                  <div className="flex-shrink-0">
                    {animal.photo_url ? (
                      <OfflineFirstImage
                        src={animal.photo_url}
                        alt={animal.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        fallbackIcon="🐄"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-3xl">
                        {ANIMAL_TYPE_ICONS[animal.type] || '🐄'}
                      </div>
                    )}
                  </div>

                  {/* Animal Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg truncate">{animal.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{ANIMAL_TYPE_ICONS[animal.type]}</span>
                      <span>{getAnimalTypeTranslation(animal.type)}</span>
                      {animal.subtype && (
                        <>
                          <span>•</span>
                          <span>{animal.subtype}</span>
                        </>
                      )}
                    </div>
                    {isFemale && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">
                          ♀ {t('common.female')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
