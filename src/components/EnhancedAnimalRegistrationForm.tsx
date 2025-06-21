
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, User, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useToast } from '@/hooks/use-toast';
import { AnimalPhotoUpload } from './AnimalPhotoUpload';
import { breedsByType } from '@/utils/breedData';

interface EnhancedAnimalRegistrationFormProps {
  language: 'am' | 'en';
  onClose: () => void;
  onSuccess?: () => void;
  editAnimal?: Animal | null;
}

interface Animal {
  id?: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  photo_url?: string;
  health_status: 'healthy' | 'attention' | 'sick';
  tracker_id?: string;
  animal_code?: string;
}

export const EnhancedAnimalRegistrationForm: React.FC<EnhancedAnimalRegistrationFormProps> = ({
  language,
  onClose,
  onSuccess,
  editAnimal
}) => {
  const [formData, setFormData] = useState({
    name: editAnimal?.name || '',
    type: editAnimal?.type || '',
    breed: editAnimal?.breed || '',
    customBreed: '',
    age: editAnimal?.age?.toString() || '',
    weight: editAnimal?.weight?.toString() || '',
    health_status: editAnimal?.health_status || 'healthy',
    tracker_id: editAnimal?.tracker_id || ''
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>(editAnimal?.photo_url || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [farmProfile, setFarmProfile] = useState<any>(null);
  
  const { addToQueue, isOnline } = useOfflineSync();
  const { toast } = useToast();

  useEffect(() => {
    fetchFarmProfile();
  }, []);

  const fetchFarmProfile = async () => {
    try {
      const { data } = await supabase.from('farm_profiles').select('*').single();
      setFarmProfile(data);
    } catch (error) {
      console.error('Error fetching farm profile:', error);
    }
  };

  const validateTrackerID = (trackerId: string): boolean => {
    // Format: HBS-xxx-xxxx
    const pattern = /^HBS-\d{3}-\d{4}$/;
    return pattern.test(trackerId);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = language === 'am' ? 'ስም ያስፈልጋል' : 'Name is required';
    }
    
    if (!formData.type) {
      newErrors.type = language === 'am' ? 'አይነት ይምረጡ' : 'Type is required';
    }

    if (!formData.tracker_id.trim()) {
      newErrors.tracker_id = language === 'am' ? 'የመከታተያ ቁጥር ያስፈልጋል' : 'Tracker ID is required';
    } else if (!validateTrackerID(formData.tracker_id)) {
      newErrors.tracker_id = language === 'am' 
        ? 'ትክክለኛ ቅርጸት: HBS-123-4567' 
        : 'Valid format: HBS-123-4567';
    }

    if (formData.age && parseFloat(formData.age) <= 0) {
      newErrors.age = language === 'am' ? 'ትክክለኛ እድሜ ያስገቡ' : 'Please enter a valid age';
    }

    if (formData.weight && parseFloat(formData.weight) <= 0) {
      newErrors.weight = language === 'am' ? 'ትክክለኛ ክብደት ያስገቡ' : 'Please enter a valid weight';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateAnimalCode = async (userId: string): Promise<string> => {
    const farmPrefix = farmProfile?.farm_prefix || 'FARM';
    
    try {
      const { data, error } = await supabase.rpc('generate_animal_code', {
        p_user_id: userId,
        p_farm_prefix: farmPrefix,
        p_animal_type: formData.type
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating animal code:', error);
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      return `${farmPrefix}-${formData.type.toUpperCase()}-${randomNum}-${dateCode}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const finalBreed = formData.breed === 'other' ? formData.customBreed : formData.breed;
      
      let animalCode = editAnimal?.animal_code || '';
      if (!editAnimal) {
        animalCode = await generateAnimalCode(user.id);
      }

      const animalData = {
        ...(editAnimal ? { id: editAnimal.id } : {}),
        animal_code: animalCode,
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        breed: finalBreed || null,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        health_status: formData.health_status,
        tracker_id: formData.tracker_id,
        photo_url: photoUrl || null,
        is_vet_verified: false
      };

      if (isOnline) {
        let result;
        if (editAnimal) {
          result = await supabase
            .from('animals')
            .update(animalData)
            .eq('id', editAnimal.id);
        } else {
          result = await supabase.from('animals').insert([animalData]);
        }
        
        if (result.error) throw result.error;

        toast({
          title: language === 'am' ? 'ተሳክቷል' : 'Success',
          description: editAnimal
            ? (language === 'am' ? 'እንስሳ ተዘምኗል' : 'Animal updated successfully')
            : (language === 'am' 
                ? `${formData.name} (${animalCode}) ተመዝግቧል` 
                : `${formData.name} (${animalCode}) registered successfully`
              )
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
      console.error('Error saving animal:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'እንስሳ ማስቀመጥ አልተሳካም' : 'Failed to save animal',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (file: File | null, url: string) => {
    setPhotoFile(file);
    setPhotoUrl(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>
              {editAnimal 
                ? (language === 'am' ? 'እንስሳ አርትዕ' : 'Edit Animal')
                : (language === 'am' ? 'እንስሳ ይመዝግቡ' : 'Register Animal')
              }
            </span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload */}
            <AnimalPhotoUpload
              language={language}
              currentPhoto={photoUrl}
              onPhotoChange={handlePhotoChange}
              disabled={loading}
            />

            {/* Animal Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{language === 'am' ? 'የእንስሳ ስም' : 'Animal Name'} *</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={language === 'am' ? 'የእንስሳው ስም' : 'Animal name'}
                disabled={loading}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Tracker ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <Hash className="w-4 h-4" />
                <span>{language === 'am' ? 'የመከታተያ ቁጥር' : 'Tracker ID'} *</span>
              </label>
              <Input
                value={formData.tracker_id}
                onChange={(e) => setFormData(prev => ({ ...prev, tracker_id: e.target.value }))}
                placeholder="HBS-123-4567"
                disabled={loading}
              />
              {errors.tracker_id && <p className="text-sm text-red-600">{errors.tracker_id}</p>}
              <p className="text-xs text-gray-500">
                {language === 'am' ? 'ቅርጸት: HBS-xxx-xxxx' : 'Format: HBS-xxx-xxxx'}
              </p>
            </div>

            {/* Animal Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'የእንስሳ አይነት' : 'Animal Type'} *
              </label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, breed: '' }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'am' ? 'አይነት ይምረጡ' : 'Select type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cattle">
                    {language === 'am' ? 'ከብት' : 'Cattle'}
                  </SelectItem>
                  <SelectItem value="poultry">
                    {language === 'am' ? 'ዶሮ' : 'Poultry'}
                  </SelectItem>
                  <SelectItem value="goat">
                    {language === 'am' ? 'ፍየል' : 'Goat'}
                  </SelectItem>
                  <SelectItem value="sheep">
                    {language === 'am' ? 'በግ' : 'Sheep'}
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
            </div>

            {/* Breed Selection */}
            {formData.type && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'am' ? 'ዝርያ' : 'Breed'}
                </label>
                <Select 
                  value={formData.breed} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, breed: value }))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'am' ? 'ዝርያ ይምረጡ' : 'Select breed'} />
                  </SelectTrigger>
                  <SelectContent>
                    {breedsByType[formData.type as keyof typeof breedsByType]?.map((breed) => (
                      <SelectItem key={breed} value={breed.toLowerCase().replace(/\s+/g, '_')}>
                        {breed}
                      </SelectItem>
                    )) || []}
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
                    disabled={loading}
                  />
                )}
              </div>
            )}

            {/* Age and Weight */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'am' ? 'እድሜ (ዓመት)' : 'Age (years)'}
                </label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="0"
                  min="0"
                  disabled={loading}
                />
                {errors.age && <p className="text-sm text-red-600">{errors.age}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'am' ? 'ክብደት (ኪ.ግ)' : 'Weight (kg)'}
                </label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  disabled={loading}
                />
                {errors.weight && <p className="text-sm text-red-600">{errors.weight}</p>}
              </div>
            </div>

            {/* Health Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'የጤና ሁኔታ' : 'Health Status'}
              </label>
              <Select 
                value={formData.health_status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, health_status: value as any }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">
                    {language === 'am' ? 'ጤናማ' : 'Healthy'}
                  </SelectItem>
                  <SelectItem value="attention">
                    {language === 'am' ? 'ትኩረት ያስፈልጋል' : 'Needs Attention'}
                  </SelectItem>
                  <SelectItem value="sick">
                    {language === 'am' ? 'ታማሚ' : 'Sick'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  language === 'am' ? 'እየተቀመጡ...' : 'Saving...'
                ) : editAnimal ? (
                  language === 'am' ? 'ዘምን' : 'Update'
                ) : (
                  language === 'am' ? 'ይመዝግቡ' : 'Register'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                {language === 'am' ? 'ሰርዝ' : 'Cancel'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
