
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload } from 'lucide-react';
import { Language } from '@/types';

interface MarketListingFormProps {
  language: Language;
  onClose: () => void;
  onSuccess: () => void;
}

export const MarketListingForm = ({ language, onClose, onSuccess }: MarketListingFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: '',
    contactMethod: 'phone',
    contactValue: ''
  });

  const translations = {
    am: {
      title: 'አዲስ ዝርዝር ጨምር',
      animalTitle: 'የእንስሳ ርዕስ',
      description: 'መግለጫ',
      price: 'ዋጋ (ብር)',
      location: 'አካባቢ',
      category: 'ምድብ',
      contactMethod: 'የመገናኛ መንገድ',
      contactValue: 'የመገናኛ መረጃ',
      submit: 'ዝርዝር ያስተዋውቁ',
      cancel: 'ይቅር'
    },
    en: {
      title: 'Add New Listing',
      animalTitle: 'Animal Title',
      description: 'Description',
      price: 'Price (ETB)',
      location: 'Location',
      category: 'Category',
      contactMethod: 'Contact Method',
      contactValue: 'Contact Information',
      submit: 'Submit Listing',
      cancel: 'Cancel'
    },
    or: {
      title: 'Tarree Haaraa Dabaluu',
      animalTitle: 'Mata duree Horii',
      description: 'Ibsa',
      price: 'Gatii (Birr)',
      location: 'Bakka',
      category: 'Akaakuu',
      contactMethod: 'Mala Qunnamtii',
      contactValue: 'Odeeffannoo Qunnamtii',
      submit: 'Tarree Dhiheessi',
      cancel: 'Haqi'
    },
    sw: {
      title: 'Ongeza Orodha Mpya',
      animalTitle: 'Kichwa cha Mnyama',
      description: 'Maelezo',
      price: 'Bei (ETB)',
      location: 'Mahali',
      category: 'Kategoria',
      contactMethod: 'Njia ya Mawasiliano',
      contactValue: 'Taarifa za Mawasiliano',
      submit: 'Wasilisha Orodha',
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
          <CardTitle className="text-lg font-semibold">{t.title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.animalTitle}</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.description}</label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.price}</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.location}</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                {t.submit}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                {t.cancel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
