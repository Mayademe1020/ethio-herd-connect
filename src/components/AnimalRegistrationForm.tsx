
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToQueue, isOnline } = useOfflineSync();
  const { toast } = useToast();

  React.useEffect(() => {
    fetchFarmProfile();
  }, []);

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

    if (!formData.name.trim()) {
      newErrors.name = language === 'am' ? 'ስም ያስፈልጋል' : 'Name is required';
    }
    if (!formData.type) {
      newErrors.type = language === 'am' ? 'አይነት ያስፈልጋል' : 'Type is required';
    }
    if (formData.age && (parseInt(formData.age) < 0 || parseInt(formData.age) > 50)) {
      newErrors.age = language === 'am' ? 'ትክክለኛ እድሜ ያስገቡ' : 'Please enter a valid age';
    }
    if (formData.weight && parseFloat(formData.weight) <= 0) {
      newErrors.weight = language === 'am' ? 'ትክክለኛ ክብደት ያስገቡ' : 'Please enter a valid weight';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateAnimalCode = async (userId: string, animalType: string): Promise<string> => {
    const farmPrefix = farmProfile?.farm_prefix || 'FARM';
    
    try {
      const { data, error } = await supabase.rpc('generate_animal_code', {
        p_user_id: userId,
        p_farm_prefix: farmPrefix,
        p_animal_type: animalType
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating animal code:', error);
      const typeCode = animalType === 'cattle' ? 'COW' : animalType === 'poultry' ? 'POU' : 'ANM';
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      return `${farmPrefix}-${typeCode}-${randomNum}-${dateCode}`;
    }
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

      const animalCode = await generateAnimalCode(user.id, formData.type);
      const finalBreed = formData.breed === 'other' ? formData.customBreed : formData.breed;

      const animalData = {
        animal_code: animalCode,
        user_id: user.id,
        name: formData.name,
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
          description: language === 'am' ? `${formData.name} (${animalCode}) ተመዝግቧል` : `${formData.name} (${animalCode}) registered successfully`
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {language === 'am' ? 'አዲስ እንስሳ ምዝገባ' : 'Register New Animal'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload */}
            <div className="text-center">
              <div className="relative inline-block">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Animal preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-green-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-green-200 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <Button
                  type="button"
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
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
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{language === 'am' ? 'ስም' : 'Name'} *</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={language === 'am' ? 'የእንስሳው ስም' : 'Animal name'}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'አይነት' : 'Type'} *
              </label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, breed: '' }))}>
                <SelectTrigger>
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
              {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
            </div>

            {/* Breed - Shows after type selection */}
            {formData.type && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'am' ? 'ዝርያ' : 'Breed'}
                </label>
                <Select value={formData.breed} onValueChange={(value) => setFormData(prev => ({ ...prev, breed: value }))}>
                  <SelectTrigger>
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
                    className="mt-2"
                  />
                )}
              </div>
            )}

            {/* Birth Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{language === 'am' ? 'የመወለድ ቀን' : 'Birth Date'}</span>
              </label>
              <DatePicker
                date={birthDate}
                onDateChange={setBirthDate}
                placeholder={language === 'am' ? 'የመወለድ ቀን ይምረጡ' : 'Select birth date'}
                language={language}
              />
            </div>

            {/* Age and Weight */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{language === 'am' ? 'እድሜ' : 'Age'}</span>
                </label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder={language === 'am' ? 'ዓመት' : 'Years'}
                  min="0"
                  max="50"
                />
                {errors.age && <p className="text-sm text-red-600">{errors.age}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Weight className="w-4 h-4" />
                  <span>{language === 'am' ? 'ክብደት' : 'Weight'}</span>
                </label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="kg"
                  min="0"
                  step="0.1"
                />
                {errors.weight && <p className="text-sm text-red-600">{errors.weight}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 transition-colors duration-200"
              >
                {loading ? (
                  language === 'am' ? 'እየተመዘገበ...' : 'Registering...'
                ) : (
                  language === 'am' ? 'እንስሳ ይመዝግቡ' : 'Register Animal'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                {language === 'am' ? 'ሰርዝ' : 'Cancel'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
