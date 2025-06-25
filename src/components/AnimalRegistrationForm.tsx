
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';
import { Language } from '@/types';

interface AnimalRegistrationFormProps {
  language: Language;
  onClose: () => void;
  onSubmit: (data: any) => void;
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
    notes: ''
  });

  const translations = {
    am: {
      title: 'እንስሳ ምዝገባ',
      name: 'ስም',
      type: 'ዓይነት',
      breed: 'ዝርያ',
      birthDate: 'የተወለደ ቀን',
      gender: 'ጾታ',
      male: 'ወንድ',
      female: 'ሴት',
      color: 'ቀለም',
      weight: 'ክብደት (ኪ.ግ)',
      notes: 'ማስታወሻዎች',
      submit: 'ምዝገባ',
      cancel: 'ሰርዝ'
    },
    en: {
      title: 'Animal Registration',
      name: 'Name',
      type: 'Type',
      breed: 'Breed',
      birthDate: 'Birth Date',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      color: 'Color',
      weight: 'Weight (kg)',
      notes: 'Notes',
      submit: 'Register',
      cancel: 'Cancel'
    },
    or: {
      title: 'Galmee Horii',
      name: 'Maqaa',
      type: 'Gosa',
      breed: 'Sanyii',
      birthDate: 'Guyyaa Dhalootaa',
      gender: 'Saala',
      male: 'Korma',
      female: 'Dhalaa',
      color: 'Halluu',
      weight: 'Ulfaatina (kg)',
      notes: 'Yaadannoo',
      submit: 'Galmeessi',
      cancel: 'Dhiisi'
    },
    sw: {
      title: 'Usajili wa Mnyama',
      name: 'Jina',
      type: 'Aina',
      breed: 'Aina',
      birthDate: 'Tarehe ya Kuzaliwa',
      gender: 'Jinsia',
      male: 'Dume',
      female: 'Jike',
      color: 'Rangi',
      weight: 'Uzito (kg)',
      notes: 'Maelezo',
      submit: 'Sajili',
      cancel: 'Ghairi'
    }
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const animalData = {
      ...formData,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      age: formData.birthDate ? Math.floor((Date.now() - new Date(formData.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)) : undefined
    };
    onSubmit(animalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-600" />
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
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t.type}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.type} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cattle">🐄 Cattle</SelectItem>
                  <SelectItem value="goat">🐐 Goat</SelectItem>
                  <SelectItem value="sheep">🐑 Sheep</SelectItem>
                  <SelectItem value="poultry">🐔 Poultry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">{t.breed}</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">{t.birthDate}</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">{t.gender}</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.gender} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t.male}</SelectItem>
                  <SelectItem value="female">{t.female}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">{t.color}</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">{t.weight}</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
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
