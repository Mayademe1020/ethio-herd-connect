/**
 * Pregnancy Service
 * Handles pregnancy tracking operations for animals
 */

import { supabase } from '@/integrations/supabase/client';
import { offlineQueue } from '@/lib/offlineQueue';

export interface PregnancyRecord {
  breeding_date: string;
  expected_delivery: string;
  actual_delivery?: string;
  status: 'pregnant' | 'delivered' | 'terminated';
  offspring_id?: string;
  notes?: string;
  recorded_at: string;
}

export interface RecordPregnancyParams {
  animalId: string;
  breedingDate: string;
  expectedDelivery: string;
  notes?: string;
}

export interface RecordBirthParams {
  animalId: string;
  actualDelivery: string;
  offspringId?: string;
  notes?: string;
}

/**
 * Record a new pregnancy for an animal
 */
export async function recordPregnancy(params: RecordPregnancyParams): Promise<void> {
  const { animalId, breedingDate, expectedDelivery, notes } = params;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current pregnancy data
    const { data: animal, error: fetchError } = await supabase
      .from('animals')
      .select('pregnancy_data')
      .eq('id', animalId)
      .single();

    if (fetchError) {
      // Silently handle missing column error
      if (fetchError.code === '42703') {
        console.warn('pregnancy_data column not found - feature not yet enabled');
        throw new Error('Pregnancy tracking not yet available');
      }
      throw fetchError;
    }

    // Create new pregnancy record
    const newPregnancyRecord: PregnancyRecord = {
      breeding_date: breedingDate,
      expected_delivery: expectedDelivery,
      status: 'pregnant',
      notes,
      recorded_at: new Date().toISOString(),
    };

    // Append to pregnancy history
    const pregnancyHistory = Array.isArray(animal?.pregnancy_data)
      ? animal.pregnancy_data
      : [];

    const updatedHistory = [...pregnancyHistory, newPregnancyRecord];

    // Update animal with pregnancy status and data
    const { error: updateError } = await supabase
      .from('animals')
      .update({
        pregnancy_status: 'pregnant',
        pregnancy_data: updatedHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', animalId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

  } catch (error) {
    console.error('Error recording pregnancy:', error);

    // Queue for offline sync
    await offlineQueue.addToQueue('pregnancy_record', params);

    throw error;
  }
}

/**
 * Record birth and complete pregnancy
 */
export async function recordBirth(params: RecordBirthParams): Promise<void> {
  const { animalId, actualDelivery, offspringId, notes } = params;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current pregnancy data
    const { data: animal, error: fetchError } = await supabase
      .from('animals')
      .select('pregnancy_data, pregnancy_status')
      .eq('id', animalId)
      .single();

    if (fetchError) throw fetchError;

    if (animal.pregnancy_status !== 'pregnant') {
      throw new Error('Animal is not currently pregnant');
    }

    // Update the most recent pregnancy record
    const pregnancyHistory = Array.isArray(animal?.pregnancy_data)
      ? animal.pregnancy_data
      : [];

    if (pregnancyHistory.length === 0) {
      throw new Error('No pregnancy record found');
    }

    // Update the last pregnancy record
    const updatedHistory = [...pregnancyHistory];
    const lastIndex = updatedHistory.length - 1;
    updatedHistory[lastIndex] = {
      ...updatedHistory[lastIndex],
      actual_delivery: actualDelivery,
      status: 'delivered',
      offspring_id: offspringId,
      notes: notes || updatedHistory[lastIndex].notes,
    };

    // Update animal status
    const { error: updateError } = await supabase
      .from('animals')
      .update({
        pregnancy_status: 'delivered',
        pregnancy_data: updatedHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', animalId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

  } catch (error) {
    console.error('Error recording birth:', error);

    // Queue for offline sync
    await offlineQueue.addToQueue('birth_record', params);

    throw error;
  }
}

/**
 * Terminate a pregnancy
 */
export async function terminatePregnancy(
  animalId: string,
  reason?: string
): Promise<void> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current pregnancy data
    const { data: animal, error: fetchError } = await supabase
      .from('animals')
      .select('pregnancy_data, pregnancy_status')
      .eq('id', animalId)
      .single();

    if (fetchError) throw fetchError;

    if (animal.pregnancy_status !== 'pregnant') {
      throw new Error('Animal is not currently pregnant');
    }

    // Update the most recent pregnancy record
    const pregnancyHistory = Array.isArray(animal?.pregnancy_data)
      ? animal.pregnancy_data
      : [];

    if (pregnancyHistory.length === 0) {
      throw new Error('No pregnancy record found');
    }

    // Update the last pregnancy record
    const updatedHistory = [...pregnancyHistory];
    const lastIndex = updatedHistory.length - 1;
    updatedHistory[lastIndex] = {
      ...updatedHistory[lastIndex],
      status: 'terminated',
      notes: reason || updatedHistory[lastIndex].notes,
    };

    // Update animal status
    const { error: updateError } = await supabase
      .from('animals')
      .update({
        pregnancy_status: 'not_pregnant',
        pregnancy_data: updatedHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', animalId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

  } catch (error) {
    console.error('Error terminating pregnancy:', error);

    // Queue for offline sync
    await offlineQueue.addToQueue('pregnancy_terminate', { animalId, reason });

    throw error;
  }
}

/**
 * Get pregnancy history for an animal
 */
export async function getPregnancyHistory(animalId: string): Promise<PregnancyRecord[]> {
  try {
    const { data: animal, error } = await supabase
      .from('animals')
      .select('pregnancy_data')
      .eq('id', animalId)
      .single();

    if (error) throw error;

    return Array.isArray(animal?.pregnancy_data) ? animal.pregnancy_data : [];
  } catch (error) {
    console.error('Error fetching pregnancy history:', error);
    return [];
  }
}

/**
 * Get current pregnancy for an animal
 */
export async function getCurrentPregnancy(animalId: string): Promise<PregnancyRecord | null> {
  try {
    const { data: animal, error } = await supabase
      .from('animals')
      .select('pregnancy_data, pregnancy_status')
      .eq('id', animalId)
      .single();

    if (error) throw error;

    if (animal.pregnancy_status !== 'pregnant') {
      return null;
    }

    const pregnancyHistory = Array.isArray(animal?.pregnancy_data)
      ? animal.pregnancy_data
      : [];

    // Return the most recent pregnancy
    return pregnancyHistory.length > 0
      ? pregnancyHistory[pregnancyHistory.length - 1]
      : null;
  } catch (error) {
    console.error('Error fetching current pregnancy:', error);
    return null;
  }
}
