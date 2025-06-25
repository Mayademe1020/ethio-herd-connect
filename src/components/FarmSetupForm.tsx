
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, MapPin, User, Phone, Mail } from 'lucide-react';
import { Language } from '@/types';

interface FarmSetupFormProps {
  language: Language;
  onClose: () => void;
  editMode?: boolean;
}

export const FarmSetupForm = ({ language, onClose, editMode = false }: FarmSetupFormProps) => {
  const [formData, setFormData] = useState({
    farmName: '',
    ownerName: '',
    phone: '',
    email: '',
    location: '',
    farmType: '',
    description: ''
  });

  const translations = {
    am: {
      title: editMode ? 'መረጃ አርትዕ' : 'የእርሻ ማዋቀር',
      farmName: 'የእርሻ ስም',
      ownerName: 'የባለቤት ስም',
      phone: 'ስልክ ቁጥር',
      email: 'ኢሜይል',
      location: 'አድራሻ',
      farmType: 'የእርሻ ዓይነት',
      description: 'መግለጫ',
      save: 'አስቀምጥ',
      cancel: 'ሰርዝ',
      cattle: 'ከብቶች',
      goats: 'ፍየሎች',
      sheep: 'በጎች',
      poultry: 'ዶሮዎች',
      mixed: 'የተደቀላቀለ'
    },
    en: {
      title: editMode ? 'Edit Information' : 'Farm Setup',
      farmName: 'Farm Name',
      ownerName: 'Owner Name',
      phone: 'Phone Number',
      email: 'Email',
      location: 'Location',
      farmType: 'Farm Type',
      description: 'Description',
      save: 'Save',
      cancel: 'Cancel',
      cattle: 'Cattle',
      goats: 'Goats',
      sheep: 'Sheep',
      poultry: 'Poultry',
      mixed: 'Mixed'
    },
    or: {
      title: editMode ? 'Odeeffannoo Fooyyessuu' : 'Qormaata Qonnaa',
      farmName: 'Maqaa Qonnaa',
      ownerName: 'Maqaa Abbaa',
      phone: 'Lakkoofsa Bilbilaa',
      email: 'Imeelii',
      location: 'Bakka',
      farmType: 'Gosa Qonnaa',
      description: 'Ibsa',
      save: 'Olkaa\'i',
      cancel: 'Dhiisi',
      cattle: 'Loon',
      goats: 'Re\'ee',
      sheep: 'Hoolaa',
      poultry: 'Lukuu',
      mixed: 'Walitti Makame'
    },
    sw: {
      title: editMode ? 'Hariri Taarifa' : 'Usanidi wa Shamba',
      farmName: 'Jina la Shamba',
      ownerName: 'Jina la Mmiliki',
      phone: 'Nambari ya Simu',
      email: 'Barua pepe',
      location: 'Mahali',
      farmType: 'Aina ya Shamba',
      description: 'Maelezo',
      save: 'Hifadhi',
      cancel: 'Ghairi',
      cattle: 'Ng\'ombe',
      goats: 'Mbuzi',
      sheep: 'Kondoo',
      poultry: 'Kuku',
      mixed: 'Mchanganyiko'
    }
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Farm setup data:', formData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center space-x-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <span>{t.title}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Farm Name */}
            <div className="space-y-2">
              <Label htmlFor="farmName" className="flex items-center space-x-2 text-sm sm:text-base">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                <span>{t.farmName}</span>
              </Label>
              <Input
                id="farmName"
                value={formData.farmName}
                onChange={(e) => handleInputChange('farmName', e.target.value)}
                placeholder={t.farmName}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <Label htmlFor="ownerName" className="flex items-center space-x-2 text-sm sm:text-base">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                <span>{t.ownerName}</span>
              </Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                placeholder={t.ownerName}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2 text-sm sm:text-base">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  <span>{t.phone}</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={t.phone}
                  className="h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2 text-sm sm:text-base">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  <span>{t.email}</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t.email}
                  className="h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm sm:text-base">{t.location}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={t.location}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>

            {/* Farm Type */}
            <div className="space-y-2">
              <Label htmlFor="farmType" className="text-sm sm:text-base">{t.farmType}</Label>
              <Select value={formData.farmType} onValueChange={(value) => handleInputChange('farmType', value)}>
                <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                  <SelectValue placeholder={t.farmType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cattle">{t.cattle}</SelectItem>
                  <SelectItem value="goats">{t.goats}</SelectItem>
                  <SelectItem value="sheep">{t.sheep}</SelectItem>
                  <SelectItem value="poultry">{t.poultry}</SelectItem>
                  <SelectItem value="mixed">{t.mixed}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm sm:text-base">{t.description}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t.description}
                rows={3}
                className="text-sm sm:text-base resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2 sm:pt-4">
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 h-10 sm:h-11 text-sm sm:text-base">
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                {t.save}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 sm:h-11 text-sm sm:text-base">
                {t.cancel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
