/**
 * Breeding Records Types
 * Complete breeding management types for EthioHerd Connect
 */

export type AnimalType = 'cattle' | 'goat' | 'sheep';
export type Gender = 'male' | 'female';
export type RecordType = 'heat' | 'mating' | 'pregnancy_confirmed' | 'birth' | 'failed_mating';
export type MatingType = 'natural' | 'artificial';
export type Outcome = 'successful' | 'failed' | 'pending' | 'unknown';
export type ReminderType = 'heat' | 'mating' | 'pregnancy_check' | 'due_date' | 'post_birth';

export interface BreedingRecord {
  id: string;
  user_id: string;
  animal_id: string;
  record_type: RecordType;
  event_date: string;
  
  // Heat cycle data
  heat_cycle_day?: number;
  heat_duration_days?: number;
  
  // Mating data
  mating_type?: MatingType;
  stud_animal_id?: string;
  stud_name?: string;
  stud_breed?: string;
  breeding_method?: string;
  
  // Pregnancy data
  expected_due_date?: string;
  pregnancy_confirmed_date?: string;
  
  // Birth data
  actual_birth_date?: string;
  offspring_count?: number;
  offspring_ids?: string[];
  birth_notes?: string;
  
  // Outcome
  outcome?: Outcome;
  notes?: string;
  
  // Reminder settings
  reminder_enabled?: boolean;
  reminder_days_before?: number[];
  
  created_at: string;
  updated_at: string;
  
  // Populated relations
  animal?: {
    id: string;
    name: string;
    type: AnimalType;
    gender: Gender;
  };
}

export interface HeatCyclePreset {
  id: string;
  animal_type: AnimalType;
  cycle_length_days: number;
  heat_duration_hours: number;
  gestation_days: number;
  postpartum_heat_days: number;
  min_age_months: number;
  is_active: boolean;
}

export interface BreedingReminder {
  id: string;
  user_id: string;
  animal_id: string;
  breeding_record_id?: string;
  reminder_type: ReminderType;
  reminder_date: string;
  message_am?: string;
  message_en?: string;
  sent: boolean;
  created_at: string;
}

export interface HeatCycleInfo {
  animalId: string;
  lastHeatDate: string | null;
  nextHeatDate: string | null;
  cycleDay: number;
  daysUntilHeat: number;
  isInHeat: boolean;
  daysSinceHeat: number;
}

export interface BreedingStats {
  totalBreedingAttempts: number;
  successfulPregnancies: number;
  failedAttempts: number;
  successRate: number;
  averageDaysBetweenHeat: number;
  totalOffspring: number;
}

export interface CreateBreedingRecordParams {
  animal_id: string;
  record_type: RecordType;
  event_date: string;
  
  // Heat
  heat_cycle_day?: number;
  heat_duration_days?: number;
  
  // Mating
  mating_type?: MatingType;
  stud_animal_id?: string;
  stud_name?: string;
  stud_breed?: string;
  breeding_method?: string;
  
  // Pregnancy
  expected_due_date?: string;
  pregnancy_confirmed_date?: string;
  
  // Birth
  actual_birth_date?: string;
  offspring_count?: number;
  offspring_ids?: string[];
  birth_notes?: string;
  
  // Outcome
  outcome?: Outcome;
  notes?: string;
  
  // Reminders
  reminder_enabled?: boolean;
}

export interface BreedingHistoryFilters {
  animalId?: string;
  recordType?: RecordType;
  startDate?: string;
  endDate?: string;
  outcome?: Outcome;
}

export interface ExportBreedingData {
  animalName: string;
  animalType: string;
  animalId: string;
  records: {
    date: string;
    type: string;
    details: string;
    outcome: string;
    notes: string;
  }[];
  generatedAt: string;
}
