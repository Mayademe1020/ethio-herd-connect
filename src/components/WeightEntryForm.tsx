
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Scale } from 'lucide-react';
import { Language, AnimalData } from '@/types';

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
    animalId: animal?.id || '',
    weight: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const translations = {
    am: {
      title: 'ክብደት መዝገብ',
      animal: 'እንስሳ',
      weight: 'ክብደት (ኪ.ግ)',
      date: 'ቀን',
      notes: 'ማስታወሻዎች',
      submit: 'መዝግብ',
      cancel: 'ሰርዝ'
    },
    en: {
      title: 'Weight Record',
      animal: 'Animal',
      weight: 'Weight (kg)',
      date: 'Date',
      notes: 'Notes',
      submit: 'Record',
      cancel: 'Cancel'
    },
    or: {
      title: 'Galmee Ulfaatinaa',
      animal: 'Horii',
      weight: 'Ulfaatina (kg)',
      date: 'Guyyaa',
      notes: 'Yaadannoo',
      submit: 'Galmeessi',
      cancel: 'Dhiisi'
    },
    sw: {
      title: 'Rekodi ya Uzito',
      animal: 'Mnyama',
      weight: 'Uzito (kg)',
      date: 'Tarehe',
      notes: 'Maelezo',
      submit: 'Rekodi',
      cancel: 'Ghairi'
    }
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightData = {
      ...formData,
      weight: parseFloat(formData.weight)
    };
    
    if (onSubmit) {
      onSubmit(weightData);
    }
    
    if (onWeightAdded) {
      onWeightAdded(weightData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Scale className="w-5 h-5 text-blue-600" />
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
            {animal && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{t.animal}</p>
                <p className="font-medium">{animal.name} ({animal.animal_code})</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="weight">{t.weight}</Label>
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
              <Label htmlFor="notes">{t.notes}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                {t.submit}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                {t.cancel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
