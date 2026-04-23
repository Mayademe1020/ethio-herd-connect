// Health Records Components - Premium Feature
// Centralized exports for clean imports

export { HealthRecordCard } from './HealthRecordCard';
export { HealthRecordList } from './HealthRecordList';
export { HealthRecordForm } from './HealthRecordForm';
export { AddHealthRecordDialog } from './AddHealthRecordDialog';
export { VaccinationSchedule } from './VaccinationSchedule';
export { VoiceInputButton } from './VoiceInputButton';
export { AiDiagnosisDialog } from './AiDiagnosisDialog';

// Re-export types for convenience
export type { 
  HealthRecord, 
  HealthRecordType, 
  HealthRecordSeverity,
  CreateHealthRecordInput,
  UpdateHealthRecordInput,
  HealthRecordStats,
  HealthCertificate 
} from '@/types/healthRecord';
