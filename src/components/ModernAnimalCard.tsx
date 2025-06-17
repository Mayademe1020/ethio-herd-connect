
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Weight, TrendingUp, MoreVertical } from 'lucide-react';

interface AnimalData {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  weight: string;
  photo?: string;
  lastVaccination?: string;
  healthStatus: 'healthy' | 'attention' | 'sick';
}

interface ModernAnimalCardProps {
  animal: AnimalData;
  language: 'am' | 'en';
  onClick?: () => void;
}

export const ModernAnimalCard = ({ animal, language, onClick }: ModernAnimalCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'attention': return 'bg-yellow-100 text-yellow-800';
      case 'sick': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'healthy': return '💚';
      case 'attention': return '⚠️';
      case 'sick': return '🚨';
      default: return '❓';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'cattle': return '🐄';
      case 'poultry': return '🐔';
      case 'goat': return '🐐';
      case 'sheep': return '🐑';
      default: return '🐾';
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-green-100"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-2xl">
              {getTypeEmoji(animal.type)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{animal.name}</h3>
              <p className="text-sm text-gray-600">
                {animal.breed} • {animal.age} {language === 'am' ? 'ዓመት' : 'years'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(animal.healthStatus)}>
              {getStatusEmoji(animal.healthStatus)}
              {language === 'am' ? 
                (animal.healthStatus === 'healthy' ? 'ጤናማ' : 
                 animal.healthStatus === 'attention' ? 'ትኩረት' : 'ህመም') 
                : animal.healthStatus}
            </Badge>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <Weight className="w-4 h-4 mx-auto text-blue-600 mb-1" />
            <p className="text-xs text-gray-600">{language === 'am' ? 'ክብደት' : 'Weight'}</p>
            <p className="text-sm font-bold text-gray-900">{animal.weight}kg</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <Calendar className="w-4 h-4 mx-auto text-purple-600 mb-1" />
            <p className="text-xs text-gray-600">{language === 'am' ? 'ክትባት' : 'Vaccine'}</p>
            <p className="text-sm font-bold text-gray-900">
              {animal.lastVaccination || (language === 'am' ? 'ያለም' : 'None')}
            </p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <TrendingUp className="w-4 h-4 mx-auto text-green-600 mb-1" />
            <p className="text-xs text-gray-600">{language === 'am' ? 'እድገት' : 'Growth'}</p>
            <p className="text-sm font-bold text-gray-900">+12%</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            💉 {language === 'am' ? 'ክትባት' : 'Vaccine'}
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            📊 {language === 'am' ? 'ክትትል' : 'Track'}
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            💰 {language === 'am' ? 'ሽያጭ' : 'Sell'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
