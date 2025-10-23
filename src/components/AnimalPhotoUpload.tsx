
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, X, Image } from 'lucide-react';
import { optimizeForPreview, optimizeForOfflineStorage, blobToBase64, IMAGE_SIZE_LIMITS } from '@/utils/imageOptimization';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useTranslations } from '@/hooks/useTranslations';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError, showInfo } = useToastNotifications();
  const t = useTranslations(language);

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError(
        t('Invalid file'),
        t('Please select an image file (JPEG, PNG)')
      );
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError(
        t('File too large'),
        t('Image must be less than 5MB')
      );
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Show info about optimization
      showInfo(
        t('Optimizing image'),
        t('Resizing and compressing for better performance')
      );
      
      // Optimize image based on network conditions
      setUploadProgress(30);
      const optimizedBlob = await optimizeForPreview(file);
      
      // Create smaller version for offline storage if needed
      setUploadProgress(60);
      const offlineBlob = await optimizeForOfflineStorage(file);
      
      // Convert to base64 for preview
      setUploadProgress(80);
      const imageUrl = await blobToBase64(optimizedBlob);
      
      // Update UI and pass to parent
      setPhotoPreview(imageUrl);
      
      // Create new file from blob with original name
      const optimizedFile = new File(
        [optimizedBlob], 
        file.name, 
        { type: file.type }
      );
      
      onPhotoChange(optimizedFile, imageUrl);
      setUploadProgress(100);
    } catch (error) {
      console.error('Error processing image:', error);
      showError(
        t('Image processing failed'),
        t('Please try again with a different image')
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
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
        {t('animals.photo')}
      </label>
      
      <Card className="p-4">
        {photoPreview ? (
          <div className="relative">
            <img
              src={photoPreview}
              alt={t('animals.preview')}
              className="w-full h-48 object-cover rounded-lg"
              loading="lazy"
              width={IMAGE_SIZE_LIMITS.PREVIEW.width}
              height={IMAGE_SIZE_LIMITS.PREVIEW.height}
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
                  {t('animals.addPhoto')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('animals.photoRequirements')}
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
            {t('animals.choosePhoto')}
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
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 text-center">
            {t('animals.optimizingPhoto')} ({uploadProgress}%)
          </div>
        </div>
      )}
    </div>
  );
};
