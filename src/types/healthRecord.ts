// Type definitions for health records
// Used for tracking vaccinations, illnesses, treatments, and checkups

/**
 * Health record types supported by the system
 */
export type HealthRecordType = 'vaccination' | 'illness' | 'checkup' | 'treatment';

/**
 * Severity levels for health records
 */
export type HealthRecordSeverity = 'mild' | 'moderate' | 'severe';

/**
 * Main HealthRecord interface matching Supabase schema
 */
export interface HealthRecord {
  id: string;
  user_id: string;
  animal_id: string | null;
  record_type: HealthRecordType;
  medicine_name: string | null;
  symptoms: string | null;
  severity: HealthRecordSeverity | null;
  notes: string | null;
  photo_url: string | null;
  administered_date: string;
  created_at: string;
}

/**
 * Input type for creating a new health record
 */
export interface CreateHealthRecordInput {
  animal_id: string;
  record_type: HealthRecordType;
  medicine_name?: string;
  symptoms?: string;
  severity?: HealthRecordSeverity;
  notes?: string;
  photo_url?: string;
  administered_date: string;
}

/**
 * Input type for updating an existing health record
 */
export interface UpdateHealthRecordInput {
  id: string;
  record_type?: HealthRecordType;
  medicine_name?: string;
  symptoms?: string;
  severity?: HealthRecordSeverity;
  notes?: string;
  photo_url?: string;
  administered_date?: string;
}

/**
 * Filters for querying health records
 */
export interface HealthRecordFilters {
  animalId?: string;
  recordType?: HealthRecordType;
  startDate?: string;
  endDate?: string;
  severity?: HealthRecordSeverity;
}

/**
 * Health record statistics for an animal
 */
export interface HealthRecordStats {
  totalRecords: number;
  vaccinationCount: number;
  illnessCount: number;
  treatmentCount: number;
  checkupCount: number;
  lastVaccinationDate: string | null;
  lastCheckupDate: string | null;
  severeCasesCount: number;
}

/**
 * Vaccination schedule item (for upcoming/recent vaccines)
 */
export interface VaccinationScheduleItem {
  id: string;
  medicine_name: string;
  administered_date: string;
  is_upcoming: boolean;
  days_until: number;
}

/**
 * Grouped health records by month
 */
export interface GroupedHealthRecords {
  month: string;
  year: number;
  records: HealthRecord[];
}

/**
 * Health trend data for charts
 */
export interface HealthTrend {
  month: string;
  illnesses: number;
  treatments: number;
  checkups: number;
  vaccinations: number;
}

/**
 * Health certificate for buyers
 */
export interface HealthCertificate {
  animal_id: string;
  animal_name: string;
  generated_at: string;
  total_records: number;
  last_vaccination: HealthRecord | null;
  last_checkup: HealthRecord | null;
  severe_cases: number;
  health_score: number; // 0-100
  records_summary: {
    type: HealthRecordType;
    count: number;
    last_date: string | null;
  }[];
}
