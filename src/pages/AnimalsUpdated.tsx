
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ArrowUpDown,
  MoreVertical,
  Syringe,
  TrendingUp,
  DollarSign,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernAnimalCard } from '@/components/ModernAnimalCard';
import { AnimalTableView } from '@/components/AnimalTableView';
import { EnhancedAnimalRegistrationForm } from '@/components/EnhancedAnimalRegistrationForm';
import { VaccinationForm } from '@/components/VaccinationForm';
import { MarketListingForm } from '@/components/MarketListingForm';
import { EnhancedOfflineIndicator } from '@/components/EnhancedOfflineIndicator';

interface AnimalData {
  id: string;
  animal_code: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  health_status: 'healthy' | 'attention' | 'sick';
  photo_url?: string;
  is_vet_verified: boolean;
  tracker_id?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  birth_date?: string;
  last_vaccination?: string;
  parent_id?: string;
}

export const AnimalsUpdated = () => {
  const [animals, setAnimals] = useState<AnimalData[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<AnimalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [showMarketForm, setShowMarketForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalData | null>(null);
  const [editingAnimal, setEditingAnimal] = useState<AnimalData | null>(null);

  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchAnimals();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [animals, searchQuery, filterType, filterHealth, sortBy, sortOrder]);

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure health_status is properly typed
      const typedData = (data || []).map(animal => ({
        ...animal,
        health_status: animal.health_status as 'healthy' | 'attention' | 'sick'
      }));
      
      setAnimals(typedData);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'እንስሳትን ማምጣት አልተሳካም' : 'Failed to fetch animals',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...animals];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(animal => 
        animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.animal_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(animal => animal.type === filterType);
    }

    // Apply health filter
    if (filterHealth !== 'all') {
      filtered = filtered.filter(animal => animal.health_status === filterHealth);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'age':
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 'weight':
          aValue = a.weight || 0;
          bValue = b.weight || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    setFilteredAnimals(filtered);
  };

  const handleDeleteAnimal = async (animalId: string) => {
    const confirmed = window.confirm(
      language === 'am' 
        ? 'እንስሳውን ማጥፋት እርግጠኛ ነዎት?' 
        : 'Are you sure you want to delete this animal?'
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', animalId);

      if (error) throw error;

      toast({
        title: language === 'am' ? 'ተሳክቷል' : 'Success',
        description: language === 'am' ? 'እንስሳ ተጠፋ' : 'Animal deleted successfully'
      });

      fetchAnimals();
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'እንስሳ ማጥፋት አልተሳካም' : 'Failed to delete animal',
        variant: 'destructive'
      });
    }
  };

  const handleEditAnimal = (animal: AnimalData) => {
    setEditingAnimal(animal);
    setShowRegistrationForm(true);
  };

  const handleVaccinate = (animal: AnimalData) => {
    setSelectedAnimal(animal);
    setShowVaccinationForm(true);
  };

  const handleSell = (animal: AnimalData) => {
    setSelectedAnimal(animal);
    setShowMarketForm(true);
  };

  const getHealthStatusBadge = (status: string) => {
    const statusMap = {
      healthy: { color: 'bg-green-100 text-green-800', text: language === 'am' ? 'ጤናማ' : 'Healthy' },
      attention: { color: 'bg-yellow-100 text-yellow-800', text: language === 'am' ? 'ትኩረት' : 'Attention' },
      sick: { color: 'bg-red-100 text-red-800', text: language === 'am' ? 'ታማሚ' : 'Sick' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.healthy;
    return <Badge className={statusInfo.color}>{statusInfo.text}</Badge>;
  };

  const getTypeEmoji = (type: string) => {
    const typeMap: Record<string, string> = {
      cattle: '🐄',
      goat: '🐐',
      sheep: '🐑',
      poultry: '🐔'
    };
    return typeMap[type] || '🐾';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'am' ? 'እየጠበቀ...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <EnhancedOfflineIndicator />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'am' ? 'የእንስሳ ዝርዝር' : 'My Animals'}
          </h1>
          <Button
            onClick={() => setShowRegistrationForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'am' ? 'አዲስ እንስሳ' : 'Add Animal'}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={language === 'am' ? 'ስም ወይም ID በመተየብ ይፈልጉ...' : 'Search by name or ID...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={language === 'am' ? 'አይነት' : 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'am' ? 'ሁሉም' : 'All'}</SelectItem>
                <SelectItem value="cattle">{language === 'am' ? 'ከብት' : 'Cattle'}</SelectItem>
                <SelectItem value="goat">{language === 'am' ? 'ፍየል' : 'Goat'}</SelectItem>
                <SelectItem value="sheep">{language === 'am' ? 'በግ' : 'Sheep'}</SelectItem>
                <SelectItem value="poultry">{language === 'am' ? 'ዶሮ' : 'Poultry'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterHealth} onValueChange={setFilterHealth}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={language === 'am' ? 'ጤና' : 'Health'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'am' ? 'ሁሉም' : 'All'}</SelectItem>
                <SelectItem value="healthy">{language === 'am' ? 'ጤናማ' : 'Healthy'}</SelectItem>
                <SelectItem value="attention">{language === 'am' ? 'ትኩረት' : 'Attention'}</SelectItem>
                <SelectItem value="sick">{language === 'am' ? 'ታማሚ' : 'Sick'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={language === 'am' ? 'ደርድር' : 'Sort'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{language === 'am' ? 'ስም' : 'Name'}</SelectItem>
                <SelectItem value="age">{language === 'am' ? 'እድሜ' : 'Age'}</SelectItem>
                <SelectItem value="weight">{language === 'am' ? 'ክብደት' : 'Weight'}</SelectItem>
                <SelectItem value="created_at">{language === 'am' ? 'ቀን' : 'Date'}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {filteredAnimals.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <div className="text-6xl mb-4">🐄</div>
              <h3 className="text-lg font-semibold mb-2">
                {language === 'am' ? 'እንስሳ አልተገኘም' : 'No Animals Found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {language === 'am' 
                  ? 'የመጀመሪያውን እንስሳ ይመዝግቡ ወይም የፍለጋ ተፅዕኖዎን ይለውጡ'
                  : 'Register your first animal or adjust your search filters'
                }
              </p>
              <Button
                onClick={() => setShowRegistrationForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'am' ? 'እንስሳ ይመዝግቡ' : 'Register Animal'}
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnimals.map((animal) => (
              <ModernAnimalCard
                key={animal.id}
                animal={animal}
                language={language}
                onEdit={() => handleEditAnimal(animal)}
                onDelete={() => handleDeleteAnimal(animal.id)}
                onVaccinate={() => handleVaccinate(animal)}
                onSell={() => handleSell(animal)}
              />
            ))}
          </div>
        ) : (
          <AnimalTableView
            animals={filteredAnimals}
            language={language}
            onEdit={handleEditAnimal}
            onDelete={handleDeleteAnimal}
            onVaccinate={handleVaccinate}
            onSell={handleSell}
          />
        )}
      </div>

      {/* Forms */}
      {showRegistrationForm && (
        <EnhancedAnimalRegistrationForm
          language={language}
          onClose={() => {
            setShowRegistrationForm(false);
            setEditingAnimal(null);
          }}
          onSuccess={() => {
            fetchAnimals();
            setShowRegistrationForm(false);
            setEditingAnimal(null);
          }}
          editAnimal={editingAnimal}
        />
      )}

      {showVaccinationForm && (
        <VaccinationForm
          language={language}
          onClose={() => {
            setShowVaccinationForm(false);
            setSelectedAnimal(null);
          }}
          mode="single"
          preSelectedAnimal={selectedAnimal?.id}
        />
      )}

      {showMarketForm && (
        <MarketListingForm
          language={language}
          onClose={() => {
            setShowMarketForm(false);
            setSelectedAnimal(null);
          }}
          onSuccess={() => {
            setShowMarketForm(false);
            setSelectedAnimal(null);
          }}
        />
      )}
    </div>
  );
};
