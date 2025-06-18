
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Calendar, X } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { toast } from 'sonner';

interface WeightEntryFormProps {
  language: 'am' | 'en';
  onClose: () => void;
}

interface Animal {
  id: string;
  name: string;
  type: string;
  breed: string;
}

export const WeightEntryForm = ({ language, onClose }: WeightEntryFormProps) => {
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const { addToQueue } = useOfflineSync();

  // Mock animals data - in real app this would come from storage/API
  const animals: Animal[] = [
    { id: '1', name: 'ሞላ', type: 'cattle', breed: 'ቦራ' },
    { id: '2', name: 'አበባ', type: 'cattle', breed: 'ሆላንድ' },
    { id: '3', name: 'ገብሬ', type: 'goat', breed: 'አርሲ-ባሌ' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAnimal || !weight) {
      toast.error(language === 'am' ? 'እባክዎ ሁல ጥ አነ ሞሉ' : 'Please fill all required fields');
      return;
    }

    const weightRecord = {
      id: `weight-${Date.now()}`,
      animalId: selectedAnimal,
      weight: parseFloat(weight),
      date,
      notes,
      recordedAt: new Date().toISOString()
    };

    addToQueue('growth', weightRecord);
    
    toast.success(
      language === 'am' 
        ? '✅ ክብደት በተሳካ ሁኔታ ተመዝግቧል'
        : '✅ Weight recorded successfully'
    );

    onClose();
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'cattle': return '🐄';
      case 'goat': return '🐐';
      case 'sheep': return '🐑';
      case 'poultry': return '🐔';
      default: return '🐾';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Scale className="w-5 h-5 text-green-600" />
              <span>{language === 'am' ? '📏 ክብደት መዝገብ' : '📏 Weight Entry'}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Animal Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'እንስሳ ይምረጡ' : 'Select Animal'}
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={selectedAnimal}
                onChange={(e) => setSelectedAnimal(e.target.value)}
              >
                <option value="">
                  {language === 'am' ? 'እንስሳ ይምረጡ...' : 'Choose an animal...'}
                </option>
                {animals.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {getTypeEmoji(animal.type)} {animal.name} ({animal.breed})
                  </option>
                ))}
              </select>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ክብደት (ኪ.ግ)' : 'Weight (kg)'}
              </label>
              <input
                type="number"
                step="0.1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder={language === 'am' ? 'ክብደት በኪሎ ግራም' : 'Weight in kilograms'}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                <Calendar className="w-4 h-4 inline mr-2" />
                {language === 'am' ? 'ቀን' : 'Date'}
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ማስታወሻ' : 'Notes (Optional)'}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder={language === 'am' ? 'ተጨማሪ መረጃ...' : 'Additional notes...'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Scale className="w-4 h-4 mr-2" />
              {language === 'am' ? 'ክብደት መዝግብ' : 'Record Weight'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
