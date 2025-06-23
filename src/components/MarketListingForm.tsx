
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Language } from '@/types';

interface MarketListingFormProps {
  language: Language;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MarketListingForm = ({
  language,
  onClose,
  onSuccess
}: MarketListingFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    contactMethod: 'phone',
    contactValue: ''
  });

  const translations = {
    am: {
      title: 'አዲስ ዝርዝር ፍጠር',
      animalTitle: 'የእንስሳ ርዕስ',
      description: 'መግለጫ',
      price: 'ዋጋ (ብር)',
      category: 'ምድብ',
      location: 'አካባቢ',
      contactMethod: 'የመገናኛ መንገድ',
      contactValue: 'የመገናኛ መረጃ',
      phone: 'ስልክ',
      email: 'ኢሜይል',
      submit: 'ዝርዝር ይለጥፉ',
      cancel: 'ይቅር',
      cattle: 'ከብት',
      goat: 'ፍየል',
      sheep: 'በግ',
      poultry: 'ዶሮ'
    },
    en: {
      title: 'Create New Listing',
      animalTitle: 'Animal Title',
      description: 'Description',
      price: 'Price (ETB)',
      category: 'Category',
      location: 'Location',
      contactMethod: 'Contact Method',
      contactValue: 'Contact Information',
      phone: 'Phone',
      email: 'Email',
      submit: 'Post Listing',
      cancel: 'Cancel',
      cattle: 'Cattle',
      goat: 'Goat',
      sheep: 'Sheep',
      poultry: 'Poultry'
    },
    or: {
      title: 'Tarree Haaraa Uumuu',
      animalTitle: 'Mataduree Horii',
      description: 'Ibsa',
      price: 'Gatii (Birr)',
      category: 'Akaakuu',
      location: 'Bakka',
      contactMethod: 'Mala Qunnamtii',
      contactValue: 'Odeeffannoo Qunnamtii',
      phone: 'Bilbila',
      email: 'Iimeelii',
      submit: 'Tarree Kaa\'i',
      cancel: 'Dhiisi',
      cattle: 'Loon',
      goat: 'Re\'ee',
      sheep: 'Hoolaa',
      poultry: 'Lukku'
    },
    sw: {
      title: 'Unda Orodha Mpya',
      animalTitle: 'Kichwa cha Mnyama',
      description: 'Maelezo',
      price: 'Bei (ETB)',
      category: 'Kategoria',
      location: 'Mahali',
      contactMethod: 'Njia ya Mawasiliano',
      contactValue: 'Taarifa za Mawasiliano',
      phone: 'Simu',
      email: 'Barua pepe',
      submit: 'Chapisha Orodha',
      cancel: 'Ghairi',
      cattle: 'Ng\'ombe',
      goat: 'Mbuzi',
      sheep: 'Kondoo',
      poultry: 'Kuku'
    }
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Submitting listing:', formData);
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">{t.animalTitle}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={t.animalTitle}
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">{t.category}</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t.category} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cattle">{t.cattle}</SelectItem>
                <SelectItem value="goat">{t.goat}</SelectItem>
                <SelectItem value="sheep">{t.sheep}</SelectItem>
                <SelectItem value="poultry">{t.poultry}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price">{t.price}</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0"
              required
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">{t.location}</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder={t.location}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t.description}
              rows={3}
              required
            />
          </div>

          {/* Contact Method */}
          <div>
            <Label htmlFor="contactMethod">{t.contactMethod}</Label>
            <Select value={formData.contactMethod} onValueChange={(value) => handleInputChange('contactMethod', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">{t.phone}</SelectItem>
                <SelectItem value="email">{t.email}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact Value */}
          <div>
            <Label htmlFor="contactValue">{t.contactValue}</Label>
            <Input
              id="contactValue"
              type={formData.contactMethod === 'email' ? 'email' : 'tel'}
              value={formData.contactValue}
              onChange={(e) => handleInputChange('contactValue', e.target.value)}
              placeholder={formData.contactMethod === 'email' ? 'email@example.com' : '+251XXXXXXXXX'}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t.cancel}
            </Button>
            <Button type="submit" className="flex-1">
              {t.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
