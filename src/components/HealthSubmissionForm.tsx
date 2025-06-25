
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Stethoscope } from 'lucide-react';
import { Language } from '@/types';

interface HealthSubmissionFormProps {
  language: Language;
  onClose: () => void;
}

export const HealthSubmissionForm = ({ language, onClose }: HealthSubmissionFormProps) => {
  const [formData, setFormData] = useState({
    animalId: '',
    symptoms: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    description: ''
  });

  const translations = {
    am: {
      title: 'የዓይነ ሐኪም ድጋፍ',
      animalId: 'የእንስሳ መለያ',
      symptoms: 'ምልክቶች',
      urgency: 'አስቸኳይነት',
      low: 'ቀላል',
      medium: 'መካከለኛ',
      high: 'አስቸኳይ',
      description: 'ዝርዝር መግለጫ',
      submit: 'ላክ',
      cancel: 'ሰርዝ'
    },
    en: {
      title: 'Veterinary Support',
      animalId: 'Animal ID',
      symptoms: 'Symptoms',
      urgency: 'Urgency',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      description: 'Detailed Description',
      submit: 'Submit',
      cancel: 'Cancel'
    },
    or: {
      title: 'Gargaarsa Hakiimaa Horii',
      animalId: 'Eshaa Horii',
      symptoms: 'Mallattoolee',
      urgency: 'Ariifachiisaa',
      low: 'Gadi',
      medium: 'Giddugaleessa',
      high: 'Guddaa',
      description: 'Ibsa Bal\'aa',
      submit: 'Ergi',
      cancel: 'Dhiisi'
    },
    sw: {
      title: 'Msaada wa Daktari wa Mifugo',
      animalId: 'Kitambulisho cha Mnyama',
      symptoms: 'Dalili',
      urgency: 'Haraka',
      low: 'Chini',
      medium: 'Kati',
      high: 'Juu',
      description: 'Maelezo ya Kina',
      submit: 'Wasilisha',
      cancel: 'Ghairi'
    }
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Health submission:', formData);
    onClose();
  };

  return (
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
            <div className="space-y-2">
              <Label htmlFor="animalId">{t.animalId}</Label>
              <Input
                id="animalId"
                value={formData.animalId}
                onChange={(e) => setFormData(prev => ({ ...prev, animalId: e.target.value }))}
                required
              />
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
                onValueChange={(value: 'low' | 'medium' | 'high') => 
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
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
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
