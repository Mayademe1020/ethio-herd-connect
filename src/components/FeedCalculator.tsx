
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Wheat, Scale, TrendingUp, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeedCalculatorProps {
  language: 'am' | 'en';
}

export const FeedCalculator: React.FC<FeedCalculatorProps> = ({ language }) => {
  const [formData, setFormData] = useState({
    animalType: '',
    weight: '',
    age: '',
    activity: 'normal' as 'low' | 'normal' | 'high',
    target: 'maintenance' as 'maintenance' | 'growth' | 'lactation'
  });
  const [results, setResults] = useState<{
    dailyFeed: number;
    concentrate: number;
    roughage: number;
    water: number;
    cost?: number;
  } | null>(null);
  const { toast } = useToast();

  const calculateFeed = () => {
    if (!formData.animalType || !formData.weight) {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'የእንስሳ ዓይነት እና ክብደት ያስፈልጋል' : 'Animal type and weight are required',
        variant: 'destructive'
      });
      return;
    }

    const weight = parseFloat(formData.weight);
    let baseFeed = 0;
    let concentrateRatio = 0.3;
    let roughageRatio = 0.7;

    // Base feed calculation (% of body weight)
    switch (formData.animalType) {
      case 'cattle':
        baseFeed = weight * 0.025; // 2.5% of body weight
        break;
      case 'goat':
      case 'sheep':
        baseFeed = weight * 0.03; // 3% of body weight
        break;
      case 'poultry':
        baseFeed = weight * 0.08; // 8% of body weight for poultry
        concentrateRatio = 0.9;
        roughageRatio = 0.1;
        break;
      default:
        baseFeed = weight * 0.025;
    }

    // Adjust for activity level
    switch (formData.activity) {
      case 'low':
        baseFeed *= 0.9;
        break;
      case 'high':
        baseFeed *= 1.2;
        break;
      default:
        break;
    }

    // Adjust for target
    switch (formData.target) {
      case 'growth':
        baseFeed *= 1.3;
        concentrateRatio += 0.1;
        break;
      case 'lactation':
        baseFeed *= 1.5;
        concentrateRatio += 0.15;
        break;
      default:
        break;
    }

    // Ensure ratios don't exceed 1
    if (concentrateRatio > 0.9) concentrateRatio = 0.9;
    roughageRatio = 1 - concentrateRatio;

    const concentrate = baseFeed * concentrateRatio;
    const roughage = baseFeed * roughageRatio;
    const water = weight * 0.05; // 5% of body weight for water
    const estimatedCost = baseFeed * 15; // Estimated cost per kg in Ethiopian Birr

    setResults({
      dailyFeed: baseFeed,
      concentrate,
      roughage,
      water,
      cost: estimatedCost
    });

    toast({
      title: language === 'am' ? 'ተሳክቷል' : 'Success',
      description: language === 'am' ? 'የመኖ ስሌት ተሟልቷል' : 'Feed calculation completed'
    });
  };

  const resetCalculator = () => {
    setFormData({
      animalType: '',
      weight: '',
      age: '',
      activity: 'normal',
      target: 'maintenance'
    });
    setResults(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-green-600" />
            <span>{language === 'am' ? 'የመኖ አሰሳቢ' : 'Feed Calculator'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Animal Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'am' ? 'የእንስሳ ዓይነት' : 'Animal Type'} *
            </label>
            <Select value={formData.animalType} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, animalType: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder={language === 'am' ? 'ይምረጡ' : 'Select'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cattle">
                  {language === 'am' ? 'ከብት' : 'Cattle'}
                </SelectItem>
                <SelectItem value="goat">
                  {language === 'am' ? 'ፍየል' : 'Goat'}
                </SelectItem>
                <SelectItem value="sheep">
                  {language === 'am' ? 'በግ' : 'Sheep'}
                </SelectItem>
                <SelectItem value="poultry">
                  {language === 'am' ? 'ዶሮ' : 'Poultry'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'am' ? 'ክብደት (ኪሎ)' : 'Weight (kg)'} *
            </label>
            <Input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
              placeholder={language === 'am' ? 'ክብደት በኪሎ' : 'Weight in kg'}
            />
          </div>

          {/* Age (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'am' ? 'እድሜ (ወር)' : 'Age (months)'}
            </label>
            <Input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              placeholder={language === 'am' ? 'እድሜ' : 'Age'}
            />
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'am' ? 'እንቅስቃሴ ደረጃ' : 'Activity Level'}
            </label>
            <Select value={formData.activity} onValueChange={(value: 'low' | 'normal' | 'high') => 
              setFormData(prev => ({ ...prev, activity: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  {language === 'am' ? 'ዝቅተኛ' : 'Low'}
                </SelectItem>
                <SelectItem value="normal">
                  {language === 'am' ? 'መካከለኛ' : 'Normal'}
                </SelectItem>
                <SelectItem value="high">
                  {language === 'am' ? 'ከፍተኛ' : 'High'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'am' ? 'ዓላማ' : 'Target'}
            </label>
            <Select value={formData.target} onValueChange={(value: 'maintenance' | 'growth' | 'lactation') => 
              setFormData(prev => ({ ...prev, target: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">
                  {language === 'am' ? 'መጠበቅ' : 'Maintenance'}
                </SelectItem>
                <SelectItem value="growth">
                  {language === 'am' ? 'እድገት' : 'Growth'}
                </SelectItem>
                <SelectItem value="lactation">
                  {language === 'am' ? 'ማጥባት' : 'Lactation'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button onClick={calculateFeed} className="flex-1 bg-green-600 hover:bg-green-700">
              <Calculator className="w-4 h-4 mr-2" />
              {language === 'am' ? 'አስሳብ' : 'Calculate'}
            </Button>
            <Button variant="outline" onClick={resetCalculator}>
              {language === 'am' ? 'ዳግም አስጀምር' : 'Reset'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Wheat className="w-5 h-5" />
              <span>{language === 'am' ? 'የመኖ ሲዝላት' : 'Feed Recommendations'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">
                      {language === 'am' ? 'ጠቅላላ ቀኋይ መኖ' : 'Total Daily Feed'}
                    </span>
                  </div>
                  <span className="font-bold text-blue-600">
                    {results.dailyFeed.toFixed(2)} kg
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Wheat className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">
                      {language === 'am' ? 'ከንትራት' : 'Concentrate'}
                    </span>
                  </div>
                  <span className="font-bold text-orange-600">
                    {results.concentrate.toFixed(2)} kg
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="font-medium">
                      {language === 'am' ? 'ሸዋጅ መኖ' : 'Roughage'}
                    </span>
                  </div>
                  <span className="font-bold text-green-600">
                    {results.roughage.toFixed(2)} kg
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 text-blue-400">💧</span>
                    <span className="font-medium">
                      {language === 'am' ? 'ውሃ' : 'Water'}
                    </span>
                  </div>
                  <span className="font-bold text-blue-600">
                    {results.water.toFixed(1)} L
                  </span>
                </div>

                {results.cost && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 text-yellow-500">💰</span>
                      <span className="font-medium">
                        {language === 'am' ? 'ወጪ/ቀን' : 'Daily Cost'}
                      </span>
                    </div>
                    <span className="font-bold text-yellow-600">
                      {results.cost.toFixed(0)} ETB
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Note */}
            <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-700">
                {language === 'am' 
                  ? 'እነዚህ ስሌቶች አጠቃላይ መመሪያዎች ናቸው። በአካባቢዎ የሚገኝ የእንስሳት ሐኪም ወይም የእንስሳት አዋላጅ ጋር ይማከሩ።'
                  : 'These calculations are general guidelines. Please consult with your local veterinarian or animal nutritionist for specific recommendations.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
