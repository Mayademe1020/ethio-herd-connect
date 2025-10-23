import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Scale, Calendar, Target } from 'lucide-react';
import { GrowthChart } from '@/components/GrowthChart';
import { Language } from '@/types';
import { useDateDisplay } from '@/hooks/useDateDisplay';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useGrowthRecords } from '@/hooks/useGrowthRecords';

interface GrowthDetailViewProps {
  language: Language;
  type: string;
  onBack: () => void;
}

export const GrowthDetailView = ({ language, type, onBack }: GrowthDetailViewProps) => {
  const { stats, animals } = useDashboardStats();
  const { growthRecords } = useGrowthRecords();
  const { formatDate } = useDateDisplay();

  const getTitle = () => {
    switch (type) {
      case 'total':
        return language === 'am' ? 'ጠቅላላ እንስሳት' : language === 'or' ? 'Horii Hundaa' : language === 'sw' ? 'Jumla ya Wanyama' : 'All Animals Growth';
      case 'growing':
        return language === 'am' ? 'እያደጉ ያሉ' : language === 'or' ? 'Gudachaa Jiran' : language === 'sw' ? 'Wanaokua' : 'Growing Animals';
      case 'targets':
        return language === 'am' ? 'የክብደት ዒላማዎች' : language === 'or' ? 'Galmoota Ulfaatinaa' : language === 'sw' ? 'Malengo ya Uzito' : 'Weight Targets';
      default:
        return language === 'am' ? 'የእድገት ዝርዝር' : language === 'or' ? "Bal'ina Guddina" : language === 'sw' ? 'Maelezo ya Ukuaji' : 'Growth Details';
    }
  };

  // Build per-animal growth summary from records
  const byAnimal: Record<
    string,
    { latest?: any; previous?: any }
  > = {};
  growthRecords.forEach((r) => {
    if (!byAnimal[r.animal_id]) byAnimal[r.animal_id] = {};
    const curr = byAnimal[r.animal_id].latest;
    if (!curr || new Date(r.recorded_date) > new Date(curr.recorded_date)) {
      byAnimal[r.animal_id].previous = byAnimal[r.animal_id].latest;
      byAnimal[r.animal_id].latest = r;
    } else if (!byAnimal[r.animal_id].previous || new Date(r.recorded_date) > new Date(byAnimal[r.animal_id].previous.recorded_date)) {
      byAnimal[r.animal_id].previous = r;
    }
  });

  const enrichedAnimals = animals.map((a: any) => {
    const rec = byAnimal[a.id] || {};
    const latest = rec.latest;
    const previous = rec.previous;
    const currentWeight = latest ? Number(latest.weight) : Number(a.weight || 0);
    const lastWeight = previous ? Number(previous.weight) : Number(a.weight || 0);
    const trend = currentWeight > lastWeight ? 'up' : currentWeight < lastWeight ? 'down' : 'stable';
    const lastWeighed = latest ? formatDate(latest.recorded_date) : a.last_weighed ? formatDate(a.last_weighed) : '';
    return {
      id: a.id,
      name: a.name || a.animal_code || 'Unnamed',
      currentWeight,
      lastWeight,
      trend,
      lastWeighed,
    };
  });

  const renderGrowingAnimals = () => (
    <div className="space-y-4">
      {enrichedAnimals.filter((a: any) => a.trend === 'up').map((animal: any, index: number) => (
        <Card key={animal.id} className="hover-scale transition-all duration-300 hover:shadow-lg border-l-4 border-l-green-500" style={{ animationDelay: `${index * 100}ms` }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">{animal.name}</h4>
                  <p className="text-sm text-gray-600">
                    {language === 'am' ? 'የአሁን ክብደት:' : language === 'or' ? 'Ulfaatina Ammaa:' : language === 'sw' ? 'Uzito wa Sasa:' : 'Current Weight:'} {animal.currentWeight}kg
                  </p>
                  <p className="text-xs text-gray-500">
                    {language === 'am' ? 'መጨረሻ ተመዝኗል:' : language === 'or' ? 'Dhumaa Safarame:' : language === 'sw' ? 'Ilipimwa Mwisho:' : 'Last weighed:'} {animal.lastWeighed || '—'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">+{Math.max(animal.currentWeight - animal.lastWeight, 0)}kg</span>
                </div>
                <p className="text-xs text-gray-500">{language === 'am' ? 'ማሻሻያ' : language === 'or' ? 'Guddina' : language === 'sw' ? 'Ukuaji' : 'Growth'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">
          {language === 'am' ? 'የእድገት ቻርቶች' : language === 'or' ? 'Chaartii Guddina' : language === 'sw' ? 'Chati za Ukuaji' : 'Growth Charts'}
        </h3>
        <div className="space-y-6">
          {enrichedAnimals.filter((a: any) => a.trend === 'up').map((animal: any) => (
            <GrowthChart key={animal.id} language={language} animalId={animal.id} animalName={animal.name} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderAllAnimals = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enrichedAnimals.map((animal: any, index: number) => (
          <Card key={animal.id} className="hover-scale transition-all duration-300 hover:shadow-md" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-blue-600" />
                <span>{animal.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'am' ? 'ክብደት:' : language === 'or' ? 'Ulfaatina:' : language === 'sw' ? 'Uzito:' : 'Weight:'}</span>
                  <span className="font-medium">{animal.currentWeight}kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'am' ? 'አዝማሚያ:' : language === 'or' ? 'Adeemsa:' : language === 'sw' ? 'Mwelekeo:' : 'Trend:'}</span>
                  <div className={`flex items-center space-x-1 ${animal.trend === 'up' ? 'text-green-600' : animal.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                    <TrendingUp className={`w-4 h-4 ${animal.trend === 'stable' ? 'rotate-90' : ''}`} />
                    <span className="text-xs font-medium">
                      {animal.trend === 'up'
                        ? language === 'am' ? 'እያደገ' : language === 'or' ? 'Gudachaa' : language === 'sw' ? 'Inakua' : 'Growing'
                        : animal.trend === 'down'
                        ? language === 'am' ? 'ተቀነሰ' : language === 'or' ? 'Xinnaate' : language === 'sw' ? 'Imeshuka' : 'Declining'
                        : language === 'am' ? 'የተረጋጋ' : language === 'or' ? 'Tasgabbii' : language === 'sw' ? 'Imara' : 'Stable'}
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
          {language === 'am' ? 'የቡድን እድገት ቻርት' : language === 'or' ? 'Chaartii Guddina Garee' : language === 'sw' ? 'Chati ya Ukuaji wa Kundi' : 'Group Growth Chart'}
        </h3>
        <GrowthChart language={language} animalId="group" animalName={language === 'am' ? 'ቡድን እይታ' : language === 'or' ? "Mul'ata Garee" : language === 'sw' ? 'Mwongozo wa Kundi' : 'Group View'} />
      </div>
    </div>
  );

  const renderTargets = () => (
    <div className="space-y-4">
      <Card className="hover-scale transition-all duration-300 hover:shadow-md border-l-4 border-l-purple-500">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-lg">
                {language === 'am' ? 'የክብደት ዒላማዎች' : language === 'or' ? 'Galmoota Ulfaatinaa' : language === 'sw' ? 'Malengo ya Uzito' : 'Weight Targets'}
              </h4>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'የዒላማ ስርዓት በዝርዝር ስራ ላይ ነው' : language === 'or' ? 'Sirna Galmee Galmaa jira' : language === 'sw' ? 'Mfumo wa malengo unakamilishwa' : 'Target system is being implemented'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
        <Button variant="ghost" onClick={onBack} className="hover-scale transition-all duration-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'am' ? 'ተመለስ' : language === 'or' ? "Deebi'i" : language === 'sw' ? 'Rudi' : 'Back'}
        </Button>
        <h2 className="text-xl font-semibold">{getTitle()}</h2>
      </div>

      {renderContent()}
    </div>
  );
};
