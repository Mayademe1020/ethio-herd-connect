
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/DatePicker';
import { Droplets, Clock, Sun, Moon } from 'lucide-react';
import { useMilkProduction } from '@/hooks/useMilkProduction';
import { useAnimalSelection } from '@/hooks/useAnimalSelection';
import { AnimalSelectorModal } from '@/components/AnimalSelectorModal';
import { Language } from '@/types';

interface MilkProductionFormProps {
  language: Language;
  onSuccess?: () => void;
}

export const MilkProductionForm = ({ language, onSuccess }: MilkProductionFormProps) => {
  const [formData, setFormData] = useState({
    production_date: new Date().toISOString().split('T')[0],
    morning_yield: '',
    evening_yield: '',
    quality_grade: '' as 'A' | 'B' | 'C' | '',
    fat_content: '',
    notes: ''
  });

  const { recordMilkProduction, isRecording } = useMilkProduction();
  const { selectedAnimal, isSelectionModalOpen, selectAnimal, openSelection, closeSelection } = useAnimalSelection();

  const translations = {
    am: {
      title: 'የወተት ምርት መመዝገብ',
      selectAnimal: 'እንስሳ ምረጥ',
      date: 'ቀን',
      morningYield: 'የጠዋት ምርት (ሊትር)',
      eveningYield: 'የምሽት ምርት (ሊትር)',
      qualityGrade: 'የጥራት ደረጃ',
      fatContent: 'የቅባት መጠን (%)',
      notes: 'ማስታወሻ',
      record: 'መዝግብ',
      gradeA: 'ደረጃ A',
      gradeB: 'ደረጃ B',
      gradeC: 'ደረጃ C'
    },
    en: {
      title: 'Record Milk Production',
      selectAnimal: 'Select Animal',
      date: 'Date',
      morningYield: 'Morning Yield (Liters)',
      eveningYield: 'Evening Yield (Liters)',
      qualityGrade: 'Quality Grade',
      fatContent: 'Fat Content (%)',
      notes: 'Notes',
      record: 'Record',
      gradeA: 'Grade A',
      gradeB: 'Grade B',
      gradeC: 'Grade C'
    },
    or: {
      title: 'Oomisha Aannan Galmeessuu',
      selectAnimal: 'Horii Filadhu',
      date: 'Guyyaa',
      morningYield: 'Oomisha Ganama (Liitira)',
      eveningYield: 'Oomisha Galgalaa (Liitira)',
      qualityGrade: 'Sadarkaa Qulqulluu',
      fatContent: 'Qabiyyee Cooma (%)',
      notes: 'Yaadannoo',
      record: 'Galmeessi',
      gradeA: 'Sadarkaa A',
      gradeB: 'Sadarkaa B',
      gradeC: 'Sadarkaa C'
    },
    sw: {
      title: 'Rekodi Uzalishaji wa Maziwa',
      selectAnimal: 'Chagua Mnyama',
      date: 'Tarehe',
      morningYield: 'Mazao ya Asubuhi (Lita)',
      eveningYield: 'Mazao ya Jioni (Lita)',
      qualityGrade: 'Daraja la Ubora',
      fatContent: 'Maudhui ya Mafuta (%)',
      notes: 'Maelezo',
      record: 'Rekodi',
      gradeA: 'Daraja A',
      gradeB: 'Daraja B',
      gradeC: 'Daraja C'
    }
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;

    const morningYield = formData.morning_yield ? parseFloat(formData.morning_yield) : 0;
    const eveningYield = formData.evening_yield ? parseFloat(formData.evening_yield) : 0;
    const totalYield = morningYield + eveningYield;

    if (totalYield === 0) return; // Need at least some production

    recordMilkProduction({
      animal_id: selectedAnimal.id,
      production_date: formData.production_date,
      morning_yield: morningYield || undefined,
      evening_yield: eveningYield || undefined,
      total_yield: totalYield,
      quality_grade: formData.quality_grade || undefined,
      fat_content: formData.fat_content ? parseFloat(formData.fat_content) : undefined,
      notes: formData.notes || undefined
    });

    // Reset form
    setFormData({
      production_date: new Date().toISOString().split('T')[0],
      morning_yield: '',
      evening_yield: '',
      quality_grade: '',
      fat_content: '',
      notes: ''
    });
    
    onSuccess?.();
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <span>{t.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t.selectAnimal}</Label>
              <Button
                type="button"
                variant="outline"
                onClick={openSelection}
                className="w-full justify-start mt-1"
              >
                {selectedAnimal ? selectedAnimal.name : t.selectAnimal}
              </Button>
            </div>

            <div>
              <Label>{t.date}</Label>
              <Input
                type="date"
                value={formData.production_date}
                onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center space-x-1">
                  <Sun className="w-4 h-4" />
                  <span>{t.morningYield}</span>
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.morning_yield}
                  onChange={(e) => setFormData({ ...formData, morning_yield: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="flex items-center space-x-1">
                  <Moon className="w-4 h-4" />
                  <span>{t.eveningYield}</span>
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.evening_yield}
                  onChange={(e) => setFormData({ ...formData, evening_yield: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t.qualityGrade}</Label>
                <Select value={formData.quality_grade} onValueChange={(value: 'A' | 'B' | 'C') => setFormData({ ...formData, quality_grade: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">{t.gradeA}</SelectItem>
                    <SelectItem value="B">{t.gradeB}</SelectItem>
                    <SelectItem value="C">{t.gradeC}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t.fatContent}</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.fat_content}
                  onChange={(e) => setFormData({ ...formData, fat_content: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>{t.notes}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={!selectedAnimal || isRecording}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {isRecording ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Recording...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4" />
                  <span>{t.record}</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimalSelectorModal
        isOpen={isSelectionModalOpen}
        onClose={closeSelection}
        onSelect={selectAnimal}
        language={language}
      />
    </>
  );
};
