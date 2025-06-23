
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Weight, TrendingUp, MoreVertical } from 'lucide-react';
import { AnimalData, Language } from '@/types';

interface ModernAnimalCardProps {
  animal: AnimalData;
  language: Language;
  onEdit: (animal: AnimalData) => void;
  onDelete: (animalId: string) => void;
  onVaccinate: (animal: AnimalData) => void;
  onTrack: (animal: AnimalData) => void;
  onSell: (animal: AnimalData) => void;
}

export const ModernAnimalCard = ({ 
  animal, 
  language, 
  onEdit,
  onDelete,
  onVaccinate,
  onTrack,
  onSell
}: ModernAnimalCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'attention': return 'bg-yellow-100 text-yellow-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'healthy': return '💚';
      case 'attention': return '⚠️';
      case 'sick': return '🚨';
      case 'critical': return '🚨';
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

  const getStatusText = (status: string) => {
    const translations = {
      am: {
        healthy: 'ጤናማ',
        attention: 'ትኩረት',
        sick: 'ህመም',
        critical: 'አደገኛ'
      },
      en: {
        healthy: 'Healthy',
        attention: 'Attention',
        sick: 'Sick',
        critical: 'Critical'
      },
      or: {
        healthy: 'Fayyaa',
        attention: 'Xalayaa',
        sick: 'Dhukkubsaa',
        critical: 'Hamaa'
      },
      sw: {
        healthy: 'Mzuri',
        attention: 'Uangalifu',
        sick: 'Mgonjwa',
        critical: 'Hatari'
      }
    };
    
    return translations[language][status as keyof typeof translations[typeof language]] || status;
  };

  const age = animal.age ? `${animal.age}` : 'Unknown age';
  const ageUnit = language === 'am' ? 'ዓመት' : 
                  language === 'or' ? 'waggaa' :
                  language === 'sw' ? 'miaka' : 'years';

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-green-100"
      onClick={() => onEdit(animal)}
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
                {animal.breed || 'Unknown breed'} • {age} {ageUnit}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(animal.health_status)}>
              {getStatusEmoji(animal.health_status)}
              {getStatusText(animal.health_status)}
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
            <p className="text-xs text-gray-600">
              {language === 'am' ? 'ክብደት' : 
               language === 'or' ? 'Ulfaatina' :
               language === 'sw' ? 'Uzito' : 'Weight'}
            </p>
            <p className="text-sm font-bold text-gray-900">{animal.weight || 'N/A'}kg</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <Calendar className="w-4 h-4 mx-auto text-purple-600 mb-1" />
            <p className="text-xs text-gray-600">
              {language === 'am' ? 'ክትባት' : 
               language === 'or' ? 'Tallaa' :
               language === 'sw' ? 'Chanjo' : 'Vaccine'}
            </p>
            <p className="text-sm font-bold text-gray-900">
              {animal.last_vaccination || (language === 'am' ? 'ያለም' : 
                                          language === 'or' ? 'Hin jiru' :
                                          language === 'sw' ? 'Hakuna' : 'None')}
            </p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <TrendingUp className="w-4 h-4 mx-auto text-green-600 mb-1" />
            <p className="text-xs text-gray-600">
              {language === 'am' ? 'እድገት' : 
               language === 'or' ? 'Guddina' :
               language === 'sw' ? 'Ukuaji' : 'Growth'}
            </p>
            <p className="text-sm font-bold text-gray-900">+12%</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onVaccinate(animal);
            }}
          >
            💉 {language === 'am' ? 'ክትባት' : 
                language === 'or' ? 'Tallaa' :
                language === 'sw' ? 'Chanjo' : 'Vaccine'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onTrack(animal);
            }}
          >
            📊 {language === 'am' ? 'ክትትል' : 
                language === 'or' ? 'Hordofu' :
                language === 'sw' ? 'Fuatilia' : 'Track'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onSell(animal);
            }}
          >
            💰 {language === 'am' ? 'ሽያጭ' : 
                language === 'or' ? 'Gurgurtaa' :
                language === 'sw' ? 'Uza' : 'Sell'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
