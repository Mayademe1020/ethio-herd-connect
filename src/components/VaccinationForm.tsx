
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Syringe, Calendar, X, Check, Search, User, FileText } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VaccinationFormProps {
  language: 'am' | 'en';
  onClose: () => void;
  mode: 'single' | 'bulk';
  preSelectedAnimal?: string;
}

interface Animal {
  id: string;
  name: string;
  type: string;
  breed: string;
  animal_code: string;
}

interface SavedDrug {
  name: string;
  dosage: string;
  manufacturer: string;
}

export const VaccinationForm = ({ language, onClose, mode, preSelectedAnimal }: VaccinationFormProps) => {
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>(preSelectedAnimal ? [preSelectedAnimal] : []);
  const [searchQuery, setSearchQuery] = useState('');
  const [vaccinationData, setVaccinationData] = useState({
    medicine: '',
    date: new Date().toISOString().split('T')[0],
    vetName: '',
    notes: '',
    dosage: '',
    manufacturer: ''
  });
  const [showSavedDrugs, setShowSavedDrugs] = useState(false);
  const { addToQueue } = useOfflineSync();
  const { user } = useAuth();

  // Mock data - in real app this would come from storage/API
  const animals: Animal[] = [
    { id: '1', name: 'ሞላ', type: 'cattle', breed: 'ቦራ', animal_code: 'HAB-COW-001' },
    { id: '2', name: 'አበባ', type: 'cattle', breed: 'ሆላንድ', animal_code: 'HAB-COW-002' },
    { id: '3', name: 'ገብሬ', type: 'goat', breed: 'አርሲ-ባሌ', animal_code: 'HAB-GOT-001' }
  ];

  const savedDrugs: SavedDrug[] = [
    { name: 'FMD Vaccine', dosage: '2ml', manufacturer: 'NVI Ethiopia' },
    { name: 'Anthrax Vaccine', dosage: '1ml', manufacturer: 'ELVAC' },
    { name: 'Blackleg Vaccine', dosage: '2ml', manufacturer: 'Bioveta' },
    { name: 'Newcastle Disease', dosage: '0.5ml', manufacturer: 'KEVEVAPI' }
  ];

  const filteredAnimals = animals.filter(animal => 
    animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    animal.animal_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAnimalSelection = (animalId: string) => {
    if (mode === 'single') {
      setSelectedAnimals([animalId]);
    } else {
      setSelectedAnimals(prev => 
        prev.includes(animalId) 
          ? prev.filter(id => id !== animalId)
          : [...prev, animalId]
      );
    }
  };

  const selectAllAnimals = () => {
    setSelectedAnimals(filteredAnimals.map(a => a.id));
  };

  const selectSavedDrug = (drug: SavedDrug) => {
    setVaccinationData(prev => ({
      ...prev,
      medicine: drug.name,
      dosage: drug.dosage,
      manufacturer: drug.manufacturer
    }));
    setShowSavedDrugs(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedAnimals.length === 0) {
      toast.error(language === 'am' ? 'እንስሳት ይምረጡ' : 'Please select animals');
      return;
    }

    if (!user) {
      toast.error(language === 'am' ? 'እባክዎ በመጀመሪያ ይግቡ' : 'Please sign in first');
      return;
    }

    // Show confirmation modal for important action
    const confirmed = window.confirm(
      language === 'am' 
        ? `${selectedAnimals.length} እንስሳትን "${vaccinationData.medicine}" ክትባት ለመስጠት እርግጠኛ ነዎት?`
        : `Are you sure you want to vaccinate ${selectedAnimals.length} animals with "${vaccinationData.medicine}"?`
    );

    if (!confirmed) return;

    const vaccinationRecord = {
      id: `vaccination-${Date.now()}`,
      animalIds: selectedAnimals,
      user_id: user.id,
      medicine: vaccinationData.medicine,
      date: vaccinationData.date,
      vetName: vaccinationData.vetName,
      notes: vaccinationData.notes,
      dosage: vaccinationData.dosage,
      manufacturer: vaccinationData.manufacturer,
      recordedAt: new Date().toISOString()
    };

    addToQueue('health', vaccinationRecord);
    
    // Save drug to local storage for future use
    if (vaccinationData.medicine && vaccinationData.dosage) {
      const existingSavedDrugs = JSON.parse(localStorage.getItem('saved-drugs') || '[]');
      const newDrug = {
        name: vaccinationData.medicine,
        dosage: vaccinationData.dosage,
        manufacturer: vaccinationData.manufacturer
      };
      
      if (!existingSavedDrugs.find((d: SavedDrug) => d.name === newDrug.name)) {
        existingSavedDrugs.push(newDrug);
        localStorage.setItem('saved-drugs', JSON.stringify(existingSavedDrugs));
      }
    }
    
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
              <span>
                💉 {language === 'am' 
                  ? (mode === 'bulk' ? 'ጅምላ ክትባት' : 'ነጠላ ክትባት')
                  : (mode === 'bulk' ? 'Bulk Vaccination' : 'Single Vaccination')
                }
              </span>
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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  🐄 {language === 'am' ? 'እንስሳት ይምረጡ' : 'Select Animals'}
                </h3>
                {mode === 'bulk' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllAnimals}
                    className="text-xs"
                  >
                    {language === 'am' ? 'ሁሉንም ምረጥ' : 'Select All'}
                  </Button>
                )}
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={language === 'am' ? 'ስም ወይም ID በመተየብ ይፈልጉ...' : 'Search by name or ID...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-base"
                />
              </div>

              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {filteredAnimals.map((animal) => (
                  <div
                    key={animal.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all touch-manipulation ${
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
                          <p className="font-medium text-base">{animal.name}</p>
                          <p className="text-sm text-gray-600">{animal.animal_code}</p>
                          <p className="text-xs text-gray-500">{animal.breed}</p>
                        </div>
                      </div>
                      {selectedAnimals.includes(animal.id) && (
                        <Check className="w-6 h-6 text-green-600" />
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

            {/* Medicine Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center">
                  💉 {language === 'am' ? 'መድሃኒት' : 'Medicine/Vaccine'}
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSavedDrugs(!showSavedDrugs)}
                  className="text-xs"
                >
                  {language === 'am' ? 'የተቀመጠ መድሃኒት' : 'Saved Drugs'}
                </Button>
              </div>
              
              {showSavedDrugs && (
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 max-h-32 overflow-y-auto">
                  {savedDrugs.map((drug, index) => (
                    <div
                      key={index}
                      className="p-2 bg-white rounded border cursor-pointer hover:bg-green-50 touch-manipulation"
                      onClick={() => selectSavedDrug(drug)}
                    >
                      <p className="font-medium text-sm">{drug.name}</p>
                      <p className="text-xs text-gray-600">{drug.dosage} - {drug.manufacturer}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <Input
                type="text"
                required
                className="text-base"
                placeholder={language === 'am' ? 'ለምሳሌ: ጥንዶት ክትባት' : 'e.g: FMD Vaccine'}
                value={vaccinationData.medicine}
                onChange={(e) => setVaccinationData({ ...vaccinationData, medicine: e.target.value })}
              />
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  📏 {language === 'am' ? 'መጠን' : 'Dosage'}
                </label>
                <Input
                  type="text"
                  className="text-base"
                  placeholder={language === 'am' ? 'ለምሳሌ: 2ml' : 'e.g: 2ml'}
                  value={vaccinationData.dosage}
                  onChange={(e) => setVaccinationData({ ...vaccinationData, dosage: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {language === 'am' ? 'ቀን' : 'Date'}
                </label>
                <Input
                  type="date"
                  required
                  className="text-base"
                  value={vaccinationData.date}
                  onChange={(e) => setVaccinationData({ ...vaccinationData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                🧑‍⚕️ {language === 'am' ? 'የዶክተር ስም (አማራጭ)' : 'Vet Name (Optional)'}
              </label>
              <Input
                type="text"
                className="text-base"
                placeholder={language === 'am' ? 'የዶክተሩ ስም...' : 'Veterinarian name...'}
                value={vaccinationData.vetName}
                onChange={(e) => setVaccinationData({ ...vaccinationData, vetName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                {language === 'am' ? 'ማስታወሻ (አማራጭ)' : 'Notes (Optional)'}
              </label>
              <Textarea
                className="text-base"
                rows={3}
                placeholder={language === 'am' ? 'ተጨማሪ መረጃ...' : 'Additional notes...'}
                value={vaccinationData.notes}
                onChange={(e) => setVaccinationData({ ...vaccinationData, notes: e.target.value })}
              />
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
              disabled={selectedAnimals.length === 0}
            >
              <Syringe className="w-5 h-5 mr-2" />
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
