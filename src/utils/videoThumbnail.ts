/**
 * Video thumbnail generation utilities
 * Generates thumbnails from video files for preview purposes
 */

export interface ThumbnailOptions {
  captureTime?: number; // Time in seconds to capture frame (default: 1)
  maxWidth?: number; // Maximum thumbnail width (default: 640)
  maxHeight?: number; // Maximum thumbnail height (default: 480)
  quality?: number; // JPEG quality 0-1 (default: 0.8)
}

export interface ThumbnailResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  size: number;
}

/**
 * Generates a thumbnail from a video file
 * Captures a frame at specified time and compresses it
 */
export const generateVideoThumbnail = async (
  file: File,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> => {
  const {
    captureTime = 1,
    maxWidth = 640,
    maxHeight = 480,
    quality = 0.8,
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      // Set video to capture time
      video.currentTime = Math.min(captureTime, video.duration - 0.1);
    };

    video.onseeked = () => {
      try {
        // Calculate thumbnail dimensions maintaining aspect ratio
        let width = video.videoWidth;
        let height = video.videoHeight;
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, width, height);

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create thumbnail blob'));
              return;
            }

            // Clean up
            URL.revokeObjectURL(video.src);

            resolve({
              dataUrl,
              blob,
              width,
              height,
              size: blob.size,
            });
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        URL.revokeObjectURL(video.src);
        reject(error);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video for thumbnail generation'));
    };

    // Load video
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Generates a compressed thumbnail (target <100KB)
 */
export const generateCompressedThumbnail = async (
  file: File
): Promise<ThumbnailResult> => {
  const TARGET_SIZE_KB = 100;
  const TARGET_SIZE_BYTES = TARGET_SIZE_KB * 1024;

  // Start with high quality
  let quality = 0.8;
  let result = await generateVideoThumbnail(file, { quality });

  // If thumbnail is too large, reduce quality iteratively
  let attempts = 0;
  const maxAttempts = 5;

  while (result.size > TARGET_SIZE_BYTES && attempts < maxAttempts) {
    quality -= 0.15;
    if (quality < 0.3) quality = 0.3; // Don't go below 30% quality
    
    result = await generateVideoThumbnail(file, { quality });
    attempts++;
  }

  return result;
};

/**
 * Generates multiple thumbnails at different time points
 * Useful for video preview galleries
 */
export const generateMultipleThumbnails = async (
  file: File,
  count: number = 3
): Promise<ThumbnailResult[]> => {
  // Get video duration first
  const video = document.createElement('video');
  video.src = URL.createObjectURL(file);
  video.preload = 'metadata';

  const duration = await new Promise<number>((resolve, reject) => {
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
  });

  // Generate thumbnails at evenly spaced intervals
  const thumbnails: ThumbnailResult[] = [];
  const interval = duration / (count + 1);

  for (let i = 1; i <= count; i++) {
    const captureTime = interval * i;
    const thumbnail = await generateVideoThumbnail(file, { captureTime });
    thumbnails.push(thumbnail);
  }

  return thumbnails;
};
