import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Grid, List, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { EnhancedAnimalRegistrationForm } from '@/components/EnhancedAnimalRegistrationForm';
import { ModernAnimalCard } from '@/components/ModernAnimalCard';
import { AnimalTableView } from '@/components/AnimalTableView';
import { EnhancedOfflineIndicator } from '@/components/EnhancedOfflineIndicator';
import { VaccinationForm } from '@/components/VaccinationForm';
import { MarketListingForm } from '@/components/MarketListingForm';

interface AnimalData {
  id: string;
  name: string;
  animal_code: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  photo_url?: string;
  health_status: 'healthy' | 'attention' | 'sick';
  healthStatus: 'healthy' | 'attention' | 'sick';
  last_vaccination?: string;
  is_vet_verified: boolean;
  created_at: string;
  tracker_id?: string;
}

export const AnimalsUpdated = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [animals, setAnimals] = useState<AnimalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<AnimalData | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  
  // Modal states
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [showMarketListingForm, setShowMarketListingForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalData | null>(null);

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our AnimalData interface
      const transformedData = data?.map(animal => ({
        ...animal,
        health_status: (animal.health_status || 'healthy') as 'healthy' | 'attention' | 'sick',
        healthStatus: (animal.health_status || 'healthy') as 'healthy' | 'attention' | 'sick'
      })) || [];
      
      setAnimals(transformedData);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'እንስሳት አልተሳካም' : 'Failed to fetch animals',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         animal.animal_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         animal.breed?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || animal.type === typeFilter;
    const matchesHealth = healthFilter === 'all' || animal.health_status === healthFilter;
    
    return matchesSearch && matchesType && matchesHealth;
  });

  const handleEdit = (animal: AnimalData) => {
    setEditingAnimal(animal);
    setShowRegistrationForm(true);
  };

  const handleDelete = async (animalId: string) => {
    try {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', animalId);

      if (error) throw error;

      toast({
        title: language === 'am' ? 'ተሳክቷል' : 'Success',
        description: language === 'am' ? 'እንስሳ ተሰርዟል' : 'Animal deleted successfully'
      });

      fetchAnimals();
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'እንስሳ መሰረዝ አልተሳካም' : 'Failed to delete animal',
        variant: 'destructive'
      });
    }
  };

  const handleVaccinate = (animal: AnimalData) => {
    setSelectedAnimal(animal);
    setShowVaccinationForm(true);
  };

  const handleTrack = (animal: AnimalData) => {
    // Navigate to tracking/growth page for this animal
    toast({
      title: language === 'am' ? 'ክትትል' : 'Tracking',
      description: language === 'am' ? 'የእንስሳ ክትትል ገጽ' : 'Animal tracking page'
    });
  };

  const handleSell = (animal: AnimalData) => {
    setSelectedAnimal(animal);
    setShowMarketListingForm(true);
  };

  const handleRegistrationSuccess = () => {
    fetchAnimals();
    setShowRegistrationForm(false);
  };

  const handleVaccinationSuccess = () => {
    fetchAnimals();
    setShowVaccinationForm(false);
    setSelectedAnimal(null);
  };

  const handleMarketSuccess = () => {
    fetchAnimals();
    setShowMarketListingForm(false);
    setSelectedAnimal(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'am' ? 'እየተጠበቀ...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      {/* Enhanced Offline Indicator */}
      <EnhancedOfflineIndicator language={language} />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'am' ? 'እንስሳቶቼ' : 'My Animals'}
          </h1>
          <Button
            onClick={() => setShowRegistrationForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'am' ? 'እንስሳ ጨምር' : 'Add Animal'}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder={language === 'am' ? 'እንስሳት ይፈልጉ...' : 'Search animals...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={language === 'am' ? 'አይነት' : 'Type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'am' ? 'ሁሉም' : 'All'}
                  </SelectItem>
                  <SelectItem value="cattle">
                    {language === 'am' ? 'ከብት' : 'Cattle'}
                  </SelectItem>
                  <SelectItem value="poultry">
                    {language === 'am' ? 'ዶሮ' : 'Poultry'}
                  </SelectItem>
                  <SelectItem value="goat">
                    {language === 'am' ? 'ፍየል' : 'Goat'}
                  </SelectItem>
                  <SelectItem value="sheep">
                    {language === 'am' ? 'በግ' : 'Sheep'}
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={healthFilter} onValueChange={setHealthFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={language === 'am' ? 'ጤንነት' : 'Health'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'am' ? 'ሁሉም' : 'All'}
                  </SelectItem>
                  <SelectItem value="healthy">
                    {language === 'am' ? 'ጤናማ' : 'Healthy'}
                  </SelectItem>
                  <SelectItem value="attention">
                    {language === 'am' ? 'ትኩረት' : 'Attention'}
                  </SelectItem>
                  <SelectItem value="sick">
                    {language === 'am' ? 'ታማሚ' : 'Sick'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                onClick={() => setViewMode('card')}
                className="h-8 px-3"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                onClick={() => setViewMode('table')}
                className="h-8 px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredAnimals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500 mb-4">
                {language === 'am' ? 'ምንም እንስሳ አልተገኘም' : 'No animals found'}
              </div>
              <Button
                onClick={() => setShowRegistrationForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'am' ? 'የመጀመሪያ እንስሳዎን ይመዝግቡ' : 'Register Your First Animal'}
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnimals.map((animal) => (
              <ModernAnimalCard
                key={animal.id}
                animal={{
                  id: animal.id,
                  name: animal.name,
                  type: animal.type,
                  breed: animal.breed,
                  age: animal.age?.toString(),
                  weight: animal.weight?.toString(),
                  photo: animal.photo_url,
                  lastVaccination: animal.last_vaccination,
                  healthStatus: animal.health_status
                }}
                language={language}
                onClick={() => handleEdit(animal)}
              />
            ))}
          </div>
        ) : (
          <AnimalTableView
            animals={filteredAnimals}
            language={language}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onVaccinate={handleVaccinate}
            onTrack={handleTrack}
            onSell={handleSell}
          />
        )}
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <EnhancedAnimalRegistrationForm
          language={language}
          onClose={() => {
            setShowRegistrationForm(false);
            setEditingAnimal(null);
          }}
          onSuccess={handleRegistrationSuccess}
          editAnimal={editingAnimal}
        />
      )}

      {/* Vaccination Form Modal */}
      {showVaccinationForm && selectedAnimal && (
        <VaccinationForm
          language={language}
          mode="single"
          preSelectedAnimal={selectedAnimal.id}
          onClose={handleVaccinationSuccess}
        />
      )}

      {/* Market Listing Form Modal */}
      {showMarketListingForm && selectedAnimal && (
        <MarketListingForm
          language={language}
          onClose={() => setShowMarketListingForm(false)}
          onSuccess={() => {
            setShowMarketListingForm(false);
            fetchAnimals();
          }}
        />
      )}
    </div>
  );
};

export default AnimalsUpdated;
