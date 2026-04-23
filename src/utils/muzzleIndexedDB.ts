/**
 * IndexedDB storage for offline muzzle identification
 * Handles caching of ML models and local muzzle embeddings
 * Optimized for Ethiopian farmers with limited connectivity and biometric data security
 */

import { logger } from './logger';

// Encryption utilities for biometric data
const ENCRYPTION_KEY_STORAGE_KEY = 'muzzle_encryption_key';

const getEncryptionKey = async (): Promise<CryptoKey> => {
  try {
    const storedKeyData = await getMuzzleMetadata(ENCRYPTION_KEY_STORAGE_KEY);
    if (storedKeyData) {
      return await crypto.subtle.importKey(
        'raw',
        new Uint8Array(storedKeyData),
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    }

    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const exportedKey = await crypto.subtle.exportKey('raw', key);
    await setMuzzleMetadata(ENCRYPTION_KEY_STORAGE_KEY, Array.from(new Uint8Array(exportedKey)));

    return key;
  } catch (error) {
    logger.error('Error getting encryption key', error);
    throw new Error('Failed to initialize encryption for biometric data');
  }
};

const encryptBiometricData = async (data: Float32Array): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> => {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data.buffer as ArrayBuffer
  );

  return { encrypted, iv };
};

const decryptBiometricData = async (encrypted: ArrayBuffer, iv: Uint8Array): Promise<Float32Array> => {
  const key = await getEncryptionKey();

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    encrypted
  );

  return new Float32Array(decrypted);
};

// Database configuration
const DB_NAME = 'ethio-herd-muzzle-offline';
const DB_VERSION = 2; // Bumped: removed operations_queue store

export const MUZZLE_STORES = {
  ML_MODELS: 'ml_models',
  MUZZLE_EMBEDDINGS: 'muzzle_embeddings',
  METADATA: 'muzzle_metadata'
} as const;

export type MuzzleStoreName = typeof MUZZLE_STORES[keyof typeof MUZZLE_STORES];

export interface CachedMLModel {
  id: string;
  modelData: ArrayBuffer | Blob;
  modelType: 'feature_extractor' | 'similarity_model';
  version: string;
  size: number;
  timestamp: number;
  checksum?: string;
}

export interface MuzzleEmbedding {
  id: string;
  animalId: string;
  embedding: Float32Array;
  encrypted: boolean;
  quality: number;
  timestamp: number;
  userId: string;
  synced: boolean;
}

export interface MuzzleMetadata {
  key: string;
  value: any;
  timestamp: number;
}

/**
 * Initialize muzzle IndexedDB
 */
export const initMuzzleDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      logger.error('Failed to open muzzle IndexedDB', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // ML Models store
      if (!db.objectStoreNames.contains(MUZZLE_STORES.ML_MODELS)) {
        const modelStore = db.createObjectStore(MUZZLE_STORES.ML_MODELS, { keyPath: 'id' });
        modelStore.createIndex('modelType', 'modelType', { unique: false });
        modelStore.createIndex('version', 'version', { unique: false });
      }

      // Muzzle embeddings store
      if (!db.objectStoreNames.contains(MUZZLE_STORES.MUZZLE_EMBEDDINGS)) {
        const embeddingStore = db.createObjectStore(MUZZLE_STORES.MUZZLE_EMBEDDINGS, { keyPath: 'id' });
        embeddingStore.createIndex('animalId', 'animalId', { unique: false });
        embeddingStore.createIndex('userId', 'userId', { unique: false });
        embeddingStore.createIndex('timestamp', 'timestamp', { unique: false });
        embeddingStore.createIndex('synced', 'synced', { unique: false });
      }

      // Metadata store
      if (!db.objectStoreNames.contains(MUZZLE_STORES.METADATA)) {
        db.createObjectStore(MUZZLE_STORES.METADATA, { keyPath: 'key' });
      }

      // Delete old operations queue store if upgrading from v1
      if (db.objectStoreNames.contains('muzzle_operations_queue')) {
        db.deleteObjectStore('muzzle_operations_queue');
      }
    };
  });
};

/**
 * Cache ML model data for offline use
 */
export const cacheMLModel = async (
  modelId: string,
  modelData: ArrayBuffer | Blob,
  modelType: 'feature_extractor' | 'similarity_model',
  version: string,
  checksum?: string
): Promise<void> => {
  try {
    const db = await initMuzzleDB();
    const transaction = db.transaction([MUZZLE_STORES.ML_MODELS], 'readwrite');
    const store = transaction.objectStore(MUZZLE_STORES.ML_MODELS);

    store.put({
      id: modelId,
      modelData,
      modelType,
      version,
      size: modelData instanceof Blob ? modelData.size : modelData.byteLength,
      timestamp: Date.now(),
      checksum
    } as CachedMLModel);

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    db.close();
  } catch (error) {
    logger.error('Error caching ML model', error);
    throw error;
  }
};

/**
 * Retrieve cached ML model
 */
export const getCachedMLModel = async (modelId: string): Promise<CachedMLModel | null> => {
  try {
    const db = await initMuzzleDB();
    const transaction = db.transaction([MUZZLE_STORES.ML_MODELS], 'readonly');
    const store = transaction.objectStore(MUZZLE_STORES.ML_MODELS);

    const request = store.get(modelId);

    const result = await new Promise<CachedMLModel | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();
    return result || null;
  } catch (error) {
    logger.error('Error getting cached ML model', error);
    return null;
  }
};

/**
 * Store muzzle embedding for offline identification
 */
export const storeMuzzleEmbedding = async (
  animalId: string,
  embedding: Float32Array,
  quality: number,
  userId: string,
  encrypt: boolean = true
): Promise<string> => {
  try {
    const db = await initMuzzleDB();
    const transaction = db.transaction([MUZZLE_STORES.MUZZLE_EMBEDDINGS], 'readwrite');
    const store = transaction.objectStore(MUZZLE_STORES.MUZZLE_EMBEDDINGS);

    const embeddingId = `${animalId}_${Date.now()}`;

    let storedEmbedding = embedding;
    let isEncrypted = false;

    if (encrypt) {
      try {
        const { encrypted, iv } = await encryptBiometricData(embedding);
        storedEmbedding = new Float32Array(encrypted);
        await setMuzzleMetadata(`${embeddingId}_iv`, Array.from(iv));
        isEncrypted = true;
      } catch (encryptError) {
        logger.error('Failed to encrypt embedding, storing unencrypted', encryptError);
      }
    }

    store.put({
      id: embeddingId,
      animalId,
      embedding: storedEmbedding,
      encrypted: isEncrypted,
      quality,
      timestamp: Date.now(),
      userId,
      synced: false
    } as MuzzleEmbedding);

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    db.close();
    return embeddingId;
  } catch (error) {
    logger.error('Error storing muzzle embedding', error);
    throw error;
  }
};

/**
 * Get muzzle embedding for a specific animal
 */
export const getMuzzleEmbedding = async (
  animalId: string,
  userId: string
): Promise<MuzzleEmbedding | null> => {
  try {
    const db = await initMuzzleDB();
    const transaction = db.transaction([MUZZLE_STORES.MUZZLE_EMBEDDINGS], 'readonly');
    const store = transaction.objectStore(MUZZLE_STORES.MUZZLE_EMBEDDINGS);
    const index = store.index('animalId');

    const request = index.getAll(animalId);

    const embeddings = await new Promise<MuzzleEmbedding[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    const userEmbeddings = embeddings.filter(e => e.userId === userId);
    if (userEmbeddings.length === 0) return null;

    const latestEmbedding = userEmbeddings.sort((a, b) => b.timestamp - a.timestamp)[0];

    if (latestEmbedding.encrypted) {
      try {
        const ivData = await getMuzzleMetadata(`${latestEmbedding.id}_iv`);
        if (!ivData) return null;
        const iv = new Uint8Array(ivData);
        latestEmbedding.embedding = await decryptBiometricData(latestEmbedding.embedding.buffer as ArrayBuffer, iv);
        latestEmbedding.encrypted = false;
      } catch (decryptError) {
        logger.error('Failed to decrypt embedding', decryptError);
        return null;
      }
    }

    return latestEmbedding;
  } catch (error) {
    logger.error('Error getting muzzle embedding', error);
    return null;
  }
};

/**
 * Get all muzzle embeddings for offline identification
 */
export const getAllMuzzleEmbeddings = async (userId: string): Promise<MuzzleEmbedding[]> => {
  try {
    const db = await initMuzzleDB();
    const transaction = db.transaction([MUZZLE_STORES.MUZZLE_EMBEDDINGS], 'readonly');
    const store = transaction.objectStore(MUZZLE_STORES.MUZZLE_EMBEDDINGS);
    const index = store.index('userId');

    const request = index.getAll(userId);

    const embeddings = await new Promise<MuzzleEmbedding[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    const decryptedEmbeddings = await Promise.all(
      embeddings.map(async (embedding) => {
        if (embedding.encrypted) {
          try {
            const ivData = await getMuzzleMetadata(`${embedding.id}_iv`);
            if (!ivData) return null;
            const iv = new Uint8Array(ivData);
            const decrypted = await decryptBiometricData(embedding.embedding.buffer as ArrayBuffer, iv);
            return { ...embedding, embedding: decrypted, encrypted: false };
          } catch (decryptError) {
            return null;
          }
        }
        return embedding;
      })
    );

    return decryptedEmbeddings.filter((e): e is MuzzleEmbedding => e !== null);
  } catch (error) {
    logger.error('Error getting all muzzle embeddings', error);
    return [];
  }
};

/**
 * Get muzzle metadata
 */
export const getMuzzleMetadata = async (key: string): Promise<any> => {
  try {
    const db = await initMuzzleDB();
    const transaction = db.transaction([MUZZLE_STORES.METADATA], 'readonly');
    const store = transaction.objectStore(MUZZLE_STORES.METADATA);

    const request = store.get(key);

    const result = await new Promise<any>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });

    db.close();
    return result;
  } catch (error) {
    logger.error('Error getting muzzle metadata', error);
    return null;
  }
};

/**
 * Set muzzle metadata
 */
export const setMuzzleMetadata = async (key: string, value: any): Promise<void> => {
  try {
    const db = await initMuzzleDB();
    const transaction = db.transaction([MUZZLE_STORES.METADATA], 'readwrite');
    const store = transaction.objectStore(MUZZLE_STORES.METADATA);

    store.put({ key, value, timestamp: Date.now() } as MuzzleMetadata);

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    db.close();
  } catch (error) {
    logger.error('Error setting muzzle metadata', error);
    throw error;
  }
};

/**
 * Clear all muzzle offline data (for logout or reset)
 */
export const clearAllMuzzleData = async (): Promise<void> => {
  try {
    const db = await initMuzzleDB();
    const storeNames = [
      MUZZLE_STORES.ML_MODELS,
      MUZZLE_STORES.MUZZLE_EMBEDDINGS,
      MUZZLE_STORES.METADATA
    ];

    const transaction = db.transaction(storeNames, 'readwrite');

    for (const storeName of storeNames) {
      transaction.objectStore(storeName).clear();
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        logger.info('Cleared all muzzle offline data including encryption keys');
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });

    db.close();
  } catch (error) {
    logger.error('Error clearing muzzle offline data', error);
    throw error;
  }
};

/**
 * Get muzzle database statistics
 */
export const getMuzzleDBStats = async (): Promise<{
  modelsCount: number;
  embeddingsCount: number;
  totalSize: number;
}> => {
  try {
    const db = await initMuzzleDB();

    let modelsCount = 0;
    let embeddingsCount = 0;

    const modelTx = db.transaction([MUZZLE_STORES.ML_MODELS], 'readonly');
    const modelReq = modelTx.objectStore(MUZZLE_STORES.ML_MODELS).count();
    modelReq.onsuccess = () => { modelsCount = modelReq.result; };

    const embTx = db.transaction([MUZZLE_STORES.MUZZLE_EMBEDDINGS], 'readonly');
    const embReq = embTx.objectStore(MUZZLE_STORES.MUZZLE_EMBEDDINGS).count();
    embReq.onsuccess = () => { embeddingsCount = embReq.result; };

    await Promise.all([
      new Promise(resolve => modelTx.oncomplete = resolve),
      new Promise(resolve => embTx.oncomplete = resolve)
    ]);

    db.close();

    return { modelsCount, embeddingsCount, totalSize: 0 };
  } catch (error) {
    logger.error('Error getting muzzle DB stats', error);
    return { modelsCount: 0, embeddingsCount: 0, totalSize: 0 };
  }
};
