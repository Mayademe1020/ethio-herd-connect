// src/components/OptimizedImage.tsx - Optimized image component with lazy loading and blur placeholder

import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: string;
  onLoad?: () => void;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackIcon,
  onLoad 
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true);
    setHasError(false);
    setImageSrc(null);

    // Create image loader
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    
    // Start loading
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad]);

  // Show fallback icon if error or no src
  if (hasError || !src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 ${className}`}>
        <span className="text-6xl">{fallbackIcon || '🐄'}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Blur placeholder while loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}
      
      {/* Actual image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
        />
      )}
    </div>
  );
};
