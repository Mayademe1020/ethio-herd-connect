/**
 * Query Builder Utilities
 * 
 * Centralized query builders with specific field selection to optimize database queries.
 * Replaces `.select('*')` with targeted field selection to reduce data transfer and improve performance.
 * 
 * @module queryBuilders
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Animal field sets for different use cases
 * - list: Minimal fields for list views (cards, tables)
 * - detail: Complete fields for detail/edit views
 * - card: Medium fields for card displays
 * - count: Minimal for counting only
 */
export const ANIMAL_FIELDS = {
  list: 'id, name, type, breed, health_status, photo_url, created_at',
  detail: 'id, name, type, breed, age, weight, health_status, photo_url, last_vaccination, notes, created_at, updated_at, user_id',
  card: 'id, name, type, breed, age, weight, health_status, photo_url',
  count: 'id'
} as const;

/**
 * Health record field sets
 */
export const HEALTH_RECORD_FIELDS = {
  list: 'id, record_type, administered_date, medicine_name, severity, animal_id',
  detail: 'id, record_type, administered_date, medicine_name, severity, notes, photo_url, created_at, animal_id, user_id'
} as const;

/**
 * Growth record field sets
 */
export const GROWTH_RECORD_FIELDS = {
  list: 'id, animal_id, weight, recorded_date, notes',
  detail: 'id, animal_id, weight, height, recorded_date, notes, created_at, user_id'
} as const;

/**
 * Market listing field sets
 */
// MARKET_LISTING_FIELDS definition
export const MARKET_LISTING_FIELDS = {
  // Remove animal_type (not in schema) and include animal_id for potential joins
  list: 'id, title, price, status, photos, created_at, animal_id',
  detail: 'id, title, description, price, age, weight, location, status, photos, created_at, updated_at, user_id, is_vet_verified, animal_id',
  card: 'id, title, price, photos, status, created_at, animal_id'
} as const;

/**
 * Milk production field sets
 */
export const MILK_PRODUCTION_FIELDS = {
  list: 'id, animal_id, amount, production_date, animals(name, photo_url)',
  detail: 'id, animal_id, amount, production_date, quality_grade, notes, created_at, user_id, animals(name, photo_url, type, subtype)'
} as const;

/**
 * Financial record field sets
 */
export const FINANCIAL_RECORD_FIELDS = {
  list: 'id, transaction_type, amount, category, transaction_date',
  detail: 'id, transaction_type, amount, category, description, transaction_date, created_at, user_id'
} as const;

/**
 * Notification field sets
 */
export const NOTIFICATION_FIELDS = {
  list: 'id, title, message, type, is_read, created_at',
  detail: 'id, title, message, type, is_read, action_url, created_at, user_id'
} as const;

/**
 * Farm assistant field sets
 */
export const FARM_ASSISTANT_FIELDS = {
  list: 'id, assistant_email, role, status, created_at',
  detail: 'id, assistant_email, role, permissions, status, created_at, farm_owner_id'
} as const;

/**
 * Build an optimized animal query with specific field selection
 * 
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @param fields - Field set to select ('list' | 'detail' | 'card' | 'count')
 * @returns Supabase query builder
 * 
 * @example
 * ```typescript
 * const query = buildAnimalQuery(supabase, userId, 'list');
 * const { data, error } = await query.order('created_at', { ascending: false });
 * ```
 */
export const buildAnimalQuery = (
  supabase: SupabaseClient,
  userId: string,
  fields: keyof typeof ANIMAL_FIELDS = 'list'
) => {
  return supabase
    .from('animals')
    .select(ANIMAL_FIELDS[fields])
    .eq('user_id', userId);
};

/**
 * Build an optimized health record query
 */
export const buildHealthRecordQuery = (
  supabase: SupabaseClient,
  userId: string,
  fields: keyof typeof HEALTH_RECORD_FIELDS = 'list'
) => {
  return supabase
    .from('health_records')
    .select(HEALTH_RECORD_FIELDS[fields])
    .eq('user_id', userId);
};

/**
 * Build an optimized growth record query
 */
export const buildGrowthRecordQuery = (
  supabase: SupabaseClient,
  userId: string,
  fields: keyof typeof GROWTH_RECORD_FIELDS = 'list'
) => {
  return supabase
    .from('growth_records')
    .select(GROWTH_RECORD_FIELDS[fields])
    .eq('user_id', userId);
};

/**
 * Build an optimized market listing query
 */
export const buildMarketListingQuery = (
  supabase: SupabaseClient,
  userId: string,
  fields: keyof typeof MARKET_LISTING_FIELDS = 'list'
) => {
  return supabase
    .from('market_listings')
    .select(MARKET_LISTING_FIELDS[fields])
    .eq('user_id', userId);
};

/**
 * Build an optimized milk production query
 */
export const buildMilkProductionQuery = (
  supabase: SupabaseClient,
  userId: string,
  fields: keyof typeof MILK_PRODUCTION_FIELDS = 'list'
) => {
  return supabase
    .from('milk_production')
    .select(MILK_PRODUCTION_FIELDS[fields])
    .eq('user_id', userId);
};

/**
 * Build an optimized financial record query
 */
export const buildFinancialRecordQuery = (
  supabase: SupabaseClient,
  userId: string,
  fields: keyof typeof FINANCIAL_RECORD_FIELDS = 'list'
) => {
  return supabase
    .from('financial_records')
    .select(FINANCIAL_RECORD_FIELDS[fields])
    .eq('user_id', userId);
};

/**
 * Build an optimized notification query
 */
export const buildNotificationQuery = (
  supabase: SupabaseClient,
  userId: string,
  fields: keyof typeof NOTIFICATION_FIELDS = 'list'
) => {
  return supabase
    .from('notifications')
    .select(NOTIFICATION_FIELDS[fields])
    .eq('user_id', userId);
};

/**
 * Build an optimized farm assistant query
 */
export const buildFarmAssistantQuery = (
  supabase: SupabaseClient,
  farmOwnerId: string,
  fields: keyof typeof FARM_ASSISTANT_FIELDS = 'list'
) => {
  return supabase
    .from('farm_assistants')
    .select(FARM_ASSISTANT_FIELDS[fields])
    .eq('farm_owner_id', farmOwnerId);
};

/**
 * Helper to build a COUNT query (most efficient for counting)
 * 
 * @param supabase - Supabase client instance
 * @param table - Table name
 * @param userId - User ID to filter by
 * @returns Supabase query builder configured for counting
 * 
 * @example
 * ```typescript
 * const { count, error } = await buildCountQuery(supabase, 'animals', userId);
 * ```
 */
export const buildCountQuery = (
  supabase: SupabaseClient,
  table: string,
  userId: string
) => {
  return supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
};
