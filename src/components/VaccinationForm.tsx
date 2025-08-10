
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Syringe } from 'lucide-react';
import { Language, AnimalData } from '@/types';
import { useSecureVaccination } from '@/hooks/useSecureVaccination';
import { useAnimalSelection } from '@/hooks/useAnimalSelection';
import { AnimalSelectorModal } from './AnimalSelectorModal';
import { AnimalIdDisplay } from './AnimalIdDisplay';

interface VaccinationFormProps {
  language: Language;
  mode?: 'single' | 'bulk';
  animal?: AnimalData;
  preSelectedAnimal?: string;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

export const VaccinationForm = ({ 
  language, 
  mode = 'single', 
  animal, 
  preSelectedAnimal,
  onClose, 
  onSubmit 
}: VaccinationFormProps) => {
  const [formData, setFormData] = useState({
    vaccineName: '',
    date: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    administeredBy: '',
    notes: ''
  });

  const { recordVaccination, loading } = useSecureVaccination();
  const { selectedAnimal, isSelectionModalOpen, selectAnimal, openSelection, closeSelection } = useAnimalSelection();

  // Use preselected animal if provided
  const currentAnimal = animal || selectedAnimal;

  const translations = {
    am: {
      title: 'ክትባት መዝገብ',
      selectAnimal: 'እንስሳ ምረጥ',
      vaccineName: 'የክትባት ስም',
      date: 'ቀን',
      nextDueDate: 'የሚቀጥለው ቀን',
      administeredBy: 'የተሰጠ በ',
      notes: 'ማስታወሻዎች',
      submit: 'መዝግብ',
      cancel: 'ሰርዝ'
    },
    en: {
      title: 'Vaccination Record',
      selectAnimal: 'Select Animal',
      vaccineName: 'Vaccine Name',
      date: 'Date',
      nextDueDate: 'Next Due Date',
      administeredBy: 'Administered By',
      notes: 'Notes',
      submit: 'Record',
      cancel: 'Cancel'
    },
    or: {
      title: 'Galmee Tallaa',
      selectAnimal: 'Horii Filachuu',
      vaccineName: 'Maqaa Tallaa',
      date: 'Guyyaa',
      nextDueDate: 'Guyyaa Itti Aanu',
      administeredBy: 'Kan Kenne',
      notes: 'Yaadannoo',
      submit: 'Galmeessi',
      cancel: 'Dhiisi'
    },
    sw: {
      title: 'Rekodi ya Chanjo',
      selectAnimal: 'Chagua Mnyama',
      vaccineName: 'Jina la Chanjo',
      date: 'Tarehe',
      nextDueDate: 'Tarehe Inayofuata',
      administeredBy: 'Aliyetoa',
      notes: 'Maelezo',
      submit: 'Rekodi',
      cancel: 'Ghairi'
    }
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAnimal) {
      return;
    }

    const { error } = await recordVaccination({
      animal_id: currentAnimal.id,
      medicine_name: formData.vaccineName,
      administered_date: formData.date,
      notes: formData.notes
    });

    if (!error) {
      if (onSubmit) {
        onSubmit(formData);
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
              <Syringe className="w-5 h-5 text-green-600" />
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
                    {!animal && (
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
                <Label htmlFor="vaccineName">{t.vaccineName}</Label>
                <Input
                  id="vaccineName"
                  value={formData.vaccineName}
                  onChange={(e) => setFormData(prev => ({ ...prev, vaccineName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t.date}</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="administeredBy">{t.administeredBy}</Label>
                <Input
                  id="administeredBy"
                  value={formData.administeredBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, administeredBy: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t.notes}</Label>
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
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={loading || !currentAnimal}
                >
                  {loading ? 'Recording...' : t.submit}
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
        title="Select Animal for Vaccination"
      />
    </>
  );
};
