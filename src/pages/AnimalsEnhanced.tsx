
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { transformAnimalData, AnimalData } from '@/types';
import { EnhancedAnimalCard } from '@/components/EnhancedAnimalCard';
import { AnimalTableView } from '@/components/AnimalTableView';
import { AnimalsSummaryCards } from '@/components/AnimalsSummaryCards';
import { QuickActionButtons } from '@/components/QuickActionButtons';
import { MilkProductionForm } from '@/components/MilkProductionForm';
import { LoadingSpinnerEnhanced } from '@/components/LoadingSpinnerEnhanced';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid, List, Search, SlidersHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const AnimalsEnhanced = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showMilkForm, setShowMilkForm] = useState(false);

  const { data: animals = [], isLoading, error } = useQuery({
    queryKey: ['animals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(transformAnimalData);
    },
    enabled: !!user
  });

  // Filter animals based on search and filters
  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.animal_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || animal.type.toLowerCase() === filterType.toLowerCase();
    const matchesHealth = filterHealth === 'all' || animal.health_status === filterHealth;
    
    return matchesSearch && matchesType && matchesHealth;
  });

  // Calculate summary data
  const summaryData = {
    totalAnimals: animals.length,
    healthyAnimals: animals.filter(a => a.health_status === 'healthy').length,
    sickAnimals: animals.filter(a => a.health_status === 'sick').length,
    needsAttention: animals.filter(a => a.health_status === 'attention').length,
    vaccinatedAnimals: animals.filter(a => a.is_vet_verified).length,
    recentlyAdded: animals.filter(a => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.created_at) > weekAgo;
    }).length
  };

  const translations = {
    am: {
      title: 'እንስሳዎች',
      search: 'ፈልግ...',
      allTypes: 'ሁሉም ዓይነቶች',
      allHealth: 'ሁሉም ጤንነት',
      noAnimals: 'እንስሳ አልተመዘገበም',
      loading: 'እንስሳዎች በመጫን ላይ...'
    },
    en: {
      title: 'Animals',
      search: 'Search...',
      allTypes: 'All Types',
      allHealth: 'All Health Status',
      noAnimals: 'No animals registered',
      loading: 'Loading animals...'
    },
    or: {
      title: 'Horollee',
      search: 'Barbaadi...',
      allTypes: 'Gosa Hundaa',
      allHealth: 'Fayyaa Hundaa',
      noAnimals: 'Horii hin galmeeffamne',
      loading: 'Horollee fe\'aa jiru...'
    },
    sw: {
      title: 'Wanyama',
      search: 'Tafuta...',
      allTypes: 'Aina Zote',
      allHealth: 'Hali Zote za Afya',
      noAnimals: 'Hakuna wanyama waliosajiliwa',
      loading: 'Inapakia wanyama...'
    }
  };

  const t = translations[language];

  const handleEdit = (animal: AnimalData) => {
    console.log('Edit animal:', animal);
  };

  const handleDelete = (animalId: string) => {
    console.log('Delete animal:', animalId);
  };

  const handleVaccinate = (animal: AnimalData) => {
    console.log('Vaccinate animal:', animal);
  };

  const handleTrack = (animal: AnimalData) => {
    console.log('Track animal:', animal);
  };

  const handleSell = (animal: AnimalData) => {
    console.log('Sell animal:', animal);
  };

  const handleMilkRecord = (animal: AnimalData) => {
    setShowMilkForm(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinnerEnhanced size="lg" text={t.loading} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="transition-all duration-200"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="transition-all duration-200"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <AnimalsSummaryCards language={language} summaryData={summaryData} />

        {/* Quick Actions */}
        <QuickActionButtons
          language={language}
          onAddAnimal={() => console.log('Add animal')}
          onRecordMilk={() => setShowMilkForm(true)}
          onAddFinancial={() => console.log('Add financial')}
          onViewAnalytics={() => console.log('View analytics')}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.allTypes} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allTypes}</SelectItem>
                      <SelectItem value="cattle">Cattle</SelectItem>
                      <SelectItem value="goat">Goat</SelectItem>
                      <SelectItem value="sheep">Sheep</SelectItem>
                      <SelectItem value="poultry">Poultry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={filterHealth} onValueChange={setFilterHealth}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.allHealth} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allHealth}</SelectItem>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="attention">Needs Attention</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Animals Display */}
        {filteredAnimals.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 text-lg">{t.noAnimals}</p>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimals.map((animal) => (
              <EnhancedAnimalCard
                key={animal.id}
                animal={animal}
                language={language}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onVaccinate={handleVaccinate}
                onTrack={handleTrack}
                onSell={handleSell}
                onMilkRecord={handleMilkRecord}
              />
            ))}
          </div>
        ) : (
          <Card className="p-4">
            <AnimalTableView
              animals={filteredAnimals}
              language={language}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onVaccinate={handleVaccinate}
              onTrack={handleTrack}
              onSell={handleSell}
            />
          </Card>
        )}
      </div>

      {/* Milk Production Form Modal */}
      <Dialog open={showMilkForm} onOpenChange={setShowMilkForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Milk Production</DialogTitle>
          </DialogHeader>
          <MilkProductionForm
            language={language}
            onSuccess={() => setShowMilkForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
