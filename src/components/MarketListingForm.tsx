import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ShoppingCart } from 'lucide-react';
import { Language } from '@/types';
import { useTranslations } from '@/hooks/useTranslations';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { ANIMAL_TYPES, ANIMAL_TYPE_ICONS } from '@/utils/animalTypes';
import { useDateDisplay } from '@/hooks/useDateDisplay';

interface MarketListingFormProps {
  language: Language;
  onClose: () => void;
  onSubmit?: (listing: any) => void;
  onSuccess?: () => void;
}

export const MarketListingForm = ({ language, onClose, onSubmit, onSuccess }: MarketListingFormProps) => {
  const { isDemoMode, getDemoData } = useDemoMode();
  const { t, getAnimalTypeTranslation } = useTranslations();

  const [formData, setFormData] = useState({
    title: '',
    category: 'cattle',
    price: '',
    location: '',
    description: '',
    contactMethod: 'phone',
    contactValue: ''
  });

  // Pre-fill form in demo mode
  useEffect(() => {
    if (isDemoMode) {
      const demoPrice = getDemoData('listing_price');
      const demoLocation = getDemoData('location');
      const demoPhone = getDemoData('phone');

      setFormData(prev => ({
        ...prev,
        price: demoPrice ? demoPrice.toString() : '25000',
        location: demoLocation || 'Addis Ababa',
        contactValue: demoPhone || '+251911111111',
        is_negotiable: true, // Pre-select negotiable
        title: 'Demo Animal for Sale',
        description: 'High-quality animal available for purchase. Contact for more details.'
      }));
    }
  }, [isDemoMode, getDemoData]);

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
            <span>{t('marketplace.title')}</span>
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
              <Label htmlFor="title">{t('marketplace.listingTitle')}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('marketplace.titleOptional')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t('marketplace.category')}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('marketplace.category')} />
                </SelectTrigger>
                <SelectContent>
                  {ANIMAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ANIMAL_TYPE_ICONS[type]} {getAnimalTypeTranslation(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">{t('marketplace.price')} (ETB)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t('marketplace.location')}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('common.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactMethod">{t('marketplace.contactMethod')}</Label>
              <Select
                value={formData.contactMethod}
                onValueChange={(value) => setFormData(prev => ({ ...prev, contactMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">{t('marketplace.phone')}</SelectItem>
                  <SelectItem value="email">{t('marketplace.email')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactValue">{t('marketplace.contactValue')}</Label>
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
                {t('marketplace.submit')}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
