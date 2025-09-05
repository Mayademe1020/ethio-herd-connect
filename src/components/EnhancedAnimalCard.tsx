
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Syringe, TrendingUp, ShoppingCart, Calendar, Scale, Droplets, Heart } from 'lucide-react';
import { Language, AnimalData } from '@/types';

interface EnhancedAnimalCardProps {
  animal: AnimalData;
  language: Language;
  onEdit: (animal: AnimalData) => void;
  onDelete: (animalId: string) => void;
  onVaccinate: (animal: AnimalData) => void;
  onTrack: (animal: AnimalData) => void;
  onSell: (animal: AnimalData) => void;
  onMilkRecord?: (animal: AnimalData) => void;
}

export const EnhancedAnimalCard = ({
  animal,
  language,
  onEdit,
  onDelete,
  onVaccinate,
  onTrack,
  onSell,
  onMilkRecord
}: EnhancedAnimalCardProps) => {
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
      recordMilk: 'ወተት መዝግብ'
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
      recordMilk: 'Record Milk'
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
      recordMilk: 'Aannan Galmeessi'
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
      recordMilk: 'Rekodi Maziwa'
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

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.01] border hover:border-primary/30 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base lg:text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {animal.name}
            </CardTitle>
            <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">{animal.animal_code}</p>
            <p className="text-xs md:text-sm text-muted-foreground truncate">{animal.type} • {animal.breed}</p>
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
            <span className="text-accent/80 ml-1 text-xs">{animal.last_vaccination}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1 md:gap-2 pt-2 mt-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(animal)}
            className="hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 flex-1 sm:flex-none"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">{t.edit}</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onVaccinate(animal)}
            className="hover:bg-accent/10 hover:border-accent/30 transition-all duration-200 flex-1 sm:flex-none"
          >
            <Syringe className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">{t.vaccinate}</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onTrack(animal)}
            className="hover:bg-secondary/10 hover:border-secondary/30 transition-all duration-200 flex-1 sm:flex-none"
          >
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">{t.track}</span>
          </Button>

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
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onSell(animal)}
            className="hover:bg-secondary/10 hover:border-secondary/30 transition-all duration-200 flex-1 sm:flex-none"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">{t.sell}</span>
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(animal.id)}
            className="transition-all duration-200 flex-1 sm:flex-none"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">{t.delete}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
