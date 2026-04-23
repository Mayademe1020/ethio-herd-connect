// src/services/healthRecordService.ts
// Service layer for health record management with offline support

import { supabase } from '@/integrations/supabase/client';
import { offlineQueue } from '@/lib/offlineQueue';
import { HEALTH_RECORD_FIELDS } from '@/lib/queryBuilders';
import type { 
  HealthRecord, 
  CreateHealthRecordInput, 
  UpdateHealthRecordInput, 
  HealthRecordFilters,
  HealthRecordStats 
} from '@/types/healthRecord';

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

export async function createHealthRecord(input: CreateHealthRecordInput): Promise<HealthRecord> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const healthRecord = {
    user_id: user.id,
    animal_id: input.animal_id,
    record_type: input.record_type,
    medicine_name: input.medicine_name || null,
    symptoms: input.symptoms || null,
    severity: input.severity || null,
    notes: input.notes || null,
    photo_url: input.photo_url || null,
    administered_date: input.administered_date
  };

  if (!navigator.onLine) {
    await offlineQueue.addToQueue('health_record', healthRecord);
    return {
      id: generateTempId(),
      ...healthRecord,
      created_at: new Date().toISOString()
    } as HealthRecord;
  }

  const { data, error } = await supabase
    .from('health_records')
    .insert(healthRecord)
    .select(HEALTH_RECORD_FIELDS.detail)
    .single();

  if (error) {
    console.error('Error creating health record:', error);
    throw error;
  }

  return data as HealthRecord;
}

export async function getHealthRecordsByAnimal(
  animalId: string, 
  filters?: Omit<HealthRecordFilters, 'animalId'>
): Promise<HealthRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('health_records')
    .select(HEALTH_RECORD_FIELDS.detail)
    .eq('user_id', user.id)
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

  if (error) {
    console.error('Error fetching health records:', error);
    throw error;
  }

  return (data || []) as HealthRecord[];
}

export async function getAllHealthRecords(filters?: HealthRecordFilters): Promise<HealthRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('health_records')
    .select(HEALTH_RECORD_FIELDS.detail)
    .eq('user_id', user.id);

  if (filters?.animalId) {
    query = query.eq('animal_id', filters.animalId);
  }
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

  if (error) {
    console.error('Error fetching health records:', error);
    throw error;
  }

  return (data || []) as HealthRecord[];
}

export async function getRecentVaccinations(animalId: string, limit: number = 5): Promise<HealthRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('health_records')
    .select(HEALTH_RECORD_FIELDS.list)
    .eq('user_id', user.id)
    .eq('animal_id', animalId)
    .eq('record_type', 'vaccination')
    .order('administered_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching vaccinations:', error);
    throw error;
  }

  return (data || []) as HealthRecord[];
}

export async function updateHealthRecord(input: UpdateHealthRecordInput): Promise<HealthRecord> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const updates: Partial<HealthRecord> = {};
  
  if (input.record_type !== undefined) updates.record_type = input.record_type;
  if (input.medicine_name !== undefined) updates.medicine_name = input.medicine_name || null;
  if (input.symptoms !== undefined) updates.symptoms = input.symptoms || null;
  if (input.severity !== undefined) updates.severity = input.severity || null;
  if (input.notes !== undefined) updates.notes = input.notes || null;
  if (input.photo_url !== undefined) updates.photo_url = input.photo_url || null;
  if (input.administered_date !== undefined) updates.administered_date = input.administered_date;

  if (!navigator.onLine) {
    await offlineQueue.addToQueue('update_health_record', {
      recordId: input.id,
      updates
    });

    return {
      id: input.id,
      user_id: user.id,
      animal_id: '',
      ...updates,
      created_at: new Date().toISOString()
    } as HealthRecord;
  }

  const { data, error } = await supabase
    .from('health_records')
    .update(updates)
    .eq('id', input.id)
    .eq('user_id', user.id)
    .select(HEALTH_RECORD_FIELDS.detail)
    .single();

  if (error) {
    console.error('Error updating health record:', error);
    throw error;
  }

  return data as HealthRecord;
}

export async function deleteHealthRecord(recordId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  if (!navigator.onLine) {
    await offlineQueue.addToQueue('delete_health_record', { recordId });
    return;
  }

  const { error } = await supabase
    .from('health_records')
    .delete()
    .eq('id', recordId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting health record:', error);
    throw error;
  }
}

export async function getHealthRecordStats(animalId: string): Promise<HealthRecordStats> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('health_records')
    .select('record_type, severity, administered_date')
    .eq('user_id', user.id)
    .eq('animal_id', animalId);

  if (error) {
    console.error('Error fetching health record stats:', error);
    throw error;
  }

  const records = data || [];
  
  const stats: HealthRecordStats = {
    totalRecords: records.length,
    vaccinationCount: records.filter(r => r.record_type === 'vaccination').length,
    illnessCount: records.filter(r => r.record_type === 'illness').length,
    treatmentCount: records.filter(r => r.record_type === 'treatment').length,
    checkupCount: records.filter(r => r.record_type === 'checkup').length,
    lastVaccinationDate: records
      .filter(r => r.record_type === 'vaccination')
      .sort((a, b) => new Date(b.administered_date).getTime() - new Date(a.administered_date).getTime())[0]?.administered_date || null,
    lastCheckupDate: records
      .filter(r => r.record_type === 'checkup')
      .sort((a, b) => new Date(b.administered_date).getTime() - new Date(a.administered_date).getTime())[0]?.administered_date || null,
    severeCasesCount: records.filter(r => r.severity === 'severe').length
  };

  return stats;
}

export async function uploadHealthRecordPhoto(file: File, recordId: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Photo too large. Maximum size is 5MB.');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP.');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `health-records/${user.id}/${recordId}/${Date.now()}.${fileExt}`;

  try {
    // Try to upload to animal-photos bucket (reusing existing bucket)
    const { error: uploadError } = await supabase.storage
      .from('animal-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      throw new Error('Failed to upload photo. Please try again.');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('animal-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadHealthRecordPhoto:', error);
    throw error;
  }
}

/**
 * Generate a health certificate for marketplace listings
 * This is a PREMIUM feature that adds value for sellers
 */
export async function generateHealthCertificate(animalId: string, animalName: string): Promise<import('@/types/healthRecord').HealthCertificate> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Fetch all health records
  const { data: records, error } = await supabase
    .from('health_records')
    .select(HEALTH_RECORD_FIELDS.detail)
    .eq('user_id', user.id)
    .eq('animal_id', animalId)
    .order('administered_date', { ascending: false });

  if (error) {
    console.error('Error fetching health records for certificate:', error);
    throw error;
  }

  const healthRecords = (records || []) as import('@/types/healthRecord').HealthRecord[];
  
  // Calculate health score (0-100)
  // Base score: 100
  // -5 for each illness
  // -10 for each severe case
  // +5 for each vaccination (max +20)
  // +5 for checkup within last 6 months
  let healthScore = 100;
  const illnessCount = healthRecords.filter(r => r.record_type === 'illness').length;
  const severeCount = healthRecords.filter(r => r.severity === 'severe').length;
  const vaccinationCount = healthRecords.filter(r => r.record_type === 'vaccination').length;
  
  healthScore -= illnessCount * 5;
  healthScore -= severeCount * 10;
  healthScore += Math.min(vaccinationCount * 5, 20);
  
  // Check for recent checkup (within 6 months)
  const lastCheckup = healthRecords.find(r => r.record_type === 'checkup');
  if (lastCheckup) {
    const checkupDate = new Date(lastCheckup.administered_date);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    if (checkupDate > sixMonthsAgo) {
      healthScore += 5;
    }
  }
  
  // Clamp score between 0-100
  healthScore = Math.max(0, Math.min(100, healthScore));

  // Generate summary by type
  const typeSummary: import('@/types/healthRecord').HealthCertificate['records_summary'] = 
    ['vaccination', 'illness', 'checkup', 'treatment'].map(type => {
      const typeRecords = healthRecords.filter(r => r.record_type === type);
      return {
        type: type as import('@/types/healthRecord').HealthRecordType,
        count: typeRecords.length,
        last_date: typeRecords[0]?.administered_date || null
      };
    });

  return {
    animal_id: animalId,
    animal_name: animalName,
    generated_at: new Date().toISOString(),
    total_records: healthRecords.length,
    last_vaccination: healthRecords.find(r => r.record_type === 'vaccination') || null,
    last_checkup: healthRecords.find(r => r.record_type === 'checkup') || null,
    severe_cases: severeCount,
    health_score: healthScore,
    records_summary: typeSummary
  };
}
