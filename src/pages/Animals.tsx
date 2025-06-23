import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Upload, Filter, Download, Users, Heart, AlertTriangle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useToast } from '@/hooks/use-toast';
import { AnimalRegistrationForm } from '@/components/AnimalRegistrationForm';
import { AnimalsListView } from '@/components/AnimalsListView';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { InteractiveSummaryCard } from '@/components/InteractiveSummaryCard';
import { VaccinationForm } from '@/components/VaccinationForm';
import { AnimalsFilters } from '@/components/AnimalsFilters';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import { AnimalData } from '@/types';
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
        setAnimals(data || []);
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
        description: language === 'am' ? 'እንስሳትን ከመስመር ውጭ መሰረዝ አይቻልም' : 
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

  const translations = {
    am: {
      title: 'የእንስሳዎች አስተዳደር',
      subtitle: 'እንስሳዎችዎን ይመዝግቡ እና ያስተዳድሩ',
      addAnimal: 'እንስሳ ይጨምሩ',
      bulkImport: 'ጅምላ አስመጣ',
      filter: 'ማጣሪያ',
      export: 'ወደ ውጭ አውጣ',
      totalAnimals: 'ጠቅላላ እንስሳት',
      healthy: 'ጤናማ',
      needAttention: 'ትኩረት ያስፈልጋል',
      verified: 'የተረጋገጠ',
      searchAnimals: 'እንስሳዎችን ይፈልጉ...'
    },
    en: {
      title: 'Animals Management',
      subtitle: 'Register and manage your animals',
      addAnimal: 'Add Animal',
      bulkImport: 'Bulk Import',
      filter: 'Filter',
      export: 'Export',
      totalAnimals: 'Total Animals',
      healthy: 'Healthy',
      needAttention: 'Need Attention',
      verified: 'Verified',
      searchAnimals: 'Search animals...'
    },
    or: {
      title: 'Bulchiinsa Horii',
      subtitle: 'Horii keessan galmeessaa fi bulchaa',
      addAnimal: 'Horii Dabaluu',
      bulkImport: 'Baay\'ee Galchuu',
      filter: 'Calaqqisiisu',
      export: 'Gadi Baasuu',
      totalAnimals: 'Horii Hundaa',
      healthy: 'Fayyaa',
      needAttention: 'Xalayaa Barbaada',
      verified: 'Mirkaneeffame',
      searchAnimals: 'Horii barbaadi...'
    },
    sw: {
      title: 'Usimamizi wa Wanyamapori',
      subtitle: 'Sajili na dhibiti wanyamapori wako',
      addAnimal: 'Ongeza Mnyama',
      bulkImport: 'Ingiza Wingi',
      filter: 'Chuja',
      export: 'Hamisha',
      totalAnimals: 'Jumla ya Wanyama',
      healthy: 'Wenye Afya',
      needAttention: 'Inahitaji Uangalifu',
      verified: 'Imethibitishwa',
      searchAnimals: 'Tafuta wanyama...'
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Page Title */}
        <div className="text-center px-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            🐄 {t.title}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
            {t.subtitle}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Button 
            onClick={handleAddAnimal}
            className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            <span className="font-medium text-center leading-tight">{t.addAnimal}</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={handleBulkImport}
            className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-500" />
            <span className="font-medium text-center leading-tight">{t.bulkImport}</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 border-purple-200 hover:bg-purple-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-500" />
            <span className="font-medium text-center leading-tight">{t.filter}</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={handleExport}
            className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 border-green-200 hover:bg-green-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-500" />
            <span className="font-medium text-center leading-tight">{t.export}</span>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <InteractiveSummaryCard
            title="Total Animals"
            titleAm="ጠቅላላ እንስሳት"
            titleOr="Horii Hundaa"
            titleSw="Jumla ya Wanyama"
            value={animals.length}
            icon={<Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            color="blue"
            language={language}
          />
          
          <InteractiveSummaryCard
            title="Healthy"
            titleAm="ጤናማ"
            titleOr="Fayyaa"
            titleSw="Wenye Afya"
            value={animals.filter(a => a.health_status === 'healthy').length}
            icon={<Heart className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            color="green"
            language={language}
          />

          <InteractiveSummaryCard
            title="Need Attention"
            titleAm="ትኩረት ያስፈልጋል"
            titleOr="Xalayaa Barbaada"
            titleSw="Inahitaji Uangalifu"
            value={animals.filter(a => a.health_status === 'attention').length}
            icon={<AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            color="yellow"
            language={language}
          />

          <InteractiveSummaryCard
            title="Verified"
            titleAm="የተረጋገጠ"
            titleOr="Mirkaneeffame"
            titleSw="Imethibitishwa"
            value={animals.filter(a => a.is_vet_verified).length}
            icon={<Shield className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            color="purple"
            language={language}
          />
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex-1 max-w-md">
            <Input
              placeholder={t.searchAnimals}
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
