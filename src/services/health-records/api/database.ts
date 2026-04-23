/**
 * @fileoverview Health Records API Layer
 * Direct Supabase database operations
 * No business logic - pure data access
 */

import { supabase } from '@/integrations/supabase/client';
import { HEALTH_RECORD_FIELDS } from '@/lib/queryBuilders';
import type { 
  HealthRecord, 
  CreateHealthRecordInput, 
  UpdateHealthRecordInput 
} from '@/types/healthRecord';
import type { PostgrestError } from '@supabase/supabase-js';

export type HealthRecordError = PostgrestError | Error;

interface QueryFilters {
  recordType?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Creates a new health record in the database
 * @param userId - User ID
 * @param input - Health record data
 * @returns {Promise<HealthRecord>} Created record
 * @throws {HealthRecordError} If creation fails
 */
export const apiCreateHealthRecord = async (
  userId: string,
  input: CreateHealthRecordInput
): Promise<HealthRecord> => {
  const record = {
    user_id: userId,
    animal_id: input.animal_id,
    record_type: input.record_type,
    medicine_name: input.medicine_name ?? null,
    symptoms: input.symptoms ?? null,
    severity: input.severity ?? null,
    notes: input.notes ?? null,
    photo_url: input.photo_url ?? null,
    administered_date: input.administered_date
  };

  const { data, error } = await supabase
    .from('health_records')
    .insert(record)
    .select(HEALTH_RECORD_FIELDS.detail)
    .single();

  if (error) throw error;
  if (!data) throw new Error('No data returned from insert');
  
  return data as HealthRecord;
};

/**
 * Fetches health records for a specific animal
 * @param userId - User ID
 * @param animalId - Animal ID
 * @param filters - Optional query filters
 * @returns {Promise<HealthRecord[]>} Array of health records
 */
export const apiGetHealthRecordsByAnimal = async (
  userId: string,
  animalId: string,
  filters?: QueryFilters
): Promise<HealthRecord[]> => {
  let query = supabase
    .from('health_records')
    .select(HEALTH_RECORD_FIELDS.detail)
    .eq('user_id', userId)
    .eq('animal_id', animalId);

  if (filters?.recordType) {
    query = query.eq('record_type', filters.recordType);
  }
  if (filters?.severity) {
    query = query.eq('severity', filters.severity);
  }
  if (filters?.startDate) {
    query = query.gte('administered_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('administered_date', filters.endDate);
  }

  const { data, error } = await query
    .order('administered_date', { ascending: false });

  if (error) throw error;
  return (data || []) as HealthRecord[];
};

/**
 * Updates an existing health record
 * @param userId - User ID
 * @param recordId - Record ID to update
 * @param updates - Fields to update
 * @returns {Promise<HealthRecord>} Updated record
 */
export const apiUpdateHealthRecord = async (
  userId: string,
  recordId: string,
  updates: Partial<UpdateHealthRecordInput>
): Promise<HealthRecord> => {
  const updateData: Partial<HealthRecord> = {};
  
  if (updates.record_type !== undefined) {
    updateData.record_type = updates.record_type;
  }
  if (updates.medicine_name !== undefined) {
    updateData.medicine_name = updates.medicine_name ?? null;
  }
  if (updates.symptoms !== undefined) {
    updateData.symptoms = updates.symptoms ?? null;
  }
  if (updates.severity !== undefined) {
    updateData.severity = updates.severity ?? null;
  }
  if (updates.notes !== undefined) {
    updateData.notes = updates.notes ?? null;
  }
  if (updates.photo_url !== undefined) {
    updateData.photo_url = updates.photo_url ?? null;
  }
  if (updates.administered_date !== undefined) {
    updateData.administered_date = updates.administered_date;
  }

  const { data, error } = await supabase
    .from('health_records')
    .update(updateData)
    .eq('id', recordId)
    .eq('user_id', userId)
    .select(HEALTH_RECORD_FIELDS.detail)
    .single();

  if (error) throw error;
  if (!data) throw new Error('No data returned from update');
  
  return data as HealthRecord;
};

/**
 * Deletes a health record
 * @param userId - User ID
 * @param recordId - Record ID to delete
 * @returns {Promise<void>}
 */
export const apiDeleteHealthRecord = async (
  userId: string,
  recordId: string
): Promise<void> => {
  const { error } = await supabase
    .from('health_records')
    .delete()
    .eq('id', recordId)
    .eq('user_id', userId);

  if (error) throw error;
};

/**
 * Fetches recent vaccinations for an animal
 * @param userId - User ID
 * @param animalId - Animal ID
 * @param limit - Maximum number of records
 * @returns {Promise<HealthRecord[]>} Vaccination records
 */
export const apiGetRecentVaccinations = async (
  userId: string,
  animalId: string,
  limit: number = 5
): Promise<HealthRecord[]> => {
  const { data, error } = await supabase
    .from('health_records')
    .select(HEALTH_RECORD_FIELDS.list)
    .eq('user_id', userId)
    .eq('animal_id', animalId)
    .eq('record_type', 'vaccination')
    .order('administered_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as HealthRecord[];
};