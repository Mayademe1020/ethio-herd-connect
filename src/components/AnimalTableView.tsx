import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Syringe, TrendingUp, ShoppingCart } from 'lucide-react';
import { Language, AnimalData } from '@/types';
import { useAnimalPageStore } from '@/stores/animalPageStore';
import { useAnimalStore } from '@/stores/animalStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { useDateDisplay } from '@/hooks/useDateDisplay';

interface AnimalTableViewProps {
  animals: AnimalData[];
  language: Language;
}

export const AnimalTableView = ({
  animals,
  language,
}: AnimalTableViewProps) => {
  const { user } = useAuth();
  const { openModal, setSelectedAnimal } = useAnimalPageStore();
  const { removeAnimal: removeAnimalFromStore } = useAnimalStore();
  const { formatDate, formatDateShort } = useDateDisplay();

  const translations = {
    am: {
      name: 'ስም',
      type: 'ዓይነት',
      breed: 'ዘር',
      health: 'ጤንነት',
      weight: 'ክብደት',
      age: 'እድሜ',
      actions: 'እርምጃዎች',
      healthy: 'ጤናማ',
      sick: 'ታሞ',
      attention: 'ትኩረት ያስፈልጋል',
      critical: 'ወሳኝ',
      edit: 'ቀይር',
      delete: 'ሰርዝ',
      vaccinate: 'ክትባት',
      track: 'ክትትል',
      sell: 'ሽጥ'
    },
    en: {
      name: 'Name',
      type: 'Type',
      breed: 'Breed',
      health: 'Health',
      weight: 'Weight',
      age: 'Age',
      actions: 'Actions',
      healthy: 'Healthy',
      sick: 'Sick',
      attention: 'Needs Attention',
      critical: 'Critical',
      edit: 'Edit',
      delete: 'Delete',
      vaccinate: 'Vaccinate',
      track: 'Track',
      sell: 'Sell'
    },
    or: {
      name: 'Maqaa',
      type: 'Gosa',
      breed: 'Sanyii',
      health: 'Fayyaa',
      weight: 'Ulfaatina',
      age: 'Umurii',
      actions: 'Gochaalee',
      healthy: 'Fayyaa',
      sick: 'Dhukkuba',
      attention: 'Xiyyeeffannaa Barbaada',
      critical: 'Murteessaa',
      edit: 'Jijjiiri',
      delete: 'Haqi',
      vaccinate: 'Walaloo',
      track: 'Hordofi',
      sell: 'Gurguri'
    },
    sw: {
      name: 'Jina',
      type: 'Aina',
      breed: 'Aina',
      health: 'Afya',
      weight: 'Uzito',
      age: 'Umri',
      actions: 'Vitendo',
      healthy: 'Mzuri',
      sick: 'Mgonjwa',
      attention: 'Inahitaji Umakini',
      critical: 'Hatari',
      edit: 'Hariri',
      delete: 'Futa',
      vaccinate: 'Chanjo',
      track: 'Fuatilia',
      sell: 'Uza'
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

  const handleEdit = (animal: AnimalData) => {
    setSelectedAnimal(animal);
    openModal('registration');
  };

  const handleDelete = async (animalId: string) => {
    if (!user) return;
    const originalAnimals = useAnimalStore.getState().animals;
    removeAnimalFromStore(animalId);
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', animalId)
      .eq('user_id', user.id);
    if (error) {
      useAnimalStore.setState({ animals: originalAnimals });
      toast.error("Failed to delete animal.");
    } else {
      toast.success("Animal deleted successfully.");
    }
  };

  const handleVaccinate = (animal: AnimalData) => openModal('vaccination', animal);
  const handleTrack = (animal: AnimalData) => openModal('weight', animal);
  const handleSell = (animal: AnimalData) => logger.info('Selling animal', { animal });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.name}</TableHead>
            <TableHead>{t.type}</TableHead>
            <TableHead>{t.breed}</TableHead>
            <TableHead>{t.health}</TableHead>
            <TableHead>{t.weight}</TableHead>
            <TableHead>{t.age}</TableHead>
            <TableHead>{t.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animals.map((animal) => (
            <TableRow key={animal.id}>
              <TableCell className="font-medium">{animal.name}</TableCell>
              <TableCell>{animal.type}</TableCell>
              <TableCell>{animal.breed}</TableCell>
              <TableCell>
                <Badge className={getHealthBadgeColor(animal.health_status)}>
                  {t[animal.health_status as keyof typeof t] || animal.health_status}
                </Badge>
              </TableCell>
              <TableCell>{animal.weight ? `${animal.weight}kg` : '-'}</TableCell>
              <TableCell>{animal.age ? `${animal.age}y` : '-'}</TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(animal)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleVaccinate(animal)}>
                    <Syringe className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleTrack(animal)}>
                    <TrendingUp className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleSell(animal)}>
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(animal.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};