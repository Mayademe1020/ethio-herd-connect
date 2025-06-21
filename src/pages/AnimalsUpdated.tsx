
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedAnimalRegistrationForm } from '@/components/EnhancedAnimalRegistrationForm';
import { ModernAnimalCard } from '@/components/ModernAnimalCard';
import { AnimalTableView } from '@/components/AnimalTableView';
import { InteractiveSummaryCard } from '@/components/InteractiveSummaryCard';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { EnhancedOfflineIndicator } from '@/components/EnhancedOfflineIndicator';
import { Plus, Search, Filter, Users, Heart, AlertTriangle, CheckCircle, Download, Grid, Table, Syringe, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface Animal {
  id: string;
  animal_code: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  photo_url?: string;
  health_status: 'healthy' | 'attention' | 'sick';
  last_vaccination?: string;
  is_vet_verified: boolean;
  created_at: string;
  tracker_id?: string;
}

const AnimalsUpdated = () => {
  const { language } = useLanguage();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  
  const { toast } = useToast();

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
      
      const typedAnimals: Animal[] = (data || []).map(animal => ({
        ...animal,
        health_status: animal.health_status as 'healthy' | 'attention' | 'sick'
      }));
      
      setAnimals(typedAnimals);
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

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         animal.animal_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         animal.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         animal.tracker_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || animal.type === typeFilter;
    const matchesHealth = healthFilter === 'all' || animal.health_status === healthFilter;
    
    return matchesSearch && matchesType && matchesHealth;
  });

  const sortedAnimals = [...filteredAnimals].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'age':
        return (b.age || 0) - (a.age || 0);
      case 'weight':
        return (b.weight || 0) - (a.weight || 0);
      case 'date':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const getStatusCounts = () => {
    return {
      total: animals.length,
      healthy: animals.filter(a => a.health_status === 'healthy').length,
      attention: animals.filter(a => a.health_status === 'attention').length,
      sick: animals.filter(a => a.health_status === 'sick').length,
      verified: animals.filter(a => a.is_vet_verified).length
    };
  };

  const statusCounts = getStatusCounts();

  const handleFilterByStatus = (status: string) => {
    setHealthFilter(status);
  };

  const handleEdit = (animal: Animal) => {
    setEditingAnimal(animal);
    setShowRegistrationForm(true);
  };

  const handleDelete = async (animalId: string) => {
    if (!confirm(language === 'am' ? 'እንስሳውን መሰረዝ ይፈልጋሉ?' : 'Are you sure you want to delete this animal?')) {
      return;
    }

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

  const handleVaccinate = (animal: Animal) => {
    toast({
      title: language === 'am' ? 'ክትባት' : 'Vaccination',
      description: language === 'am' ? `${animal.name} ለክትባት ተዘጋጅቷል` : `${animal.name} prepared for vaccination`
    });
  };

  const handleTrack = (animal: Animal) => {
    toast({
      title: language === 'am' ? 'መከታተያ' : 'Tracking',
      description: language === 'am' ? `${animal.name} የመከታተያ መረጃ` : `${animal.name} tracking information`
    });
  };

  const handleSell = (animal: Animal) => {
    toast({
      title: language === 'am' ? 'ሽያጭ' : 'Sell',
      description: language === 'am' ? `${animal.name} ለሽያጭ ተዘጋጅቷል` : `${animal.name} prepared for sale`
    });
  };

  const handleExportData = () => {
    const csvData = animals.map(animal => ({
      'Animal Code': animal.animal_code,
      'Tracker ID': animal.tracker_id || 'N/A',
      'Name': animal.name,
      'Type': animal.type,
      'Breed': animal.breed || 'Unknown',
      'Age': animal.age || 'Unknown',
      'Weight': animal.weight || 'Unknown',
      'Health Status': animal.health_status,
      'Vet Verified': animal.is_vet_verified ? 'Yes' : 'No',
      'Registration Date': new Date(animal.created_at).toLocaleDateString()
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mylivestock-animals-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: language === 'am' ? 'ውጤታማ' : 'Success',
      description: language === 'am' ? 'መረጃ ወደ ፋይል ወጣ' : 'Data exported successfully',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <EnhancedHeader />
      <EnhancedOfflineIndicator language={language} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {language === 'am' ? 'የእንስሳት ምዝገባ' : 'Animal Registration'}
          </h1>
          <p className="text-gray-600">
            {language === 'am' 
              ? 'እንስሳትዎን ይመዝግቡ እና ይከታተሉ'
              : 'Register and manage your livestock'
            }
          </p>
        </div>

        {/* Quick Add Button */}
        <div className="text-center">
          <Button 
            className="h-16 px-8 bg-emerald-600 hover:bg-emerald-700 text-lg transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={() => {
              setEditingAnimal(null);
              setShowRegistrationForm(true);
            }}
          >
            <Plus className="w-6 h-6 mr-2" />
            {language === 'am' ? 'አዲስ እንስሳ ይመዝግቡ' : 'Register New Animal'}
          </Button>
        </div>

        {/* Interactive Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          <InteractiveSummaryCard
            title="Total Animals"
            titleAm="ጠቅላላ እንስሳት"
            value={statusCounts.total}
            icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="blue"
            onClick={() => setHealthFilter('all')}
          />
          
          <InteractiveSummaryCard
            title="Healthy"
            titleAm="ጤናማ"
            value={statusCounts.healthy}
            icon={<Heart className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="green"
            onClick={() => handleFilterByStatus('healthy')}
          />
          
          <InteractiveSummaryCard
            title="Need Attention"
            titleAm="ትኩረት"
            value={statusCounts.attention}
            icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="yellow"
            onClick={() => handleFilterByStatus('attention')}
            disabled={statusCounts.attention === 0}
          />
          
          <InteractiveSummaryCard
            title="Sick"
            titleAm="ታማሚ"
            value={statusCounts.sick}
            icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="red"
            onClick={() => handleFilterByStatus('sick')}
            disabled={statusCounts.sick === 0}
          />
          
          <InteractiveSummaryCard
            title="Vet Verified"
            titleAm="ዶክተር ማረጋገጫ"
            value={statusCounts.verified}
            icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="purple"
            onClick={() => {}}
          />
        </div>

        {/* View Toggle and Controls */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                placeholder={language === 'am' ? 'እንስሳት ይፈልጉ...' : 'Search animals...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[200px]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="transition-all duration-300"
              >
                <Grid className="w-4 h-4 mr-1" />
                {language === 'am' ? 'ካርድ' : 'Cards'}
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="transition-all duration-300"
              >
                <Table className="w-4 h-4 mr-1" />
                {language === 'am' ? 'ሰንጠረዥ' : 'Table'}
              </Button>
            </div>
          </div>
          
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={language === 'am' ? 'ደርድር' : 'Sort'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">
                  {language === 'am' ? 'ቀን' : 'Date'}
                </SelectItem>
                <SelectItem value="name">
                  {language === 'am' ? 'ስም' : 'Name'}
                </SelectItem>
                <SelectItem value="age">
                  {language === 'am' ? 'እድሜ' : 'Age'}
                </SelectItem>
                <SelectItem value="weight">
                  {language === 'am' ? 'ክብደት' : 'Weight'}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleExportData}
              className="ml-auto transition-all duration-300 hover:scale-105 active:scale-95"
              disabled={animals.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              {language === 'am' ? 'ወጣት' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Animals Display */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {language === 'am' ? 'የእኔ እንስሳት' : 'My Animals'}
            {sortedAnimals.length > 0 && (
              <span className="text-gray-500 font-normal ml-2">
                ({sortedAnimals.length} {language === 'am' ? 'ውጤቶች' : 'results'})
              </span>
            )}
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-green-100 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedAnimals.length > 0 ? (
            viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedAnimals.map((animal) => (
                  <ModernAnimalCard
                    key={animal.id}
                    animal={{
                      id: animal.id,
                      name: animal.name,
                      type: animal.type,
                      breed: animal.breed || 'Unknown',
                      age: animal.age?.toString() || 'Unknown',
                      weight: animal.weight?.toString() || 'Unknown',
                      photo: animal.photo_url,
                      lastVaccination: animal.last_vaccination || undefined,
                      healthStatus: animal.health_status,
                      trackerId: animal.tracker_id
                    }}
                    language={language}
                  />
                ))}
              </div>
            ) : (
              <AnimalTableView
                animals={sortedAnimals}
                language={language}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onVaccinate={handleVaccinate}
                onTrack={handleTrack}
                onSell={handleSell}
              />
            )
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐄</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {language === 'am' ? 'ምንም እንስሳ አልተገኘም' : 'No animals found'}
              </h3>
              <p className="text-gray-500 mb-4">
                {animals.length === 0 
                  ? (language === 'am' ? 'የመጀመሪያ እንስሳዎን ይመዝግቡ' : 'Register your first animal')
                  : (language === 'am' ? 'የተለያዩ ቃላት ይሞክሩ ወይም ማጣሪያዎቹን ይለውጡ' : 'Try different search terms or adjust your filters')
                }
              </p>
              <Button 
                onClick={() => {
                  setEditingAnimal(null);
                  setShowRegistrationForm(true);
                }}
                className="bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'am' ? 'እንስሳ ይመዝግቡ' : 'Register Animal'}
              </Button>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation language={language} />

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <EnhancedAnimalRegistrationForm
          language={language}
          onClose={() => {
            setShowRegistrationForm(false);
            setEditingAnimal(null);
          }}
          onSuccess={fetchAnimals}
          editAnimal={editingAnimal}
        />
      )}
    </div>
  );
};

export default AnimalsUpdated;
