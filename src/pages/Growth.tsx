import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WeightEntryForm } from '@/components/WeightEntryForm';
import { GrowthChart } from '@/components/GrowthChart';
import { AnimalGrowthCard } from '@/components/AnimalGrowthCard';
import { InteractiveSummaryCard } from '@/components/InteractiveSummaryCard';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { GrowthDetailView } from '@/components/DetailedViews/GrowthDetailView';
import { Plus, TrendingUp, BarChart3, Users, Scale, Target, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useToastNotifications } from '@/hooks/useToastNotifications';

const Growth = () => {
  const { language } = useLanguage();
  const { addToQueue, isOnline } = useOfflineSync();
  const { showSuccess, showError } = useToastNotifications();
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [selectedAnimalForChart, setSelectedAnimalForChart] = useState<string | null>(null);
  const [selectedDetailView, setSelectedDetailView] = useState<string | null>(null);

  // Enhanced mock animals data with growth information
  const animals = [
    {
      id: '1',
      name: 'ሞላ',
      type: 'cattle',
      breed: 'ቦራ',
      currentWeight: 78,
      lastWeighed: '2024-06-01',
      growthTrend: 'up' as const,
      targetWeight: 90,
      weeklyGain: 2.1
    },
    {
      id: '2',
      name: 'አበባ',
      type: 'cattle',
      breed: 'ሆላንድ',
      currentWeight: 85,
      lastWeighed: '2024-05-28',
      growthTrend: 'stable' as const,
      targetWeight: 95,
      weeklyGain: 0.8
    },
    {
      id: '3',
      name: 'ገብሬ',
      type: 'goat',
      breed: 'አርሲ-ባሌ',
      currentWeight: 25,
      lastWeighed: '2024-05-30',
      growthTrend: 'up' as const,
      targetWeight: 30,
      weeklyGain: 1.2
    }
  ];

  const growthStats = {
    totalAnimals: animals.length,
    trackedAnimals: animals.length,
    averageWeight: Math.round(animals.reduce((acc, animal) => acc + (animal.currentWeight || 0), 0) / animals.length),
    totalWeight: animals.reduce((acc, animal) => acc + (animal.currentWeight || 0), 0),
    improvingGrowth: animals.filter(a => a.growthTrend === 'up').length,
    upcomingWeighings: 3,
    onTarget: animals.filter(a => (a.currentWeight / a.targetWeight) >= 0.8).length,
    averageWeeklyGain: Math.round((animals.reduce((acc, a) => acc + a.weeklyGain, 0) / animals.length) * 10) / 10
  };

  const handleAddWeight = (animalId?: string) => {
    setShowWeightForm(true);
  };

  const handleViewChart = (animalId: string) => {
    setSelectedAnimalForChart(animalId);
  };

  const handleDetailViewClick = (cardType: string) => {
    setSelectedDetailView(cardType);
  };

  const handleWeightAdded = (weightData: any) => {
    if (!isOnline) {
      addToQueue('growth', weightData);
      showSuccess(
        language === 'am' ? 'ክብደት ታክሏል' : 'Weight Added',
        language === 'am' ? 'ከመስመር ሁኔታ። ሲመለስ ይሰምራል።' : 'Saved offline. Will sync when online.'
      );
    } else {
      showSuccess(
        language === 'am' ? 'ክብደት ታክሏል' : 'Weight Added',
        language === 'am' ? 'ክብደት በተሳካ ሁኔታ ታክሏል' : 'Weight recorded successfully'
      );
    }
    setShowWeightForm(false);
  };

  const selectedAnimal = selectedAnimalForChart 
    ? animals.find(a => a.id === selectedAnimalForChart)
    : null;

  // If detail view is selected, show it
  if (selectedDetailView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
        <EnhancedHeader />
        <OfflineIndicator language={language} />
        
        <main className="container mx-auto px-4 py-6">
          <GrowthDetailView
            language={language}
            type={selectedDetailView}
            onBack={() => setSelectedDetailView(null)}
          />
        </main>

        <BottomNavigation language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <EnhancedHeader />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="text-center animate-fade-in">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Button 
            className="h-24 flex flex-col space-y-2 bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={() => handleAddWeight()}
          >
            <Plus className="w-8 h-8" />
            <span className="text-lg font-medium">
              {language === 'am' ? 'ክብደት ጨምር' : 'Add Weight'}
            </span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col space-y-2 border-green-200 hover:bg-green-50 transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={() => setSelectedAnimalForChart('1')}
          >
            <BarChart3 className="w-8 h-8" />
            <span className="text-lg font-medium">
              {language === 'am' ? 'እድገት ቻርት' : 'Growth Charts'}
            </span>
          </Button>
        </div>

        {/* Interactive Growth Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 lg:gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <InteractiveSummaryCard
            title="Total Animals"
            titleAm="ጠቅላላ እንስሳ"
            value={growthStats.totalAnimals}
            icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="blue"
            onClick={() => handleDetailViewClick('total')}
          />
          
          <InteractiveSummaryCard
            title="Tracked"
            titleAm="ተከታትለው"
            value={growthStats.trackedAnimals}
            icon={<Target className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="green"
            onClick={() => handleDetailViewClick('tracked')}
          />
          
          <InteractiveSummaryCard
            title="Avg Weight"
            titleAm="አማካኝ ክብደት"
            value={`${growthStats.averageWeight}kg`}
            icon={<Scale className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="purple"
            onClick={() => handleDetailViewClick('average')}
          />
          
          <InteractiveSummaryCard
            title="Total Weight"
            titleAm="ጠቅላላ ክብደት"
            value={`${growthStats.totalWeight}kg`}
            icon={<Scale className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="teal"
            onClick={() => handleDetailViewClick('total')}
          />
          
          <InteractiveSummaryCard
            title="Growing"
            titleAm="እያደጉ"
            value={growthStats.improvingGrowth}
            icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="emerald"
            onClick={() => handleDetailViewClick('growing')}
          />
          
          <InteractiveSummaryCard
            title="Upcoming"
            titleAm="ቀሪ ክትትል"
            value={growthStats.upcomingWeighings}
            icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="orange"
            onClick={() => handleDetailViewClick('upcoming')}
          />

          <InteractiveSummaryCard
            title="On Target"
            titleAm="በዒላማ ላይ"
            value={growthStats.onTarget}
            icon={<Target className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="indigo"
            onClick={() => handleDetailViewClick('targets')}
          />

          <InteractiveSummaryCard
            title="Weekly Gain"
            titleAm="ሳምንታዊ ጭማሪ"
            value={`${growthStats.averageWeeklyGain}kg`}
            icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="pink"
            onClick={() => handleDetailViewClick('gains')}
          />
        </div>

        {/* Chart View */}
        {selectedAnimalForChart && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                {language === 'am' ? 'የእድገት ቻርት' : 'Growth Chart'}
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedAnimalForChart(null)}
                className="transition-all duration-300 hover:scale-105 active:scale-95"
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
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h2 className="text-xl font-semibold text-gray-800">
              {language === 'am' ? 'እንስሳቶች' : 'Animals'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {animals.map((animal, index) => (
                <div 
                  key={animal.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <AnimalGrowthCard
                    language={language}
                    animal={animal}
                    onAddWeight={handleAddWeight}
                    onViewChart={handleViewChart}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNavigation language={language} />

      {/* Weight Entry Form Modal */}
      {showWeightForm && (
        <WeightEntryForm
          language={language}
          onClose={() => setShowWeightForm(false)}
          onWeightAdded={handleWeightAdded}
        />
      )}
    </div>
  );
};

export default Growth;
