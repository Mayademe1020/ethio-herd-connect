
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

interface GrowthChartProps {
  language: 'am' | 'en';
  animalId?: string;
  animalName?: string;
}

interface WeightData {
  date: string;
  weight: number;
  displayDate: string;
}

export const GrowthChart = ({ language, animalId, animalName }: GrowthChartProps) => {
  // Mock weight data - in real app this would come from storage/API
  const weightData: WeightData[] = [
    { date: '2024-01-01', weight: 45, displayDate: '01/01' },
    { date: '2024-02-01', weight: 52, displayDate: '01/02' },
    { date: '2024-03-01', weight: 58, displayDate: '01/03' },
    { date: '2024-04-01', weight: 65, displayDate: '01/04' },
    { date: '2024-05-01', weight: 71, displayDate: '01/05' },
    { date: '2024-06-01', weight: 78, displayDate: '01/06' },
  ];

  const chartConfig = {
    weight: {
      label: language === 'am' ? 'ክብደት (ኪ.ግ)' : 'Weight (kg)',
      color: 'hsl(142, 76%, 36%)',
    },
  };

  const currentWeight = weightData[weightData.length - 1]?.weight || 0;
  const previousWeight = weightData[weightData.length - 2]?.weight || 0;
  const weightGain = currentWeight - previousWeight;
  const growthRate = previousWeight > 0 ? ((weightGain / previousWeight) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span>
            {language === 'am' ? '📈 የእድገት ቻርት' : '📈 Growth Chart'}
            {animalName && ` - ${animalName}`}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Growth Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <p className="text-2xl font-bold text-green-700">{currentWeight}</p>
            <p className="text-sm text-green-600">
              {language === 'am' ? 'የአሁን ክብደት' : 'Current Weight'}
            </p>
            <p className="text-xs text-gray-500">kg</p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-2xl font-bold text-blue-700">
              {weightGain > 0 ? '+' : ''}{weightGain.toFixed(1)}
            </p>
            <p className="text-sm text-blue-600">
              {language === 'am' ? 'የወር ጭማሪ' : 'Monthly Gain'}
            </p>
            <p className="text-xs text-gray-500">kg</p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <p className="text-2xl font-bold text-purple-700">
              {growthRate.toFixed(1)}%
            </p>
            <p className="text-sm text-purple-600">
              {language === 'am' ? 'የእድገት መጠን' : 'Growth Rate'}
            </p>
            <p className="text-xs text-gray-500">
              {language === 'am' ? 'በወር' : 'per month'}
            </p>
          </div>
        </div>

        {/* Weight Chart */}
        <div className="h-64">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => `${language === 'am' ? 'ቀን' : 'Date'}: ${value}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="var(--color-weight)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-weight)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Growth Insights */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-start space-x-2">
            <Calendar className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">
                {language === 'am' ? '💡 የእድገት ምክር' : '💡 Growth Insight'}
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                {language === 'am' 
                  ? `እንስሳዎ በቅርብ ወር ${weightGain.toFixed(1)} ኪግ አግኝቷል። ይህ ${growthRate > 5 ? 'ጥሩ' : growthRate > 0 ? 'መካከለኛ' : 'ዝቅተኛ'} የእድገት መጠን ነው።`
                  : `Your animal gained ${weightGain.toFixed(1)} kg last month. This is a ${growthRate > 5 ? 'good' : growthRate > 0 ? 'moderate' : 'low'} growth rate.`
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
