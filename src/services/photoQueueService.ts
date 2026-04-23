// src/services/photoQueueService.ts
// Handles photo uploads with offline support

import { supabase } from '@/integrations/supabase/client';
import { offlineQueue } from '@/lib/offlineQueue';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Photo queue item
export interface PhotoQueueItem {
  id: string;
  animal_id: string;
  user_id: string;
  photo_base64: string;
  file_name: string;
  content_type: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  retry_count: number;
  created_at: string;
  uploaded_at?: string;
  error?: string;
  storage_url?: string;
}

// IndexedDB schema for photos
interface PhotoQueueDB extends DBSchema {
  photos: {
    key: string;
    value: PhotoQueueItem;
    indexes: { 'by-status': string; 'by-animal': string };
  };
}

const DB_NAME = 'ethio-herd-photo-queue';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

// Retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAYS = [2000, 5000, 10000, 20000, 30000]; // 2s, 5s, 10s, 20s, 30s

class PhotoQueueService {
  private db: IDBPDatabase<PhotoQueueDB> | null = null;
  private isProcessing = false;
  private listeners: Set<() => void> = new Set();

  async init() {
    if (this.db) return;

    this.db = await openDB<PhotoQueueDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-status', 'status');
          store.createIndex('by-animal', 'animal_id');
        }
      },
    });
  }

  // Add photo to queue
  async queuePhoto(
    animalId: string,
    userId: string,
    base64Data: string,
    fileName: string = 'animal-photo.jpg'
  ): Promise<string> {
    await this.init();

    const item: PhotoQueueItem = {
      id: `photo_${animalId}_${Date.now()}`,
      animal_id: animalId,
      user_id: userId,
      photo_base64: base64Data,
      file_name: fileName,
      content_type: 'image/jpeg',
      status: 'pending',
      retry_count: 0,
      created_at: new Date().toISOString(),
    };

    await this.db!.add(STORE_NAME, item);
    this.notifyListeners();

    // Try to upload immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return item.id;
  }

  // Upload photo immediately or queue for later
  async uploadPhoto(
    animalId: string,
    userId: string,
    file: File | Blob,
    fileName?: string
  ): Promise<{ url: string | null; queued: boolean; queueId?: string }> {
    // Convert file to base64 for storage
    const base64 = await this.fileToBase64(file);
    const actualFileName = fileName || `animal-${animalId}-${Date.now()}.jpg`;

    if (navigator.onLine) {
      // Try immediate upload
      try {
        const url = await this.uploadToStorage(userId, animalId, file, actualFileName);
        return { url, queued: false };
      } catch (error) {
        console.warn('Immediate upload failed, queuing:', error);
        // Fall back to queue
        const queueId = await this.queuePhoto(animalId, userId, base64, actualFileName);
        return { url: null, queued: true, queueId };
      }
    } else {
      // Offline - queue it
      const queueId = await this.queuePhoto(animalId, userId, base64, actualFileName);
      return { url: null, queued: true, queueId };
    }
  }

  // Convert file to base64
  private fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix if present
        const base64Data = base64.split(',')[1] || base64;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Convert base64 to Blob
  private base64ToBlob(base64: string, contentType: string = 'image/jpeg'): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  // Upload to Supabase Storage
  private async uploadToStorage(
    userId: string,
    animalId: string,
    file: File | Blob,
    fileName: string
  ): Promise<string> {
    const filePath = `${userId}/${animalId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('animal-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('animal-photos')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  // Process photo queue
  async processQueue(): Promise<{ uploaded: number; failed: number; total: number }> {
    if (this.isProcessing || !navigator.onLine) {
      return { uploaded: 0, failed: 0, total: 0 };
    }

    this.isProcessing = true;
    this.notifyListeners();

    let uploaded = 0;
    let failed = 0;
    let total = 0;

    try {
      await this.init();
      const pendingPhotos = await this.getPendingPhotos();
      total = pendingPhotos.length;

      for (const photo of pendingPhotos) {
        try {
          // Mark as uploading
          await this.updatePhoto(photo.id, {
            status: 'uploading',
          });

          // Convert base64 to blob and upload
          const blob = this.base64ToBlob(photo.photo_base64, photo.content_type);
          const url = await this.uploadToStorage(
            photo.user_id,
            photo.animal_id,
            blob,
            photo.file_name
          );

          // Update animal record with photo URL
          await this.updateAnimalPhotoUrl(photo.animal_id, url);

          // Mark as completed
          await this.updatePhoto(photo.id, {
            status: 'completed',
            uploaded_at: new Date().toISOString(),
            storage_url: url,
          });

          // Clear base64 data to free up storage
          await this.clearPhotoData(photo.id);

          uploaded++;
        } catch (error) {
          const newRetryCount = photo.retry_count + 1;

          if (newRetryCount >= MAX_RETRIES) {
            await this.updatePhoto(photo.id, {
              status: 'failed',
              retry_count: newRetryCount,
              error: error instanceof Error ? error.message : 'Upload failed',
            });
            failed++;
          } else {
            await this.updatePhoto(photo.id, {
              status: 'pending',
              retry_count: newRetryCount,
              error: error instanceof Error ? error.message : 'Upload failed',
            });

            // Wait before retry
            const delay = RETRY_DELAYS[newRetryCount - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    } finally {
      this.isProcessing = false;
      this.notifyListeners();
    }

    return { uploaded, failed, total };
  }

  // Update animal record with photo URL
  private async updateAnimalPhotoUrl(animalId: string, photoUrl: string) {
    const { error } = await supabase
      .from('animals')
      .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
      .eq('id', animalId);

    if (error) throw error;
  }

  // Get pending photos
  private async getPendingPhotos(): Promise<PhotoQueueItem[]> {
    await this.init();
    const tx = this.db!.transaction(STORE_NAME, 'readonly');
    const index = tx.store.index('by-status');
    return await index.getAll('pending');
  }

  // Update photo item
  private async updatePhoto(id: string, updates: Partial<PhotoQueueItem>) {
    await this.init();
    const photo = await this.db!.get(STORE_NAME, id);
    if (photo) {
      await this.db!.put(STORE_NAME, { ...photo, ...updates });
      this.notifyListeners();
    }
  }

  // Clear photo base64 data to save storage
  private async clearPhotoData(id: string) {
    await this.init();
    const photo = await this.db!.get(STORE_NAME, id);
    if (photo && photo.status === 'completed') {
      await this.db!.put(STORE_NAME, { 
        ...photo, 
        photo_base64: '', // Clear the data
      });
    }
  }

  // Get photo by ID
  async getPhoto(id: string): Promise<PhotoQueueItem | undefined> {
    await this.init();
    return await this.db!.get(STORE_NAME, id);
  }

  // Get photos for animal
  async getPhotosForAnimal(animalId: string): Promise<PhotoQueueItem[]> {
    await this.init();
    const tx = this.db!.transaction(STORE_NAME, 'readonly');
    const index = tx.store.index('by-animal');
    return await index.getAll(animalId);
  }

  // Get queue stats
  async getStats(): Promise<{
    pending: number;
    uploading: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    await this.init();
    const all = await this.db!.getAll(STORE_NAME);
    return {
      pending: all.filter(p => p.status === 'pending').length,
      uploading: all.filter(p => p.status === 'uploading').length,
      completed: all.filter(p => p.status === 'completed').length,
      failed: all.filter(p => p.status === 'failed').length,
      total: all.length,
    };
  }

  // Retry failed photos
  async retryFailed(): Promise<void> {
    await this.init();
    const tx = this.db!.transaction(STORE_NAME, 'readwrite');
    const index = tx.store.index('by-status');
    const failed = await index.getAll('failed');

    for (const photo of failed) {
      await tx.store.put({
        ...photo,
        status: 'pending',
        retry_count: 0,
        error: undefined,
      });
    }

    await tx.done;
    this.notifyListeners();

    if (navigator.onLine) {
      this.processQueue();
    }
  }

  // Clear completed photos older than 7 days
  async cleanup(): Promise<number> {
    await this.init();
    const tx = this.db!.transaction(STORE_NAME, 'readwrite');
    const index = tx.store.index('by-status');
    const completed = await index.getAll('completed');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let cleared = 0;
    for (const photo of completed) {
      if (photo.uploaded_at && new Date(photo.uploaded_at) < sevenDaysAgo) {
        await tx.store.delete(photo.id);
        cleared++;
      }
    }

    await tx.done;
    this.notifyListeners();
    return cleared;
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Check if processing
  isProcessingQueue(): boolean {
    return this.isProcessing;
  }
}

// Singleton instance
export const photoQueueService = new PhotoQueueService();

// Initialize on module load
photoQueueService.init();

// Auto-process when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setTimeout(() => photoQueueService.processQueue(), 1000);
  });
}

// Periodic cleanup (every 24 hours)
if (typeof window !== 'undefined') {
  setInterval(() => {
    photoQueueService.cleanup();
  }, 24 * 60 * 60 * 1000);
}
