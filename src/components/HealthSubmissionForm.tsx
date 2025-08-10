
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Stethoscope } from 'lucide-react';
import { Language, AnimalData } from '@/types';
import { useSecureHealthSubmission } from '@/hooks/useSecureHealthSubmission';
import { useAnimalSelection } from '@/hooks/useAnimalSelection';
import { AnimalSelectorModal } from './AnimalSelectorModal';
import { AnimalIdDisplay } from './AnimalIdDisplay';

interface HealthSubmissionFormProps {
  language: Language;
  onClose: () => void;
  preSelectedAnimal?: AnimalData;
}

export const HealthSubmissionForm = ({ 
  language, 
  onClose, 
  preSelectedAnimal 
}: HealthSubmissionFormProps) => {
  const [formData, setFormData] = useState({
    symptoms: '',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    description: ''
  });

  const { submitHealthRecord, loading } = useSecureHealthSubmission();
  const { selectedAnimal, isSelectionModalOpen, selectAnimal, openSelection, closeSelection } = useAnimalSelection();

  // Use preselected animal if provided
  const currentAnimal = preSelectedAnimal || selectedAnimal;

  const translations = {
    am: {
      title: 'የዓይነ ሐኪም ድጋፍ',
      selectAnimal: 'እንስሳ ምረጥ',
      symptoms: 'ምልክቶች',
      urgency: 'አስቸኳይነት',
      low: 'ቀላል',
      medium: 'መካከለኛ',
      high: 'አስቸኳይ',
      critical: 'ወሳኝ',
      description: 'ዝርዝር መግለጫ',
      submit: 'ላክ',
      cancel: 'ሰርዝ'
    },
    en: {
      title: 'Veterinary Support',
      selectAnimal: 'Select Animal',
      symptoms: 'Symptoms',
      urgency: 'Urgency',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
      description: 'Detailed Description',
      submit: 'Submit',
      cancel: 'Cancel'
    },
    or: {
      title: 'Gargaarsa Hakiimaa Horii',
      selectAnimal: 'Horii Filachuu',
      symptoms: 'Mallattoolee',
      urgency: 'Ariifachiisaa',
      low: 'Gadi',
      medium: 'Giddugaleessa',
      high: 'Guddaa',
      critical: 'Murteessaa',
      description: 'Ibsa Bal\'aa',
      submit: 'Ergi',
      cancel: 'Dhiisi'
    },
    sw: {
      title: 'Msaada wa Daktari wa Mifugo',
      selectAnimal: 'Chagua Mnyama',
      symptoms: 'Dalili',
      urgency: 'Haraka',
      low: 'Chini',
      medium: 'Kati',
      high: 'Juu',
      critical: 'Hatari',
      description: 'Maelezo ya Kina',
      submit: 'Wasilisha',
      cancel: 'Ghairi'
    }
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAnimal) {
      return;
    }

    const { error } = await submitHealthRecord({
      animal_id: currentAnimal.id,
      symptoms: formData.symptoms,
      description: formData.description,
      urgency: formData.urgency
    });

    if (!error) {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-green-600" />
              <span>{t.title}</span>
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
                <Label>{t.selectAnimal}</Label>
                {currentAnimal ? (
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{currentAnimal.name}</p>
                      <AnimalIdDisplay animalId={currentAnimal.animal_code} size="sm" />
                    </div>
                    {!preSelectedAnimal && (
                      <Button variant="outline" size="sm" onClick={openSelection}>
                        Change
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button variant="outline" onClick={openSelection} className="w-full">
                    {t.selectAnimal}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">{t.symptoms}</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">{t.urgency}</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                    setFormData(prev => ({ ...prev, urgency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t.low}</SelectItem>
                    <SelectItem value="medium">{t.medium}</SelectItem>
                    <SelectItem value="high">{t.high}</SelectItem>
                    <SelectItem value="critical">{t.critical}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={loading || !currentAnimal}
                >
                  {loading ? 'Submitting...' : t.submit}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  {t.cancel}
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
        title="Select Animal for Health Submission"
      />
    </>
  );
};
