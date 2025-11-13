
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, X, Image, AlertTriangle } from 'lucide-react';
import { optimizeForPreview, optimizeForOfflineStorage, blobToBase64, IMAGE_SIZE_LIMITS, formatFileSize, getImageDimensions, exceedsMegapixelLimit, resizeToMegapixelLimit } from '@/utils/imageOptimization';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

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
  const [compressionStage, setCompressionStage] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [showLargeFileWarning, setShowLargeFileWarning] = useState(false);
  const [compressionStartTime, setCompressionStartTime] = useState<number>(0);
  const [originalMegapixels, setOriginalMegapixels] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError, showInfo } = useToastNotifications();
  const { t } = useTranslations();

  // Track compression analytics
  const trackCompressionEvent = async (eventName: string, properties: Record<string, any>) => {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_name: eventName,
          properties: {
            ...properties,
            component: 'AnimalPhotoUpload',
            timestamp: new Date().toISOString()
          }
        });

      if (error) {
        logger.warn('Failed to track compression analytics', { error, eventName });
      }
    } catch (error) {
      logger.warn('Analytics tracking failed', { error, eventName });
    }
  };

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

    // Check for large files (>10MB) and show warning
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      setShowLargeFileWarning(true);
      // Still allow processing but warn user
    }

    // Validate file size (max 20MB to allow large Ethiopian photos)
    if (file.size > 20 * 1024 * 1024) {
      showError(
        t('File too large'),
        t('Image must be less than 20MB')
      );
      return;
    }

    // Check image dimensions and megapixels
    try {
      const dimensions = await getImageDimensions(file);
      setOriginalMegapixels(dimensions.megapixels);

      if (exceedsMegapixelLimit(dimensions.width, dimensions.height, 5)) {
        // Show warning but allow processing - we'll resize it
        setShowLargeFileWarning(true);
      }
    } catch (error) {
      console.warn('Failed to get image dimensions:', error);
      // Continue with upload even if we can't check dimensions
    }

    try {
      setIsUploading(true);
      setUploadProgress(5);
      setOriginalSize(file.size);
      const startTime = Date.now();
      setCompressionStartTime(startTime);

      // Track compression start
      await trackCompressionEvent('animal_photo_compression_started', {
        originalSize: file.size,
        fileType: file.type,
        fileName: file.name
      });

      // Show info about optimization
      showInfo(
        t('Optimizing image'),
        t('Resizing and compressing for better performance')
      );

      // First resize if image exceeds 5MP limit
      let imageToOptimize = file;
      if (originalMegapixels && originalMegapixels > 5) {
        setUploadProgress(5);
        setCompressionStage('Resizing large image...');
        imageToOptimize = await resizeToMegapixelLimit(file, 5) as any;
        setUploadProgress(10);
      }

      // Optimize image for preview with progress tracking
      const optimizedBlob = await optimizeForPreview(imageToOptimize, (progress) => {
        setUploadProgress(10 + progress * 0.35); // 10-45% for preview optimization
        setCompressionStage('Optimizing for preview...');
      });

      // Create smaller version for offline storage
      const offlineBlob = await optimizeForOfflineStorage(imageToOptimize, (progress) => {
        setUploadProgress(45 + progress * 0.3); // 45-75% for offline optimization
        setCompressionStage('Preparing offline version...');
      });

      // Convert to base64 for preview
      setUploadProgress(80);
      setCompressionStage('Finalizing...');
      const imageUrl = await blobToBase64(optimizedBlob);

      // Update UI and pass to parent
      setPhotoPreview(imageUrl);
      setCompressedSize(optimizedBlob.size);

      // Create new file from blob with original name
      const optimizedFile = new File(
        [optimizedBlob],
        file.name,
        { type: file.type }
      );

      const compressionTime = Date.now() - startTime;
      const compressionRatio = ((1 - optimizedBlob.size / file.size) * 100);

      onPhotoChange(optimizedFile, imageUrl);
      setUploadProgress(100);
      setCompressionStage('Complete');

      // Track compression completion
      await trackCompressionEvent('animal_photo_compression_completed', {
        originalSize: file.size,
        compressedSize: optimizedBlob.size,
        offlineSize: offlineBlob.size,
        compressionRatio: compressionRatio.toFixed(1),
        compressionTime,
        finalSizeKB: Math.round(optimizedBlob.size / 1024)
      });
    } catch (error) {
      console.error('Error processing image:', error);
      showError(
        t('Image processing failed'),
        t('Please try again with a different image')
      );

      // Track compression failure
      await trackCompressionEvent('animal_photo_compression_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stage: 'processing',
        originalSize: file.size
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setCompressionStage('');
      // Hide large file warning after 3 seconds
      setTimeout(() => setShowLargeFileWarning(false), 3000);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setOriginalMegapixels(null);
    setShowLargeFileWarning(false);
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
            <div className="relative">
              <img
                src={photoPreview}
                alt={t('animals.preview')}
                className="w-full h-48 object-cover rounded-lg"
                loading="lazy"
                width={IMAGE_SIZE_LIMITS.PREVIEW.width}
                height={IMAGE_SIZE_LIMITS.PREVIEW.height}
              />

              {/* Size indicators */}
              {originalMegapixels && originalMegapixels > 5 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-orange-600 bg-opacity-90 text-white text-xs rounded">
                  {originalMegapixels.toFixed(1)}MP → 5MP
                </div>
              )}
            </div>
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
        <div className="space-y-3" role="status" aria-live="polite" aria-label="Photo upload progress">
          {/* Progress Bar with Accessibility */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{compressionStage || t('animals.optimizingPhoto')}</span>
              <span aria-live="polite">{uploadProgress}%</span>
            </div>
            <div
              className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden"
              role="progressbar"
              aria-valuenow={uploadProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
                style={{ width: `${uploadProgress}%` }}
              />
              {/* Animated pulse for active processing */}
              {uploadProgress < 100 && (
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              )}
            </div>
          </div>

          {/* Size Information */}
          {originalSize > 0 && compressedSize > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 font-medium">
                    {t('animals.compressionComplete') || 'Compression Complete'}
                  </span>
                </div>
                <span className="text-green-600 font-mono text-xs">
                  {((1 - compressedSize / originalSize) * 100).toFixed(0)}% {t('animals.saved') || 'saved'}
                </span>
              </div>
              <div className="mt-1 text-xs text-green-700">
                {formatFileSize(originalSize)} → {formatFileSize(compressedSize)}
              </div>
            </div>
          )}

          {/* Processing Warnings */}
          {Date.now() - compressionStartTime > 5000 && uploadProgress < 90 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-amber-800">
                  {t('animals.processingLargeFile') || 'Processing large file'}
                </div>
                <div className="text-amber-700 text-xs mt-1">
                  {t('animals.processingMessage') || 'This may take a moment on slower connections. Please wait...'}
                </div>
              </div>
            </div>
          )}

          {/* Performance Metrics for Debug */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-gray-500 mt-2">
              <summary className="cursor-pointer hover:text-gray-700">
                Debug Info
              </summary>
              <div className="mt-1 space-y-1 font-mono">
                <div>Original: {formatFileSize(originalSize)}</div>
                <div>Compressed: {formatFileSize(compressedSize)}</div>
                <div>Time: {(Date.now() - compressionStartTime) / 1000}s</div>
                <div>Progress: {uploadProgress}%</div>
              </div>
            </details>
          )}
        </div>
      )}

      {showLargeFileWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-amber-800">Large image detected</div>
            <div className="text-amber-700">
              Your photo exceeds 5MP. It will be automatically resized for better performance.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
