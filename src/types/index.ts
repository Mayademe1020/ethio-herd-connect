
export interface AnimalData {
  id: string;
  animal_code: string;
  name: string;
  type: string;
  breed: string;
  birth_date: string;
  weight?: number;
  health_status: 'healthy' | 'sick' | 'attention' | 'critical';
  is_vet_verified: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
  gender?: 'male' | 'female';
  color?: string;
  parent_id?: string;
  notes?: string;
  vaccination_records?: VaccinationRecord[];
  weight_records?: WeightRecord[];
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
