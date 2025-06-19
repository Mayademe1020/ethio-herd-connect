
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimalRegistrationForm } from '@/components/AnimalRegistrationForm';
import { ModernAnimalCard } from '@/components/ModernAnimalCard';
import { Plus, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

const Animals = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  
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
      
      // Ensure health_status is properly typed
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
                         animal.breed?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || animal.type === typeFilter;
    const matchesHealth = healthFilter === 'all' || animal.health_status === healthFilter;
    
    return matchesSearch && matchesType && matchesHealth;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <Header language={language} setLanguage={setLanguage} />
      
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
            className="h-16 px-8 bg-emerald-600 hover:bg-emerald-700 text-lg"
            onClick={() => setShowRegistrationForm(true)}
          >
            <Plus className="w-6 h-6 mr-2" />
            {language === 'am' ? 'አዲስ እንስሳ ይመዝግቡ' : 'Register New Animal'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-gray-800">{statusCounts.total}</div>
            <p className="text-sm text-gray-600">
              {language === 'am' ? 'ጠቅላላ እንስሳት' : 'Total Animals'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-green-600">{statusCounts.healthy}</div>
            <p className="text-sm text-gray-600">
              {language === 'am' ? 'ጤናማ' : 'Healthy'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.attention}</div>
            <p className="text-sm text-gray-600">
              {language === 'am' ? 'ትኩረት' : 'Attention'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-red-600">{statusCounts.sick}</div>
            <p className="text-sm text-gray-600">
              {language === 'am' ? 'ታማሚ' : 'Sick'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.verified}</div>
            <p className="text-sm text-gray-600">
              {language === 'am' ? 'ዶክተር ማረጋገጫ' : 'Vet Verified'}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder={language === 'am' ? 'እንስሳት ይፈልጉ...' : 'Search animals...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="flex space-x-2">
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
        </div>

        {/* Animals Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {language === 'am' ? 'የእኔ እንስሳት' : 'My Animals'}
            {filteredAnimals.length > 0 && (
              <span className="text-gray-500 font-normal ml-2">
                ({filteredAnimals.length} {language === 'am' ? 'ውጤቶች' : 'results'})
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
          ) : filteredAnimals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAnimals.map((animal) => (
                <ModernAnimalCard
                  key={animal.id}
                  animal={{
                    ...animal,
                    healthStatus: animal.health_status
                  }}
                  language={language}
                />
              ))}
            </div>
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
                onClick={() => setShowRegistrationForm(true)}
                className="bg-green-600 hover:bg-green-700"
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
        <AnimalRegistrationForm
          language={language}
          onClose={() => setShowRegistrationForm(false)}
          onSuccess={fetchAnimals}
        />
      )}
    </div>
  );
};

export default Animals;
