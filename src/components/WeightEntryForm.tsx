
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Calendar, X } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { toast } from 'sonner';
import { validateInput, validateDate, sanitizeInput } from '@/utils/animalIdGenerator';
import { DatePicker } from './DatePicker';

interface WeightEntryFormProps {
  language: 'am' | 'en';
  onClose: () => void;
  onWeightAdded: (weightData: any) => void;
}

interface Animal {
  id: string;
  name: string;
  type: string;
  breed: string;
  animal_code: string;
}

export const WeightEntryForm = ({ language, onClose, onWeightAdded }: WeightEntryFormProps) => {
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addToQueue } = useOfflineSync();

  // Mock animals data - in real app this would come from storage/API
  const animals: Animal[] = [
    { id: '1', name: 'ሞላ', type: 'cattle', breed: 'ቦራ', animal_code: 'FARM-COW-001-241222' },
    { id: '2', name: 'አበባ', type: 'cattle', breed: 'ሆላንድ', animal_code: 'FARM-COW-002-241222' },
    { id: '3', name: 'ገብሬ', type: 'goat', breed: 'አርሲ-ባሌ', animal_code: 'FARM-GOT-001-241222' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedAnimal) {
      newErrors.animal = language === 'am' ? 'እባክዎ እንስሳ ይምረጡ' : 'Please select an animal';
    }
    if (!validateInput(weight, 'weight')) {
      newErrors.weight = language === 'am' ? 'ትክክለኛ ክብደት ያስገቡ (0-5000 ኪግ)' : 'Please enter valid weight (0-5000 kg)';
    }
    if (!validateDate(date, 'past')) {
      newErrors.date = language === 'am' ? 'ቀን ከዛሬ በፊት መሆን አለበት' : 'Date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const weightRecord = {
      id: `weight-${Date.now()}`,
      animalId: selectedAnimal,
      weight: parseFloat(weight),
      date: date.toISOString().split('T')[0],
      notes: sanitizeInput(notes),
      recordedAt: new Date().toISOString()
    };

    addToQueue('growth', weightRecord);
    
    toast.success(
      language === 'am' 
        ? '✅ ክብደት በተሳካ ሁኔታ ተመዝግቧል'
        : '✅ Weight recorded successfully'
    );

    onWeightAdded(weightRecord);
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm sm:text-lg flex items-center space-x-1 sm:space-x-2">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span>{language === 'am' ? '📏 ክብደት መዝገብ' : '📏 Weight Entry'}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 sm:h-8 sm:w-8 p-0">
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="px-3 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Animal Selection */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'እንስሳ ይምረጡ' : 'Select Animal'} *
              </label>
              <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder={language === 'am' ? 'እንስሳ ይምረጡ...' : 'Choose an animal...'} />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {getTypeEmoji(animal.type)} {animal.name} ({animal.animal_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.animal && <p className="text-xs text-red-600">{errors.animal}</p>}
            </div>

            {/* Weight */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'ክብደት (ኪ.ግ)' : 'Weight (kg)'} *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5000"
                className="h-8 sm:h-10 text-xs sm:text-sm"
                placeholder={language === 'am' ? 'ክብደት በኪሎ ግራም' : 'Weight in kilograms'}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              {errors.weight && <p className="text-xs text-red-600">{errors.weight}</p>}
            </div>

            {/* Date */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{language === 'am' ? 'ቀን' : 'Date'} *</span>
              </label>
              <DatePicker
                date={date}
                onDateChange={(newDate) => setDate(newDate || new Date())}
                placeholder={language === 'am' ? 'ቀን ይምረጡ' : 'Select date'}
                language={language}
              />
              {errors.date && <p className="text-xs text-red-600">{errors.date}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'ማስታወሻ' : 'Notes (Optional)'}
              </label>
              <Input
                className="h-8 sm:h-10 text-xs sm:text-sm"
                placeholder={language === 'am' ? 'ተጨማሪ መረጃ...' : 'Additional notes...'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
              />
            </div>

            {/* Submit */}
            <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700 h-8 sm:h-10 text-xs sm:text-sm"
              >
                <Scale className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {language === 'am' ? 'ክብደት መዝግብ' : 'Record Weight'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
              >
                {language === 'am' ? 'ሰርዝ' : 'Cancel'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
