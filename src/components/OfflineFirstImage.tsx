// OfflineFirstImage.tsx - Robust image component for slow/offline networks
// Simple approach: Native lazy loading + Service Worker cache + error fallback

import { useState, useEffect, useRef } from 'react';

interface OfflineFirstImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: string;
  onLoad?: () => void;
}

// Check if we're online
const isOnline = (): boolean => navigator.onLine;

export const OfflineFirstImage = ({
  src,
  alt,
  className = '',
  fallbackIcon = '🐄',
  onLoad
}: OfflineFirstImageProps) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [displaySrc, setDisplaySrc] = useState<string>('');
  const [wasOnline, setWasOnline] = useState(true);

  useEffect(() => {
    // Track online/offline status
    const handleOnline = () => setWasOnline(true);
    const handleOffline = () => setWasOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setWasOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setStatus('loading');
    
    if (!src) {
      setStatus('error');
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      setDisplaySrc(src);
      setStatus('loaded');
      onLoad?.();
    };
    
    img.onerror = () => {
      // Try localStorage cache as fallback for offline
      const cached = localStorage.getItem(`img_cache_${btoa(src).slice(0, 50)}`);
      if (cached) {
        setDisplaySrc(cached);
        setStatus('loaded');
      } else {
        setStatus('error');
      }
    };
    
    // Use the original URL - Service Worker will handle caching
    // Browser's lazy loading handles the rest
    img.src = src;
    img.loading = 'lazy'; // Native lazy loading - works offline once cached!

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad]);

  // Loading state - show placeholder
  if (status === 'loading') {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 animate-pulse ${className}`}>
        <span className="text-2xl opacity-50">⏳</span>
      </div>
    );
  }

  // Error state - show fallback icon
  if (status === 'error' || !displaySrc) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 ${className}`}>
        <div className="text-center">
          <span className="text-4xl block">{fallbackIcon}</span>
          {!wasOnline && (
            <span className="text-xs text-gray-400 block mt-1">Offline</span>
          )}
        </div>
      </div>
    );
  }

  // Loaded - show image
  return (
    <img
      src={displaySrc}
      alt={alt}
      className={`${className} transition-opacity duration-200`}
      loading="lazy"
      decoding="async"
      style={{ opacity: status === 'loaded' ? 1 : 0 }}
    />
  );
};

// Preloader component - call this when user is online to prefetch images
export const prefetchImages = (urls: string[]): void => {
  if (!navigator.onLine) return;
  
  urls.forEach(url => {
    if (!url) return;
    
    // Let browser cache it natively
    const img = new Image();
    img.src = url;
    
    // Also cache in localStorage for offline fallback
    fetch(url, { mode: 'cors' })
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            localStorage.setItem(
              `img_cache_${btoa(url).slice(0, 50)}`,
              reader.result as string
            );
          } catch (e) {
            // Storage full or unavailable
          }
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {});
  });
};

// Hook to prefetch images in view - simple and robust
export const useImagePrefetcher = (imageUrls: string[]) => {
  const prefetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Only prefetch when online
    if (!navigator.onLine) return;
    
    // Prefetch images that haven't been cached yet
    const urlsToPrefetch = imageUrls.filter(url => 
      url && !prefetchedRef.current.has(url)
    );
    
    urlsToPrefetch.forEach(url => {
      prefetchedRef.current.add(url);
      prefetchImages([url]);
    });
  }, [imageUrls.join(',')]); // Re-run when URLs change
};