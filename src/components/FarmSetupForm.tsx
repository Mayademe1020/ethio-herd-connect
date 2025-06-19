
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Home, User, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FarmSetupFormProps {
  language: 'am' | 'en';
  onClose: () => void;
  onSuccess?: () => void;
}

export const FarmSetupForm: React.FC<FarmSetupFormProps> = ({
  language,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    farmName: '',
    farmPrefix: '',
    ownerName: '',
    location: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const { user } = useAuth();

  const generatePrefix = (farmName: string): string => {
    // Take first 3 consonants from farm name, fallback to first 3 chars
    const consonants = farmName.toUpperCase().replace(/[AEIOU\s]/g, '');
    return consonants.length >= 3 ? consonants.slice(0, 3) : farmName.toUpperCase().slice(0, 3);
  };

  const handleFarmNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      farmName: value,
      farmPrefix: generatePrefix(value)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.farmName.trim()) {
      newErrors.farmName = language === 'am' ? 'የእርሻ ስም ያስፈልጋል' : 'Farm name is required';
    }
    if (!formData.farmPrefix.trim() || formData.farmPrefix.length < 2) {
      newErrors.farmPrefix = language === 'am' ? 'ቢያንስ 2 ቁምፊ ያለው ቅድመ-ቅጥያ ያስፈልጋል' : 'Prefix must be at least 2 characters';
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = language === 'am' ? 'ባለቤት ስም ያስፈልጋል' : 'Owner name is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = language === 'am' ? 'አካባቢ ያስፈልጋል' : 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!user) {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'እባክዎ በመጀመሪያ ይግቡ' : 'Please sign in first',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('farm_profiles')
        .upsert([{
          user_id: user.id,
          farm_name: formData.farmName,
          farm_prefix: formData.farmPrefix.toUpperCase(),
          owner_name: formData.ownerName,
          location: formData.location,
          phone: formData.phone || null
        }], {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: language === 'am' ? 'ተሳክቷል' : 'Success',
        description: language === 'am' ? 'የእርሻ መረጃ ተቀምጧል' : 'Farm profile saved successfully'
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving farm profile:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'የእርሻ መረጃ ማስቀመጥ አልተሳካም' : 'Failed to save farm profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <span>{language === 'am' ? 'የእርሻ መረጃ' : 'Farm Profile'}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Farm Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>{language === 'am' ? 'የእርሻ ስም' : 'Farm Name'} *</span>
              </label>
              <Input
                value={formData.farmName}
                onChange={(e) => handleFarmNameChange(e.target.value)}
                placeholder={language === 'am' ? 'ምሳሌ: ሃበሻ እርሻ' : 'Example: Habesha Farm'}
              />
              {errors.farmName && <p className="text-sm text-red-600">{errors.farmName}</p>}
            </div>

            {/* Farm Prefix */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'የእንስሳ ኮድ ቅድመ-ቅጥያ' : 'Animal Code Prefix'} *
              </label>
              <Input
                value={formData.farmPrefix}
                onChange={(e) => setFormData(prev => ({ ...prev, farmPrefix: e.target.value.toUpperCase() }))}
                placeholder="HAB"
                maxLength={5}
                className="uppercase"
              />
              <p className="text-xs text-gray-500">
                {language === 'am' 
                  ? 'የእንስሳ ኮዶች እንደ HAB-COW-001-240615 ይመስላሉ'
                  : 'Animal codes will look like HAB-COW-001-240615'
                }
              </p>
              {errors.farmPrefix && <p className="text-sm text-red-600">{errors.farmPrefix}</p>}
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{language === 'am' ? 'ባለቤት ስም' : 'Owner Name'} *</span>
              </label>
              <Input
                value={formData.ownerName}
                onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                placeholder={language === 'am' ? 'ሙሉ ስም' : 'Full name'}
              />
              {errors.ownerName && <p className="text-sm text-red-600">{errors.ownerName}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{language === 'am' ? 'አካባቢ' : 'Location'} *</span>
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder={language === 'am' ? 'ከተማ፣ ክልል' : 'City, Region'}
              />
              {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{language === 'am' ? 'ስልክ ቁጥር' : 'Phone Number'}</span>
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+251912345678"
                type="tel"
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  language === 'am' ? 'እየተቀመጠ...' : 'Saving...'
                ) : (
                  language === 'am' ? 'ይቀምጡ' : 'Save Profile'
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
