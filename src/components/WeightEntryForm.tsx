
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Scale } from 'lucide-react';
import { Language, AnimalData } from '@/types';
import { useSecureGrowthTracking } from '@/hooks/useSecureGrowthTracking';
import { useAnimalSelection } from '@/hooks/useAnimalSelection';
import { AnimalSelectorModal } from './AnimalSelectorModal';
import { AnimalIdDisplay } from './AnimalIdDisplay';
import { useTranslations } from '@/hooks/useTranslations';
import { useDateDisplay } from '@/hooks/useDateDisplay';
import { sanitizeFormData } from '@/utils/securityUtils';

interface WeightEntryFormProps {
  language: Language;
  animal?: AnimalData;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  onWeightAdded?: (data: any) => void;
}

export const WeightEntryForm = ({ 
  language, 
  animal, 
  onClose, 
  onSubmit,
  onWeightAdded 
}: WeightEntryFormProps) => {
  const [formData, setFormData] = useState({
    weight: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const { recordWeight, loading } = useSecureGrowthTracking();
  const { selectedAnimal, isSelectionModalOpen, selectAnimal, openSelection, closeSelection } = useAnimalSelection();
  const { t } = useTranslations();

  // Use preselected animal if provided
  const currentAnimal = animal || selectedAnimal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAnimal) {
      return;
    }

    // Sanitize form data before submission
    const sanitizedData = sanitizeFormData({
      notes: formData.notes
    });

    const { error } = await recordWeight({
      animal_id: currentAnimal.id,
      weight: parseFloat(formData.weight),
      recorded_date: formData.date,
      notes: sanitizedData.notes
    });

    if (!error) {
      const weightData = {
        ...formData,
        weight: parseFloat(formData.weight),
        animalId: currentAnimal.id
      };
      
      if (onSubmit) {
        onSubmit(weightData);
      }
      
      if (onWeightAdded) {
        onWeightAdded(weightData);
      }
      
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <span>{t('growth.weightRecord')}</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Animal Selection */}
              <div className="space-y-2">
                <Label>{t('growth.selectAnimal')}</Label>
                {currentAnimal ? (
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{currentAnimal.name}</p>
                      <AnimalIdDisplay animalId={currentAnimal.animal_code} size="sm" />
                    </div>
                    {!animal && (
                      <Button variant="outline" size="sm" onClick={openSelection}>
                        Change
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button variant="outline" onClick={openSelection} className="w-full">
                    {t('growth.selectAnimal')}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">{t('animals.weight')}</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t('common.date')}</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('animals.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading || !currentAnimal}
                >
                  {loading ? 'Recording...' : t('common.save')}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Animal Selection Modal */}
      <AnimalSelectorModal
        language={language}
        isOpen={isSelectionModalOpen}
        onClose={closeSelection}
        onSelect={selectAnimal}
        title="Select Animal for Weight Tracking"
      />
    </>
  );
};
