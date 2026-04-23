/**
 * Muzzle Search Service
 * Handles vector similarity search for muzzle identification
 * Supports local (IndexedDB) and cloud (Supabase pgvector) searches
 */

import { supabase } from '@/integrations/supabase/client';
import { getAllMuzzleEmbeddings } from '@/utils/muzzleIndexedDB';
import {
  type IdentificationResult,
  type AnimalMatch,
  type SearchMode,
  type MuzzleEmbedding,
  type IdentificationStatus,
  MuzzleErrorCode,
  type MuzzleError
} from '@/types/muzzle';
import { logger } from '@/utils/logger';

export interface SearchOptions {
  mode: SearchMode;
  confidenceThreshold: number;
  maxResults: number;
  includeAlternatives: boolean;
  timeoutMs: number;
  userId?: string;
}

export interface VectorSimilarityResult {
  animalId: string;
  similarity: number;
  embedding: Float32Array;
  registrationData: any;
}

export interface LocalSearchResult {
  results: VectorSimilarityResult[];
  searchedCount: number;
  searchTimeMs: number;
}

/**
 * SIMPLE OFFLINE SEARCH RESULT
 * Basic result for offline identification
 */
export interface SimpleSearchResult {
  /** True if a match was found */
  found: boolean;
  /** Best match animal ID */
  animalId?: string;
  /** Similarity score (0-1) */
  confidence: number;
  /** Animal name if found */
  animalName?: string;
  /** Search time in ms */
  searchTimeMs: number;
  /** Whether network was available */
  searchedOnline: boolean;
  /** Message to show user */
  message: string;
}

export interface CloudSearchResult {
  results: VectorSimilarityResult[];
  searchedCount: number;
  searchTimeMs: number;
}

const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  mode: 'hybrid',
  confidenceThreshold: 0.85,
  maxResults: 5,
  includeAlternatives: true,
  timeoutMs: 10000,
};

const SIMILARITY_THRESHOLD_HIGH = 0.9;
const SIMILARITY_THRESHOLD_MEDIUM = 0.8;

export class MuzzleSearchService {
  private _initialized = false;

  /**
   * Initialize the search service
   */
  async initialize(): Promise<void> {
    if (this._initialized) return;
    // In a real implementation, we might warm up connections or check DB status
    this._initialized = true;
  }

  /**
   * Perform muzzle identification search
   */
  async identifyMuzzle(
    embedding: MuzzleEmbedding,
    options: Partial<SearchOptions> = {}
  ): Promise<IdentificationResult> {
    const searchOptions = { ...DEFAULT_SEARCH_OPTIONS, ...options };
    const startTime = performance.now();

    try {
      let localResults: LocalSearchResult | null = null;
      let cloudResults: CloudSearchResult | null = null;
      let searchedLocal = false;
      let searchedCloud = false;

      if (searchOptions.mode === 'local' || searchOptions.mode === 'hybrid') {
        try {
          localResults = await this.searchLocal(embedding, searchOptions);
          searchedLocal = true;
        } catch (localError) {
          logger.warn('Local search failed', localError);
          if (searchOptions.mode === 'local') throw localError;
        }
      }

      if (searchOptions.mode === 'cloud' || searchOptions.mode === 'hybrid') {
        try {
          cloudResults = await this.searchCloud(embedding, searchOptions);
          searchedCloud = true;
        } catch (cloudError) {
          logger.warn('Cloud search failed', cloudError);
          if (searchOptions.mode === 'cloud') throw cloudError;
        }
      }

      const combinedResults = this.combineSearchResults(localResults, cloudResults);
      const processedResult = this.processSearchResults(
        combinedResults,
        searchOptions,
        performance.now() - startTime
      );

      return {
        ...processedResult,
        searchedLocal,
        searchedCloud,
        timestamp: new Date().toISOString(),
        searchDurationMs: performance.now() - startTime,
      };

    } catch (error) {
      logger.error('Muzzle identification failed', error);
      throw this.createError(
        MuzzleErrorCode.SEARCH_TIMEOUT,
        `Identification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Local search using muzzleIndexedDB embeddings
   */
  private async searchLocal(
    queryEmbedding: MuzzleEmbedding,
    options: SearchOptions
  ): Promise<LocalSearchResult> {
    const startTime = performance.now();

    try {
      const storedEmbeddings = await getAllMuzzleEmbeddings(options.userId || '');

      if (!storedEmbeddings || storedEmbeddings.length === 0) {
        return { results: [], searchedCount: 0, searchTimeMs: performance.now() - startTime };
      }

      const queryVector = queryEmbedding.vector;
      if (!queryVector) {
        throw new Error('No embedding vector in query');
      }

      const similarities: VectorSimilarityResult[] = storedEmbeddings
        .map((stored) => ({
          animalId: stored.animalId,
          similarity: this.cosineSimilarity(queryVector, stored.embedding),
          embedding: stored.embedding,
          registrationData: {},
        }))
        .filter(result => result.similarity >= options.confidenceThreshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, options.maxResults);

      return {
        results: similarities,
        searchedCount: storedEmbeddings.length,
        searchTimeMs: performance.now() - startTime,
      };

    } catch (error) {
      logger.error('Local search failed', error);
      throw this.createError(MuzzleErrorCode.OFFLINE_NO_LOCAL_DATA, 'Local search failed');
    }
  }

  /**
   * Cloud search using Supabase pgvector RPC
   */
  private async searchCloud(
    queryEmbedding: MuzzleEmbedding,
    options: SearchOptions
  ): Promise<CloudSearchResult> {
    const startTime = performance.now();

     try {
       const queryVector = queryEmbedding.vector;
       if (!queryVector || queryVector.length === 0) {
         throw new Error('Invalid embedding data');
       }

       const { data, error } = await supabase.rpc('search_similar_muzzles', {
         query_embedding: `[${Array.from(queryVector)}]`,
         similarity_threshold: options.confidenceThreshold,
         max_results: options.maxResults,
       });

      if (error) {
        throw new Error(`pgvector search failed: ${error.message}`);
      }

      // Fetch owner details for each match
      const results: VectorSimilarityResult[] = [];
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((r: any) => r.user_id))];
        const animalIds = [...new Set(data.map((r: any) => r.animal_id))];

        // Fetch farm profiles for owners
        const { data: profiles } = await supabase
          .from('farm_profiles')
          .select('user_id, farm_name, owner_name, location, phone')
          .in('user_id', userIds);

        // Fetch animal details
        const { data: animals } = await supabase
          .from('animals')
          .select('id, name, type, subtype, animal_id')
          .in('id', animalIds);

        const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
        const animalMap = new Map((animals || []).map(a => [a.id, a]));

        for (const row of data) {
          const profile = profileMap.get(row.user_id);
          const animal = animalMap.get(row.animal_id);
          results.push({
            animalId: row.animal_id,
            similarity: parseFloat(row.similarity),
            embedding: new Float32Array(),
            registrationData: {
              registration_id: row.registration_id,
              user_id: row.user_id,
              owner_name: profile?.owner_name,
              farm_name: profile?.farm_name,
              location: profile?.location,
              owner_phone: profile?.phone,
              animal_name: animal?.name,
              animal_type: animal?.type,
              animal_breed: animal?.subtype,
              animal_code: animal?.animal_id,
            },
          });
        }
      }

      return {
        results,
        searchedCount: results.length,
        searchTimeMs: performance.now() - startTime,
      };

    } catch (error) {
      logger.error('Cloud search failed', error);
      throw this.createError(MuzzleErrorCode.SYNC_FAILED, 'Cloud search temporarily unavailable');
    }
  }

  /**
   * Combine local and cloud results, deduplicate by animalId
   */
  private combineSearchResults(
    localResults: LocalSearchResult | null,
    cloudResults: CloudSearchResult | null
  ): VectorSimilarityResult[] {
    const allResults: VectorSimilarityResult[] = [];

    if (localResults?.results) {
      allResults.push(...localResults.results);
    }

    if (cloudResults?.results) {
      cloudResults.results.forEach(cloudResult => {
        const existingIndex = allResults.findIndex(r => r.animalId === cloudResult.animalId);
        if (existingIndex >= 0) {
          if (cloudResult.similarity > allResults[existingIndex].similarity) {
            allResults[existingIndex] = cloudResult;
          }
        } else {
          allResults.push(cloudResult);
        }
      });
    }

    return allResults.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Process results into IdentificationResult
   */
  private processSearchResults(
    results: VectorSimilarityResult[],
    options: SearchOptions,
    searchDurationMs: number
  ): Omit<IdentificationResult, 'searchedLocal' | 'searchedCloud' | 'timestamp' | 'searchDurationMs'> {
    if (results.length === 0) {
      return { status: 'no_match', confidence: 0 };
    }

    const bestMatch = results[0];
    const confidence = bestMatch.similarity;

    let status: IdentificationStatus;
    if (confidence >= SIMILARITY_THRESHOLD_HIGH) {
      status = 'match';
    } else if (confidence >= SIMILARITY_THRESHOLD_MEDIUM) {
      status = 'possible_match';
    } else {
      status = 'no_match';
    }

    const animalMatch: AnimalMatch = {
      animalId: bestMatch.animalId,
      animalCode: bestMatch.registrationData?.animal_code || '',
      name: bestMatch.registrationData?.animal_name || '',
      type: bestMatch.registrationData?.animal_type || '',
      breed: bestMatch.registrationData?.breed,
      ownerId: bestMatch.registrationData?.user_id || '',
      ownerName: bestMatch.registrationData?.owner_name,
      ownerPhone: bestMatch.registrationData?.owner_phone,
      farmName: bestMatch.registrationData?.farm_name,
      location: bestMatch.registrationData?.location,
      similarity: confidence,
      muzzleRegisteredAt: bestMatch.registrationData?.created_at || '',
    };

    const alternatives = options.includeAlternatives && results.length > 1
      ? results.slice(1).map(r => ({
          animalId: r.animalId,
          animalCode: r.registrationData?.animal_code || '',
          name: r.registrationData?.animal_name || '',
          type: r.registrationData?.animal_type || '',
          breed: r.registrationData?.breed,
          ownerId: r.registrationData?.user_id || '',
          ownerName: r.registrationData?.owner_name,
          ownerPhone: r.registrationData?.owner_phone,
          farmName: r.registrationData?.farm_name,
          location: r.registrationData?.location,
          similarity: r.similarity,
          muzzleRegisteredAt: r.registrationData?.created_at || '',
        }))
      : undefined;

    return {
      status,
      confidence,
      animal: status === 'match' ? animalMatch : undefined,
      alternatives,
    };
  }

  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dotProduct / denom;
  }

  private createError(code: MuzzleErrorCode, message: string): MuzzleError {
    return {
      code,
      message,
      messageAm: message,
      retryable: [MuzzleErrorCode.SEARCH_TIMEOUT, MuzzleErrorCode.SYNC_FAILED].includes(code),
    };
  }
}

/**
 * SIMPLE OFFLINE SEARCH
 * Search YOUR OWN animals WITHOUT network
 * 
 * Use this when:
 * - Farmer is in area with no signal
 * - Want to verify their own registered animals
 * - Quick local check before going online
 */
export async function searchOffline(
  embedding: Float32Array,
  userId: string
): Promise<SimpleSearchResult> {
  const startTime = performance.now();

  try {
    // Get all locally stored embeddings for this user
    const storedEmbeddings = await getAllMuzzleEmbeddings(userId);

    if (!storedEmbeddings || storedEmbeddings.length === 0) {
      return {
        found: false,
        confidence: 0,
        searchTimeMs: performance.now() - startTime,
        searchedOnline: false,
        message: 'No animals registered locally. Register your animals first!',
      };
    }

    // Calculate similarity with each stored embedding
    let bestMatch: { animalId: string; similarity: number; animalName?: string } | null = null;

    for (const stored of storedEmbeddings) {
      const similarity = cosineSimilaritySimple(embedding, stored.embedding);
      
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = {
          animalId: stored.animalId,
          similarity,
          animalName: stored.metadata?.name || stored.animalCode,
        };
      }
    }

    const searchTimeMs = performance.now() - startTime;

    if (!bestMatch) {
      return {
        found: false,
        confidence: 0,
        searchTimeMs,
        searchedOnline: false,
        message: 'Search complete. No animals found.',
      };
    }

    // Check confidence threshold (85% for offline)
    const isMatch = bestMatch.similarity >= 0.85;

    return {
      found: isMatch,
      animalId: bestMatch.animalId,
      confidence: Math.round(bestMatch.similarity * 100) / 100,
      animalName: bestMatch.animalName,
      searchTimeMs,
      searchedOnline: false,
      message: isMatch
        ? `Found: ${bestMatch.animalName || bestMatch.animalId} (${Math.round(bestMatch.similarity * 100)}% match)`
        : `Possible match: ${bestMatch.animalName || bestMatch.animalId} (${Math.round(bestMatch.similarity * 100)}% - too low, go online for verification)`,
    };

  } catch (error) {
    logger.error('Offline search failed', error);
    return {
      found: false,
      confidence: 0,
      searchTimeMs: performance.now() - startTime,
      searchedOnline: false,
      message: 'Offline search failed. Please try again.',
    };
  }
}

/**
 * Simple cosine similarity for offline search
 */
function cosineSimilaritySimple(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

export const muzzleSearchService = new MuzzleSearchService();
export default muzzleSearchService;
