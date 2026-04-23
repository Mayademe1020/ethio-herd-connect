// Image Cache for Offline Support
// Caches images in IndexedDB for offline viewing

import React from 'react';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ImageCacheDB extends DBSchema {
  images: {
    key: string;
    value: {
      url: string;
      blob: Blob;
      timestamp: number;
      size: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

const DB_NAME = 'ethio-herd-image-cache';
const DB_VERSION = 1;
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB max
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

class ImageCacheManager {
  private db: IDBPDatabase<ImageCacheDB> | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      this.db = await openDB<ImageCacheDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('images')) {
            const store = db.createObjectStore('images', { keyPath: 'url' });
            store.createIndex('by-timestamp', 'timestamp');
          }
        },
      });
    })();

    return this.initPromise;
  }

  // Cache an image from URL
  async cacheImage(url: string, forceRefresh = false): Promise<string | null> {
    await this.init();
    if (!url || !url.startsWith('http')) return url;

    // Check if already cached
    if (!forceRefresh) {
      const cached = await this.getCachedImage(url);
      if (cached) return URL.createObjectURL(cached);
    }

    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) return url;

      const blob = await response.blob();
      
      // Check cache size and cleanup if needed
      await this.ensureSpace(blob.size);

      // Store in IndexedDB
      await this.db!.put('images', {
        url,
        blob,
        timestamp: Date.now(),
        size: blob.size,
      });

      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn('ImageCache: Failed to cache image:', url, error);
      return url;
    }
  }

  // Get cached image blob
  async getCachedImage(url: string): Promise<Blob | null> {
    await this.init();
    try {
      const cached = await this.db!.get('images', url);
      if (!cached) return null;

      // Check if expired
      if (Date.now() - cached.timestamp > DEFAULT_TTL) {
        await this.db!.delete('images', url);
        return null;
      }

      // Update timestamp (LRU)
      await this.db!.put('images', {
        ...cached,
        timestamp: Date.now(),
      });

      return cached.blob;
    } catch {
      return null;
    }
  }

  // Check if image is cached and return object URL
  async getCachedImageUrl(url: string): Promise<string | null> {
    const blob = await this.getCachedImage(url);
    if (blob) {
      return URL.createObjectURL(blob);
    }
    return null;
  }

  // Preload multiple images
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls
      .filter(url => url && url.startsWith('http'))
      .map(url => this.cacheImage(url).catch(() => null));
    
    await Promise.all(promises);
  }

  // Get cache statistics
  async getCacheStats(): Promise<{ count: number; totalSize: number }> {
    await this.init();
    const items = await this.db!.getAll('images');
    return {
      count: items.length,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
    };
  }

  // Clear entire cache
  async clearCache(): Promise<void> {
    await this.init();
    await this.db!.clear('images');
  }

  // Clear expired images
  async clearExpired(): Promise<void> {
    await this.init();
    const ttl = Date.now() - DEFAULT_TTL;
    const tx = this.db!.transaction('images', 'readwrite');
    const index = tx.store.index('by-timestamp');
    
    let cursor = await index.openCursor();
    while (cursor) {
      if (cursor.primaryKey && cursor.value.timestamp < ttl) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
  }

  // Ensure space for new image
  private async ensureSpace(requiredSize: number): Promise<void> {
    const stats = await this.getCacheStats();
    if (stats.totalSize + requiredSize <= MAX_CACHE_SIZE) return;

    // Clear oldest images until we have space
    const tx = this.db!.transaction('images', 'readwrite');
    const index = tx.store.index('by-timestamp');
    
    let cursor = await index.openCursor();
    let freedSpace = 0;
    
    while (stats.totalSize + requiredSize - freedSpace > MAX_CACHE_SIZE && cursor) {
      if (cursor.primaryKey && cursor.value) {
        freedSpace += cursor.value.size;
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
  }
}

// Singleton instance
export const imageCache = new ImageCacheManager();

// Helper hook for React components
export const useImageCache = () => {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    imageCache.init().then(() => setIsReady(true));
  }, []);

  const getImage = useCallback(async (url: string): Promise<string> => {
    const cached = await imageCache.getCachedImageUrl(url);
    return cached || url;
  }, []);

  const cacheImage = useCallback(async (url: string): Promise<string> => {
    return await imageCache.cacheImage(url) || url;
  }, []);

  return { isReady, getImage, cacheImage };
};