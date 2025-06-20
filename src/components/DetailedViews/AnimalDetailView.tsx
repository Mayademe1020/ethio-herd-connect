
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cow, Activity, Calendar, Weight } from 'lucide-react';

interface AnimalDetailViewProps {
  language: 'am' | 'en';
  type: string;
  onBack: () => void;
}

export const AnimalDetailView = ({ language, type, onBack }: AnimalDetailViewProps) => {
  const mockAnimals = [
    { id: '1', name: 'ሞላ', type: 'cattle', breed: 'ቦራ', age: '2 years', status: 'healthy' },
    { id: '2', name: 'አበባ', type: 'cattle', breed: 'ሆላንድ', age: '3 years', status: 'healthy' },
    { id: '3', name: 'ገብሬ', type: 'goat', breed: 'አርሲ-ባሌ', age: '1 year', status: 'needs_attention' }
  ];

  const getTitle = () => {
    switch (type) {
      case 'total':
        return language === 'am' ? 'ጠቅላላ እንስሳት' : 'Total Animals';
      case 'healthy':
        return language === 'am' ? 'ጤናማ እንስሳት' : 'Healthy Animals';
      case 'attention':
        return language === 'am' ? 'ትኩረት የሚፈልጉ' : 'Need Attention';
      default:
        return language === 'am' ? 'የእንስሳት ዝርዝር' : 'Animal Details';
    }
  };

  const filteredAnimals = type === 'healthy' 
    ? mockAnimals.filter(a => a.status === 'healthy')
    : type === 'attention'
    ? mockAnimals.filter(a => a.status === 'needs_attention')
    : mockAnimals;

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnimals.map((animal, index) => (
          <Card 
            key={animal.id} 
            className="hover-scale transition-all duration-300 hover:shadow-lg border-l-4 border-l-green-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Cow className="w-5 h-5 text-green-600" />
                <span>{animal.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">
                  {language === 'am' ? 'ዓይነት:' : 'Type:'} {animal.type}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span className="text-gray-600">
                  {language === 'am' ? 'እድሜ:' : 'Age:'} {animal.age}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Weight className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600">
                  {language === 'am' ? 'ዝርያ:' : 'Breed:'} {animal.breed}
                </span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                animal.status === 'healthy' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {animal.status === 'healthy' 
                  ? (language === 'am' ? 'ጤናማ' : 'Healthy')
                  : (language === 'am' ? 'ትኩረት ያስፈልጋል' : 'Needs Attention')
                }
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
