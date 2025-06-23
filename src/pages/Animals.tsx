
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useToast } from '@/hooks/use-toast';
import { AnimalRegistrationForm } from '@/components/AnimalRegistrationForm';
import { AnimalsListView } from '@/components/AnimalsListView';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { VaccinationForm } from '@/components/VaccinationForm';
import { AnimalsFilters } from '@/components/AnimalsFilters';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import { AnimalsPageHeader } from '@/components/AnimalsPageHeader';
import { AnimalsQuickActions } from '@/components/AnimalsQuickActions';
import { AnimalsSummaryCards } from '@/components/AnimalsSummaryCards';
import { AnimalData, transformAnimalData, Language } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

const Animals = () => {
  const { language } = useLanguage();
  const [animals, setAnimals] = useState<AnimalData[]>([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    breed: '',
    healthStatus: ''
  });
  const { toast } = useToast();
  const { isOnline } = useOfflineSync();

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*');

      if (error) {
        console.error('Error fetching animals:', error);
        toast({
          title: language === 'am' ? 'ስህተት' : 
                language === 'or' ? 'Dogoggora' :
                language === 'sw' ? 'Hitilafu' : 'Error',
          description: language === 'am' ? 'እንስሳትን መጫን አልተሳካም' : 
                      language === 'or' ? 'Horii fe\'uun hin milkoofne' :
                      language === 'sw' ? 'Imeshindwa kupakia wanyama' :
                      'Failed to load animals',
          variant: 'destructive'
        });
      } else {
        // Transform the data using our helper function
        const transformedData = (data || []).map(transformAnimalData);
        setAnimals(transformedData);
      }
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 
              language === 'or' ? 'Dogoggora' :
              language === 'sw' ? 'Hitilafu' : 'Error',
        description: language === 'am' ? 'እንስሳትን መጫን አልተሳካም' : 
                    language === 'or' ? 'Horii fe\'uun hin milkoofne' :
                    language === 'sw' ? 'Imeshindwa kupakia wanyama' :
                    'Failed to load animals',
        variant: 'destructive'
      });
    }
  };

  const handleAddAnimal = () => {
    setShowRegistrationForm(true);
  };

  const handleBulkImport = () => {
    toast({
      title: language === 'am' ? 'በቅርቡ ይመጣል' : 
            language === 'or' ? 'Yeroo dhiyootti dhufa' :
            language === 'sw' ? 'Inakuja Hivi Karibuni' : 'Coming Soon',
      description: language === 'am' ? 'ይህ ባህሪ በቅርቡ ይመጣል' : 
                  language === 'or' ? 'Amaloomi kun yeroo dhiyootti dhufa' :
                  language === 'sw' ? 'Kipengele hiki kinakuja hivi karibuni' :
                  'This feature is coming soon'
    });
  };

  const handleExport = () => {
    toast({
      title: language === 'am' ? 'በቅርቡ ይመጣል' : 
            language === 'or' ? 'Yeroo dhiyootti dhufa' :
            language === 'sw' ? 'Inakuja Hivi Karibuni' : 'Coming Soon',
      description: language === 'am' ? 'ይህ ባህሪ በቅርቡ ይመጣል' : 
                  language === 'or' ? 'Amaloomi kun yeroo dhiyootti dhufa' :
                  language === 'sw' ? 'Kipengele hiki kinakuja hivi karibuni' :
                  'This feature is coming soon'
    });
  };

  const handleRegistrationSuccess = () => {
    fetchAnimals();
  };

  const handleEditAnimal = (animal: AnimalData) => {
    console.log('Edit animal:', animal);
    toast({
      title: language === 'am' ? 'በቅርቡ ይመጣል' : 
            language === 'or' ? 'Yeroo dhiyootti dhufa' :
            language === 'sw' ? 'Inakuja Hivi Karibuni' : 'Coming Soon',
      description: language === 'am' ? 'ይህ ባህሪ በቅርቡ ይመጣል' : 
                  language === 'or' ? 'Amaloomi kun yeroo dhiyootti dhufa' :
                  language === 'sw' ? 'Kipengele hiki kinakuja hivi karibuni' :
                  'This feature is coming soon'
    });
  };

  const handleDeleteAnimal = async (animalId: string) => {
    if (!isOnline) {
      toast({
        title: language === 'am' ? 'ስህተት' : 
              language === 'or' ? 'Dogoggora' :
              language === 'sw' ? 'Hitilafu' : 'Error',
        description: language === 'am' ? 'እንስሳትን ከመስመር ውጪ መሰረዝ አይቻልም' : 
                    language === 'or' ? 'Horii yeroo interneetii hin jirre haquu hin danda\'amu' :
                    language === 'sw' ? 'Haiwezi kufuta wanyama wakati huna mtandao' :
                    'Cannot delete animals offline',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', animalId);

      if (error) {
        console.error('Error deleting animal:', error);
        toast({
          title: language === 'am' ? 'ስህተት' : 
                language === 'or' ? 'Dogoggora' :
                language === 'sw' ? 'Hitilafu' : 'Error',
          description: language === 'am' ? 'እንስሳትን መሰረዝ አልተሳካም' : 
                      language === 'or' ? 'Horii haquun hin milkoofne' :
                      language === 'sw' ? 'Imeshindwa kufuta mnyama' :
                      'Failed to delete animal',
          variant: 'destructive'
        });
      } else {
        fetchAnimals();
        toast({
          title: language === 'am' ? 'ተሳክቷል' : 
                language === 'or' ? 'Milkaa\'e' :
                language === 'sw' ? 'Imefanikiwa' : 'Success',
          description: language === 'am' ? 'እንስሳ በተሳካ ሁኔታ ተሰርዟል' : 
                      language === 'or' ? 'Horiin milkaa\'inaan haqame' :
                      language === 'sw' ? 'Mnyama amefutwa kwa ufanisi' :
                      'Animal deleted successfully'
        });
      }
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 
              language === 'or' ? 'Dogoggora' :
              language === 'sw' ? 'Hitilafu' : 'Error',
        description: language === 'am' ? 'እንስሳትን መሰረዝ አልተሳካም' : 
                    language === 'or' ? 'Horii haquun hin milkoofne' :
                    language === 'sw' ? 'Imeshindwa kufuta mnyama' :
                    'Failed to delete animal',
        variant: 'destructive'
      });
    }
  };

  const handleVaccinate = (animal: AnimalData) => {
    setSelectedAnimal(animal);
    setShowVaccinationForm(true);
  };

  const handleTrack = (animal: AnimalData) => {
    console.log('Track animal:', animal);
    toast({
      title: language === 'am' ? 'በቅርቡ ይመጣል' : 
            language === 'or' ? 'Yeroo dhiyootti dhufa' :
            language === 'sw' ? 'Inakuja Hivi Karibuni' : 'Coming Soon',
      description: language === 'am' ? 'ይህ ባህሪ በቅርቡ ይመጣል' : 
                  language === 'or' ? 'Amaloomi kun yeroo dhiyootti dhufa' :
                  language === 'sw' ? 'Kipengele hiki kinakuja hivi karibuni' :
                  'This feature is coming soon'
    });
  };

  const handleSell = (animal: AnimalData) => {
    console.log('Sell animal:', animal);
    toast({
      title: language === 'am' ? 'በቅርቡ ይመጣል' : 
            language === 'or' ? 'Yeroo dhiyootti dhufa' :
            language === 'sw' ? 'Inakuja Hivi Karibuni' : 'Coming Soon',
      description: language === 'am' ? 'ይህ ባህሪ በቅርቡ ይመጣል' : 
                  language === 'or' ? 'Amaloomi kun yeroo dhiyootti dhufa' :
                  language === 'sw' ? 'Kipengele hiki kinakuja hivi karibuni' :
                  'This feature is coming soon'
    });
  };

  const filteredAnimals = animals.filter(animal => {
    const searchTermLower = searchTerm.toLowerCase();
    const nameMatch = animal.name.toLowerCase().includes(searchTermLower);
    const codeMatch = animal.animal_code.toLowerCase().includes(searchTermLower);
    
    const typeMatch = filters.type ? animal.type === filters.type : true;
    const breedMatch = filters.breed ? animal.breed === filters.breed : true;
    const healthStatusMatch = filters.healthStatus ? animal.health_status === filters.healthStatus : true;

    return (nameMatch || codeMatch) && typeMatch && breedMatch && healthStatusMatch;
  });

  const searchPlaceholder = language === 'am' ? 'እንስሳዎችን ይፈልጉ...' : 
                          language === 'or' ? 'Horii barbaadi...' :
                          language === 'sw' ? 'Tafuta wanyama...' :
                          'Search animals...';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Page Title */}
        <AnimalsPageHeader language={language} />

        {/* Quick Actions */}
        <AnimalsQuickActions
          language={language}
          onAddAnimal={handleAddAnimal}
          onBulkImport={handleBulkImport}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onExport={handleExport}
        />

        {/* Summary Cards */}
        <AnimalsSummaryCards animals={animals} language={language} />

        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex-1 max-w-md">
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
            />
          </div>
          
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            language={language}
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="border-green-100">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <AnimalsFilters
                filters={filters}
                onFiltersChange={setFilters}
                language={language}
              />
            </CardContent>
          </Card>
        )}

        {/* Animals List */}
        <AnimalsListView
          animals={filteredAnimals}
          viewMode={viewMode}
          language={language}
          onEdit={handleEditAnimal}
          onDelete={handleDeleteAnimal}
          onVaccinate={handleVaccinate}
          onTrack={handleTrack}
          onSell={handleSell}
          onShowRegistrationForm={() => setShowRegistrationForm(true)}
        />
      </main>

      <BottomNavigation language={language} />

      {/* Modals */}
      {showRegistrationForm && (
        <AnimalRegistrationForm
          language={language}
          onClose={() => setShowRegistrationForm(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {showVaccinationForm && selectedAnimal && (
        <VaccinationForm
          language={language}
          animal={selectedAnimal}
          mode="single"
          onClose={() => {
            setShowVaccinationForm(false);
            setSelectedAnimal(null);
          }}
        />
      )}
    </div>
  );
};

export default Animals;
