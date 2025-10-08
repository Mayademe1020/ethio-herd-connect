import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Syringe, TrendingUp, ShoppingCart, Calendar, Scale } from 'lucide-react';
import { Language, AnimalData } from '@/types';
import { useAnimalPageStore } from '@/stores/animalPageStore';
import { useAnimalStore } from '@/stores/animalStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModernAnimalCardProps {
  animal: AnimalData;
  language: Language;
}

export const ModernAnimalCard = ({
  animal,
  language,
}: ModernAnimalCardProps) => {
  const { user } = useAuth();
  const { openModal, setSelectedAnimal } = useAnimalPageStore();
  const { removeAnimal: removeAnimalFromStore } = useAnimalStore();

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
      verified: 'የተረጋገጠ'
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
      verified: 'Verified'
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
      verified: 'Mirkaneeffame'
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
      verified: 'Imethibitishwa'
    }
  };

  const t = translations[language];

  const getHealthBadgeColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'attention': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = () => {
    setSelectedAnimal(animal);
    openModal('registration');
  };

  const handleDelete = async () => {
    if (!user) return;
    const originalAnimals = useAnimalStore.getState().animals;
    removeAnimalFromStore(animal.id);
    const { error } = await supabase.from('animals').delete().eq('id', animal.id);
    if (error) {
      useAnimalStore.setState({ animals: originalAnimals });
      toast.error("Failed to delete animal.");
    } else {
      toast.success("Animal deleted successfully.");
    }
  };

  const handleVaccinate = () => openModal('vaccination', animal);
  const handleTrack = () => openModal('weight', animal);
  const handleSell = () => console.log('Selling animal:', animal);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{animal.name}</CardTitle>
          <Badge className={getHealthBadgeColor(animal.health_status)}>
            {t[animal.health_status as keyof typeof t] || animal.health_status}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{animal.animal_code}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{animal.type} • {animal.breed}</p>
          </div>
          {animal.is_vet_verified && (
            <Badge variant="outline" className="text-xs">
              ✓ {t.verified}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {animal.weight && (
            <div className="flex items-center space-x-1">
              <Scale className="w-4 h-4 text-gray-400" />
              <span>{animal.weight}kg</span>
            </div>
          )}
          
          {animal.age && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{animal.age}y</span>
            </div>
          )}
        </div>

        {animal.last_vaccination && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{t.lastVaccination}:</span> {animal.last_vaccination}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-1" />
            {t.edit}
          </Button>
          <Button variant="outline" size="sm" onClick={handleVaccinate}>
            <Syringe className="w-4 h-4 mr-1" />
            {t.vaccinate}
          </Button>
          <Button variant="outline" size="sm" onClick={handleTrack}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {t.track}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSell}>
            <ShoppingCart className="w-4 h-4 mr-1" />
            {t.sell}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            {t.delete}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};