
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
  
  const { addToQueue, isOnline } = useOfflineSync();
  const { toast } = useToast();

  React.useEffect(() => {
    fetchFarmProfile();
  }, []);

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

    if (!formData.groupName.trim()) {
      newErrors.groupName = language === 'am' ? 'የቡድን ስም ያስፈልጋል' : 'Group name is required';
    }
    if (!formData.totalCount || parseInt(formData.totalCount) <= 0) {
      newErrors.totalCount = language === 'am' ? 'ትክክለኛ ቁጥር ያስገቡ' : 'Please enter a valid count';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateGroupCode = async (userId: string): Promise<string> => {
    const farmPrefix = farmProfile?.farm_prefix || 'FARM';
    
    try {
      const { data, error } = await supabase.rpc('generate_poultry_group_code', {
        p_user_id: userId,
        p_farm_prefix: farmPrefix
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating group code:', error);
      const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      return `${farmPrefix}-POULTRY-GRP${randomNum}-${dateCode}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const groupCode = await generateGroupCode(user.id);
      const finalBreed = formData.breed === 'other' ? formData.customBreed : formData.breed;
      const totalCount = parseInt(formData.totalCount);

      const groupData = {
        user_id: user.id,
        group_code: groupCode,
        group_name: formData.groupName,
        breed: finalBreed || null,
        total_count: totalCount,
        current_count: totalCount,
        batch_date: batchDate?.toISOString().split('T')[0],
        notes: formData.notes || null
      };

      if (isOnline) {
        const { error } = await supabase.from('poultry_groups').insert([groupData]);
        if (error) throw error;

        toast({
          title: language === 'am' ? 'ተሳክቷል' : 'Success',
          description: language === 'am' 
            ? `${formData.groupName} (${groupCode}) ተመዝግቧል` 
            : `${formData.groupName} (${groupCode}) registered successfully`
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>{language === 'am' ? 'የዶሮ ቡድን ምዝገባ' : 'Register Poultry Group'}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Group Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'የቡድን ስም' : 'Group Name'} *
              </label>
              <Input
                value={formData.groupName}
                onChange={(e) => setFormData(prev => ({ ...prev, groupName: e.target.value }))}
                placeholder={language === 'am' ? 'ምሳሌ: የመጀመሪያ ቡድን' : 'Example: Batch 1'}
              />
              {errors.groupName && <p className="text-sm text-red-600">{errors.groupName}</p>}
            </div>

            {/* Batch Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
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
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ዝርያ' : 'Breed'}
              </label>
              <Select value={formData.breed} onValueChange={(value) => setFormData(prev => ({ ...prev, breed: value }))}>
                <SelectTrigger>
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
                  className="mt-2"
                />
              )}
            </div>

            {/* Total Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ጠቅላላ ቁጥር' : 'Total Count'} *
              </label>
              <Input
                type="number"
                value={formData.totalCount}
                onChange={(e) => setFormData(prev => ({ ...prev, totalCount: e.target.value }))}
                placeholder={language === 'am' ? 'የዶሮዎች ቁጥር' : 'Number of birds'}
                min="1"
              />
              {errors.totalCount && <p className="text-sm text-red-600">{errors.totalCount}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ማስታወሻ' : 'Notes'}
              </label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={language === 'am' ? 'ተጨማሪ መረጃ' : 'Additional notes'}
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
                  language === 'am' ? 'እየተመዘገበ...' : 'Registering...'
                ) : (
                  language === 'am' ? 'ቡድን ይመዝግቡ' : 'Register Group'
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
