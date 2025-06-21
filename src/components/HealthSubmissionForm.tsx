
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Camera, Upload, Stethoscope, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface HealthSubmissionFormProps {
  language: 'am' | 'en';
  onClose: () => void;
}

export const HealthSubmissionForm: React.FC<HealthSubmissionFormProps> = ({
  language,
  onClose
}) => {
  const [formData, setFormData] = useState({
    animalId: '',
    symptoms: '',
    description: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    photo: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.animalId || !formData.symptoms) {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'የእንስሳ መለያ እና ምልክቶች ያስፈልጋል' : 'Animal ID and symptoms are required',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      let photoUrl = null;

      // Upload photo if provided
      if (formData.photo) {
        const fileExt = formData.photo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `health-submissions/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('health-photos')
          .upload(filePath, formData.photo);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('health-photos')
            .getPublicUrl(filePath);
          photoUrl = publicUrl;
        }
      }

      // Submit health case
      const { error } = await supabase
        .from('health_submissions')
        .insert([{
          user_id: user.id,
          animal_id: formData.animalId,
          symptoms: formData.symptoms,
          description: formData.description,
          urgency: formData.urgency,
          photo_url: photoUrl,
          status: 'new'
        }]);

      if (error) throw error;

      toast({
        title: language === 'am' ? 'ተሳክቷል' : 'Success',
        description: language === 'am' ? 'የጤንነት ማመልከቻ ተልኳል' : 'Health submission sent successfully'
      });

      onClose();
    } catch (error) {
      console.error('Error submitting health case:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ማመልከቻ መላክ አልተሳካም' : 'Failed to submit health case',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-green-600" />
            <span>{language === 'am' ? 'የዓይነ ሐኪም ድጋፍ ማመልከቻ' : 'Veterinary Support Request'}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Animal ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'የእንስሳ መለያ' : 'Animal ID'} *
              </label>
              <Input
                type="text"
                value={formData.animalId}
                onChange={(e) => setFormData(prev => ({ ...prev, animalId: e.target.value }))}
                placeholder={language === 'am' ? 'ምሳሌ: COW-001' : 'e.g., COW-001'}
                required
              />
            </div>

            {/* Urgency Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'አጣዳፊነት ደረጃ' : 'Urgency Level'}
              </label>
              <Select value={formData.urgency} onValueChange={(value: 'low' | 'medium' | 'high') => 
                setFormData(prev => ({ ...prev, urgency: value }))
              }>
                <SelectTrigger className={getUrgencyColor(formData.urgency)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    {language === 'am' ? 'ዝቅተኛ' : 'Low'}
                  </SelectItem>
                  <SelectItem value="medium">
                    {language === 'am' ? 'መካከለኛ' : 'Medium'}
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span>{language === 'am' ? 'ከፍተኛ' : 'High'}</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Symptoms */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ምልክቶች' : 'Symptoms'} *
              </label>
              <Textarea
                value={formData.symptoms}
                onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                placeholder={language === 'am' ? 'እንስሳው የሚያሳየው ምልክቶች ይግለጹ...' : 'Describe the symptoms observed...'}
                rows={3}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ተጨማሪ መግለጫ' : 'Additional Description'}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={language === 'am' ? 'ማንኛውም ተጨማሪ መረጃ...' : 'Any additional information...'}
                rows={3}
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ፎቶ' : 'Photo'}
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300">
                  <Camera className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {language === 'am' ? 'ፎቶ ይምረጡ' : 'Choose Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, photo: null }));
                        setPhotoPreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {language === 'am' ? 'ለዓይነ ሐኪም ድጋፍ ላክ' : 'Report for Vet Support'}
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
