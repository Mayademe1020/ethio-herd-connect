import { supabase } from '@/integrations/supabase/client';

// Offline caching utilities
const FEED_CACHE_KEY = 'feed_ingredients_cache';
const RATIONS_CACHE_KEY = 'ilri_rations_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CacheData<T> {
  data: T;
  timestamp: number;
}

// IndexedDB helpers for caching
const openCacheDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FeedCache', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache');
      }
    };
  });
};

const getFromIndexedDB = async <T>(key: string): Promise<CacheData<T> | null> => {
  try {
    const db = await openCacheDB();
    const transaction = db.transaction(['cache'], 'readonly');
    const store = transaction.objectStore('cache');

    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.warn('IndexedDB not available:', error);
    return null;
  }
};

const saveToIndexedDB = async <T>(key: string, data: CacheData<T>): Promise<void> => {
  try {
    const db = await openCacheDB();
    const transaction = db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    store.put(data, key);
  } catch (error) {
    console.warn('Failed to save to IndexedDB:', error);
  }
};

export interface FeedIngredient {
  id: string;
  name_am: string;
  name_en: string;
  icon_emoji: string;
  category: 'energy' | 'protein' | 'mineral' | 'roughage';
  dry_matter_percent: number;
  crude_protein_percent: number;
  energy_mj_kg: number;
  calcium_percent: number;
  phosphorus_percent: number;
  seasonal_availability: { dry_season: boolean; wet_season: boolean };
  commonly_available: boolean;
  region_specific: string[];
}

export interface ILRIRation {
  id: string;
  animal_type: string;
  animal_subtype: string;
  production_goal: string;
  season: string;
  ingredient_ratios: Record<string, number>; // feed_id -> percentage
  nutritional_analysis: Record<string, number>;
  expected_production: string;
  disclaimer_text_am: string;
  disclaimer_text_en: string;
}

export interface FeedPlan {
  id: string;
  farmer_id: string;
  animal_id: string;
  ration_id: string;
  mode_type: 'user_driven' | 'app_driven';
  selected_feeds: string[]; // feed IDs
  custom_notes?: string;
  telegram_shared: boolean;
  created_at: string;
}

/**
 * Get all available feed ingredients with caching
 */
export const getFeedIngredients = async (): Promise<FeedIngredient[]> => {
  // Try cache first
  const cached = await getFromIndexedDB<FeedIngredient[]>(FEED_CACHE_KEY);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Fetch from server
  try {
    const { data, error } = await supabase
      .from('feed_ingredients')
      .select('*')
      .order('name_en');

    if (error) throw error;
    const ingredients = data || [];

    // Cache the result
    await saveToIndexedDB(FEED_CACHE_KEY, { data: ingredients, timestamp: Date.now() });

    return ingredients;
  } catch (error) {
    // If network fails and we have cache, return stale cache
    if (cached) {
      console.warn('Network failed, returning cached feed ingredients');
      return cached.data;
    }
    throw error;
  }
};

/**
 * Get feed ingredients filtered by season
 */
export const getSeasonalFeeds = async (season: 'dry' | 'wet'): Promise<FeedIngredient[]> => {
  const seasonKey = season === 'dry' ? 'dry_season' : 'wet_season';

  const { data, error } = await supabase
    .from('feed_ingredients')
    .select('*')
    .filter(`seasonal_availability->>${seasonKey}`, 'eq', 'true')
    .order('commonly_available', { ascending: false })
    .order('name_en');

  if (error) throw error;
  return data || [];
};

/**
 * Get ILRI rations for specific animal and conditions
 */
export const getILRIRations = async (
  animalType: string,
  productionGoal: string,
  season: string
): Promise<ILRIRation[]> => {
  const { data, error } = await supabase
    .from('ilri_rations')
    .select('*')
    .eq('animal_type', animalType)
    .eq('production_goal', productionGoal)
    .eq('season', season)
    .eq('is_active', true);

  if (error) throw error;
  return data || [];
};

/**
 * Calculate ration using user's available feeds (Mode A)
 */
export const calculateUserDrivenRation = async (
  animalType: string,
  productionGoal: string,
  season: string,
  availableFeedIds: string[]
): Promise<{
  ration: ILRIRation | null;
  advice: string;
  nutritional_balance: Record<string, number>;
}> => {
  // Get all possible rations for this animal/goal/season
  const possibleRations = await getILRIRations(animalType, productionGoal, season);

  // Find ration that uses ONLY available feeds
  const suitableRation = possibleRations.find(ration => {
    const requiredFeeds = Object.keys(ration.ingredient_ratios);
    return requiredFeeds.every(feedId => availableFeedIds.includes(feedId));
  });

  if (suitableRation) {
    return {
      ration: suitableRation,
      advice: 'Perfect! This ration uses only the feeds you have available.',
      nutritional_balance: suitableRation.nutritional_analysis
    };
  }

  // If no perfect match, find the best partial match
  const partialMatch = possibleRations.find(ration => {
    const requiredFeeds = Object.keys(ration.ingredient_ratios);
    const availableCount = requiredFeeds.filter(feedId => availableFeedIds.includes(feedId)).length;
    return availableCount > 0; // At least some feeds available
  });

  if (partialMatch) {
    const requiredFeeds = Object.keys(partialMatch.ingredient_ratios);
    const missingFeeds = requiredFeeds.filter(feedId => !availableFeedIds.includes(feedId));

    return {
      ration: partialMatch,
      advice: `This ration can work with your feeds, but would be improved by adding: ${missingFeeds.join(', ')}`,
      nutritional_balance: partialMatch.nutritional_analysis
    };
  }

  // No suitable ration found
  return {
    ration: null,
    advice: 'No suitable ration found with your available feeds. Consider adding protein-rich feeds like cotton seed cake.',
    nutritional_balance: {}
  };
};

/**
 * Get optimal ILRI ration (Mode B)
 */
export const getOptimalRation = async (
  animalType: string,
  productionGoal: string,
  season: string
): Promise<ILRIRation | null> => {
  const rations = await getILRIRations(animalType, productionGoal, season);
  return rations[0] || null; // Return first (best) match
};

/**
 * Save a feed plan for a farmer
 */
export const saveFeedPlan = async (plan: Omit<FeedPlan, 'id' | 'created_at'>): Promise<FeedPlan> => {
  const { data, error } = await supabase
    .from('farmer_feed_plans')
    .insert(plan)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get farmer's saved feed plans
 */
export const getFarmerFeedPlans = async (farmerId: string): Promise<FeedPlan[]> => {
  const { data, error } = await supabase
    .from('farmer_feed_plans')
    .select('*')
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Share ration via Telegram
 */
export const shareRationViaTelegram = (ration: ILRIRation, animalType: string) => {
  const message = formatRationMessage(ration, animalType);
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(message)}`;
  window.open(telegramUrl, '_blank');
};

/**
 * Format ration for sharing
 */
const formatRationMessage = (ration: ILRIRation, animalType: string): string => {
  const ingredients = Object.entries(ration.ingredient_ratios)
    .map(([feedId, percentage]) => `${percentage}% ${feedId}`)
    .join(', ');

  return `🐄 **Ethio Herd Connect - Feed Ration**

**Animal:** ${animalType}
**Production Goal:** ${ration.production_goal}
**Season:** ${ration.season}

**Daily Ration:**
${ingredients}

**Expected Production:** ${ration.expected_production}

⚠️ **Consult veterinarian before use**
**Source:** ILRI Research for Ethiopian Conditions

#EthioHerdConnect #LivestockNutrition`;
};