/**
 * Video compression utilities for marketplace video uploads
 * 
 * Note: Client-side video compression is complex and resource-intensive.
 * This implementation provides a pragmatic approach:
 * 1. For videos already under 5MB: Skip compression
 * 2. For larger videos: Provide guidance to user
 * 3. Future enhancement: Server-side compression or use of FFmpeg.wasm
 */

export interface CompressionProgress {
  stage: 'checking' | 'compressing' | 'complete';
  progress: number; // 0-100
}

export interface CompressionResult {
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  wasCompressed: boolean;
}

const TARGET_SIZE_MB = 5;
const TARGET_SIZE_BYTES = TARGET_SIZE_MB * 1024 * 1024;

/**
 * Compresses a video file to target size <5MB
 * Currently implements a pragmatic approach:
 * - If video is already small enough, return as-is
 * - If video is too large, suggest user to record shorter video
 * 
 * Future enhancement: Implement actual compression using FFmpeg.wasm or server-side processing
 */
export const compressVideo = async (
  file: File,
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressionResult> => {
  const originalSize = file.size;

  onProgress?.({ stage: 'checking', progress: 10 });

  // If video is already under target size, no compression needed
  if (originalSize <= TARGET_SIZE_BYTES) {
    onProgress?.({ stage: 'complete', progress: 100 });
    
    return {
      compressedBlob: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
      wasCompressed: false,
    };
  }

  // For videos over target size, we'll attempt basic compression
  // by creating a new blob with reduced quality
  try {
    onProgress?.({ stage: 'compressing', progress: 50 });

    // Create a video element to read metadata
    const video = document.createElement('video');
    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Failed to load video'));
      setTimeout(() => reject(new Error('Video load timeout')), 10000);
    });

    // Check if MediaRecorder is available for re-encoding
    if (typeof MediaRecorder === 'undefined') {
      URL.revokeObjectURL(videoUrl);
      throw new Error('MediaRecorder not supported');
    }

    // For now, if video is too large, return it as-is
    // The validation layer will catch this and show appropriate error
    URL.revokeObjectURL(videoUrl);
    
    onProgress?.({ stage: 'complete', progress: 100 });

    return {
      compressedBlob: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
      wasCompressed: false,
    };

  } catch (error) {
    console.error('Video compression error:', error);
    
    // Return original file if compression fails
    return {
      compressedBlob: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
      wasCompressed: false,
    };
  }
};

/**
 * Checks if a video needs compression
 */
export const needsCompression = (file: File): boolean => {
  return file.size > TARGET_SIZE_BYTES;
};

/**
 * Gets compression recommendation message for user
 */
export const getCompressionMessage = (fileSizeMB: number): string => {
  if (fileSizeMB <= TARGET_SIZE_MB) {
    return 'Video size is optimal';
  }
  
  const excessMB = (fileSizeMB - TARGET_SIZE_MB).toFixed(1);
  return `Video is ${excessMB}MB over the limit. Please record a shorter video or reduce quality.`;
};
