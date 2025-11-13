/**
 * Video validation utilities for marketplace video uploads
 * Validates duration, size, and format according to requirements
 */

export const VIDEO_CONSTRAINTS = {
  MAX_DURATION_SECONDS: 10,
  MAX_SIZE_MB: 20,
  MAX_SIZE_BYTES: 20 * 1024 * 1024, // 20MB in bytes
  ALLOWED_FORMATS: ['video/mp4', 'video/quicktime', 'video/x-msvideo'], // MP4, MOV, AVI
  ALLOWED_EXTENSIONS: ['.mp4', '.mov', '.avi'],
} as const;

export interface VideoValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates video duration is ≤10 seconds
 */
export const validateVideoDuration = async (
  file: File
): Promise<VideoValidationResult> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;

      if (duration > VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS) {
        resolve({
          isValid: false,
          error: `Video must be ${VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS} seconds or less (current: ${Math.round(duration)}s)`,
        });
      } else {
        resolve({ isValid: true });
      }
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      resolve({
        isValid: false,
        error: 'Could not read video metadata',
      });
    };

    video.src = URL.createObjectURL(file);
  });
};

/**
 * Validates video size is ≤20MB
 */
export const validateVideoSize = (file: File): VideoValidationResult => {
  if (file.size > VIDEO_CONSTRAINTS.MAX_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `Video must be ${VIDEO_CONSTRAINTS.MAX_SIZE_MB}MB or less (current: ${sizeMB}MB)`,
    };
  }
  return { isValid: true };
};

/**
 * Validates video format is MP4, MOV, or AVI
 */
export const validateVideoFormat = (file: File): VideoValidationResult => {
  const isValidMimeType = VIDEO_CONSTRAINTS.ALLOWED_FORMATS.includes(file.type);
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  const isValidExtension = VIDEO_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(fileExtension);

  if (!isValidMimeType && !isValidExtension) {
    return {
      isValid: false,
      error: 'Invalid video format. Use MP4, MOV, or AVI',
    };
  }
  return { isValid: true };
};

/**
 * Validates all video constraints (format, size, duration)
 */
export const validateVideo = async (file: File): Promise<VideoValidationResult> => {
  // Check format first
  const formatResult = validateVideoFormat(file);
  if (!formatResult.isValid) {
    return formatResult;
  }

  // Check size
  const sizeResult = validateVideoSize(file);
  if (!sizeResult.isValid) {
    return sizeResult;
  }

  // Check duration (async)
  const durationResult = await validateVideoDuration(file);
  if (!durationResult.isValid) {
    return durationResult;
  }

  return { isValid: true };
};
