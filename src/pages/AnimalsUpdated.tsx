
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { EnhancedAnimalRegistrationForm } from '@/components/EnhancedAnimalRegistrationForm';
import { EnhancedOfflineIndicator } from '@/components/EnhancedOfflineIndicator';
import { VaccinationForm } from '@/components/VaccinationForm';
import { MarketListingForm } from '@/components/MarketListingForm';
import { AnimalsFilters } from '@/components/AnimalsFilters';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import { AnimalsListView } from '@/components/AnimalsListView';

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

  const handleVaccinationClose = () => {
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
        <div className="flex flex-wrap gap-2 items-end justify-between">
          <div className="flex-1 min-w-64">
            <AnimalsFilters
              language={language}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              healthFilter={healthFilter}
              onHealthFilterChange={setHealthFilter}
            />
          </div>

          {/* View Mode Toggle */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimalsListView
          animals={filteredAnimals}
          viewMode={viewMode}
          language={language}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onVaccinate={handleVaccinate}
          onTrack={handleTrack}
          onSell={handleSell}
          onShowRegistrationForm={() => setShowRegistrationForm(true)}
        />
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
          onClose={handleVaccinationClose}
        />
      )}

      {/* Market Listing Form Modal */}
      {showMarketListingForm && selectedAnimal && (
        <MarketListingForm
          language={language}
          onClose={() => setShowMarketListingForm(false)}
          onSuccess={handleMarketSuccess}
        />
      )}
    </div>
  );
};

export default AnimalsUpdated;
