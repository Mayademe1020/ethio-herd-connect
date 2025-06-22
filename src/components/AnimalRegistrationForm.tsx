
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, User, Weight, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from './DatePicker';
import { breedsByType } from '@/utils/breedData';
import { AnimalIdDisplay } from '@/components/AnimalIdDisplay';
import { generateAnimalId, validateInput, sanitizeInput } from '@/utils/animalIdGenerator';

interface AnimalRegistrationFormProps {
  language: 'am' | 'en';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AnimalRegistrationForm: React.FC<AnimalRegistrationFormProps> = ({
  language,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    customBreed: '',
    age: '',
    weight: ''
  });
  const [birthDate, setBirthDate] = useState<Date>();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [farmProfile, setFarmProfile] = useState<any>(null);
  const [generatedAnimalId, setGeneratedAnimalId] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToQueue, isOnline } = useOfflineSync();
  const { toast } = useToast();

  React.useEffect(() => {
    fetchFarmProfile();
  }, []);

  React.useEffect(() => {
    if (formData.type && farmProfile) {
      const newId = generateAnimalId(formData.type, farmProfile.farm_prefix || 'FARM');
      setGeneratedAnimalId(newId);
    }
  }, [formData.type, farmProfile]);

  const fetchFarmProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('farm_profiles')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setFarmProfile(data);
    } catch (error) {
      console.error('Error fetching farm profile:', error);
    }
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photo) return null;

    const fileExt = photo.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${(await supabase.auth.getUser()).data.user?.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('animal-photos')
      .upload(filePath, photo);

    if (uploadError) {
      console.error('Photo upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('animal-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!validateInput(formData.name, 'name')) {
      newErrors.name = language === 'am' ? 'ስም ያስፈልጋል' : 'Name is required';
    }

    // Validate type
    if (!formData.type) {
      newErrors.type = language === 'am' ? 'አይነት ያስፈልጋል' : 'Type is required';
    }

    // Validate age
    if (formData.age && !validateInput(formData.age, 'age')) {
      newErrors.age = language === 'am' ? 'ትክክለኛ እድሜ ያስገቡ (0-50)' : 'Please enter a valid age (0-50)';
    }

    // Validate weight
    if (formData.weight && !validateInput(formData.weight, 'weight')) {
      newErrors.weight = language === 'am' ? 'ትክክለኛ ክብደት ያስገቡ' : 'Please enter a valid weight';
    }

    // Validate birth date
    if (birthDate && birthDate > new Date()) {
      newErrors.birthDate = language === 'am' ? 'የመወለድ ቀን ከዛሬ በፊት መሆን አለበት' : 'Birth date cannot be in the future';
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

      let uploadedPhotoUrl: string | null = null;
      
      if (isOnline && photo) {
        uploadedPhotoUrl = await uploadPhoto();
      }

      const finalBreed = formData.breed === 'other' ? sanitizeInput(formData.customBreed) : formData.breed;

      const animalData = {
        animal_code: generatedAnimalId,
        user_id: user.id,
        name: sanitizeInput(formData.name),
        type: formData.type,
        breed: finalBreed || null,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        birth_date: birthDate?.toISOString().split('T')[0] || null,
        photo_url: uploadedPhotoUrl,
        health_status: 'healthy',
        is_vet_verified: false
      };

      if (isOnline) {
        const { error } = await supabase
          .from('animals')
          .insert([animalData]);

        if (error) throw error;

        toast({
          title: language === 'am' ? 'ተሳክቷል' : 'Success',
          description: language === 'am' ? `${formData.name} (${generatedAnimalId}) ተመዝግቧል` : `${formData.name} (${generatedAnimalId}) registered successfully`
        });
      } else {
        addToQueue('animal', animalData);
        toast({
          title: language === 'am' ? 'ኦፍላይን ተቀምጧል' : 'Saved Offline',
          description: language === 'am' ? 'በመስመር ላይ ሲሆኑ ይመጣል' : 'Will sync when online'
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error registering animal:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'እንስሳ መመዝገብ አልተሳካም' : 'Failed to register animal',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const availableBreeds = formData.type ? breedsByType[formData.type as keyof typeof breedsByType] || [] : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base lg:text-lg">
            {language === 'am' ? 'አዲስ እንስሳ ምዝገባ' : 'Register New Animal'}
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
                {language === 'am' ? 'የእንስሳ መለያ' : 'Animal ID'}
              </label>
              <AnimalIdDisplay 
                animalId={generatedAnimalId} 
                showCopy={true}
                size="sm"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Photo Upload */}
            <div className="text-center">
              <div className="relative inline-block">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Animal preview"
                    className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover border-2 sm:border-4 border-green-200"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gray-200 border-2 sm:border-4 border-green-200 flex items-center justify-center">
                    <Camera className="w-6 h-6 sm:w-12 sm:h-12 text-gray-400" />
                  </div>
                )}
                <Button
                  type="button"
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full w-6 h-6 sm:w-10 sm:h-10 p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                {language === 'am' ? 'ፎቶ ይጨምሩ' : 'Add Photo'}
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/*"
                className="hidden"
                capture="environment"
              />
            </div>

            {/* Name */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{language === 'am' ? 'ስም' : 'Name'} *</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={language === 'am' ? 'የእንስሳው ስም' : 'Animal name'}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Type */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'አይነት' : 'Type'} *
              </label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, breed: '' }))}>
                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder={language === 'am' ? 'እንስሳ አይነት ይምረጡ' : 'Select animal type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cattle">
                    🐄 {language === 'am' ? 'ከብት' : 'Cattle'}
                  </SelectItem>
                  <SelectItem value="poultry">
                    🐔 {language === 'am' ? 'ዶሮ' : 'Poultry'}
                  </SelectItem>
                  <SelectItem value="goat">
                    🐐 {language === 'am' ? 'ፍየል' : 'Goat'}
                  </SelectItem>
                  <SelectItem value="sheep">
                    🐑 {language === 'am' ? 'በግ' : 'Sheep'}
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-red-600">{errors.type}</p>}
            </div>

            {/* Breed - Shows after type selection */}
            {formData.type && (
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">
                  {language === 'am' ? 'ዝርያ' : 'Breed'}
                </label>
                <Select value={formData.breed} onValueChange={(value) => setFormData(prev => ({ ...prev, breed: value }))}>
                  <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder={language === 'am' ? 'ዝርያ ይምረጡ' : 'Select breed'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBreeds.map((breed) => (
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
            )}

            {/* Birth Date */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{language === 'am' ? 'የመወለድ ቀን' : 'Birth Date'}</span>
              </label>
              <DatePicker
                date={birthDate}
                onDateChange={setBirthDate}
                placeholder={language === 'am' ? 'የመወለድ ቀን ይምረጡ' : 'Select birth date'}
                language={language}
              />
              {errors.birthDate && <p className="text-xs text-red-600">{errors.birthDate}</p>}
            </div>

            {/* Age and Weight */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{language === 'am' ? 'እድሜ' : 'Age'}</span>
                </label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder={language === 'am' ? 'ዓመት' : 'Years'}
                  min="0"
                  max="50"
                  className="h-8 sm:h-10 text-xs sm:text-sm"
                />
                {errors.age && <p className="text-xs text-red-600">{errors.age}</p>}
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2">
                  <Weight className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{language === 'am' ? 'ክብደት' : 'Weight'}</span>
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
            </div>

            {/* Submit Button */}
            <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 transition-colors duration-200 h-8 sm:h-10 text-xs sm:text-sm"
              >
                {loading ? (
                  language === 'am' ? 'እየተመዘገበ...' : 'Registering...'
                ) : (
                  language === 'am' ? 'እንስሳ ይመዝግቡ' : 'Register Animal'
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
