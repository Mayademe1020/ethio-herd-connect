/**
 * WebP Image Conversion and Optimization
 * 
 * Provides WebP conversion utilities for better compression and performance
 * WebP typically provides 25-35% smaller file sizes than JPEG
 */

import { logger } from './logger';

/**
 * Check if browser supports WebP
 */
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

/**
 * Convert image to WebP format
 */
export const convertToWebP = async (
  file: File,
  quality: number = 0.85
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert to WebP'));
              return;
            }
            resolve(blob);
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Create responsive image srcset with WebP support
 */
export const createResponsiveImageSrc = (
  baseUrl: string,
  widths: number[] = [320, 640, 1024, 1920]
): { srcset: string; srcsetWebP: string | null } => {
  const srcset = widths
    .map(w => `${baseUrl}?w=${w} ${w}w`)
    .join(', ');

  const webpUrl = baseUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const srcsetWebP = supportsWebP() 
    ? widths.map(w => `${webpUrl}?w=${w} ${w}w`).join(', ')
    : null;

  return { srcset, srcsetWebP };
};

/**
 * Generate low quality placeholder (LQIP) URL
 */
export const generateLQIPUrl = (originalUrl: string): string => {
  return `${originalUrl}?w=20&blur=10`;
};

/**
 * Batch convert images to WebP
 */
export const batchConvertToWebP = async (
  files: File[],
  quality: number = 0.85,
  onProgress?: (completed: number, total: number) => void
): Promise<{ original: File; webp: Blob; savedBytes: number }[]> => {
  const results: { original: File; webp: Blob; savedBytes: number }[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const webpBlob = await convertToWebP(file, quality);
      const savedBytes = file.size - webpBlob.size;
      
      results.push({
        original: file,
        webp: webpBlob,
        savedBytes
      });
      
      logger.info(`Converted ${file.name} to WebP`, {
        originalSize: file.size,
        webpSize: webpBlob.size,
        savings: `${((savedBytes / file.size) * 100).toFixed(1)}%`
      });
      
      onProgress?.(i + 1, files.length);
    } catch (error) {
      logger.error(`Failed to convert ${file.name} to WebP`, error);
    }
  }
  
  return results;
};

/**
 * Get optimal image format based on browser support
 */
export const getOptimalImageFormat = (
  originalFormat: string
): 'webp' | 'jpeg' | 'png' => {
  if (supportsWebP()) {
    return 'webp';
  }
  
  if (originalFormat === 'image/png' || originalFormat.includes('png')) {
    return 'png';
  }
  
  return 'jpeg';
};

export default {
  supportsWebP,
  convertToWebP,
  createResponsiveImageSrc,
  generateLQIPUrl,
  batchConvertToWebP,
  getOptimalImageFormat
};
