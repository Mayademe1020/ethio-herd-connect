import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, MapPin, User, Phone, Mail } from 'lucide-react';
import { Language } from '@/types';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { supabase } from '@/integrations/supabase/client';

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
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Error', 'You must be logged in to save farm information');
        return;
      }

      const farmPrefix = formData.farmName.substring(0, 3).toUpperCase();
      
      const { error } = await supabase
        .from('farm_profiles')
        .upsert({
          user_id: user.id,
          farm_name: formData.farmName,
          farm_prefix: farmPrefix,
          owner_name: formData.ownerName,
          phone: formData.phone,
          location: formData.location
        });

      if (error) throw error;

      showSuccess('Success', 'Farm information saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving farm profile:', error);
      showError('Error', 'Failed to save farm information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl max-h-[95vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 md:pb-4 px-3 md:px-6 pt-3 md:pt-6">
          <CardTitle className="text-base md:text-xl font-bold flex items-center gap-2">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span className="truncate">{t.title}</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="px-3 md:px-6 pb-3 md:pb-6 space-y-4 md:space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Farm Name - Full width */}
            <div className="space-y-2">
              <Label htmlFor="farmName" className="flex items-center gap-2 text-sm md:text-base font-medium">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <span>{t.farmName}</span>
              </Label>
              <Input
                id="farmName"
                value={formData.farmName}
                onChange={(e) => handleInputChange('farmName', e.target.value)}
                placeholder={t.farmName}
                className="h-10 md:h-11 text-sm md:text-base transition-all focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* Owner Name - Full width */}
            <div className="space-y-2">
              <Label htmlFor="ownerName" className="flex items-center gap-2 text-sm md:text-base font-medium">
                <User className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <span>{t.ownerName}</span>
              </Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                placeholder={t.ownerName}
                className="h-10 md:h-11 text-sm md:text-base transition-all focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* Contact Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm md:text-base font-medium">
                  <Phone className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                  <span>{t.phone}</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={t.phone}
                  className="h-10 md:h-11 text-sm md:text-base transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm md:text-base font-medium">
                  <Mail className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                  <span>{t.email}</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t.email}
                  className="h-10 md:h-11 text-sm md:text-base transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Location - Full width */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm md:text-base font-medium">{t.location}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={t.location}
                className="h-10 md:h-11 text-sm md:text-base transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Farm Type - Full width */}
            <div className="space-y-2">
              <Label htmlFor="farmType" className="text-sm md:text-base font-medium">{t.farmType}</Label>
              <Select value={formData.farmType} onValueChange={(value) => handleInputChange('farmType', value)}>
                <SelectTrigger className="h-10 md:h-11 text-sm md:text-base transition-all focus:ring-2 focus:ring-primary/20">
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

            {/* Description - Full width */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm md:text-base font-medium">{t.description}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t.description}
                rows={3}
                className="text-sm md:text-base resize-none transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Action Buttons - Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-6">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 h-10 md:h-11 text-sm md:text-base bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                <Save className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                {loading ? 'Saving...' : t.save}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 h-10 md:h-11 text-sm md:text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {t.cancel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
