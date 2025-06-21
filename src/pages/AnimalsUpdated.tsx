
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Grid, List, SortAsc, SortDesc } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernAnimalCard } from '@/components/ModernAnimalCard';
import { AnimalTableView } from '@/components/AnimalTableView';
import { EnhancedAnimalRegistrationForm } from '@/components/EnhancedAnimalRegistrationForm';
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
  health_status: 'healthy' | 'attention' | 'sick';
  last_vaccination?: string;
  is_vet_verified: boolean;
  created_at: string;
  photo_url?: string;
  tracker_id?: string;
}

type ViewMode = 'card' | 'table';
type SortField = 'name' | 'type' | 'age' | 'weight' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function AnimalsUpdated() {
  const { language } = useLanguage();
  const { toast } = useToast();

  // State management
  const [animals, setAnimals] = useState<AnimalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Modal states
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [editAnimal, setEditAnimal] = useState<AnimalData | null>(null);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [selectedAnimalForVaccination, setSelectedAnimalForVaccination] = useState<AnimalData | null>(null);
  const [showMarketForm, setShowMarketForm] = useState(false);
  const [selectedAnimalForSale, setSelectedAnimalForSale] = useState<AnimalData | null>(null);

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'እንስሳት ማምጣት አልተሳካም' : 'Failed to fetch animals',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnimal = async (animalId: string) => {
    if (!confirm(language === 'am' ? 'እንስሳን መሰረዝ ይፈልጋሉ?' : 'Are you sure you want to delete this animal?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', animalId);

      if (error) throw error;

      setAnimals(animals.filter(animal => animal.id !== animalId));
      toast({
        title: language === 'am' ? 'ተሳክቷል' : 'Success',
        description: language === 'am' ? 'እንስሳ ተሰርዟል' : 'Animal deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'እንስሳ መሰረዝ አልተሳካም' : 'Failed to delete animal',
        variant: 'destructive'
      });
    }
  };

  const handleEditAnimal = (animal: AnimalData) => {
    setEditAnimal(animal);
    setShowRegistrationForm(true);
  };

  const handleVaccinate = (animal: AnimalData) => {
    setSelectedAnimalForVaccination(animal);
    setShowVaccinationForm(true);
  };

  const handleTrack = (animal: AnimalData) => {
    // Navigate to detailed tracking view
    toast({
      title: language === 'am' ? 'ክትትል' : 'Tracking',
      description: language === 'am' 
        ? `${animal.name} የክትትል መረጃ` 
        : `Tracking details for ${animal.name}`
    });
  };

  const handleSell = (animal: AnimalData) => {
    setSelectedAnimalForSale(animal);
    setShowMarketForm(true);
  };

  const handleRegistrationSuccess = () => {
    fetchAnimals();
    setShowRegistrationForm(false);
    setEditAnimal(null);
  };

  const handleVaccinationSuccess = () => {
    fetchAnimals();
    setShowVaccinationForm(false);
    setSelectedAnimalForVaccination(null);
  };

  const handleMarketSuccess = () => {
    setShowMarketForm(false);
    setSelectedAnimalForSale(null);
  };

  // Filter and sort animals
  const filteredAndSortedAnimals = animals
    .filter(animal => {
      const matchesSearch = animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           animal.animal_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           animal.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           animal.tracker_id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || animal.type === typeFilter;
      const matchesHealth = healthFilter === 'all' || animal.health_status === healthFilter;
      
      return matchesSearch && matchesType && matchesHealth;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle undefined values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getAnimalStats = () => {
    const total = animals.length;
    const healthy = animals.filter(a => a.health_status === 'healthy').length;
    const needsAttention = animals.filter(a => a.health_status === 'attention').length;
    const sick = animals.filter(a => a.health_status === 'sick').length;

    return { total, healthy, needsAttention, sick };
  };

  const stats = getAnimalStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'am' ? 'እንስሳት እየተጫኑ...' : 'Loading animals...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 space-y-6">
      <EnhancedOfflineIndicator language={language} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'am' ? 'የእኔ እንስሳት' : 'My Animals'}
          </h1>
          <p className="text-gray-600">
            {language === 'am' 
              ? `ጠቅላላ ${stats.total} እንስሳት` 
              : `Total ${stats.total} animals`
            }
          </p>
        </div>
        <Button
          onClick={() => setShowRegistrationForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {language === 'am' ? 'እንስሳ ይጨምሩ' : 'Add Animal'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">
              {language === 'am' ? 'ጠቅላላ' : 'Total'}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
            <div className="text-sm text-gray-600">
              {language === 'am' ? 'ጤናማ' : 'Healthy'}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.needsAttention}</div>
            <div className="text-sm text-gray-600">
              {language === 'am' ? 'ትኩረት' : 'Attention'}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.sick}</div>
            <div className="text-sm text-gray-600">
              {language === 'am' ? 'ታማሚ' : 'Sick'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder={language === 'am' ? 'እንስሳት ይፈልጉ...' : 'Search animals...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
              className="px-3"
            >
              {viewMode === 'card' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-2">
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('name')}
              className="flex items-center space-x-1"
            >
              <span>{language === 'am' ? 'ስም' : 'Name'}</span>
              {sortField === 'name' && (
                sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('created_at')}
              className="flex items-center space-x-1"
            >
              <span>{language === 'am' ? 'ቀን' : 'Date'}</span>
              {sortField === 'created_at' && (
                sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Animals Display */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedAnimals.map((animal) => (
            <ModernAnimalCard
              key={animal.id}
              animal={{
                ...animal,
                tracker_id: animal.tracker_id || ''
              }}
              language={language}
              onEdit={() => handleEditAnimal(animal)}
              onDelete={() => handleDeleteAnimal(animal.id)}
              onVaccinate={() => handleVaccinate(animal)}
              onTrack={() => handleTrack(animal)}
              onSell={() => handleSell(animal)}
            />
          ))}
        </div>
      ) : (
        <AnimalTableView
          animals={filteredAndSortedAnimals}
          language={language}
          onEdit={handleEditAnimal}
          onDelete={handleDeleteAnimal}
          onVaccinate={handleVaccinate}
          onTrack={handleTrack}
          onSell={handleSell}
        />
      )}

      {filteredAndSortedAnimals.length === 0 && (
        <Card className="bg-white shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="text-gray-500 mb-4">
              <Grid className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {language === 'am' ? 'ምንም እንስሳ አልተገኘም' : 'No animals found'}
              </h3>
              <p className="text-sm">
                {searchQuery || typeFilter !== 'all' || healthFilter !== 'all'
                  ? (language === 'am' ? 'የፍለጋ መስፈርቶችዎን ይለውጡ' : 'Try adjusting your search criteria')
                  : (language === 'am' ? 'የመጀመሪያ እንስሳ ይጨምሩ' : 'Add your first animal')
                }
              </p>
            </div>
            {!(searchQuery || typeFilter !== 'all' || healthFilter !== 'all') && (
              <Button
                onClick={() => setShowRegistrationForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'am' ? 'እንስሳ ይጨምሩ' : 'Add Animal'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <EnhancedAnimalRegistrationForm
          language={language}
          onClose={() => {
            setShowRegistrationForm(false);
            setEditAnimal(null);
          }}
          onSuccess={handleRegistrationSuccess}
          editAnimal={editAnimal}
        />
      )}

      {/* Vaccination Form Modal */}
      {showVaccinationForm && selectedAnimalForVaccination && (
        <VaccinationForm
          language={language}
          animal={selectedAnimalForVaccination}
          onClose={() => {
            setShowVaccinationForm(false);
            setSelectedAnimalForVaccination(null);
          }}
          onSuccess={handleVaccinationSuccess}
        />
      )}

      {/* Market Listing Form Modal */}
      {showMarketForm && selectedAnimalForSale && (
        <MarketListingForm
          language={language}
          animal={selectedAnimalForSale}
          onClose={() => {
            setShowMarketForm(false);
            setSelectedAnimalForSale(null);
          }}
          onSuccess={handleMarketSuccess}
        />
      )}
    </div>
  );
}
