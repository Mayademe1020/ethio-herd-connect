/**
 * OptimizedImage Component
 * 
 * A React component that provides optimized image loading for Ethiopian farmers:
 * - Lazy loading by default
 * - Responsive images
 * - Progressive loading with placeholder
 * - Network-aware quality adjustment
 * - Low-bandwidth optimization
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  getOptimalImageQuality, 
  getImageLoadingStrategy,
  getPlaceholderImage,
  OptimizedImageProps 
} from '@/utils/imageOptimization';
import { logger } from '@/utils/logger';

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading,
  sizes,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Determine loading strategy
  const loadingStrategy = loading || getImageLoadingStrategy();
  
  // Generate placeholder
  const placeholder = width && height 
    ? getPlaceholderImage(width, height)
    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+';
  
  useEffect(() => {
    // Set initial src to placeholder
    setCurrentSrc(placeholder);
    
    // If eager loading or image is in viewport, load immediately
    if (loadingStrategy === 'eager') {
      setCurrentSrc(src);
    } else {
      // Use Intersection Observer for lazy loading
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCurrentSrc(src);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before entering viewport
          threshold: 0.01
        }
      );
      
      if (imgRef.current) {
        observer.observe(imgRef.current);
      }
      
      return () => {
        observer.disconnect();
      };
    }
  }, [src, loadingStrategy, placeholder]);
  
  const handleLoad = () => {
    setIsLoaded(true);
    logger.debug('Image loaded successfully', { src });
    onLoad?.();
  };
  
  const handleError = () => {
    setHasError(true);
    logger.warn('Image failed to load', { src });
    onError?.();
  };
  
  // Error state
  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
      >
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }
  
  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loadingStrategy}
      sizes={sizes}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      decoding="async"
    />
  );
};

/**
 * OptimizedBackgroundImage Component
 * For background images with lazy loading
 */
interface OptimizedBackgroundImageProps {
  src: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const OptimizedBackgroundImage: React.FC<OptimizedBackgroundImageProps> = ({
  src,
  children,
  className = '',
  style = {}
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>('none');
  const divRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Preload image
            const img = new Image();
            img.onload = () => {
              setBackgroundImage(`url(${src})`);
              setIsLoaded(true);
            };
            img.src = src;
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );
    
    if (divRef.current) {
      observer.observe(divRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [src]);
  
  return (
    <div
      ref={divRef}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{
        ...style,
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {children}
    </div>
  );
};
