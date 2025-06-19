
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, X, Upload, MapPin, DollarSign, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useToast } from '@/hooks/use-toast';

interface Animal {
  id: string;
  animal_code: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  photo_url?: string;
  is_vet_verified: boolean;
}

interface MarketListingFormProps {
  language: 'am' | 'en';
  onClose: () => void;
  onSuccess?: () => void;
}

export const MarketListingForm: React.FC<MarketListingFormProps> = ({
  language,
  onClose,
  onSuccess
}) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    contactMethod: 'phone' as 'phone' | 'telegram' | 'sms',
    contactValue: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToQueue, isOnline } = useOfflineSync();
  const { toast } = useToast();

  React.useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'እንስሳትን ማምጣት አልተሳካም' : 'Failed to fetch animals',
        variant: 'destructive'
      });
    }
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + photos.length > 5) {
      toast({
        title: language === 'am' ? 'ማስጠንቀቂያ' : 'Warning',
        description: language === 'am' ? 'ከ5 በላይ ፎቶ መጨመር አይችሉም' : 'Cannot add more than 5 photos',
        variant: 'destructive'
      });
      return;
    }

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // Create preview URLs
    const newUrls = files.map(file => URL.createObjectURL(file));
    setPhotoUrls(prev => [...prev, ...newUrls]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newUrls = photoUrls.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoUrls(newUrls);
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) return [];

    const uploadedUrls: string[] = [];
    
    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${supabase.auth.getUser().then(u => u.data.user?.id)}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('animal-photos')
        .upload(filePath, photo);

      if (uploadError) {
        console.error('Photo upload error:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('animal-photos')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedAnimal) {
      newErrors.animal = language === 'am' ? 'እንስሳ ይምረጡ' : 'Please select an animal';
    }
    if (!formData.title.trim()) {
      newErrors.title = language === 'am' ? 'ርዕስ ያስፈልጋል' : 'Title is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = language === 'am' ? 'ዋጋ ያስፈልጋል' : 'Valid price is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = language === 'am' ? 'አካባቢ ያስፈልጋል' : 'Location is required';
    }
    if (!formData.contactValue.trim()) {
      newErrors.contactValue = language === 'am' ? 'የመገናኛ መረጃ ያስፈልጋል' : 'Contact information is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      let uploadedPhotoUrls: string[] = [];
      
      if (isOnline && photos.length > 0) {
        uploadedPhotoUrls = await uploadPhotos();
      }

      const listingData = {
        animal_id: selectedAnimal!.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        weight: selectedAnimal!.weight,
        age: selectedAnimal!.age,
        location: formData.location,
        contact_method: formData.contactMethod,
        contact_value: formData.contactValue,
        is_vet_verified: selectedAnimal!.is_vet_verified,
        photos: uploadedPhotoUrls,
        status: 'active'
      };

      if (isOnline) {
        const { error } = await supabase
          .from('market_listings')
          .insert([listingData]);

        if (error) throw error;

        toast({
          title: language === 'am' ? 'ተሳክቷል' : 'Success',
          description: language === 'am' ? 'ዝርዝሩ ተፈጥሯል' : 'Listing created successfully'
        });
      } else {
        addToQueue('market', listingData);
        toast({
          title: language === 'am' ? 'ኦፍላይን ተቀምጧል' : 'Saved Offline',
          description: language === 'am' ? 'በመስመር ላይ ሲሆኑ ይመጣል' : 'Will sync when online'
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ዝርዝር መፍጠር አልተሳካም' : 'Failed to create listing',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {language === 'am' ? 'ለሽያጭ ማስቀመጫ' : 'Create Listing'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Animal Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'እንስሳ ምረጥ' : 'Select Animal'} *
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {animals.map((animal) => (
                  <div
                    key={animal.id}
                    onClick={() => setSelectedAnimal(animal)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAnimal?.id === animal.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {animal.photo_url && (
                        <img
                          src={animal.photo_url}
                          alt={animal.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{animal.name}</span>
                          <Badge variant="outline">{animal.animal_code}</Badge>
                          {animal.is_vet_verified && (
                            <Badge className="bg-green-100 text-green-800">
                              {language === 'am' ? 'ዶክተር ማረጋገጫ' : 'Vet Verified'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {animal.breed} • {animal.weight}kg • {animal.age} {language === 'am' ? 'ዓመት' : 'years'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.animal && <p className="text-sm text-red-600">{errors.animal}</p>}
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ፎቶዎች' : 'Photos'} ({photos.length}/5)
              </label>
              
              <div className="flex flex-wrap gap-2">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-6 h-6 p-0"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                
                {photos.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-20 h-20 flex flex-col items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs">{language === 'am' ? 'ጨምር' : 'Add'}</span>
                  </Button>
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/*"
                multiple
                className="hidden"
                capture="environment"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ርዕስ' : 'Title'} *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={language === 'am' ? 'የእንስሳው ርዕስ' : 'Animal listing title'}
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'መግለጫ' : 'Description'}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={language === 'am' ? 'ስለ እንስሳው ይግለጹ' : 'Describe the animal'}
                rows={3}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ዋጋ (ብር)' : 'Price (ETB)'} *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
              {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'አካባቢ' : 'Location'} *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder={language === 'am' ? 'ከተማ፣ ክልል' : 'City, Region'}
                  className="pl-10"
                />
              </div>
              {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'የመገናኛ መንገድ' : 'Contact Method'} *
              </label>
              <Select value={formData.contactMethod} onValueChange={(value: any) => setFormData(prev => ({ ...prev, contactMethod: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{language === 'am' ? 'ስልክ' : 'Phone'}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="telegram">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Telegram</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>SMS</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'የመገናኛ መረጃ' : 'Contact Information'} *
              </label>
              <Input
                value={formData.contactValue}
                onChange={(e) => setFormData(prev => ({ ...prev, contactValue: e.target.value }))}
                placeholder={
                  formData.contactMethod === 'phone' 
                    ? '+251912345678'
                    : formData.contactMethod === 'telegram'
                    ? '@username'
                    : '+251912345678'
                }
              />
              {errors.contactValue && <p className="text-sm text-red-600">{errors.contactValue}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  language === 'am' ? 'እየተመዘገበ...' : 'Creating...'
                ) : (
                  language === 'am' ? 'ዝርዝር ፍጠር' : 'Create Listing'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                {language === 'am' ? 'ሰርዝ' : 'Cancel'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
