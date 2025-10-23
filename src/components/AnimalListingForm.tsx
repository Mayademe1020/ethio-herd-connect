import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Upload, X, Camera, MapPin, Tag, DollarSign } from 'lucide-react';
import { Language } from '@/types';
import { useDateDisplay } from '@/hooks/useDateDisplay';
import { sanitizeFormData } from '@/utils/securityUtils';

interface AnimalListingFormProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSubmit: (data: any) => Promise<void>;
}

export const AnimalListingForm = ({
  isOpen,
  onClose,
  language,
  onSubmit
}: AnimalListingFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    animalType: '',
    breed: '',
    age: '',
    weight: '',
    price: '',
    location: '',
    contactMethod: 'phone',
    contactValue: '',
    isVetVerified: false,
    photos: [] as File[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const { toast } = useToast();

  const translations = {
    am: {
      title: 'እንስሳ ለሽያጭ አስተዋውቅ',
      listingTitle: 'የዝርዝር ርዕስ',
      titlePlaceholder: 'ለምሣሌ: ጤናማ የወተት ላም ለሽያጭ',
      description: 'መግለጫ',
      descriptionPlaceholder: 'የእንስሳውን ዝርዝር መግለጫ ያስገቡ...',
      animalType: 'የእንስሳ አይነት',
      selectType: 'አይነት ይምረጡ',
      cattle: 'ከብት',
      goats: 'ፍየሎች',
      sheep: 'በጎች',
      poultry: 'ዶሮዎች',
      breed: 'ዝርያ',
      breedPlaceholder: 'ለምሣሌ: ሆልስቴይን',
      age: 'እድሜ (በወር)',
      weight: 'ክብደት (በኪሎ)',
      price: 'ዋጋ (በብር)',
      location: 'አካባቢ',
      locationPlaceholder: 'ከተማ/ወረዳ',
      contactMethod: 'የመገናኛ መንገድ',
      phone: 'ስልክ',
      email: 'ኢሜይል',
      contactValue: 'የመገናኛ ዝርዝር',
      phonePlaceholder: '+251...',
      emailPlaceholder: 'email@example.com',
      vetVerified: 'በእንስሳ ሐኪም የተረጋገጠ',
      photos: 'ፎቶዎች',
      addPhotos: 'ፎቶዎች ያክሉ',
      maxPhotos: 'በቢበዛ 5 ፎቶዎች',
      publish: 'አትም',
      cancel: 'ሰርዝ',
      required: 'ግዴታ',
      success: 'ዝርዝሩ በተሳካ ሁኔታ ተተከለ!',
      error: 'ዝርዝሩን ማስገባት አልተቻለም'
    },
    en: {
      title: 'List Animal for Sale',
      listingTitle: 'Listing Title',
      titlePlaceholder: 'e.g., Healthy dairy cow for sale',
      description: 'Description',
      descriptionPlaceholder: 'Provide detailed information about your animal...',
      animalType: 'Animal Type',
      selectType: 'Select Type',
      cattle: 'Cattle',
      goats: 'Goats',
      sheep: 'Sheep',
      poultry: 'Poultry',
      breed: 'Breed',
      breedPlaceholder: 'e.g., Holstein',
      age: 'Age (months)',
      weight: 'Weight (kg)',
      price: 'Price (ETB)',
      location: 'Location',
      locationPlaceholder: 'City/District',
      contactMethod: 'Contact Method',
      phone: 'Phone',
      email: 'Email',
      contactValue: 'Contact Details',
      phonePlaceholder: '+251...',
      emailPlaceholder: 'email@example.com',
      vetVerified: 'Veterinarian Verified',
      photos: 'Photos',
      addPhotos: 'Add Photos',
      maxPhotos: 'Maximum 5 photos',
      publish: 'Publish',
      cancel: 'Cancel',
      required: 'Required',
      success: 'Listing published successfully!',
      error: 'Failed to publish listing'
    },
    or: {
      title: 'Bineensa Gurgurtaaf Tarreessuu',
      listingTitle: 'Mata Duree Tarree',
      titlePlaceholder: 'Fkf: Saawwa fayyaa gurgurtaaf',
      description: 'Ibsa',
      descriptionPlaceholder: 'Waa\'ee bineensa keessanii ibsa bal\'aa kennaa...',
      animalType: 'Gosa Bineensaa',
      selectType: 'Gosa Filadhu',
      cattle: 'Loon',
      goats: 'Re\'ee',
      sheep: 'Hoolaa',
      poultry: 'Lukku',
      breed: 'Sanyii',
      breedPlaceholder: 'Fkf: Holstein',
      age: 'Umurii (ji\'oota)',
      weight: 'Ulfaatina (kg)',
      price: 'Gatii (ETB)',
      location: 'Bakka',
      locationPlaceholder: 'Magaalaa/Aanaa',
      contactMethod: 'Mala Qunnamtii',
      phone: 'Bilbilaa',
      email: 'Imeelii',
      contactValue: 'Bal\'ina Qunnamtii',
      phonePlaceholder: '+251...',
      emailPlaceholder: 'email@example.com',
      vetVerified: 'Hakiima Bineensotaatiin Mirkaneeffame',
      photos: 'Suuraalee',
      addPhotos: 'Suuraalee Dabaluu',
      maxPhotos: 'Suuraalee 5 hanga',
      publish: 'Maxxansuu',
      cancel: 'Dhiisuu',
      required: 'Barbaachisaa',
      success: 'Tarreen milkaa\'inaan maxxanfame!',
      error: 'Tarree maxxansuu dadhabeera'
    },
    sw: {
      title: 'Orodhesha Mnyama wa Kuuza',
      listingTitle: 'Kichwa cha Orodha',
      titlePlaceholder: 'k.m., Ng\'ombe mzuri wa maziwa kuuzwa',
      description: 'Maelezo',
      descriptionPlaceholder: 'Toa maelezo ya kina kuhusu mnyama wako...',
      animalType: 'Aina ya Mnyama',
      selectType: 'Chagua Aina',
      cattle: 'Ng\'ombe',
      goats: 'Mbuzi',
      sheep: 'Kondoo',
      poultry: 'Kuku',
      breed: 'Aina',
      breedPlaceholder: 'k.m., Holstein',
      age: 'Umri (miezi)',
      weight: 'Uzito (kg)',
      price: 'Bei (ETB)',
      location: 'Mahali',
      locationPlaceholder: 'Jiji/Wilaya',
      contactMethod: 'Njia ya Mawasiliano',
      phone: 'Simu',
      email: 'Barua Pepe',
      contactValue: 'Maelezo ya Mawasiliano',
      phonePlaceholder: '+251...',
      emailPlaceholder: 'email@example.com',
      vetVerified: 'Imethibitishwa na Daktari wa Mifugo',
      photos: 'Picha',
      addPhotos: 'Ongeza Picha',
      maxPhotos: 'Picha 5 tu',
      publish: 'Chapisha',
      cancel: 'Ghairi',
      required: 'Inahitajika',
      success: 'Orodha imechapishwa kwa mafanikio!',
      error: 'Imeshindwa kuchapisha orodha'
    }
  };

  const t = translations[language];

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.photos.length + files.length > 5) {
      toast({
        title: "Too many photos",
        description: "Maximum 5 photos allowed",
        variant: "destructive",
      });
      return;
    }

    const newPhotos = [...formData.photos, ...files];
    setFormData(prev => ({ ...prev, photos: newPhotos }));

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, photos: newPhotos }));
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Sanitize form data before submission
      const sanitizedData = sanitizeFormData(formData);
      
      await onSubmit(sanitizedData);
      toast({
        title: t.success,
        description: "Your listing is now live on the marketplace.",
      });
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        animalType: '',
        breed: '',
        age: '',
        weight: '',
        price: '',
        location: '',
        contactMethod: 'phone',
        contactValue: '',
        isVetVerified: false,
        photos: []
      });
      setPhotoPreviews([]);
    } catch (error) {
      toast({
        title: t.error,
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium">{t.listingTitle} *</label>
                <Input
                  placeholder={t.titlePlaceholder}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              {/* Animal Type */}
              <div>
                <label className="text-sm font-medium">{t.animalType} *</label>
                <Select value={formData.animalType} onValueChange={(value) => handleInputChange('animalType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cattle">🐄 {t.cattle}</SelectItem>
                    <SelectItem value="goats">🐐 {t.goats}</SelectItem>
                    <SelectItem value="sheep">🐑 {t.sheep}</SelectItem>
                    <SelectItem value="poultry">🐔 {t.poultry}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Breed */}
              <div>
                <label className="text-sm font-medium">{t.breed}</label>
                <Input
                  placeholder={t.breedPlaceholder}
                  value={formData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                />
              </div>

              {/* Age & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">{t.age}</label>
                  <Input
                    type="number"
                    placeholder="24"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.weight}</label>
                  <Input
                    type="number"
                    placeholder="450"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-sm font-medium">{t.price} *</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Location */}
              <div>
                <label className="text-sm font-medium">{t.location} *</label>
                <Input
                  placeholder={t.locationPlaceholder}
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                />
              </div>

              {/* Contact Method */}
              <div>
                <label className="text-sm font-medium">{t.contactMethod} *</label>
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
                <label className="text-sm font-medium">{t.contactValue} *</label>
                <Input
                  placeholder={formData.contactMethod === 'phone' ? t.phonePlaceholder : t.emailPlaceholder}
                  type={formData.contactMethod === 'email' ? 'email' : 'tel'}
                  value={formData.contactValue}
                  onChange={(e) => handleInputChange('contactValue', e.target.value)}
                  required
                />
              </div>

              {/* Vet Verified */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t.vetVerified}</label>
                <Switch
                  checked={formData.isVetVerified}
                  onCheckedChange={(checked) => handleInputChange('isVetVerified', checked)}
                />
              </div>

              {/* Photos */}
              <div>
                <label className="text-sm font-medium">{t.photos}</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      disabled={formData.photos.length >= 5}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {t.addPhotos}
                    </Button>
                    <span className="text-xs text-gray-500">{t.maxPhotos}</span>
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  
                  {/* Photo Previews */}
                  {photoPreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {photoPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description - Full Width */}
          <div>
            <label className="text-sm font-medium">{t.description}</label>
            <Textarea
              placeholder={t.descriptionPlaceholder}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : t.publish}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};