
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, X, Image } from 'lucide-react';

interface AnimalPhotoUploadProps {
  language: 'am' | 'en';
  currentPhoto?: string;
  onPhotoChange: (file: File | null, url: string) => void;
  disabled?: boolean;
}

export const AnimalPhotoUpload: React.FC<AnimalPhotoUploadProps> = ({
  language,
  currentPhoto,
  onPhotoChange,
  disabled = false
}) => {
  const [photoPreview, setPhotoPreview] = useState<string>(currentPhoto || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(language === 'am' ? 'እባክዎ ምስል ፋይል ይምረጡ' : 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'am' ? 'ምስሉ ከ5MB በታች መሆን አለበት' : 'Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setPhotoPreview(imageUrl);
      onPhotoChange(file, imageUrl);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    onPhotoChange(null, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        {language === 'am' ? 'የእንስሳ ምስል' : 'Animal Photo'}
      </label>
      
      <Card className="p-4">
        {photoPreview ? (
          <div className="relative">
            <img
              src={photoPreview}
              alt="Animal preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemovePhoto}
              disabled={disabled || isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Image className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-600 mb-2">
                  {language === 'am' 
                    ? 'የእንስሳውን ምስል ይጨምሩ' 
                    : 'Add animal photo'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  {language === 'am' 
                    ? 'ከ5MB በታች፣ JPG ወይም PNG' 
                    : 'Max 5MB, JPG or PNG'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            disabled={disabled || isUploading}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            {language === 'am' ? 'ምስል ይምረጡ' : 'Choose Photo'}
          </Button>
          
          {/* Camera button for mobile devices */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // On mobile, this will trigger the camera
              if (fileInputRef.current) {
                fileInputRef.current.setAttribute('capture', 'environment');
                fileInputRef.current.click();
              }
            }}
            disabled={disabled || isUploading}
            className="px-3"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />
      </Card>

      {isUploading && (
        <div className="text-sm text-gray-600 text-center">
          {language === 'am' ? 'ምስል እየተጫነ...' : 'Uploading photo...'}
        </div>
      )}
    </div>
  );
};
