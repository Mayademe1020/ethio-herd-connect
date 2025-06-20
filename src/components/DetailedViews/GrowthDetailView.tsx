
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Scale, Calendar, Target } from 'lucide-react';
import { GrowthChart } from '@/components/GrowthChart';

interface GrowthDetailViewProps {
  language: 'am' | 'en';
  type: string;
  onBack: () => void;
}

export const GrowthDetailView = ({ language, type, onBack }: GrowthDetailViewProps) => {
  const mockGrowthData = {
    animals: [
      { id: '1', name: 'ሞላ', currentWeight: 78, lastWeight: 75, trend: 'up', lastWeighed: '2024-06-15' },
      { id: '2', name: 'አበባ', currentWeight: 85, lastWeight: 83, trend: 'up', lastWeighed: '2024-06-12' },
      { id: '3', name: 'ገብሬ', currentWeight: 25, lastWeight: 25, trend: 'stable', lastWeighed: '2024-06-10' }
    ],
    targets: [
      { animal: 'ሞላ', currentWeight: 78, targetWeight: 90, deadline: '2024-08-01' },
      { animal: 'አበባ', currentWeight: 85, targetWeight: 95, deadline: '2024-07-15' }
    ]
  };

  const getTitle = () => {
    switch (type) {
      case 'total':
        return language === 'am' ? 'ጠቅላላ እንስሳት' : 'All Animals Growth';
      case 'growing':
        return language === 'am' ? 'እያደጉ ያሉ' : 'Growing Animals';
      case 'targets':
        return language === 'am' ? 'የክብደት ዒላማዎች' : 'Weight Targets';
      default:
        return language === 'am' ? 'የእድገት ዝርዝር' : 'Growth Details';
    }
  };

  const renderGrowingAnimals = () => (
    <div className="space-y-4">
      {mockGrowthData.animals.filter(a => a.trend === 'up').map((animal, index) => (
        <Card 
          key={animal.id} 
          className="hover-scale transition-all duration-300 hover:shadow-lg border-l-4 border-l-green-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">{animal.name}</h4>
                  <p className="text-sm text-gray-600">
                    {language === 'am' ? 'የአሁን ክብደት:' : 'Current Weight:'} {animal.currentWeight}kg
                  </p>
                  <p className="text-xs text-gray-500">
                    {language === 'am' ? 'መጨረሻ ተመዝኗል:' : 'Last weighed:'} {animal.lastWeighed}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">+{animal.currentWeight - animal.lastWeight}kg</span>
                </div>
                <p className="text-xs text-gray-500">
                  {language === 'am' ? 'ማሻሻያ' : 'Growth'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">
          {language === 'am' ? 'የእድገት ቻርቶች' : 'Growth Charts'}
        </h3>
        <div className="space-y-6">
          {mockGrowthData.animals.filter(a => a.trend === 'up').map((animal) => (
            <GrowthChart 
              key={animal.id}
              language={language}
              animalId={animal.id}
              animalName={animal.name}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderAllAnimals = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockGrowthData.animals.map((animal, index) => (
          <Card 
            key={animal.id} 
            className="hover-scale transition-all duration-300 hover:shadow-md"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-blue-600" />
                <span>{animal.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {language === 'am' ? 'ክብደት:' : 'Weight:'}
                  </span>
                  <span className="font-medium">{animal.currentWeight}kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {language === 'am' ? 'አዝማሚያ:' : 'Trend:'}
                  </span>
                  <div className={`flex items-center space-x-1 ${
                    animal.trend === 'up' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${animal.trend === 'stable' ? 'rotate-90' : ''}`} />
                    <span className="text-xs font-medium">
                      {animal.trend === 'up' 
                        ? (language === 'am' ? 'እያደገ' : 'Growing')
                        : (language === 'am' ? 'የተረጋጋ' : 'Stable')
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">
          {language === 'am' ? 'የቡድን እድገት ቻርት' : 'Group Growth Chart'}
        </h3>
        <GrowthChart 
          language={language}
          animalId="group"
          animalName={language === 'am' ? 'ቡድን እይታ' : 'Group View'}
        />
      </div>
    </div>
  );

  const renderTargets = () => (
    <div className="space-y-4">
      {mockGrowthData.targets.map((target, index) => (
        <Card 
          key={index} 
          className="hover-scale transition-all duration-300 hover:shadow-md border-l-4 border-l-purple-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">{target.animal}</h4>
                  <p className="text-sm text-gray-600">
                    {target.currentWeight}kg → {target.targetWeight}kg
                  </p>
                  <p className="text-xs text-gray-500">
                    {language === 'am' ? 'ቀነ-ገደብ:' : 'Deadline:'} {target.deadline}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((target.currentWeight / target.targetWeight) * 100)}%
                </div>
                <p className="text-xs text-gray-500">
                  {language === 'am' ? 'ተጠናቋል' : 'Complete'}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(target.currentWeight / target.targetWeight) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'growing':
        return renderGrowingAnimals();
      case 'targets':
        return renderTargets();
      case 'total':
      default:
        return renderAllAnimals();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="hover-scale transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'am' ? 'ተመለስ' : 'Back'}
        </Button>
        <h2 className="text-xl font-semibold">{getTitle()}</h2>
      </div>

      {renderContent()}
    </div>
  );
};
