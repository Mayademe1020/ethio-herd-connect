
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeft, ArrowRight, User, Heart, Calendar, Beef } from 'lucide-react';
import { Language, AnimalData } from '@/types';
import { useSecureAnimalRegistration } from '@/hooks/useSecureAnimalRegistration';
import { AnimalPhotoUpload } from './AnimalPhotoUpload';

interface EnhancedAnimalRegistrationFormProps {
  language: Language;
  onClose: () => void;
  onSuccess: () => void;
  editAnimal?: AnimalData;
}

export const EnhancedAnimalRegistrationForm = ({ 
  language, 
  onClose, 
  onSuccess, 
  editAnimal 
}: EnhancedAnimalRegistrationFormProps) => {
  const { t } = useTranslations();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: editAnimal?.name || '',
    type: editAnimal?.type || '',
    breed: editAnimal?.breed || '',
    birthDate: editAnimal?.birth_date || '',
    gender: editAnimal?.gender || '',
    color: editAnimal?.color || '',
    weight: editAnimal?.weight?.toString() || '',
    healthStatus: editAnimal?.health_status || 'healthy' as 'healthy' | 'sick' | 'attention' | 'critical',
    notes: editAnimal?.notes || '',
    photoUrl: editAnimal?.photo_url || ''
  });

  const { registerAnimal, updateAnimal, loading } = useSecureAnimalRegistration();

  const ethiopianBreeds = {
    cattle: ['Boran', 'Horro', 'Arsi', 'Danakil', 'Fogera', 'Sheko'],
    sheep: ['Blackhead Somali', 'Afar', 'Menz', 'Horro', 'Arsi-Bale'],
    goat: ['Boer', 'Arsi-Bale', 'Afar', 'Keffa', 'Long-eared Somali'],
    poultry: ['Rhode Island Red', 'Leghorn', 'Local/Indigenous']
  };

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handlePhotoChange = (file: File | null, url: string) => {
    setFormData(prev => ({ ...prev, photoUrl: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const animalData = {
      name: formData.name,
      type: formData.type,
      breed: formData.breed,
      birth_date: formData.birthDate || undefined,
      gender: formData.gender || undefined,
      color: formData.color || undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      health_status: formData.healthStatus,
      notes: formData.notes || undefined,
      photo_url: formData.photoUrl || undefined
    };

    let result;
    if (editAnimal) {
      result = await updateAnimal(editAnimal.id, animalData);
    } else {
      result = await registerAnimal(animalData);
    }

    if (!result.error) {
      onSuccess();
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-ethiopia-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-ethiopia-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t('animals.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="border-ethiopia-green-200 focus:border-ethiopia-green-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Animal Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, breed: '' }))}
              >
                <SelectTrigger className="border-ethiopia-green-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cow">{t('animalTypes.cow')}</SelectItem>
                  <SelectItem value="bull">{t('animalTypes.bull')}</SelectItem>
                  <SelectItem value="ox">{t('animalTypes.ox')}</SelectItem>
                  <SelectItem value="calf">{t('animalTypes.calf')}</SelectItem>
                  <SelectItem value="sheep">{t('animalTypes.sheep')}</SelectItem>
                  <SelectItem value="goat">{t('animalTypes.goat')}</SelectItem>
                  <SelectItem value="poultry">{t('animalTypes.poultry')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type && (
              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Select
                  value={formData.breed}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, breed: value }))}
                >
                  <SelectTrigger className="border-ethiopia-green-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ethiopianBreeds[formData.type as keyof typeof ethiopianBreeds]?.map((breed) => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-ethiopia-gold-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Beef className="w-8 h-8 text-ethiopia-gold-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Physical Characteristics</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">{t('animals.gender')}</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger className="border-ethiopia-green-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('animals.male')}</SelectItem>
                    <SelectItem value="female">{t('animals.female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">{t('animals.age')}</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="border-ethiopia-green-200 focus:border-ethiopia-green-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">{t('animals.color')}</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="border-ethiopia-green-200 focus:border-ethiopia-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">{t('animals.weight')}</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                className="border-ethiopia-green-200 focus:border-ethiopia-green-500"
              />
            </div>

            <AnimalPhotoUpload
              language={language as 'am' | 'en'}
              currentPhoto={formData.photoUrl}
              onPhotoChange={handlePhotoChange}
              disabled={loading}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Health Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthStatus">Health Status</Label>
              <Select
                value={formData.healthStatus}
                onValueChange={(value: 'healthy' | 'sick' | 'attention' | 'critical') => 
                  setFormData(prev => ({ ...prev, healthStatus: value }))
                }
              >
                <SelectTrigger className="border-ethiopia-green-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="attention">Needs Attention</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('animals.notes')}</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-3 border border-ethiopia-green-200 rounded-lg focus:border-ethiopia-green-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b border-ethiopia-green-100">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-ethiopia-green-800 mb-2">
              {t.title}
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{t.progress}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <Badge variant="outline" className="text-ethiopia-green-600 border-ethiopia-green-200">
                {currentStep}/{totalSteps}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-4 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.previous}</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800"
              >
                {t.cancel}
              </Button>

              {currentStep === totalSteps ? (
                <Button
                  type="submit"
                  className="bg-ethiopia-green-600 hover:bg-ethiopia-green-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : t.submit}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                  className="bg-ethiopia-green-600 hover:bg-ethiopia-green-700 text-white flex items-center space-x-2"
                >
                  <span>{t.next}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
