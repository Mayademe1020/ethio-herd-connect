
import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { WeightEntryForm } from '@/components/WeightEntryForm';
import { GrowthChart } from '@/components/GrowthChart';
import { AnimalGrowthCard } from '@/components/AnimalGrowthCard';
import { Plus, TrendingUp, BarChart3 } from 'lucide-react';

const Growth = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [selectedAnimalForChart, setSelectedAnimalForChart] = useState<string | null>(null);

  // Mock animals data with growth information
  const animals = [
    {
      id: '1',
      name: 'ሞላ',
      type: 'cattle',
      breed: 'ቦራ',
      currentWeight: 78,
      lastWeighed: '2024-06-01',
      growthTrend: 'up' as const
    },
    {
      id: '2',
      name: 'አበባ',
      type: 'cattle',
      breed: 'ሆላንድ',
      currentWeight: 85,
      lastWeighed: '2024-05-28',
      growthTrend: 'stable' as const
    },
    {
      id: '3',
      name: 'ገብሬ',
      type: 'goat',
      breed: 'አርሲ-ባሌ',
      currentWeight: 25,
      lastWeighed: '2024-05-30',
      growthTrend: 'up' as const
    }
  ];

  const handleAddWeight = (animalId?: string) => {
    setShowWeightForm(true);
  };

  const handleViewChart = (animalId: string) => {
    setSelectedAnimalForChart(animalId);
  };

  const selectedAnimal = selectedAnimalForChart 
    ? animals.find(a => a.id === selectedAnimalForChart)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {language === 'am' ? 'የእድገት ክትትል' : 'Growth Monitoring'}
          </h1>
          <p className="text-gray-600">
            {language === 'am' 
              ? 'የእንስሳትዎን ክብደት እና እድገት ይከታተሉ'
              : 'Track your animals\' weight and growth progress'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            className="h-24 flex flex-col space-y-2 bg-green-600 hover:bg-green-700"
            onClick={() => handleAddWeight()}
          >
            <Plus className="w-8 h-8" />
            <span className="text-lg font-medium">
              {language === 'am' ? 'ክብደት ጨምር' : 'Add Weight'}
            </span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col space-y-2 border-green-200 hover:bg-green-50"
            onClick={() => setSelectedAnimalForChart('1')}
          >
            <BarChart3 className="w-8 h-8" />
            <span className="text-lg font-medium">
              {language === 'am' ? 'እድገት ቻርት' : 'Growth Charts'}
            </span>
          </Button>
        </div>

        {/* Chart View */}
        {selectedAnimalForChart && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                {language === 'am' ? 'የእድገት ቻርት' : 'Growth Chart'}
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedAnimalForChart(null)}
              >
                {language === 'am' ? 'ዝርዝር ተመለስ' : 'Back to List'}
              </Button>
            </div>
            <GrowthChart 
              language={language}
              animalId={selectedAnimalForChart}
              animalName={selectedAnimal?.name}
            />
          </div>
        )}

        {/* Animals List */}
        {!selectedAnimalForChart && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {language === 'am' ? 'እንስሳቶች' : 'Animals'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {animals.map((animal) => (
                <AnimalGrowthCard
                  key={animal.id}
                  language={language}
                  animal={animal}
                  onAddWeight={handleAddWeight}
                  onViewChart={handleViewChart}
                />
              ))}
            </div>
          </div>
        )}

        {/* Overall Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>{language === 'am' ? 'አጠቃላይ ስታትስቲክስ' : 'Overall Statistics'}</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{animals.length}</p>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'ተከታትለው እንስሳ' : 'Animals Tracked'}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">
                {animals.filter(a => a.growthTrend === 'up').length}
              </p>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'እያደጉ' : 'Growing'}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-700">
                {animals.reduce((acc, animal) => acc + (animal.currentWeight || 0), 0).toFixed(0)}
              </p>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'ጠቅላላ ክብደት (ኪግ)' : 'Total Weight (kg)'}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-700">
                {(animals.reduce((acc, animal) => acc + (animal.currentWeight || 0), 0) / animals.length).toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'አማካኝ ክብደት' : 'Avg Weight'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation language={language} />

      {/* Weight Entry Form Modal */}
      {showWeightForm && (
        <WeightEntryForm
          language={language}
          onClose={() => setShowWeightForm(false)}
        />
      )}
    </div>
  );
};

export default Growth;
