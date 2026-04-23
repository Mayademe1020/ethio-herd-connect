/**
 * @fileoverview Health Records Business Logic
 * Calculations, validations, and business rules
 * No database calls - pure functions
 */

import type { HealthRecord } from '@/types/healthRecord';
import { getVaccineInterval } from '@/config/vaccines';
import { 
  calculateNextDueDate, 
  getDaysUntil,
  isOverdue,
  isDueSoon 
} from '@/utils/health-records/date';

export interface VaccinationStatus {
  vaccineName: string;
  lastDate: string;
  nextDueDate: string;
  daysUntil: number;
  status: 'valid' | 'due-soon' | 'overdue';
}

export interface HealthStats {
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
 * Calculates vaccination status for an array of records
 * Groups by vaccine type and determines status
 * @param records - Health records
 * @returns {VaccinationStatus[]} Vaccination statuses
 */
export const calculateVaccinationStatuses = (
  records: HealthRecord[]
): VaccinationStatus[] => {
  // Get only vaccinations
  const vaccinations = records.filter(r => r.record_type === 'vaccination');
  
  // Group by vaccine name, keeping only the latest for each
  const latestByVaccine = new Map<string, HealthRecord>();
  
  vaccinations.forEach(record => {
    const vaccineName = record.medicine_name;
    if (!vaccineName) return;
    
    const existing = latestByVaccine.get(vaccineName);
    if (!existing || new Date(record.administered_date) > new Date(existing.administered_date)) {
      latestByVaccine.set(vaccineName, record);
    }
  });
  
  // Calculate status for each
  return Array.from(latestByVaccine.entries()).map(([vaccineName, record]) => {
    const nextDueDate = calculateNextDueDate(vaccineName, record.administered_date);
    const daysUntil = getDaysUntil(nextDueDate);
    
    let status: 'valid' | 'due-soon' | 'overdue' = 'valid';
    if (isOverdue(nextDueDate)) {
      status = 'overdue';
    } else if (isDueSoon(nextDueDate)) {
      status = 'due-soon';
    }
    
    return {
      vaccineName,
      lastDate: record.administered_date,
      nextDueDate,
      daysUntil,
      status
    };
  });
};

/**
 * Calculates health statistics from records
 * @param records - Health records
 * @returns {HealthStats} Statistics summary
 */
export const calculateHealthStats = (records: HealthRecord[]): HealthStats => {
  const vaccinations = records.filter(r => r.record_type === 'vaccination');
  const illnesses = records.filter(r => r.record_type === 'illness');
  const treatments = records.filter(r => r.record_type === 'treatment');
  const checkups = records.filter(r => r.record_type === 'checkup');
  
  // Sort vaccinations by date (newest first)
  const sortedVaccinations = [...vaccinations].sort(
    (a, b) => new Date(b.administered_date).getTime() - new Date(a.administered_date).getTime()
  );
  
  // Sort checkups by date (newest first)
  const sortedCheckups = [...checkups].sort(
    (a, b) => new Date(b.administered_date).getTime() - new Date(a.administered_date).getTime()
  );
  
  return {
    totalRecords: records.length,
    vaccinationCount: vaccinations.length,
    illnessCount: illnesses.length,
    treatmentCount: treatments.length,
    checkupCount: checkups.length,
    lastVaccinationDate: sortedVaccinations[0]?.administered_date ?? null,
    lastCheckupDate: sortedCheckups[0]?.administered_date ?? null,
    severeCasesCount: illnesses.filter(r => r.severity === 'severe').length
  };
};

/**
 * Validates health record input
 * @param input - Input to validate
 * @returns {string | null} Error message or null if valid
 */
export const validateHealthRecordInput = (
  input: { record_type?: string; administered_date?: string; medicine_name?: string }
): string | null => {
  if (!input.record_type) {
    return 'Record type is required';
  }
  
  if (!input.administered_date) {
    return 'Date is required';
  }
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(input.administered_date)) {
    return 'Invalid date format. Use YYYY-MM-DD';
  }
  
  // Validate date is not too far in future (max 1 year)
  const inputDate = new Date(input.administered_date);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  
  if (inputDate > maxDate) {
    return 'Date cannot be more than 1 year in the future';
  }
  
  // Validate medicine name for non-checkup records
  if (input.record_type !== 'checkup' && !input.medicine_name?.trim()) {
    return 'Medicine or vaccine name is required';
  }
  
  return null;
};

/**
 * Groups records by month for display
 * @param records - Health records
 * @returns {Map<string, HealthRecord[]>} Records grouped by month
 */
export const groupRecordsByMonth = (
  records: HealthRecord[]
): Map<string, HealthRecord[]> => {
  const grouped = new Map<string, HealthRecord[]>();
  
  records.forEach(record => {
    const date = new Date(record.administered_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(record);
  });
  
  return grouped;
};

/**
 * Filters records by type
 * @param records - Health records
 * @param type - Record type to filter by
 * @returns {HealthRecord[]} Filtered records
 */
export const filterRecordsByType = (
  records: HealthRecord[],
  type: string
): HealthRecord[] => {
  if (type === 'all') return records;
  return records.filter(r => r.record_type === type);
};

/**
 * Sorts records by date (newest first)
 * @param records - Health records
 * @returns {HealthRecord[]} Sorted records
 */
export const sortRecordsByDate = (
  records: HealthRecord[]
): HealthRecord[] => {
  return [...records].sort(
    (a, b) => new Date(b.administered_date).getTime() - new Date(a.administered_date).getTime()
  );
};