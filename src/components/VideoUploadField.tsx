import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Video, Upload, X, Loader2, Play, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { validateVideo } from '@/utils/videoValidation';
import { compressVideo, type CompressionProgress } from '@/utils/videoCompression';
import { generateCompressedThumbnail } from '@/utils/videoThumbnail';
import { uploadVideoWithThumbnail, type VideoUploadProgress } from '@/services/videoUploadService';

interface VideoUploadFieldProps {
  value?: string; // URL of uploaded video
  thumbnailUrl?: string; // URL of video thumbnail
  onChange: (videoUrl: string | null, thumbnailUrl?: string | null) => void;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
  onError?: (error: string) => void;
}

export const VideoUploadField: React.FC<VideoUploadFieldProps> = ({
  value,
  thumbnailUrl: initialThumbnailUrl,
  onChange,
  onUploadStart,
  onUploadComplete,
  onError
}) => {
  const { t } = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(value || null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(initialThumbnailUrl || null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoSize, setVideoSize] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [compressionStage, setCompressionStage] = useState<string>('');

  // Validate video duration
  const validateVideoDuration = (video: HTMLVideoElement): Promise<boolean> => {
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        const duration = video.duration;
        setVideoDuration(duration);
        resolve(duration <= 10); // Max 10 seconds
      };
    });
  };



  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);

    try {
      setIsUploading(true);
      onUploadStart?.();
      setUploadProgress(10);

      // Validate video (format, size, duration) using validation utilities
      const validationResult = await validateVideo(file);
      if (!validationResult.isValid) {
        const errorMsg = validationResult.error || 'Invalid video';
        setValidationError(errorMsg);
        onError?.(errorMsg);
        setIsUploading(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(20);

      // Store file size for display
      const fileSizeMB = file.size / (1024 * 1024);
      setVideoSize(fileSizeMB);

      // Create video element for thumbnail generation
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(file);
      videoElement.preload = 'metadata';

      // Wait for metadata to load to get duration
      await new Promise<void>((resolve) => {
        videoElement.onloadedmetadata = () => {
          setVideoDuration(videoElement.duration);
          resolve();
        };
      });

      setUploadProgress(30);

      // Compress video if needed
      const compressionResult = await compressVideo(file, (progress: CompressionProgress) => {
        setCompressionStage(progress.stage);
        setUploadProgress(30 + (progress.progress * 0.2)); // 30-50%
      });

      setUploadProgress(50);

      // Use compressed video for upload
      const videoToUpload = compressionResult.compressedBlob;
      const finalSizeMB = videoToUpload.size / (1024 * 1024);
      setVideoSize(finalSizeMB);

      // Generate compressed thumbnail (<100KB)
      const thumbnailResult = await generateCompressedThumbnail(file);
      setThumbnailUrl(thumbnailResult.dataUrl);
      setUploadProgress(60);

      // Upload video and thumbnail to Supabase Storage
      const uploadResult = await uploadVideoWithThumbnail(
        videoToUpload,
        thumbnailResult.blob,
        (progress: VideoUploadProgress) => {
          if (progress.stage === 'video') {
            setUploadProgress(60 + (progress.progress * 0.2)); // 60-80%
          } else if (progress.stage === 'thumbnail') {
            setUploadProgress(80 + (progress.progress * 0.15)); // 80-95%
          } else if (progress.stage === 'complete') {
            setUploadProgress(100);
          }
        }
      );

      // Create preview URLs
      setVideoUrl(uploadResult.videoUrl);
      setThumbnailUrl(uploadResult.thumbnailUrl);

      onChange(uploadResult.videoUrl, uploadResult.thumbnailUrl);
      onUploadComplete?.();

    } catch (error) {
      console.error('Video upload error:', error);
      onError?.(t('errors.videoUploadFailed'));
      setVideoUrl(null);
      setThumbnailUrl(null);
      setVideoDuration(null);
      setVideoSize(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    if (thumbnailUrl) {
      URL.revokeObjectURL(thumbnailUrl);
    }
    setVideoUrl(null);
    setThumbnailUrl(null);
    setVideoDuration(null);
    setVideoSize(null);
    setValidationError(null);
    onChange(null, null);
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
          {t('marketplace.addVideo')}
        </Label>
        <span className="text-sm text-gray-500">
          {t('common.optional')}
        </span>
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">
              {validationError}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {t('marketplace.videoRequirements')}
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Preview or Upload Buttons */}
      {videoUrl ? (
        <div className="relative">
          {/* Video thumbnail with play button */}
          <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Play icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-orange-600 ml-1" />
              </div>
            </div>
          </div>
          
          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors z-10"
            aria-label={t('common.delete')}
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Video info */}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded space-x-2">
            {videoDuration && (
              <span>{videoDuration.toFixed(1)}s</span>
            )}
            {videoSize && (
              <span>• {videoSize.toFixed(1)} MB</span>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {/* Record video button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="h-24 flex flex-col items-center justify-center space-y-2"
          >
            <Video className="w-6 h-6" />
            <span className="text-sm">{t('marketplace.recordVideo')}</span>
          </Button>

          {/* Choose video button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="h-24 flex flex-col items-center justify-center space-y-2"
          >
            <Upload className="w-6 h-6" />
            <span className="text-sm">{t('marketplace.chooseVideo')}</span>
          </Button>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {compressionStage === 'compressing' 
                ? t('marketplace.compressingVideo')
                : t('marketplace.uploadingVideo')}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-center text-gray-500">
            {uploadProgress.toFixed(0)}%
          </p>
        </div>
      )}

      {/* Helper text */}
      {!videoUrl && !isUploading && (
        <p className="text-sm text-gray-500">
          {t('marketplace.videoHelper')}
        </p>
      )}
    </div>
  );
};
