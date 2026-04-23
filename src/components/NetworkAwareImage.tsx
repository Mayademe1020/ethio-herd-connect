// src/components/NetworkAwareImage.tsx - Network-aware image component optimized for low bandwidth

import { useState, useEffect, memo } from 'react';

interface NetworkAwareImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: string;
  lowQualitySrc?: string;
  onLoad?: () => void;
}

// Get network connection info
const getNetworkInfo = (): { effectiveType: string; saveData: boolean } | null => {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  if (!connection) return null;

  return {
    effectiveType: connection.effectiveType || '4g',
    saveData: connection.saveData || false
  };
};

export const NetworkAwareImage = memo(({
  src,
  alt,
  className = '',
  fallbackIcon,
  lowQualitySrc,
  onLoad
}: NetworkAwareImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [isHighQuality, setIsHighQuality] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(null);
    setIsHighQuality(false);

    const networkInfo = getNetworkInfo();
    const shouldUseLowQuality = 
      networkInfo?.effectiveType === '2g' || 
      networkInfo?.effectiveType === '3g' ||
      networkInfo?.saveData === true;

    const imageSrc = (shouldUseLowQuality && lowQualitySrc) ? lowQualitySrc : src;

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(imageSrc);
      setIsLoading(false);
      setIsHighQuality(!shouldUseLowQuality);
      onLoad?.();
    };
    
    img.onerror = () => {
      // Try fallback to regular src if low quality failed
      if (imageSrc !== src) {
        img.src = src;
      } else {
        setHasError(true);
        setIsLoading(false);
      }
    };
    
    img.src = imageSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, lowQualitySrc, onLoad]);

  // Show fallback icon if error or no src
  if (hasError || !src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <span className="text-5xl">{fallbackIcon || '🐄'}</span>
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
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          decoding="async"
          width="400"
          height="300"
        />
      )}

      {/* Low quality indicator - hidden for farmers, debug only in development */}
      {import.meta.env.DEV && !isHighQuality && currentSrc && (
        <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
         LQ
        </div>
      )}
    </div>
  );
});

NetworkAwareImage.displayName = 'NetworkAwareImage';
