// src/components/EditAnimalModal.tsx - Modal for editing animal details

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Camera } from 'lucide-react';
import { AnimalSubtypeSelector } from '@/components/AnimalSubtypeSelector';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EditAnimalModalProps {
  animalId: string;
  currentData: {
    name: string;
    type: 'cattle' | 'goat' | 'sheep';
    subtype: string;
    photo_url?: string;
  };
  onSave: (updates: { name: string; subtype: string; photo_url?: string }) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

export const EditAnimalModal = ({
  animalId,
  currentData,
  onSave,
  onClose,
  isSaving
}: EditAnimalModalProps) => {
  const { t } = useTranslations();
  const [name, setName] = useState(currentData.name);
  const [subtype, setSubtype] = useState(currentData.subtype);
  const [photoUrl, setPhotoUrl] = useState(currentData.photo_url);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentData.photo_url || null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Validation
  const isValid = name.trim().length > 0;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (): Promise<string | undefined> => {
    if (!photoFile) return photoUrl;

    setIsUploadingPhoto(true);
    try {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${animalId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('animal-photos')
        .upload(filePath, photoFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('animal-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      return photoUrl;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!isValid) return;

    try {
      // Upload photo if changed
      const finalPhotoUrl = await uploadPhoto();

      await onSave({
        name: name.trim(),
        subtype,
        photo_url: finalPhotoUrl
      });
    } catch (error) {
      console.error('Error saving animal:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {t('edit')} {currentData.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Photo Upload */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Photo / ፎቶ
              <span className="text-sm text-gray-500 font-normal ml-2">(Optional)</span>
            </Label>

            <div className="space-y-3">
              {/* Photo Preview */}
              {photoPreview && (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      setPhotoUrl(undefined);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upload Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    disabled={isSaving}
                  />
                  <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                    <Camera className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Take Photo
                    </span>
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    disabled={isSaving}
                  />
                  <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Upload
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <Label htmlFor="name" className="text-base font-semibold mb-2 block">
              Name / ስም <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter animal name"
              className="text-base"
              disabled={isSaving}
            />
            {name.trim().length === 0 && (
              <p className="text-sm text-red-500 mt-1">Name is required</p>
            )}
          </div>

          {/* Subtype Selector */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Type / ዓይነት <span className="text-red-500">*</span>
            </Label>
            <AnimalSubtypeSelector
              animalType={currentData.type}
              value={subtype}
              onChange={setSubtype}
              disabled={isSaving}
            />
          </div>

          {/* Bilingual Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Changes will be saved immediately
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>ማስታወሻ:</strong> ለውጦች ወዲያውኑ ይቀመጣሉ
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isSaving}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={!isValid || isSaving || isUploadingPhoto}
          >
            {isSaving || isUploadingPhoto ? 'Saving...' : t('save')}
          </Button>
        </div>
      </Card>
    </div>
  );
};
