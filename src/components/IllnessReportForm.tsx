
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, AlertTriangle } from 'lucide-react';
import { Language, AnimalData } from '@/types';

interface IllnessReportFormProps {
  language: Language;
  animal: AnimalData;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const IllnessReportForm = ({ 
  language, 
  animal, 
  onClose, 
  onSubmit 
}: IllnessReportFormProps) => {
  const [formData, setFormData] = useState({
    animalId: animal.id,
    symptoms: '',
    severity: 'attention' as 'attention' | 'sick' | 'critical',
    notes: ''
  });

  const translations = {
    am: {
      title: 'ህመም ሪፖርት',
      animal: 'እንስሳ',
      symptoms: 'በሽታ መለያዎች',
      severity: 'ክብደት',
      attention: 'ትኩረት',
      sick: 'ህሙም',
      critical: 'አደገኛ',
      notes: 'ማስታወሻዎች',
      submit: 'ሪፖርት',
      cancel: 'ሰርዝ'
    },
    en: {
      title: 'Illness Report',
      animal: 'Animal',
      symptoms: 'Symptoms',
      severity: 'Severity',
      attention: 'Needs Attention',
      sick: 'Sick',
      critical: 'Critical',
      notes: 'Notes',
      submit: 'Report',
      cancel: 'Cancel'
    },
    or: {
      title: 'Gabaasa Dhukkubaa',
      animal: 'Horii',
      symptoms: 'Mallattoo Dhukkubaa',
      severity: 'Cimina',
      attention: 'Xiyyeeffannoo Barbaada',
      sick: 'Dhukkubsaa',
      critical: 'Balaa',
      notes: 'Yaadannoo',
      submit: 'Gabaasi',
      cancel: 'Dhiisi'
    },
    sw: {
      title: 'Ripoti ya Ugonjwa',
      animal: 'Mnyama',
      symptoms: 'Dalili',
      severity: 'Kiwango',
      attention: 'Anahitaji Umakini',
      sick: 'Mgonjwa',
      critical: 'Hatari',
      notes: 'Maelezo',
      submit: 'Ripoti',
      cancel: 'Ghairi'
    }
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
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
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{t.animal}</p>
              <p className="font-medium">{animal.name} ({animal.animal_code})</p>
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
              <Label htmlFor="severity">{t.severity}</Label>
              <Select
                value={formData.severity}
                onValueChange={(value: 'attention' | 'sick' | 'critical') => 
                  setFormData(prev => ({ ...prev, severity: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attention">{t.attention}</SelectItem>
                  <SelectItem value="sick">{t.sick}</SelectItem>
                  <SelectItem value="critical">{t.critical}</SelectItem>
                </SelectContent>
              </Select>
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
              <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
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
