// src/utils/imageCompression.ts - Image compression utilities

/**
 * Compress an image file to target size
 * @param file - The image file to compress
 * @param maxSizeKB - Maximum size in KB (default: 500KB)
 * @param maxWidth - Maximum width in pixels (default: 1200)
 * @param maxHeight - Maximum height in pixels (default: 1200)
 * @returns Compressed image as Blob
 */
export async function compressImage(
  file: File,
  maxSizeKB: number = 500,
  maxWidth: number = 1200,
  maxHeight: number = 1200
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels to meet size target
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              const sizeKB = blob.size / 1024;
              
              // If size is acceptable or quality is too low, return
              if (sizeKB <= maxSizeKB || quality <= 0.5) {
                resolve(blob);
              } else {
                // Try again with lower quality
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        tryCompress();
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Convert image to WebP format if supported
 * @param file - The image file to convert
 * @param quality - Quality (0-1, default: 0.9)
 * @returns Converted image as Blob
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.9
): Promise<Blob> {
  if (!supportsWebP()) {
    // Fallback to JPEG compression
    return compressImage(file);
  }
  
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
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Get optimized image format based on browser support
 */
export function getOptimalImageFormat(): 'webp' | 'jpeg' {
  return supportsWebP() ? 'webp' : 'jpeg';
}
