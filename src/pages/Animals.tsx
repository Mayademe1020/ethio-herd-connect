
import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { AnimalRegistrationForm } from '@/components/AnimalRegistrationForm';
import { ModernAnimalCard } from '@/components/ModernAnimalCard';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { Plus, Search, Filter, TrendingUp } from 'lucide-react';

const Animals = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data - replace with real data from Supabase
  const mockAnimals = [
    {
      id: '1',
      name: 'ሞላ',
      type: 'cattle',
      breed: 'ቦራ',
      age: '3',
      weight: '285',
      healthStatus: 'healthy' as const,
      lastVaccination: '2 ወር'
    },
    {
      id: '2',
      name: 'ድንቅ',
      type: 'cattle',
      breed: 'ሆልስታይን',
      age: '4',
      weight: '320',
      healthStatus: 'attention' as const,
      lastVaccination: '5 ወር'
    },
    {
      id: '3',
      name: 'ቂጥ ቂጥ',
      type: 'poultry',
      breed: 'ሮድ አይላንድ',
      age: '1',
      weight: '2.5',
      healthStatus: 'healthy' as const,
      lastVaccination: '1 ወር'
    }
  ];

  const filteredAnimals = mockAnimals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || animal.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: mockAnimals.length,
    cattle: mockAnimals.filter(a => a.type === 'cattle').length,
    poultry: mockAnimals.filter(a => a.type === 'poultry').length,
    healthy: mockAnimals.filter(a => a.healthStatus === 'healthy').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-24">
      <Header language={language} setLanguage={setLanguage} />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero Stats Section */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {language === 'am' ? '🐄 የእንስሳት አስተዳደር' : '🐄 Animal Management'}
          </h1>
          <p className="text-gray-600 mb-6">
            {language === 'am' 
              ? 'ዘመናዊ የከብት እና የዶሮ መዝገብ አስተዳደር'
              : 'Modern livestock and poultry management'
            }
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
              <div className="text-2xl font-bold text-green-600">{stats.total}</div>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'ጠቅላላ እንስሳት' : 'Total Animals'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{stats.cattle}</div>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'ከብቶች' : 'Cattle'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-600">{stats.poultry}</div>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'ዶሮዎች' : 'Poultry'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
              <div className="text-2xl font-bold text-emerald-600">{stats.healthy}</div>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'ጤናማ' : 'Healthy'}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <Button 
          className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
          onClick={() => setShowRegistrationForm(true)}
        >
          <Plus className="w-6 h-6 mr-3" />
          {language === 'am' ? '✨ አዲስ እንስሳ ይመዝግቡ' : '✨ Register New Animal'}
        </Button>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={language === 'am' ? 'እንስሳ ፈልግ...' : 'Search animals...'}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">{language === 'am' ? 'ሁሉም' : 'All Types'}</option>
            <option value="cattle">{language === 'am' ? 'ከብት' : 'Cattle'}</option>
            <option value="poultry">{language === 'am' ? 'ዶሮ' : 'Poultry'}</option>
            <option value="goat">{language === 'am' ? 'ፍየል' : 'Goat'}</option>
            <option value="sheep">{language === 'am' ? 'በግ' : 'Sheep'}</option>
          </select>
        </div>

        {/* Animals Grid */}
        {filteredAnimals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAnimals.map((animal) => (
              <ModernAnimalCard
                key={animal.id}
                animal={animal}
                language={language}
                onClick={() => console.log('View animal details:', animal.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {language === 'am' ? 'ምንም እንስሳ አልተገኘም' : 'No animals found'}
            </h3>
            <p className="text-gray-500">
              {language === 'am' 
                ? 'የፍለጋ ቃልዎን ይለውጡ ወይም አዲስ እንስሳ ያስመዝግቡ'
                : 'Try adjusting your search or register a new animal'
              }
            </p>
          </div>
        )}

        {/* Growth Insights */}
        {mockAnimals.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                {language === 'am' ? 'የእድገት ትንታኔ' : 'Growth Insights'}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">+15%</div>
                <p className="text-sm text-gray-600">
                  {language === 'am' ? 'የወር እድገት' : 'Monthly Growth'}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">98%</div>
                <p className="text-sm text-gray-600">
                  {language === 'am' ? 'የጤንነት መጠን' : 'Health Rate'}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">₹2,450</div>
                <p className="text-sm text-gray-600">
                  {language === 'am' ? 'የወር ገቢ' : 'Monthly Revenue'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation language={language} />

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <AnimalRegistrationForm
          language={language}
          onClose={() => setShowRegistrationForm(false)}
        />
      )}
    </div>
  );
};

export default Animals;
