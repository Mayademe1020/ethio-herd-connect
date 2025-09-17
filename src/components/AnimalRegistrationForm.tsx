import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Language } from '@/types';
import { generateContinuousAnimalNumber, validateInput, sanitizeInput } from '@/utils/animalIdGenerator';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';
import { ANIMAL_TYPES, ANIMAL_TYPE_ICONS } from '@/utils/animalTypes';

interface AnimalRegistrationFormProps {
  language: Language;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

export const AnimalRegistrationForm = ({ 
  language, 
  onClose, 
  onSubmit 
}: AnimalRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    birthDate: '',
    gender: '',
    color: '',
    weight: '',
    ageYears: '',
    ageMonths: '',
    notes: ''
  });

  const [animalId, setAnimalId] = useState('');
  const [showAnimalId, setShowAnimalId] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [farmProfile, setFarmProfile] = useState<any>(null);
  const [existingAnimals, setExistingAnimals] = useState<any[]>([]);
  const { showError, showSuccess } = useToastNotifications();
  const { t, getAnimalTypeTranslation } = useTranslations();

  useEffect(() => {
    fetchFarmProfile();
    fetchExistingAnimals();
  }, []);

  useEffect(() => {
    if (formData.type && farmProfile && existingAnimals.length >= 0) {
      generateAnimalId();
    }
  }, [formData.type, farmProfile, existingAnimals]);

  const fetchFarmProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('farm_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching farm profile:', error);
        return;
      }

      setFarmProfile(data || { farm_prefix: 'FARM' });
    } catch (error) {
      console.error('Error fetching farm profile:', error);
    }
  };

  const fetchExistingAnimals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('animals')
        .select('animal_code')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching existing animals:', error);
        return;
      }

      setExistingAnimals(data || []);
    } catch (error) {
      console.error('Error fetching existing animals:', error);
    }
  };

  const generateAnimalId = async () => {
    if (!formData.type || !farmProfile) return;
    
    try {
      const generatedId = await generateContinuousAnimalNumber(
        formData.type,
        farmProfile.farm_prefix || 'FARM',
        existingAnimals
      );
      setAnimalId(generatedId);
    } catch (error) {
      console.error('Error generating animal ID:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name is now optional - no validation needed
    
    if (!formData.type) {
      newErrors.type = language === 'am' ? 'ዓይነት ይምረጡ' : 'Please select animal type';
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Error', 'You must be logged in to register animals');
        return;
      }

      const animalData = {
        user_id: user.id,
        animal_code: animalId,
        name: sanitizeInput(formData.name),
        type: formData.type,
        breed: sanitizeInput(formData.breed) || null,
        birth_date: formData.birthDate || null,
        gender: formData.gender || null,
        color: sanitizeInput(formData.color) || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        notes: sanitizeInput(formData.notes) || null,
        age: formData.birthDate ? Math.floor((Date.now() - new Date(formData.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)) : null,
        health_status: 'healthy'
      };

      const { error } = await supabase
        .from('animals')
        .insert([animalData]);

      if (error) throw error;
      
      if (onSubmit) {
        onSubmit(animalData);
      }
      
      showSuccess('Success', `${formData.name} registered successfully with ID: ${animalId}`);
      onClose();
    } catch (error) {
      console.error('Error registering animal:', error);
      showError('Error', 'Failed to register animal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center space-x-1 sm:space-x-2">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span>{t('animals.registration')}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="px-3 sm:px-6 space-y-3 sm:space-y-4">
          {/* Animal ID Display */}
          {animalId && (
            <div className="bg-primary/5 p-2 sm:p-3 rounded-lg border border-primary/20 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <Label className="text-xs sm:text-sm font-medium text-primary">
                  {t('animals.animalId')}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnimalId(!showAnimalId)}
                  className="h-6 w-6 p-0"
                >
                  {showAnimalId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-primary bg-background p-2 rounded border">
                {showAnimalId ? animalId : '•'.repeat(animalId.length)}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Name Field */}
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm font-medium">{t('animals.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="h-8 sm:h-10 text-xs sm:text-sm transition-all focus:ring-2 focus:ring-primary/20"
                placeholder={t('animals.name')}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Type Selection */}
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="type" className="text-xs sm:text-sm font-medium">{t('animals.type')} *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm transition-all focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder={t('animals.type')} />
                </SelectTrigger>
                <SelectContent>
                  {ANIMAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ANIMAL_TYPE_ICONS[type]} {getAnimalTypeTranslation(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
            </div>

            {/* Breed and Gender Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="breed" className="text-xs sm:text-sm font-medium">{t('animals.breed')}</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                  className="h-8 sm:h-10 text-xs sm:text-sm transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="gender" className="text-xs sm:text-sm font-medium">{t('animals.gender')}</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm transition-all focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder={t('animals.gender')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('animals.male')}</SelectItem>
                    <SelectItem value="female">{t('animals.female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Age Selection - Custom Input */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="ageYears" className="text-xs sm:text-sm font-medium">{t('animals.ageYears')}</Label>
                <Input
                  id="ageYears"
                  type="number"
                  min="0"
                  max="30"
                  value={formData.ageYears}
                  onChange={(e) => setFormData(prev => ({ ...prev, ageYears: e.target.value }))}
                  className="h-8 sm:h-10 text-xs sm:text-sm transition-all focus:ring-2 focus:ring-primary/20"
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="ageMonths" className="text-xs sm:text-sm font-medium">{t('animals.ageMonths')}</Label>
                <Input
                  id="ageMonths"
                  type="number"
                  min="0"
                  max="11"
                  value={formData.ageMonths}
                  onChange={(e) => setFormData(prev => ({ ...prev, ageMonths: e.target.value }))}
                  className="h-8 sm:h-10 text-xs sm:text-sm transition-all focus:ring-2 focus:ring-primary/20"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="weight" className="text-xs sm:text-sm font-medium">{t('animals.weight')}</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="h-8 sm:h-10 text-xs sm:text-sm transition-all focus:ring-2 focus:ring-primary/20"
                />
                {errors.weight && <p className="text-xs text-destructive">{errors.weight}</p>}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="color" className="text-xs sm:text-sm font-medium">{t('animals.color')}</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="h-8 sm:h-10 text-xs sm:text-sm transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="notes" className="text-xs sm:text-sm font-medium">{t('animals.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="text-xs sm:text-sm resize-none transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 h-8 sm:h-10 text-xs sm:text-sm bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                {loading ? 'Saving...' : t('animals.submit')}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
