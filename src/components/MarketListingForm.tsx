import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ShoppingCart } from 'lucide-react';
import { Language } from '@/types';

interface MarketListingFormProps {
  language: Language;
  onClose: () => void;
  onSubmit?: (listing: any) => void;
  onSuccess?: () => void;
}

export const MarketListingForm = ({ language, onClose, onSubmit, onSuccess }: MarketListingFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'cattle',
    price: '',
    location: '',
    description: '',
    contactMethod: 'phone',
    contactValue: ''
  });

  const translations = {
    am: {
      title: 'ለመሸጥ',
      listingTitle: 'ርዕስ (ባዶ ሊሆን ይችላል)',
      titleOptional: 'ምሳሌ: ጤናማ ላም',
      category: 'ምድብ',
      price: 'ዋጋ',
      location: 'አካባቢ',
      description: 'መግለጫ',
      contactMethod: 'የመገናኛ መንገድ',
      phone: 'ስልክ',
      email: 'ኢሜይል',
      contactValue: 'የመገናኛ ዝርዝር',
      submit: 'አስቀምጥ',
      cancel: 'ሰርዝ'
    },
    en: {
      title: 'For Sale',
      listingTitle: 'Title (Optional)',
      titleOptional: 'Example: Healthy cow',
      category: 'Category',
      price: 'Price',
      location: 'Location',
      description: 'Description',
      contactMethod: 'Contact Method',
      phone: 'Phone',
      email: 'Email',
      contactValue: 'Contact Details',
      submit: 'Create Listing',
      cancel: 'Cancel'
    },
    or: {
      title: 'Gurgurtaaf',
      listingTitle: 'Mata Duree (Dirqama Miti)',
      titleOptional: 'Fakkeera: Loon fayyaa',
      category: 'Akaakuu',
      price: 'Gatii',
      location: 'Bakka',
      description: 'Ibsa',
      contactMethod: 'Mala Qunnamtii',
      phone: 'Bilbila',
      email: 'Imeelii',
      contactValue: 'Ibsa Qunnamtii',
      submit: 'Kaa\'i',
      cancel: 'Dhiisi'
    },
    sw: {
      title: 'Kwa Kuuza',
      listingTitle: 'Kichwa (Si Lazima)',
      titleOptional: 'Mfano: Ng\'ombe mzuri',
      category: 'Jamii',
      price: 'Bei',
      location: 'Mahali',
      description: 'Maelezo',
      contactMethod: 'Njia ya Mawasiliano',
      phone: 'Simu',
      email: 'Barua pepe',
      contactValue: 'Maelezo ya Mawasiliano',
      submit: 'Tengeneza',
      cancel: 'Ghairi'
    }
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const listingData = {
      ...formData,
      price: parseFloat(formData.price)
    };
    
    if (onSubmit) {
      onSubmit(listingData);
    }
    
    if (onSuccess) {
      onSuccess();
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
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
              <Label htmlFor="title">{t.listingTitle}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t.titleOptional}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t.category}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.category} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cow">🐄 {language === 'am' ? 'ላም' : language === 'or' ? 'Loon' : language === 'sw' ? 'Ng\'ombe Jike' : 'Cow'}</SelectItem>
                  <SelectItem value="bull">🐂 {language === 'am' ? 'በሬ' : language === 'or' ? 'Korma' : language === 'sw' ? 'Ng\'ombe Dume' : 'Bull'}</SelectItem>
                  <SelectItem value="ox">🐂 {language === 'am' ? 'ወንድ በሬ' : language === 'or' ? 'Korma Qotee' : language === 'sw' ? 'Maksai' : 'Ox'}</SelectItem>
                  <SelectItem value="calf">🐄 {language === 'am' ? 'ተቦ' : language === 'or' ? 'Jabbiituu' : language === 'sw' ? 'Ndama' : 'Calf'}</SelectItem>
                  <SelectItem value="goat">🐐 {language === 'am' ? 'ፍየል' : language === 'or' ? 'Re\'ee' : language === 'sw' ? 'Mbuzi' : 'Goat'}</SelectItem>
                  <SelectItem value="sheep">🐑 {language === 'am' ? 'በግ' : language === 'or' ? 'Hoolaa' : language === 'sw' ? 'Kondoo' : 'Sheep'}</SelectItem>
                  <SelectItem value="poultry">🐔 {language === 'am' ? 'ዶሮ' : language === 'or' ? 'Lukku' : language === 'sw' ? 'Kuku' : 'Poultry'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">{t.price} (ETB)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t.location}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactMethod">{t.contactMethod}</Label>
              <Select
                value={formData.contactMethod}
                onValueChange={(value) => setFormData(prev => ({ ...prev, contactMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">{t.phone}</SelectItem>
                  <SelectItem value="email">{t.email}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactValue">{t.contactValue}</Label>
              <Input
                id="contactValue"
                type={formData.contactMethod === 'email' ? 'email' : 'tel'}
                value={formData.contactValue}
                onChange={(e) => setFormData(prev => ({ ...prev, contactValue: e.target.value }))}
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
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
