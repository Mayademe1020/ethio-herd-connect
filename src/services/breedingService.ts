/**
 * Breeding Service
 * Complete breeding management for EthioHerd Connect
 * Includes heat cycles, mating, pregnancy, birth tracking with notifications and export
 */

import { supabase } from '@/integrations/supabase/client';
import { offlineQueue } from '@/lib/offlineQueue';
import {
  BreedingRecord,
  HeatCyclePreset,
  BreedingReminder,
  HeatCycleInfo,
  BreedingStats,
  CreateBreedingRecordParams,
  AnimalType,
  RecordType,
} from '@/types/breeding';
import { addDays, parseISO, differenceInDays, format } from 'date-fns';

export interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// Ethiopian heat cycle presets (already in DB, but providing fallback)
const DEFAULT_PRESETS: Record<AnimalType, HeatCyclePreset> = {
  cattle: {
    id: 'default-cattle',
    animal_type: 'cattle',
    cycle_length_days: 21,
    heat_duration_hours: 18,
    gestation_days: 283,
    postpartum_heat_days: 45,
    min_age_months: 15,
    is_active: true,
  },
  goat: {
    id: 'default-goat',
    animal_type: 'goat',
    cycle_length_days: 18,
    heat_duration_hours: 36,
    gestation_days: 150,
    postpartum_heat_days: 30,
    min_age_months: 7,
    is_active: true,
  },
  sheep: {
    id: 'default-sheep',
    animal_type: 'sheep',
    cycle_length_days: 17,
    heat_duration_hours: 30,
    gestation_days: 147,
    postpartum_heat_days: 30,
    min_age_months: 7,
    is_active: true,
  },
};

// Get heat cycle preset for animal type
async function getHeatCyclePreset(animalType: AnimalType): Promise<HeatCyclePreset> {
  try {
    const { data, error } = await supabase
      .from('heat_cycle_presets')
      .select('*')
      .eq('animal_type', animalType)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return DEFAULT_PRESETS[animalType];
    }

    return data;
  } catch {
    return DEFAULT_PRESETS[animalType];
  }
}

// Get heat cycle info for an animal
export async function getHeatCycleInfo(animalId: string): Promise<HeatCycleInfo | null> {
  try {
    // Get animal and its latest breeding records
    const { data: animal, error: animalError } = await supabase
      .from('animals')
      .select('id, type, gender, last_heat_date, breeding_status')
      .eq('id', animalId)
      .single();

    if (animalError || !animal) return null;
    if (animal.gender !== 'female') return null;

    const preset = await getHeatCyclePreset(animal.type as AnimalType);
    const today = new Date();

    // Get last heat date
    let lastHeatDate: Date | null = null;
    if (animal.last_heat_date) {
      lastHeatDate = parseISO(animal.last_heat_date);
    } else {
      // Try to get from breeding records
      const { data: heatRecord } = await supabase
        .from('breeding_records')
        .select('event_date')
        .eq('animal_id', animalId)
        .eq('record_type', 'heat')
        .order('event_date', { ascending: false })
        .limit(1)
        .single();

      if (heatRecord) {
        lastHeatDate = parseISO(heatRecord.event_date);
      }
    }

    if (!lastHeatDate) {
      return {
        animalId,
        lastHeatDate: null,
        nextHeatDate: null,
        cycleDay: 0,
        daysUntilHeat: 0,
        isInHeat: false,
        daysSinceHeat: 0,
      };
    }

    const daysSinceHeat = differenceInDays(today, lastHeatDate);
    const cycleDay = daysSinceHeat % preset.cycle_length_days;
    const daysUntilHeat = preset.cycle_length_days - cycleDay;
    const isInHeat = cycleDay < (preset.heat_duration_hours / 24);
    const nextHeatDate = addDays(lastHeatDate, preset.cycle_length_days);

    return {
      animalId,
      lastHeatDate: lastHeatDate.toISOString(),
      nextHeatDate: nextHeatDate.toISOString(),
      cycleDay,
      daysUntilHeat,
      isInHeat,
      daysSinceHeat,
    };
  } catch (error) {
    console.error('Error getting heat cycle info:', error);
    return null;
  }
}

// Get all breeding records for an animal
export async function getBreedingRecords(animalId: string): Promise<BreedingRecord[]> {
  try {
    const { data, error } = await supabase
      .from('breeding_records')
      .select('*')
      .eq('animal_id', animalId)
      .order('event_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching breeding records:', error);
    return [];
  }
}

// Get all breeding records for user's animals
export async function getAllBreedingRecords(userId: string): Promise<BreedingRecord[]> {
  try {
    const { data, error } = await supabase
      .from('breeding_records')
      .select(`
        *,
        animal:animals(id, name, type, gender, animal_id)
      `)
      .eq('user_id', userId)
      .order('event_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all breeding records:', error);
    return [];
  }
}

// Create a breeding record
export async function createBreedingRecord(
  userId: string,
  params: CreateBreedingRecordParams
): Promise<ServiceResult<BreedingRecord>> {
  try {
    const { data, error } = await supabase
      .from('breeding_records')
      .insert({
        user_id: userId,
        ...params,
      })
      .select()
      .single();

    if (error) throw error;

    // Update animal's last breeding date
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (params.record_type === 'heat') {
      updateData.last_heat_date = params.event_date;
    } else if (params.record_type === 'mating') {
      updateData.last_mating_date = params.event_date;
      updateData.breeding_count = (await getBreedingCount(params.animal_id)) + 1;
    }

    await supabase
      .from('animals')
      .update(updateData)
      .eq('id', params.animal_id);

    // Create reminders if enabled
    if (params.reminder_enabled !== false) {
      await createBreedingReminders(userId, data);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating breeding record:', error);
    return { success: false, error: String(error) };
  }
}

// Helper to get breeding count
async function getBreedingCount(animalId: string): Promise<number> {
  const { data } = await supabase
    .from('animals')
    .select('breeding_count')
    .eq('id', animalId)
    .single();
  return data?.breeding_count || 0;
}

// Create breeding reminders
async function createBreedingReminders(
  userId: string,
  record: BreedingRecord
): Promise<void> {
  try {
    const preset = await getCyclePresetForAnimal(record.animal_id);
    if (!preset) return;

    const reminders: Omit<BreedingReminder, 'id' | 'created_at'>[] = [];
    const eventDate = parseISO(record.event_date);

    if (record.record_type === 'heat') {
      // Remind for next heat cycle
      const nextHeat = addDays(eventDate, preset.cycle_length_days);
      reminders.push({
        user_id: userId,
        animal_id: record.animal_id,
        breeding_record_id: record.id,
        reminder_type: 'heat',
        reminder_date: format(addDays(nextHeat, -1), 'yyyy-MM-dd'),
        message_am: 'እባክዎ እንስሳው ሁስት ሊሆን ይችላል',
        message_en: 'Your animal may be in heat tomorrow',
      });
    } else if (record.record_type === 'mating') {
      // Remind for pregnancy check (45 days later for cattle)
      const checkDate = eventDate;
      reminders.push({
        user_id: userId,
        animal_id: record.animal_id,
        breeding_record_id: record.id,
        reminder_type: 'pregnancy_check',
        reminder_date: format(addDays(checkDate, 45), 'yyyy-MM-dd'),
        message_am: 'እባክዎ ጥንቃቄ ያድርጉ',
        message_en: 'Time for pregnancy check',
      });

      // Due date reminder
      if (record.expected_due_date) {
        const dueDate = parseISO(record.expected_due_date);
        reminders.push({
          user_id: userId,
          animal_id: record.animal_id,
          breeding_record_id: record.id,
          reminder_type: 'due_date',
          reminder_date: format(addDays(dueDate, -7), 'yyyy-MM-dd'),
          message_am: 'ልጅ ሊወለድ ቀረበ',
          message_en: 'Birth expected in 7 days',
        });
      }
    } else if (record.record_type === 'birth') {
      // Post-birth checkup reminder
      const checkupDate = addDays(eventDate, 7);
      reminders.push({
        user_id: userId,
        animal_id: record.animal_id,
        breeding_record_id: record.id,
        reminder_type: 'post_birth',
        reminder_date: format(checkupDate, 'yyyy-MM-dd'),
        message_am: 'ልጅ ለማስተካከል ጊዜው ነው',
        message_en: 'Time for post-birth checkup',
      });
    }

    if (reminders.length > 0) {
      await supabase.from('breeding_reminders').insert(reminders);
    }
  } catch (error) {
    console.error('Error creating breeding reminders:', error);
  }
}

async function getCyclePresetForAnimal(animalId: string): Promise<HeatCyclePreset | null> {
  try {
    const { data: animal } = await supabase
      .from('animals')
      .select('type')
      .eq('id', animalId)
      .single();

    if (!animal) return null;
    return getHeatCyclePreset(animal.type as AnimalType);
  } catch {
    return null;
  }
}

// Get breeding statistics for an animal
export async function getBreedingStats(animalId: string): Promise<BreedingStats> {
  try {
    const records = await getBreedingRecords(animalId);

    const totalBreedingAttempts = records.filter(
      (r) => r.record_type === 'mating' || r.record_type === 'pregnancy_confirmed'
    ).length;

    const successfulPregnancies = records.filter(
      (r) => r.record_type === 'birth' || r.outcome === 'successful'
    ).length;

    const failedAttempts = records.filter(
      (r) => r.outcome === 'failed'
    ).length;

    const totalOffspring = records
      .filter((r) => r.record_type === 'birth')
      .reduce((sum, r) => sum + (r.offspring_count || 0), 0);

    // Calculate average days between heat cycles
    const heatRecords = records
      .filter((r) => r.record_type === 'heat')
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

    let averageDaysBetweenHeat = 0;
    if (heatRecords.length > 1) {
      let totalDays = 0;
      for (let i = 0; i < heatRecords.length - 1; i++) {
        totalDays += differenceInDays(
          parseISO(heatRecords[i].event_date),
          parseISO(heatRecords[i + 1].event_date)
        );
      }
      averageDaysBetweenHeat = Math.round(totalDays / (heatRecords.length - 1));
    }

    return {
      totalBreedingAttempts,
      successfulPregnancies,
      failedAttempts,
      successRate: totalBreedingAttempts > 0
        ? Math.round((successfulPregnancies / totalBreedingAttempts) * 100)
        : 0,
      averageDaysBetweenHeat,
      totalOffspring,
    };
  } catch (error) {
    console.error('Error calculating breeding stats:', error);
    return {
      totalBreedingAttempts: 0,
      successfulPregnancies: 0,
      failedAttempts: 0,
      successRate: 0,
      averageDaysBetweenHeat: 0,
      totalOffspring: 0,
    };
  }
}

// Delete a breeding record
export async function deleteBreedingRecord(
  userId: string,
  recordId: string
): Promise<ServiceResult> {
  try {
    const { error } = await supabase
      .from('breeding_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', userId);

    if (error) throw error;

    // Also delete related reminders
    await supabase
      .from('breeding_reminders')
      .delete()
      .eq('breeding_record_id', recordId);

    return { success: true };
  } catch (error) {
    console.error('Error deleting breeding record:', error);
    return { success: false, error: String(error) };
  }
}

// Get upcoming reminders for user
export async function getBreedingReminders(userId: string): Promise<BreedingReminder[]> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('breeding_reminders')
      .select(`
        *,
        animal:animals(id, name, type)
      `)
      .eq('user_id', userId)
      .gte('reminder_date', today)
      .eq('sent', false)
      .order('reminder_date', { ascending: true })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching breeding reminders:', error);
    return [];
  }
}

// Export breeding records to CSV format
export function exportBreedingRecordsToCSV(
  records: BreedingRecord[],
  animalName: string,
  animalId: string
): string {
  const headers = ['Date', 'Type', 'Details', 'Outcome', 'Notes'];
  const rows = records.map((r) => [
    r.event_date,
    r.record_type,
    getRecordDetails(r),
    r.outcome || 'N/A',
    r.notes || '',
  ]);

  const csvContent = [
    `Breeding History for ${animalName} (${animalId})`,
    `Generated: ${new Date().toISOString()}`,
    '',
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

function getRecordDetails(record: BreedingRecord): string {
  switch (record.record_type) {
    case 'heat':
      return `Heat Cycle Day ${record.heat_cycle_day || 'N/A'}`;
    case 'mating':
      return `${record.mating_type || 'Natural'} - ${record.stud_name || 'Unknown'}`;
    case 'pregnancy_confirmed':
      return `Due: ${record.expected_due_date || 'N/A'}`;
    case 'birth':
      return `${record.offspring_count || 1} offspring`;
    case 'failed_mating':
      return record.notes || 'Failed';
    default:
      return '';
  }
}

// Calculate expected due date based on animal type
export function calculateDueDate(matingDate: string, animalType: AnimalType): string {
  const preset = DEFAULT_PRESETS[animalType];
  return format(addDays(parseISO(matingDate), preset.gestation_days), 'yyyy-MM-dd');
}

// Get recommended mating windows
export function getRecommendedMatingWindow(heatInfo: HeatCycleInfo): {
  startDate: string;
  endDate: string;
  optimal: boolean;
} | null {
  if (!heatInfo.nextHeatDate) return null;

  const nextHeat = parseISO(heatInfo.nextHeatDate);
  const optimalStart = addDays(nextHeat, -2); // 2 days before heat
  const optimalEnd = addDays(nextHeat, 1); // 1 day after heat starts

  const today = new Date();
  const optimal = today >= optimalStart && today <= optimalEnd;

  return {
    startDate: format(optimalStart, 'yyyy-MM-dd'),
    endDate: format(optimalEnd, 'yyyy-MM-dd'),
    optimal,
  };
}
