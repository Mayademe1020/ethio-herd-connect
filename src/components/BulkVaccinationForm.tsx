
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Syringe, Calendar, X, Check } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { toast } from 'sonner';

interface BulkVaccinationFormProps {
  language: 'am' | 'en';
  onClose: () => void;
}

interface Animal {
  id: string;
  name: string;
  type: string;
  breed: string;
}

export const BulkVaccinationForm = ({ language, onClose }: BulkVaccinationFormProps) => {
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [vaccinationData, setVaccinationData] = useState({
    medicine: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const { addToQueue } = useOfflineSync();

  // Mock animals data - in real app this would come from storage/API
  const animals: Animal[] = [
    { id: '1', name: 'ሞላ', type: 'cattle', breed: 'ቦራ' },
    { id: '2', name: 'አበባ', type: 'cattle', breed: 'ሆላንድ' },
    { id: '3', name: 'ገብሬ', type: 'goat', breed: 'አርሲ-ባሌ' }
  ];

  const toggleAnimalSelection = (animalId: string) => {
    setSelectedAnimals(prev => 
      prev.includes(animalId) 
        ? prev.filter(id => id !== animalId)
        : [...prev, animalId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedAnimals.length === 0) {
      toast.error(language === 'am' ? 'እንስሳት ይምረጡ' : 'Please select animals');
      return;
    }

    const vaccinationRecord = {
      id: `vaccination-${Date.now()}`,
      animalIds: selectedAnimals,
      medicine: vaccinationData.medicine,
      date: vaccinationData.date,
      notes: vaccinationData.notes,
      recordedAt: new Date().toISOString()
    };

    addToQueue('health', vaccinationRecord);
    
    toast.success(
      language === 'am' 
        ? `✅ ${selectedAnimals.length} እንስሳት ክትባት ተሰጥቷቸዋል`
        : `✅ Vaccination recorded for ${selectedAnimals.length} animals`
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
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Syringe className="w-5 h-5 text-blue-600" />
              <span>{language === 'am' ? '💉 ጅምላ ክትባት' : '💉 Bulk Vaccination'}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Animal Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">
                {language === 'am' ? 'እንስሳት ይምረጡ' : 'Select Animals'}
              </h3>
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {animals.map((animal) => (
                  <div
                    key={animal.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedAnimals.includes(animal.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => toggleAnimalSelection(animal.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeEmoji(animal.type)}</span>
                        <div>
                          <p className="font-medium">{animal.name}</p>
                          <p className="text-sm text-gray-600">{animal.breed}</p>
                        </div>
                      </div>
                      {selectedAnimals.includes(animal.id) && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {selectedAnimals.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {selectedAnimals.length} {language === 'am' ? 'እንስሳት ተመርጠዋል' : 'animals selected'}
                </Badge>
              )}
            </div>

            {/* Medicine */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'መድሃኒት' : 'Medicine/Vaccine'}
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={language === 'am' ? 'ለምሳሌ: ጥንዶት ክትባት' : 'e.g: FMD Vaccine'}
                value={vaccinationData.medicine}
                onChange={(e) => setVaccinationData({ ...vaccinationData, medicine: e.target.value })}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={vaccinationData.date}
                onChange={(e) => setVaccinationData({ ...vaccinationData, date: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ማስታወሻ' : 'Notes (Optional)'}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder={language === 'am' ? 'ተጨማሪ መረጃ...' : 'Additional notes...'}
                value={vaccinationData.notes}
                onChange={(e) => setVaccinationData({ ...vaccinationData, notes: e.target.value })}
              />
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={selectedAnimals.length === 0}
            >
              <Syringe className="w-4 h-4 mr-2" />
              {language === 'am' 
                ? `${selectedAnimals.length} እንስሳትን ክትባት ስጥ`
                : `Vaccinate ${selectedAnimals.length} Animals`
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
