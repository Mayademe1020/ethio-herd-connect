import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { compressImage } from '@/utils/imageCompression';
import { getImageDimensions, exceedsMegapixelLimit, resizeToMegapixelLimit, formatFileSize } from '@/utils/imageOptimization';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface PhotoUploadFieldProps {
  value?: string; // URL of uploaded photo
  onChange: (url: string | null) => void;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
  onError?: (error: string) => void;
}

export const PhotoUploadField: React.FC<PhotoUploadFieldProps> = ({
  value,
  onChange,
  onUploadStart,
  onUploadComplete,
  onError
}) => {
  const { t } = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionStage, setCompressionStage] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [showLargeFileWarning, setShowLargeFileWarning] = useState(false);
  const [compressionStartTime, setCompressionStartTime] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [originalMegapixels, setOriginalMegapixels] = useState<number | null>(null);

  // Track compression analytics
  const trackCompressionEvent = async (eventName: string, properties: Record<string, any>) => {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_name: eventName,
          properties: {
            ...properties,
            component: 'PhotoUploadField',
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.(t('errors.invalidFileType'));
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      onError?.(t('errors.photoTooLarge'));
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
      onUploadStart?.();
      setUploadProgress(10);

      const startTime = Date.now();
      setCompressionStartTime(startTime);

      // Track compression start
      await trackCompressionEvent('photo_compression_started', {
        originalSize: file.size,
        fileType: file.type,
        fileName: file.name
      });

      // First resize if image exceeds 5MP limit
      let imageToCompress = file;
      if (originalMegapixels && originalMegapixels > 5) {
        setCompressionStage('Resizing large image...');
        setUploadProgress(15);
        imageToCompress = await resizeToMegapixelLimit(file, 5) as any;
        setUploadProgress(25);
      }

      // Compress image
      const compressedBlob = await compressImage(imageToCompress, 500, 1200, 1200);
      const compressedSizeKB = Math.round(compressedBlob.size / 1024);
      const compressionTime = Date.now() - startTime;
      const compressionRatio = ((1 - compressedBlob.size / file.size) * 100);

      setCompressedSize(compressedSizeKB);
      setUploadProgress(40);

      // Track compression completion
      await trackCompressionEvent('photo_compression_completed', {
        originalSize: file.size,
        compressedSize: compressedBlob.size,
        compressionRatio: compressionRatio.toFixed(1),
        compressionTime,
        finalSizeKB: compressedSizeKB
      });

      // Create preview
      const previewUrl = URL.createObjectURL(compressedBlob);
      setPreviewUrl(previewUrl);
      setUploadProgress(50);

      // Upload to Supabase Storage
      const fileName = `listing-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `listings/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('animal-photos')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(90);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('animal-photos')
        .getPublicUrl(filePath);

      setUploadProgress(100);
      onChange(publicUrl);
      onUploadComplete?.();

      // Track successful upload
      await trackCompressionEvent('photo_upload_completed', {
        finalUrl: publicUrl,
        totalTime: Date.now() - startTime
      });

    } catch (error) {
      console.error('Photo upload error:', error);
      onError?.(t('errors.photoUploadFailed'));
      setPreviewUrl(null);
      setCompressedSize(null);

      // Track upload failure
      await trackCompressionEvent('photo_upload_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stage: 'upload'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setCompressedSize(null);
    setOriginalMegapixels(null);
    setShowLargeFileWarning(false);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          {t('marketplace.addPhoto')}
        </Label>
        <span className="text-sm text-gray-500">
          {t('common.optional')}
        </span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Preview or Upload Buttons */}
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          
          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            aria-label={t('common.delete')}
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Size indicators */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {originalMegapixels && originalMegapixels > 5 && (
              <div className="px-2 py-1 bg-orange-600 bg-opacity-90 text-white text-xs rounded">
                {originalMegapixels.toFixed(1)}MP → 5MP
              </div>
            )}
            {compressedSize && (
              <div className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                {compressedSize} KB
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {/* Camera button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="h-24 flex flex-col items-center justify-center space-y-2"
          >
            <Camera className="w-6 h-6" />
            <span className="text-sm">{t('marketplace.takePhoto')}</span>
          </Button>

          {/* Gallery button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="h-24 flex flex-col items-center justify-center space-y-2"
          >
            <Upload className="w-6 h-6" />
            <span className="text-sm">{t('marketplace.choosePhoto')}</span>
          </Button>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('marketplace.uploadingPhoto')}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-center text-gray-500">
            {uploadProgress}%
          </p>
        </div>
      )}

      {/* Helper text */}
      {!previewUrl && !isUploading && (
        <p className="text-sm text-gray-500">
          {t('marketplace.photoHelper')}
        </p>
      )}

      {/* Large file warning */}
      {showLargeFileWarning && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-orange-800">Large image detected</div>
            <div className="text-orange-700">
              Your photo exceeds 5MP. It will be automatically resized for better performance.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
