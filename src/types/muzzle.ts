/**
 * Muzzle Identification System Types
 * Types for cattle muzzle biometric identification feature
 */

// ============================================================================
// Core Muzzle Types
// ============================================================================

/**
 * Muzzle registration status for an animal
 */
export type MuzzleStatus = 'not_registered' | 'registered' | 'pending_update';

/**
 * Muzzle registration record linked to an animal
 */
export interface MuzzleRegistration {
  id: string;
  animal_id: string;
  user_id: string;
  
  // Embedding data
  embedding_version: string;
  
  // Image references
  image_url?: string;
  thumbnail_url?: string;
  
  // Quality metadata
  quality_score?: number; // 0-100
  capture_conditions?: CaptureConditions;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  is_active: boolean;
  
  // Consent tracking
  consent_given: boolean;
  consent_timestamp?: string;
}

/**
 * Muzzle embedding with extracted features
 */
export interface MuzzleEmbedding {
  id: string;
  vector: Float32Array; // 1280-dimensional MobileNetV2 embedding
  confidence: number; // 0-1
  modelVersion: string;
  extractedAt: string;
  imageQuality: QualityScore;
  captureConditions: CaptureConditions;
}

/**
 * Quality score for captured muzzle image
 */
export interface QualityScore {
  overall: number; // 0-100
  brightness: number; // 0-100
  sharpness: number; // 0-100
  coverage: number; // 0-100 - How much of muzzle is visible
}

/**
 * Conditions during muzzle capture
 */
export interface CaptureConditions {
  lighting: 'poor' | 'acceptable' | 'good';
  distance: 'too_close' | 'optimal' | 'too_far';
  motion: boolean;
  deviceType: string;
}

// ============================================================================
// Identification Types
// ============================================================================

/**
 * Result status from muzzle identification
 */
export type IdentificationStatus = 'match' | 'possible_match' | 'no_match' | 'error';

/**
 * Search mode for identification
 */
export type SearchMode = 'local' | 'cloud' | 'hybrid';

/**
 * Result from muzzle identification attempt
 */
export interface IdentificationResult {
  status: IdentificationStatus;
  confidence: number; // 0-1
  animal?: AnimalMatch;
  alternatives?: AnimalMatch[]; // For possible matches
  searchedLocal: boolean;
  searchedCloud: boolean;
  timestamp: string;
  searchDurationMs?: number;
}

/**
 * Matched animal from identification
 */
export interface AnimalMatch {
  animalId: string;
  animalCode: string;
  name: string;
  type: string;
  breed?: string;
  ownerId: string;
  ownerName?: string;
  ownerPhone?: string;
  farmName?: string;
  location?: string;
  similarity: number; // 0-1
  muzzleRegisteredAt: string;
}

/**
 * Identification log entry for audit
 */
export interface MuzzleIdentificationLog {
  id: string;
  user_id: string;
  search_mode: SearchMode;
  result_status: IdentificationStatus;
  matched_animal_id?: string;
  matched_registration_id?: string;
  confidence_score?: number;
  alternatives?: AnimalMatch[];
  device_info?: DeviceInfo;
  location_info?: LocationInfo;
  search_duration_ms?: number;
  created_at: string;
}

// ============================================================================
// Duplicate Detection Types
// ============================================================================

/**
 * Resolution options for duplicate detection
 */
export type DuplicateResolution = 
  | 'continued' 
  | 'transfer_requested' 
  | 'fraud_reported' 
  | 'cancelled' 
  | 'pending';

/**
 * Duplicate muzzle detection event
 */
export interface MuzzleDuplicateEvent {
  id: string;
  
  // Attempted registration
  attempted_animal_id?: string;
  attempted_user_id: string;
  
  // Existing match
  existing_registration_id?: string;
  existing_animal_id?: string;
  existing_user_id?: string;
  
  // Similarity
  similarity_score: number; // 0-1
  
  // Resolution
  resolution?: DuplicateResolution;
  resolution_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
  
  created_at: string;
}

// ============================================================================
// Ownership Transfer Types
// ============================================================================

/**
 * Status of ownership transfer
 */
export type TransferStatus = 
  | 'pending' 
  | 'awaiting_verification' 
  | 'verified' 
  | 'disputed' 
  | 'completed' 
  | 'cancelled';

/**
 * Ownership transfer record with muzzle verification
 */
export interface OwnershipTransfer {
  id: string;
  animal_id: string;
  
  // Transfer parties
  from_user_id: string;
  to_user_id: string;
  
  // Status
  status: TransferStatus;
  
  // Muzzle verification
  muzzle_verified: boolean;
  verification_attempts: number;
  last_verification_at?: string;
  verification_confidence?: number;
  
  // Timestamps
  initiated_at: string;
  confirmed_at?: string;
  completed_at?: string;
  
  // Dispute handling
  dispute_reason?: string;
  dispute_resolved_at?: string;
}

// ============================================================================
// Model Version Types
// ============================================================================

/**
 * ML model version information
 */
export interface MuzzleModelVersion {
  id: string;
  version: string;
  model_url: string;
  model_size_bytes?: number;
  embedding_dimension: number;
  accuracy_score?: number;
  is_active: boolean;
  released_at: string;
  deprecated_at?: string;
  notes?: string;
}

// ============================================================================
// Device & Context Types
// ============================================================================

/**
 * Device information for context
 */
export interface DeviceInfo {
  userAgent?: string;
  platform?: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  hasWebGL: boolean;
  gpuTier?: 'low' | 'medium' | 'high';
}

/**
 * Location information for context
 */
export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  region?: string;
}

// ============================================================================
// Capture Types
// ============================================================================

/**
 * Captured muzzle image with metadata
 */
export interface CapturedImage {
  id: string;
  blob: Blob;
  dataUrl: string;
  timestamp: number;
  metadata: ImageMetadata;
}

/**
 * Metadata for captured image
 */
export interface ImageMetadata {
  width: number;
  height: number;
  brightness: number; // 0-100
  blur: number; // 0-100 (higher = more blur)
  distance: 'too_close' | 'optimal' | 'too_far';
  lighting: 'poor' | 'acceptable' | 'good';
  motion: boolean;
}

// ============================================================================
// Consent Types
// ============================================================================

/**
 * Consent record for biometric data collection
 */
export interface ConsentRecord {
  userId: string;
  animalId: string;
  consentType: 'biometric_collection' | 'data_sharing' | 'analytics';
  consentGiven: boolean;
  timestamp: string;
  consentText: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Muzzle-specific error codes
 */
export enum MuzzleErrorCode {
  // Capture errors
  CAMERA_ACCESS_DENIED = 'CAMERA_ACCESS_DENIED',
  CAMERA_NOT_AVAILABLE = 'CAMERA_NOT_AVAILABLE',
  IMAGE_QUALITY_TOO_LOW = 'IMAGE_QUALITY_TOO_LOW',
  
  // ML errors
  MODEL_LOAD_FAILED = 'MODEL_LOAD_FAILED',
  MODEL_NOT_CACHED = 'MODEL_NOT_CACHED',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
  EXTRACTION_TIMEOUT = 'EXTRACTION_TIMEOUT',
  
  // Identification errors
  NO_MATCH_FOUND = 'NO_MATCH_FOUND',
  MULTIPLE_MATCHES = 'MULTIPLE_MATCHES',
  SEARCH_TIMEOUT = 'SEARCH_TIMEOUT',
  
  // Registration errors
  DUPLICATE_DETECTED = 'DUPLICATE_DETECTED',
  ANIMAL_ALREADY_REGISTERED = 'ANIMAL_ALREADY_REGISTERED',
  
  // Network errors
  OFFLINE_NO_LOCAL_DATA = 'OFFLINE_NO_LOCAL_DATA',
  SYNC_FAILED = 'SYNC_FAILED',

  // Security errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Device errors
  DEVICE_NOT_SUPPORTED = 'DEVICE_NOT_SUPPORTED',
  INSUFFICIENT_MEMORY = 'INSUFFICIENT_MEMORY',
}

/**
 * Recovery action for muzzle errors
 */
export type RecoveryAction = 
  | { type: 'retry' }
  | { type: 'retake_photo'; guidance: string }
  | { type: 'enable_camera' }
  | { type: 'download_model' }
  | { type: 'use_server_fallback' }
  | { type: 'wait_for_connection' }
  | { type: 'contact_support' };

/**
 * Muzzle error with recovery information
 */
export interface MuzzleError {
  code: MuzzleErrorCode;
  message: string;
  messageAm: string; // Amharic translation
  recoveryAction?: RecoveryAction;
  retryable: boolean;
}

// ============================================================================
// Device Capability Types
// ============================================================================

/**
 * Device capability assessment
 */
export interface DeviceCapability {
  canRunMLLocally: boolean;
  hasWebGL: boolean;
  estimatedRAM: number;
  gpuTier: 'low' | 'medium' | 'high';
  recommendedMode: 'local' | 'server' | 'lite';
  batteryLevel?: number;
  isLowPowerMode: boolean;
}

/**
 * Inference mode for ML processing
 */
export type InferenceMode = 'local' | 'server';
