import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, User, Weight, Calendar, Baby, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from './DatePicker';
import { breedsByType } from '@/utils/breedData';
import { AnimalIdDisplay } from '@/components/AnimalIdDisplay';
import { generateAnimalId, validateInput, sanitizeInput } from '@/utils/animalIdGenerator';

interface CalfRegistrationFormProps {
  language: 'am' | 'en';
  onClose: () => void;
  onSuccess?: () => void;
}

export const CalfRegistrationForm: React.FC<CalfRegistrationFormProps> = ({
  language,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    customBreed: '',
    weight: '',
    parentId: ''
  });
  const [birthDate, setBirthDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [farmProfile, setFarmProfile] = useState<any>(null);
  const [cows, setCows] = useState<any[]>([]);
  const [showTips, setShowTips] = useState(false);
  const [generatedAnimalId, setGeneratedAnimalId] = useState<string>('');
  
  const { addToQueue, isOnline } = useOfflineSync();
  const { toast } = useToast();

  React.useEffect(() => {
    fetchFarmProfile();
    fetchCows();
  }, []);

  React.useEffect(() => {
    if (farmProfile) {
      const newId = generateAnimalId('cattle', farmProfile.farm_prefix || 'FARM');
      setGeneratedAnimalId(newId);
    }
  }, [farmProfile]);

  const fetchFarmProfile = async () => {
    try {
      const { data } = await supabase.from('farm_profiles').select('*').single();
      setFarmProfile(data);
    } catch (error) {
      console.error('Error fetching farm profile:', error);
    }
  };

  const fetchCows = async () => {
    try {
      const { data } = await supabase
        .from('animals')
        .select('id, name, animal_code')
        .eq('type', 'cattle');
      setCows(data || []);
    } catch (error) {
      console.error('Error fetching cows:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateInput(formData.name, 'name')) {
      newErrors.name = language === 'am' ? 'ስም ያስፈልጋል' : 'Name is required';
    }
    if (!birthDate) {
      newErrors.birthDate = language === 'am' ? 'የመወለድ ቀን ያስፈልጋል' : 'Birth date is required';
    }
    if (birthDate && birthDate > new Date()) {
      newErrors.birthDate = language === 'am' ? 'የመወለድ ቀን ከዛሬ በፊት መሆን አለበት' : 'Birth date cannot be in the future';
    }
    if (formData.weight && !validateInput(formData.weight, 'weight')) {
      newErrors.weight = language === 'am' ? 'ትክክለኛ ክብደት ያስገቡ' : 'Please enter a valid weight';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const finalBreed = formData.breed === 'other' ? sanitizeInput(formData.customBreed) : formData.breed;

      const calfData = {
        animal_code: generatedAnimalId,
        user_id: user.id,
        name: sanitizeInput(formData.name),
        type: 'cattle',
        breed: finalBreed || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        birth_date: birthDate?.toISOString().split('T')[0],
        parent_id: formData.parentId || null,
        health_status: 'healthy',
        is_vet_verified: false
      };

      if (isOnline) {
        const { error } = await supabase.from('animals').insert([calfData]);
        if (error) throw error;

        toast({
          title: language === 'am' ? 'ተሳክቷል' : 'Success',
          description: language === 'am' 
            ? `${formData.name} (${generatedAnimalId}) ተመዝግቧል` 
            : `${formData.name} (${generatedAnimalId}) registered successfully`
        });
      } else {
        addToQueue('animal', calfData);
        toast({
          title: language === 'am' ? 'ኦፍላይን ተቀምጧል' : 'Saved Offline',
          description: language === 'am' ? 'በመስመር ላይ ሲሆኑ ይመጣል' : 'Will sync when online'
        });
      }

      setShowTips(true);
    } catch (error) {
      console.error('Error registering calf:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ጥጃ መመዝገብ አልተሳካም' : 'Failed to register calf',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (showTips) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base flex items-center space-x-1 sm:space-x-2">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                <span>{language === 'am' ? 'የጥጃ እንክብካቤ መመሪያ' : 'Calf Care Guide'}</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div>
                <h4 className="font-medium text-green-600 text-xs sm:text-sm">
                  {language === 'am' ? 'የመጀመሪያ ክትባት:' : 'First Vaccination:'}
                </h4>
                <p className="text-xs sm:text-sm">{language === 'am' ? '90 ቀን (3 ወር) ዕድሜ ላይ' : 'At 90 days (3 months) of age'}</p>
              </div>
              <div>
                <h4 className="font-medium text-green-600 text-xs sm:text-sm">
                  {language === 'am' ? 'ማጥባት:' : 'Weaning:'}
                </h4>
                <p className="text-xs sm:text-sm">{language === 'am' ? '6-8 ወር ዕድሜ ላይ' : 'At 6-8 months of age'}</p>
              </div>
              <div>
                <h4 className="font-medium text-green-600 text-xs sm:text-sm">
                  {language === 'am' ? 'የክብደት መከታተያ:' : 'Weight Monitoring:'}
                </h4>
                <p className="text-xs sm:text-sm">{language === 'am' ? 'በየ2 ሳምንቱ' : 'Every 2 weeks'}</p>
              </div>
            </div>
            <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4">
              <Button 
                onClick={() => { onClose(); onSuccess?.(); }} 
                className="flex-1 bg-green-600 hover:bg-green-700 h-8 sm:h-10 text-xs sm:text-sm"
              >
                {language === 'am' ? 'ተረድቻለሁ' : 'Got it'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center space-x-1 sm:space-x-2">
            <Baby className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{language === 'am' ? 'ጥጃ ምዝገባ' : 'Register Calf'}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 sm:h-8 sm:w-8 p-0">
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="px-3 sm:px-6 space-y-3 sm:space-y-4">
          {/* Generated Animal ID Preview */}
          {generatedAnimalId && (
            <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
              <label className="text-xs sm:text-sm font-medium text-green-800 mb-1 sm:mb-2 block">
                {language === 'am' ? 'የጥጃ መለያ' : 'Calf ID'}
              </label>
              <AnimalIdDisplay 
                animalId={generatedAnimalId} 
                showCopy={true}
                size="sm"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Name */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{language === 'am' ? 'የጥጃ ስም' : 'Calf Name'} *</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={language === 'am' ? 'የጥጃው ስም' : 'Calf name'}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Birth Date */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{language === 'am' ? 'የመወለድ ቀን' : 'Birth Date'} *</span>
              </label>
              <DatePicker
                date={birthDate}
                onDateChange={setBirthDate}
                placeholder={language === 'am' ? 'የመወለድ ቀን ይምረጡ' : 'Select birth date'}
                language={language}
              />
              {errors.birthDate && <p className="text-xs text-red-600">{errors.birthDate}</p>}
            </div>

            {/* Parent Cow Selection */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'እናት ላም' : 'Mother Cow'}
              </label>
              <Select value={formData.parentId} onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}>
                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder={language === 'am' ? 'እናት ላም ይምረጡ' : 'Select mother cow'} />
                </SelectTrigger>
                <SelectContent>
                  {cows.map((cow) => (
                    <SelectItem key={cow.id} value={cow.id}>
                      {cow.name} ({cow.animal_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Breed */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'ዝርያ' : 'Breed'}
              </label>
              <Select value={formData.breed} onValueChange={(value) => setFormData(prev => ({ ...prev, breed: value }))}>
                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder={language === 'am' ? 'ዝርያ ይምረጡ' : 'Select breed'} />
                </SelectTrigger>
                <SelectContent>
                  {breedsByType.cattle.map((breed) => (
                    <SelectItem key={breed} value={breed.toLowerCase().replace(/\s+/g, '_')}>
                      {breed}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">
                    {language === 'am' ? 'ሌላ' : 'Other'}
                  </SelectItem>
                </SelectContent>
              </Select>

              {formData.breed === 'other' && (
                <Input
                  value={formData.customBreed}
                  onChange={(e) => setFormData(prev => ({ ...prev, customBreed: e.target.value }))}
                  placeholder={language === 'am' ? 'ዝርያ ይጻፉ' : 'Enter breed name'}
                  className="mt-1 sm:mt-2 h-8 sm:h-10 text-xs sm:text-sm"
                />
              )}
            </div>

            {/* Weight */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2">
                <Weight className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{language === 'am' ? 'የመወለድ ክብደት' : 'Birth Weight'}</span>
              </label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="kg"
                min="0"
                step="0.1"
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
              {errors.weight && <p className="text-xs text-red-600">{errors.weight}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 h-8 sm:h-10 text-xs sm:text-sm"
              >
                {loading ? (
                  language === 'am' ? 'እየተመዘገበ...' : 'Registering...'
                ) : (
                  language === 'am' ? 'ጥጃ ይመዝግቡ' : 'Register Calf'
                )}
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
