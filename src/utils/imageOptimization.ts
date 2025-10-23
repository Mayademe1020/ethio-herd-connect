/**
 * Image Optimization Utilities
 * 
 * Provides utilities for optimizing images for Ethiopian farmers with:
 * - Lazy loading
 * - Responsive images
 * - Low-bandwidth optimization
 * - Progressive loading
 */

import { logger } from './logger';

/**
 * Image quality presets for different network conditions
 */
export const IMAGE_QUALITY = {
  LOW: 0.5,      // For 2G/slow 3G
  MEDIUM: 0.7,   // For 3G
  HIGH: 0.85,    // For 4G/WiFi
  ORIGINAL: 1.0  // For fast connections
} as const;

/**
 * Image size presets for responsive images
 */
export const IMAGE_SIZES = {
  THUMBNAIL: { width: 150, height: 150 },
  SMALL: { width: 320, height: 240 },
  MEDIUM: { width: 640, height: 480 },
  LARGE: { width: 1024, height: 768 },
  XLARGE: { width: 1920, height: 1080 }
} as const;

/**
 * Detect network speed and return appropriate image quality
 */
export const getOptimalImageQuality = (): number => {
  // Check if Network Information API is available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType;
    
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return IMAGE_QUALITY.LOW;
      case '3g':
        return IMAGE_QUALITY.MEDIUM;
      case '4g':
        return IMAGE_QUALITY.HIGH;
      default:
        return IMAGE_QUALITY.MEDIUM; // Default to medium for unknown
    }
  }
  
  // Fallback: check if user has data saver enabled
  if ('connection' in navigator && (navigator as any).connection?.saveData) {
    return IMAGE_QUALITY.LOW;
  }
  
  // Default to medium quality
  return IMAGE_QUALITY.MEDIUM;
};

/**
 * Get optimal image size based on viewport and device pixel ratio
 */
export const getOptimalImageSize = (containerWidth: number): keyof typeof IMAGE_SIZES => {
  const dpr = window.devicePixelRatio || 1;
  const targetWidth = containerWidth * dpr;
  
  if (targetWidth <= 150) return 'THUMBNAIL';
  if (targetWidth <= 320) return 'SMALL';
  if (targetWidth <= 640) return 'MEDIUM';
  if (targetWidth <= 1024) return 'LARGE';
  return 'XLARGE';
};

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (baseUrl: string, sizes: (keyof typeof IMAGE_SIZES)[]): string => {
  return sizes
    .map(size => {
      const { width } = IMAGE_SIZES[size];
      return `${baseUrl}?w=${width} ${width}w`;
    })
    .join(', ');
};

/**
 * Lazy load image with intersection observer
 */
export const lazyLoadImage = (
  img: HTMLImageElement,
  src: string,
  options?: IntersectionObserverInit
): void => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        target.src = src;
        target.classList.add('loaded');
        observer.unobserve(target);
        logger.debug('Image lazy loaded', { src });
      }
    });
  }, options || { rootMargin: '50px' });
  
  observer.observe(img);
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      logger.debug('Image preloaded', { src });
      resolve();
    };
    img.onerror = () => {
      logger.warn('Failed to preload image', { src });
      reject(new Error(`Failed to preload image: ${src}`));
    };
    img.src = src;
  });
};

/**
 * Compress image file before upload
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              logger.info('Image compressed', {
                originalSize: file.size,
                compressedSize: blob.size,
                reduction: `${((1 - blob.size / file.size) * 100).toFixed(1)}%`
              });
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
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
 * Get placeholder image (low quality placeholder)
 */
export const getPlaceholderImage = (width: number, height: number): string => {
  // Generate a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dy=".3em">
        Loading...
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Check if image is cached
 */
export const isImageCached = (src: string): boolean => {
  const img = new Image();
  img.src = src;
  return img.complete;
};

/**
 * Progressive image loading component props
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Detect connection quality
 */
export const detectConnectionQuality = (): string => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection?.effectiveType || 'unknown';
  }
  return 'unknown';
};

/**
 * Get image loading strategy based on device and network
 */
export const getImageLoadingStrategy = (): 'lazy' | 'eager' => {
  // Check if on slow connection
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection?.saveData || connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
      return 'lazy';
    }
  }
  
  // Check if low-end device
  const memory = (performance as any).memory;
  if (memory && memory.jsHeapSizeLimit < 1073741824) { // Less than 1GB
    return 'lazy';
  }
  
  return 'lazy'; // Default to lazy for Ethiopian context
};

/**
 * Calculate optimal image dimensions for container
 */
export const calculateImageDimensions = (
  originalWidth: number,
  originalHeight: number,
  containerWidth: number,
  containerHeight?: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;
  
  if (containerHeight) {
    // Fit within both width and height constraints
    const widthRatio = containerWidth / originalWidth;
    const heightRatio = containerHeight / originalHeight;
    const ratio = Math.min(widthRatio, heightRatio);
    
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  }
  
  // Fit within width constraint only
  return {
    width: containerWidth,
    height: Math.round(containerWidth / aspectRatio)
  };
};
