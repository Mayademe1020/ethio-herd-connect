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
  favorite?: boolean;
  vaccination_records?: VaccinationRecord[];
  growth_records?: WeightRecord[];
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
  recorded_date: string;
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
export const transformAnimalData = (dbAnimal: any): AnimalData => {
  return {
    ...dbAnimal,
    health_status: dbAnimal.health_status || 'healthy',
    updated_at: dbAnimal.updated_at || dbAnimal.created_at,
    user_id: dbAnimal.user_id || 'current-user-id'
  };
};