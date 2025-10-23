
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from './DatePicker';
import { breedsByType } from '@/utils/breedData';
import { AnimalIdDisplay } from '@/components/AnimalIdDisplay';
import { generateAnimalId, validateInput } from '@/utils/animalIdGenerator';
import { useDateDisplay } from '@/hooks/useDateDisplay';
import { sanitizeFormData } from '@/utils/securityUtils';

interface PoultryGroupFormProps {
  language: 'am' | 'en';
  onClose: () => void;
  onSuccess?: () => void;
}

export const PoultryGroupForm: React.FC<PoultryGroupFormProps> = ({
  language,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    groupName: '',
    breed: '',
    customBreed: '',
    totalCount: '',
    notes: ''
  });
  const [batchDate, setBatchDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [farmProfile, setFarmProfile] = useState<any>(null);
  const [generatedGroupId, setGeneratedGroupId] = useState<string>('');
  
  const { addToQueue, isOnline } = useOfflineSync();
  const { toast } = useToast();

  React.useEffect(() => {
    fetchFarmProfile();
  }, []);

  React.useEffect(() => {
    if (farmProfile) {
      const newId = generateAnimalId('poultry', farmProfile.farm_prefix || 'FARM');
      setGeneratedGroupId(newId.replace('POU-', 'GRP-'));
    }
  }, [farmProfile]);

  const fetchFarmProfile = async () => {
    try {
      const { data } = await supabase.from('farm_profiles').select('*').single();
      setFarmProfile(data);
    } catch (error) {
      console.error('Error fetching farm profile:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateInput(formData.groupName, 'name')) {
      newErrors.groupName = language === 'am' ? 'የቡድን ስም ያስፈልጋል' : 'Group name is required';
    }
    if (!formData.totalCount || !validateInput(formData.totalCount, 'count')) {
      newErrors.totalCount = language === 'am' ? 'ትክክለኛ ቁጥር ያስገቡ (1-10000)' : 'Please enter a valid count (1-10000)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Sanitize form data before submission
      const sanitizedData = sanitizeFormData({
        groupName: formData.groupName,
        customBreed: formData.customBreed,
        notes: formData.notes
      });

      const finalBreed = formData.breed === 'other' ? sanitizedData.customBreed : formData.breed;
      const totalCount = parseInt(formData.totalCount);

      const groupData = {
        user_id: user.id,
        group_code: generatedGroupId,
        group_name: sanitizedData.groupName,
        breed: finalBreed || null,
        total_count: totalCount,
        current_count: totalCount,
        batch_date: batchDate?.toISOString().split('T')[0],
        notes: sanitizedData.notes || null
      };

      if (isOnline) {
        const { error } = await supabase.from('poultry_groups').insert([groupData]);
        if (error) throw error;

        toast({
          title: language === 'am' ? 'ተሳክቷል' : 'Success',
          description: language === 'am' 
            ? `${formData.groupName} (${generatedGroupId}) ተመዝግቧል` 
            : `${formData.groupName} (${generatedGroupId}) registered successfully`
        });
      } else {
        addToQueue('poultry_group', groupData);
        toast({
          title: language === 'am' ? 'ኦፍላይን ተቀምጧል' : 'Saved Offline',
          description: language === 'am' ? 'በመስመር ላይ ሲሆኑ ይመጣል' : 'Will sync when online'
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error registering poultry group:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'የዶሮ ቡድን መመዝገብ አልተሳካም' : 'Failed to register poultry group',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center space-x-1 sm:space-x-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{language === 'am' ? 'የዶሮ ቡድን ምዝገባ' : 'Register Poultry Group'}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 sm:h-8 sm:w-8 p-0">
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="px-3 sm:px-6 space-y-3 sm:space-y-4">
          {/* Generated Group ID Preview */}
          {generatedGroupId && (
            <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
              <label className="text-xs sm:text-sm font-medium text-green-800 mb-1 sm:mb-2 block">
                {language === 'am' ? 'የቡድን መለያ' : 'Group ID'}
              </label>
              <AnimalIdDisplay 
                animalId={generatedGroupId} 
                showCopy={true}
                size="sm"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Group Name */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'የቡድን ስም' : 'Group Name'} *
              </label>
              <Input
                value={formData.groupName}
                onChange={(e) => setFormData(prev => ({ ...prev, groupName: e.target.value }))}
                placeholder={language === 'am' ? 'ምሳሌ: የመጀመሪያ ቡድን' : 'Example: Batch 1'}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
              {errors.groupName && <p className="text-xs text-red-600">{errors.groupName}</p>}
            </div>

            {/* Batch Date */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{language === 'am' ? 'የቡድን ቀን' : 'Batch Date'}</span>
              </label>
              <DatePicker
                date={batchDate}
                onDateChange={(date) => setBatchDate(date || new Date())}
                placeholder={language === 'am' ? 'ቀን ይምረጡ' : 'Select date'}
                language={language}
              />
            </div>

            {/* Breed */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'ዝርያ' : 'Breed'}
              </label>
              <Select value={formData.breed} onValueChange={(value) => setFormData(prev => ({ ...prev, breed: value }))}>
                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder={language === 'am' ? 'ዝርያ ይምረጡ' : 'Select breed'} />
                </SelectTrigger>
                <SelectContent>
                  {breedsByType.poultry.map((breed) => (
                    <SelectItem key={breed} value={breed.toLowerCase().replace(/\s+/g, '_')}>
                      {breed}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">
                    {language === 'am' ? 'ሌላ' : 'Other'}
                  </SelectItem>
                </SelectContent>
              </Select>

              {formData.breed === 'other' && (
                <Input
                  value={formData.customBreed}
                  onChange={(e) => setFormData(prev => ({ ...prev, customBreed: e.target.value }))}
                  placeholder={language === 'am' ? 'ዝርያ ይጻፉ' : 'Enter breed name'}
                  className="mt-1 sm:mt-2 h-8 sm:h-10 text-xs sm:text-sm"
                />
              )}
            </div>

            {/* Total Count */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'ጠቅላላ ቁጥር' : 'Total Count'} *
              </label>
              <Input
                type="number"
                value={formData.totalCount}
                onChange={(e) => setFormData(prev => ({ ...prev, totalCount: e.target.value }))}
                placeholder={language === 'am' ? 'የዶሮዎች ቁጥር' : 'Number of birds'}
                min="1"
                max="10000"
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
              {errors.totalCount && <p className="text-xs text-red-600">{errors.totalCount}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'ማስታወሻ' : 'Notes'}
              </label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={language === 'am' ? 'ተጨማሪ መረጃ' : 'Additional notes'}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 h-8 sm:h-10 text-xs sm:text-sm"
              >
                {loading ? (
                  language === 'am' ? 'እየተመዘገበ...' : 'Registering...'
                ) : (
                  language === 'am' ? 'ቡድን ይመዝግቡ' : 'Register Group'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
              >
                {language === 'am' ? 'ሰርዝ' : 'Cancel'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
