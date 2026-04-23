import { useState, useCallback } from 'react';
import { convertToWebP, supportsWebP } from '@/utils/webpOptimization';

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

interface UseImageCompression {
  compressImage: (file: File, options?: CompressionOptions) => Promise<File>;
  isCompressing: boolean;
  error: string | null;
  clearError: () => void;
}

export function useImageCompression(): UseImageCompression {
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compressImage = useCallback(async (
    file: File,
    options: CompressionOptions = {}
  ): Promise<File> => {
    const { maxWidth = 1200, maxHeight = 1200, quality = 0.85 } = options;
    
    setIsCompressing(true);
    setError(null);

    try {
      // Check if WebP is supported
      const webpSupported = supportsWebP();
      
      // If file is already small (< 500KB), skip compression
      if (file.size < 500 * 1024) {
        return file;
      }

      let processedFile: File = file;

      // Resize if needed
      if (maxWidth || maxHeight) {
        processedFile = await resizeImage(file, maxWidth, maxHeight);
      }

      // Convert to WebP if supported
      if (webpSupported) {
        const webpBlob = await convertToWebP(processedFile, quality);
        processedFile = new File([webpBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
          type: 'image/webp'
        });
      }

      // If still too large, reduce quality
      if (processedFile.size > 500 * 1024 && quality > 0.5) {
        const reducedBlob = await convertToWebP(processedFile, quality - 0.2);
        processedFile = new File([reducedBlob], processedFile.name, {
          type: 'image/webp'
        });
      }

      return processedFile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Compression failed';
      setError(errorMessage);
      // Return original file if compression fails
      return file;
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    compressImage,
    isCompressing,
    error,
    clearError
  };
}

async function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          } else {
            reject(new Error('Failed to resize image'));
          }
        }, file.type, 0.9);
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export default useImageCompression;
