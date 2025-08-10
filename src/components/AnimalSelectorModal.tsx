
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Search } from 'lucide-react';
import { AnimalData, Language, transformAnimalData } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AnimalIdDisplay } from './AnimalIdDisplay';

interface AnimalSelectorModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (animal: AnimalData) => void;
  title?: string;
}

export const AnimalSelectorModal = ({
  language,
  isOpen,
  onClose,
  onSelect,
  title
}: AnimalSelectorModalProps) => {
  const [animals, setAnimals] = useState<AnimalData[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<AnimalData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const translations = {
    am: {
      selectAnimal: 'እንስሳ ይምረጡ',
      search: 'ፈልግ',
      name: 'ስም',
      type: 'ዓይነት',
      code: 'መለያ',
      select: 'ምረጥ',
      cancel: 'ሰርዝ',
      noAnimals: 'እንስሳት አልተገኙም'
    },
    en: {
      selectAnimal: 'Select Animal',
      search: 'Search',
      name: 'Name',
      type: 'Type',
      code: 'Code',
      select: 'Select',
      cancel: 'Cancel',
      noAnimals: 'No animals found'
    },
    or: {
      selectAnimal: 'Horii Filachuu',
      search: 'Barbaadi',
      name: 'Maqaa',
      type: 'Gosa',
      code: 'Lakkoofsa',
      select: 'Filadhu',
      cancel: 'Dhiisi',
      noAnimals: 'Horii hin argamne'
    },
    sw: {
      selectAnimal: 'Chagua Mnyama',
      search: 'Tafuta',
      name: 'Jina',
      type: 'Aina',
      code: 'Nambari',
      select: 'Chagua',
      cancel: 'Ghairi',
      noAnimals: 'Hakuna wanyama'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      fetchAnimals();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAnimals(animals);
    } else {
      const filtered = animals.filter(animal =>
        animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.animal_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAnimals(filtered);
    }
  }, [animals, searchQuery]);

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Transform database data to match our AnimalData interface
      const transformedAnimals = (data || []).map(transformAnimalData);
      setAnimals(transformedAnimals);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch animals',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{title || t.selectAnimal}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : filteredAnimals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t.noAnimals}
              </div>
            ) : (
              filteredAnimals.map((animal) => (
                <div
                  key={animal.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelect(animal)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{animal.name}</p>
                        <p className="text-sm text-gray-500">
                          {animal.type} • {animal.breed}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AnimalIdDisplay animalId={animal.animal_code} size="sm" />
                    <Button size="sm" variant="outline">
                      {t.select}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
