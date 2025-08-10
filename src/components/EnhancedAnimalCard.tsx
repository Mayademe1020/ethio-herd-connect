
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
    <Card className="group hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.02] border border-gray-200 hover:border-green-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
            {animal.name}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={`${getHealthBadgeColor(animal.health_status)} transition-all duration-200`}>
              <Heart className="w-3 h-3 mr-1" />
              {t[animal.health_status as keyof typeof t] || animal.health_status}
            </Badge>
            {animal.is_vet_verified && (
              <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                ✓ {t.verified}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 font-medium">{animal.animal_code}</p>
        <p className="text-sm text-gray-500">{animal.type} • {animal.breed}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {animal.weight && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
              <Scale className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{animal.weight}kg</span>
            </div>
          )}
          
          {animal.age && (
            <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="font-medium">{animal.age}y</span>
            </div>
          )}
        </div>

        {animal.last_vaccination && (
          <div className="text-sm p-2 bg-green-50 rounded-lg">
            <span className="font-medium text-green-700">{t.lastVaccination}:</span>
            <span className="text-green-600 ml-1">{animal.last_vaccination}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(animal)}
            className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 hover:scale-105"
          >
            <Edit className="w-4 h-4 mr-1" />
            {t.edit}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onVaccinate(animal)}
            className="hover:bg-green-50 hover:border-green-300 transition-all duration-200 hover:scale-105"
          >
            <Syringe className="w-4 h-4 mr-1" />
            {t.vaccinate}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onTrack(animal)}
            className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 hover:scale-105"
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            {t.track}
          </Button>

          {canProduceMilk && onMilkRecord && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onMilkRecord(animal)}
              className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 hover:scale-105"
            >
              <Droplets className="w-4 h-4 mr-1" />
              {t.recordMilk}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onSell(animal)}
            className="hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200 hover:scale-105"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {t.sell}
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(animal.id)}
            className="hover:scale-105 transition-transform duration-200"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {t.delete}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
