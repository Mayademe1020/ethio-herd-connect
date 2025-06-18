
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scale, TrendingUp, Calendar } from 'lucide-react';

interface AnimalGrowthCardProps {
  language: 'am' | 'en';
  animal: {
    id: string;
    name: string;
    type: string;
    breed: string;
    currentWeight?: number;
    lastWeighed?: string;
    growthTrend?: 'up' | 'down' | 'stable';
  };
  onAddWeight: (animalId: string) => void;
  onViewChart: (animalId: string) => void;
}

export const AnimalGrowthCard = ({ 
  language, 
  animal, 
  onAddWeight, 
  onViewChart 
}: AnimalGrowthCardProps) => {
  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'cattle': return '🐄';
      case 'goat': return '🐐';
      case 'sheep': return '🐑';
      case 'poultry': return '🐔';
      default: return '🐾';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up': return 'bg-green-100 text-green-800';
      case 'down': return 'bg-red-100 text-red-800';
      case 'stable': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return language === 'am' ? 'ምንም ጊዜ የለም' : 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Animal Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getTypeEmoji(animal.type)}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{animal.name}</h3>
                <p className="text-sm text-gray-600">{animal.breed}</p>
              </div>
            </div>
            
            {animal.growthTrend && (
              <Badge className={getTrendColor(animal.growthTrend)}>
                <span className="mr-1">{getTrendIcon(animal.growthTrend)}</span>
                {language === 'am' 
                  ? animal.growthTrend === 'up' ? 'እድገት' : animal.growthTrend === 'down' ? 'መቀነስ' : 'ቋሚ'
                  : animal.growthTrend === 'up' ? 'Growing' : animal.growthTrend === 'down' ? 'Declining' : 'Stable'
                }
              </Badge>
            )}
          </div>

          {/* Weight Info */}
          <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                {language === 'am' ? 'የአሁን ክብደት' : 'Current Weight'}
              </p>
              <p className="font-semibold text-lg">
                {animal.currentWeight ? `${animal.currentWeight} kg` : '--'}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">
                {language === 'am' ? 'መጨረሻ የተመዘገበ' : 'Last Weighed'}
              </p>
              <p className="text-sm flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(animal.lastWeighed)}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => onAddWeight(animal.id)}
            >
              <Scale className="w-4 h-4 mr-1" />
              {language === 'am' ? 'ክብደት ጨምር' : 'Add Weight'}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onViewChart(animal.id)}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              {language === 'am' ? 'ቻርት ይመልከቱ' : 'View Chart'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
