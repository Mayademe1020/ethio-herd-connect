/**
 * Video upload service for marketplace listings
 * Handles video and thumbnail uploads to Supabase Storage
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { offlineQueue } from '@/lib/offlineQueue';

export interface VideoUploadProgress {
  stage: 'video' | 'thumbnail' | 'complete';
  progress: number; // 0-100
  bytesUploaded?: number;
  totalBytes?: number;
}

export interface VideoUploadResult {
  videoUrl: string;
  thumbnailUrl: string;
  videoPath: string;
  thumbnailPath: string;
}

const VIDEO_BUCKET = 'animal-photos'; // Using existing bucket for now
const VIDEO_FOLDER = 'listings/videos';
const THUMBNAIL_FOLDER = 'listings/thumbnails';

/**
 * Uploads video to Supabase Storage
 */
export const uploadVideo = async (
  videoBlob: Blob,
  onProgress?: (progress: VideoUploadProgress) => void
): Promise<string> => {
  const fileName = `video-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`;
  const filePath = `${VIDEO_FOLDER}/${fileName}`;

  try {
    onProgress?.({ stage: 'video', progress: 0 });

    const { error: uploadError } = await supabase.storage
      .from(VIDEO_BUCKET)
      .upload(filePath, videoBlob, {
        contentType: videoBlob.type || 'video/mp4',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      logger.error('Video upload failed', { error: uploadError, filePath });
      throw uploadError;
    }

    onProgress?.({ stage: 'video', progress: 100 });

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(VIDEO_BUCKET)
      .getPublicUrl(filePath);

    logger.info('Video uploaded successfully', { publicUrl, filePath });

    return publicUrl;
  } catch (error) {
    logger.error('Video upload error', { error, filePath });
    throw error;
  }
};

/**
 * Uploads thumbnail to Supabase Storage
 */
export const uploadThumbnail = async (
  thumbnailBlob: Blob,
  onProgress?: (progress: VideoUploadProgress) => void
): Promise<string> => {
  const fileName = `thumb-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
  const filePath = `${THUMBNAIL_FOLDER}/${fileName}`;

  try {
    onProgress?.({ stage: 'thumbnail', progress: 0 });

    const { error: uploadError } = await supabase.storage
      .from(VIDEO_BUCKET)
      .upload(filePath, thumbnailBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      logger.error('Thumbnail upload failed', { error: uploadError, filePath });
      throw uploadError;
    }

    onProgress?.({ stage: 'thumbnail', progress: 100 });

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(VIDEO_BUCKET)
      .getPublicUrl(filePath);

    logger.info('Thumbnail uploaded successfully', { publicUrl, filePath });

    return publicUrl;
  } catch (error) {
    logger.error('Thumbnail upload error', { error, filePath });
    throw error;
  }
};

/**
 * Uploads both video and thumbnail
 * Includes retry logic and offline queue support
 */
export const uploadVideoWithThumbnail = async (
  videoBlob: Blob,
  thumbnailBlob: Blob,
  onProgress?: (progress: VideoUploadProgress) => void
): Promise<VideoUploadResult> => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // Upload video
      onProgress?.({ stage: 'video', progress: 0 });
      const videoUrl = await uploadVideo(videoBlob, onProgress);

      // Upload thumbnail
      onProgress?.({ stage: 'thumbnail', progress: 0 });
      const thumbnailUrl = await uploadThumbnail(thumbnailBlob, onProgress);

      onProgress?.({ stage: 'complete', progress: 100 });

      return {
        videoUrl,
        thumbnailUrl,
        videoPath: extractPathFromUrl(videoUrl),
        thumbnailPath: extractPathFromUrl(thumbnailUrl),
      };
    } catch (error) {
      retryCount++;
      logger.warn(`Upload attempt ${retryCount} failed`, { error });

      if (retryCount >= maxRetries) {
        // Add to offline queue if all retries failed
        logger.info('Adding video upload to offline queue');
        
        await offlineQueue.addToQueue('listing_creation', {
          videoBlob: await blobToBase64(videoBlob),
          thumbnailBlob: await blobToBase64(thumbnailBlob),
        });

        throw new Error('Video upload failed. Will retry when online.');
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }

  throw new Error('Video upload failed after all retries');
};

/**
 * Deletes video and thumbnail from storage
 */
export const deleteVideo = async (videoUrl: string, thumbnailUrl?: string): Promise<void> => {
  try {
    const videoPath = extractPathFromUrl(videoUrl);
    
    const { error: videoError } = await supabase.storage
      .from(VIDEO_BUCKET)
      .remove([videoPath]);

    if (videoError) {
      logger.error('Failed to delete video', { error: videoError, videoPath });
    }

    if (thumbnailUrl) {
      const thumbnailPath = extractPathFromUrl(thumbnailUrl);
      
      const { error: thumbnailError } = await supabase.storage
        .from(VIDEO_BUCKET)
        .remove([thumbnailPath]);

      if (thumbnailError) {
        logger.error('Failed to delete thumbnail', { error: thumbnailError, thumbnailPath });
      }
    }

    logger.info('Video and thumbnail deleted successfully');
  } catch (error) {
    logger.error('Error deleting video', { error });
    throw error;
  }
};

/**
 * Helper: Extract file path from Supabase public URL
 */
const extractPathFromUrl = (url: string): string => {
  const parts = url.split(`/${VIDEO_BUCKET}/`);
  return parts[1] || '';
};

/**
 * Helper: Convert Blob to base64 for offline storage
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Helper: Convert base64 back to Blob
 */
export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(',');
  const contentType = parts[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};
