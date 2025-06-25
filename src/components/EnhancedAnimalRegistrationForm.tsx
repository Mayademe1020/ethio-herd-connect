
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Camera } from 'lucide-react';
import { Language, AnimalData } from '@/types';

interface EnhancedAnimalRegistrationFormProps {
  language: Language;
  onClose: () => void;
  onSuccess: () => void;
  editAnimal?: AnimalData | null;
}

export const EnhancedAnimalRegistrationForm = ({
  language,
  onClose,
  onSuccess,
  editAnimal
}: EnhancedAnimalRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    name: editAnimal?.name || '',
    type: editAnimal?.type || '',
    breed: editAnimal?.breed || '',
    weight: editAnimal?.weight?.toString() || '',
    age: editAnimal?.age?.toString() || '',
    color: editAnimal?.color || '',
    gender: editAnimal?.gender || ''
  });

  const translations = {
    am: {
      title: editAnimal ? 'እንስሳ ቀይር' : 'አዲስ እንስሳ ምዝገባ',
      name: 'ስም',
      type: 'ዓይነት',
      breed: 'ዘር',
      weight: 'ክብደት (ኪግ)',
      age: 'እድሜ',
      color: 'ቀለም',
      gender: 'ጾታ',
      male: 'ወንድ',
      female: 'ሴት',
      cattle: 'ከብት',
      goat: 'ፍየል',
      sheep: 'በግ',
      poultry: 'ዶሮ',
      save: 'አስቀምጥ',
      cancel: 'ሰርዝ'
    },
    en: {
      title: editAnimal ? 'Edit Animal' : 'Register New Animal',
      name: 'Name',
      type: 'Type',
      breed: 'Breed',
      weight: 'Weight (kg)',
      age: 'Age',
      color: 'Color',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      cattle: 'Cattle',
      goat: 'Goat',
      sheep: 'Sheep',
      poultry: 'Poultry',
      save: 'Save',
      cancel: 'Cancel'
    },
    or: {
      title: editAnimal ? 'Horii Jijjiiri' : 'Horii Haaraa Galmeessi',
      name: 'Maqaa',
      type: 'Gosa',
      breed: 'Sanyii',
      weight: 'Ulfaatina (kg)',
      age: 'Umurii',
      color: 'Halluu',
      gender: 'Saala',
      male: 'Korma',
      female: 'Dubartii',
      cattle: 'Loon',
      goat: 'Re\'ee',
      sheep: 'Hoolaa',
      poultry: 'Lukku',
      save: 'Olkaai',
      cancel: 'Dhiisi'
    },
    sw: {
      title: editAnimal ? 'Hariri Mnyama' : 'Sajili Mnyama Mpya',
      name: 'Jina',
      type: 'Aina',
      breed: 'Aina',
      weight: 'Uzito (kg)',
      age: 'Umri',
      color: 'Rangi',
      gender: 'Jinsia',
      male: 'Dume',
      female: 'Jike',
      cattle: 'Ng\'ombe',
      goat: 'Mbuzi',
      sheep: 'Kondoo',
      poultry: 'Kuku',
      save: 'Hifadhi',
      cancel: 'Ghairi'
    }
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.name}</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.type}</label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cattle">{t.cattle}</SelectItem>
                  <SelectItem value="goat">{t.goat}</SelectItem>
                  <SelectItem value="sheep">{t.sheep}</SelectItem>
                  <SelectItem value="poultry">{t.poultry}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.breed}</label>
              <Input
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.weight}</label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.age}</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.gender}</label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t.male}</SelectItem>
                  <SelectItem value="female">{t.female}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                {t.save}
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
