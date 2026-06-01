
import type { MuzzleStatus } from './muzzle';

export interface AnimalData {
  id: string;
  animal_code: string;
  animal_id?: string; // Professional animal ID (FARM-TYPE-###)
  name: string;
  type: string;
  subtype?: string; // Added for better animal classification
  breed: string;
  breed_custom?: string; // User-provided breed description for unknown breeds
  is_custom_breed?: boolean; // Flag indicating custom breed entry
  birth_date: string;
  weight?: number;
  health_status: 'healthy' | 'sick' | 'attention' | 'critical';
  is_vet_verified: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  gender?: 'male' | 'female';
  color?: string;
  parent_id?: string;
  notes?: string;
  age?: number;
  last_vaccination?: string;
  photo_url?: string;
  photos?: string[];
  location?: string;
  vaccination_due_date?: string;
  estimated_value?: number;
  status?: string; // Professional status system
  vaccination_records?: VaccinationRecord[];
  weight_records?: WeightRecord[];
  // Muzzle identification
  muzzle_status?: MuzzleStatus;
  // Farm team management
  farm_id?: string;
}

export interface VaccinationRecord {
  id: string;
  animal_id: string;
  vaccine_name: string;
  date_administered: string;
  next_due_date?: string;
  administered_by: string;
  notes?: string;
  created_at: string;
}

export interface WeightRecord {
  id: string;
  animal_id: string;
  weight: number;
  date_recorded: string;
  recorded_by: string;
  notes?: string;
  created_at: string;
}

export type Language = 'am' | 'en' | 'or' | 'sw';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  farm_name?: string;
  location?: string;
  created_at: string;
}

// Helper function to transform database data to our AnimalData interface
export const transformAnimalData = (dbAnimal: unknown): AnimalData => {
  const record = (dbAnimal ?? {}) as Partial<AnimalData> & {
    health_status?: string;
    updated_at?: string;
    created_at?: string;
    user_id?: string;
  };
  const health_status = record.health_status ?? 'healthy';
  const validHealthStatus = ['healthy', 'sick', 'attention', 'critical'].includes(health_status)
    ? (health_status as AnimalData['health_status'])
    : 'healthy';

  return {
    ...(record as AnimalData),
    health_status: validHealthStatus,
    updated_at: record.updated_at ?? record.created_at ?? new Date().toISOString(),
    user_id: record.user_id ?? 'current-user-id'
  };
};


// Re-export muzzle types
export * from './muzzle';
