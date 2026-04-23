-- Muzzle Identification System Schema
-- This migration creates tables for cattle muzzle biometric identification

-- Enable pgvector extension for similarity search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- Table: muzzle_registrations
-- Stores muzzle biometric data linked to animals
-- ============================================================================
CREATE TABLE IF NOT EXISTS muzzle_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Embedding data (512-dimensional vector for muzzle features)
  embedding vector(512) NOT NULL,
  embedding_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  
  -- Image references
  image_url TEXT,
  thumbnail_url TEXT,
  
  -- Quality metadata
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  capture_conditions JSONB DEFAULT '{}',
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- Consent tracking
  consent_given BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  
  -- Ensure one active muzzle per animal
  CONSTRAINT unique_active_muzzle_per_animal UNIQUE (animal_id)
);

-- Index for vector similarity search using IVFFlat
CREATE INDEX IF NOT EXISTS idx_muzzle_registrations_embedding 
  ON muzzle_registrations 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_muzzle_registrations_user_id 
  ON muzzle_registrations(user_id);

-- Index for active registrations
CREATE INDEX IF NOT EXISTS idx_muzzle_registrations_active 
  ON muzzle_registrations(is_active) 
  WHERE is_active = true;

-- ============================================================================
-- Table: muzzle_identification_logs
-- Audit log for all identification attempts
-- ============================================================================
CREATE TABLE IF NOT EXISTS muzzle_identification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Search details (store embedding as vector for potential re-analysis)
  search_embedding vector(512),
  search_mode VARCHAR(20) NOT NULL CHECK (search_mode IN ('local', 'cloud', 'hybrid')),
  
  -- Results
  result_status VARCHAR(20) NOT NULL CHECK (result_status IN ('match', 'possible_match', 'no_match', 'error')),
  matched_animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  matched_registration_id UUID REFERENCES muzzle_registrations(id) ON DELETE SET NULL,
  confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  alternatives JSONB DEFAULT '[]', -- Array of possible matches with scores
  
  -- Context
  device_info JSONB DEFAULT '{}',
  location_info JSONB DEFAULT '{}',
  
  -- Performance metrics
  search_duration_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user identification history
CREATE INDEX IF NOT EXISTS idx_muzzle_identification_logs_user_id 
  ON muzzle_identification_logs(user_id);

-- Index for matched animals
CREATE INDEX IF NOT EXISTS idx_muzzle_identification_logs_matched_animal 
  ON muzzle_identification_logs(matched_animal_id) 
  WHERE matched_animal_id IS NOT NULL;

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_muzzle_identification_logs_created_at 
  ON muzzle_identification_logs(created_at DESC);

-- ============================================================================
-- Table: muzzle_duplicate_events
-- Records potential duplicate muzzle detections for fraud prevention
-- ============================================================================
CREATE TABLE IF NOT EXISTS muzzle_duplicate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The new registration attempt
  attempted_animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  attempted_user_id UUID NOT NULL,
  attempted_embedding vector(512),
  
  -- The existing match
  existing_registration_id UUID REFERENCES muzzle_registrations(id) ON DELETE SET NULL,
  existing_animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  existing_user_id UUID,
  
  -- Similarity score
  similarity_score DECIMAL(5,4) NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 1),
  
  -- Resolution
  resolution VARCHAR(30) CHECK (resolution IN ('continued', 'transfer_requested', 'fraud_reported', 'cancelled', 'pending')),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for pending duplicates
CREATE INDEX IF NOT EXISTS idx_muzzle_duplicate_events_pending 
  ON muzzle_duplicate_events(resolution) 
  WHERE resolution = 'pending' OR resolution IS NULL;

-- Index for user's duplicate events
CREATE INDEX IF NOT EXISTS idx_muzzle_duplicate_events_user 
  ON muzzle_duplicate_events(attempted_user_id);

-- ============================================================================
-- Table: ownership_transfers
-- Tracks animal ownership transfers with muzzle verification
-- ============================================================================
CREATE TABLE IF NOT EXISTS ownership_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  
  -- Transfer parties
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  
  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'awaiting_verification', 'verified', 'disputed', 'completed', 'cancelled')),
  
  -- Muzzle verification
  muzzle_verified BOOLEAN DEFAULT false,
  verification_attempts INTEGER DEFAULT 0,
  last_verification_at TIMESTAMPTZ,
  verification_confidence DECIMAL(5,4) CHECK (verification_confidence >= 0 AND verification_confidence <= 1),
  
  -- Timestamps
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Dispute handling
  dispute_reason TEXT,
  dispute_resolved_at TIMESTAMPTZ,
  
  -- Ensure transfer is between different users
  CONSTRAINT valid_transfer CHECK (from_user_id != to_user_id)
);

-- Index for pending transfers
CREATE INDEX IF NOT EXISTS idx_ownership_transfers_pending 
  ON ownership_transfers(status) 
  WHERE status IN ('pending', 'awaiting_verification');

-- Index for user's transfers (as sender)
CREATE INDEX IF NOT EXISTS idx_ownership_transfers_from_user 
  ON ownership_transfers(from_user_id);

-- Index for user's transfers (as receiver)
CREATE INDEX IF NOT EXISTS idx_ownership_transfers_to_user 
  ON ownership_transfers(to_user_id);

-- Index for animal transfers
CREATE INDEX IF NOT EXISTS idx_ownership_transfers_animal 
  ON ownership_transfers(animal_id);

-- ============================================================================
-- Table: muzzle_model_versions
-- Tracks ML model versions for embedding compatibility
-- ============================================================================
CREATE TABLE IF NOT EXISTS muzzle_model_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(20) NOT NULL UNIQUE,
  model_url TEXT NOT NULL,
  model_size_bytes INTEGER,
  embedding_dimension INTEGER DEFAULT 512,
  accuracy_score DECIMAL(5,4) CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
  is_active BOOLEAN DEFAULT false,
  released_at TIMESTAMPTZ DEFAULT NOW(),
  deprecated_at TIMESTAMPTZ,
  notes TEXT
);

-- Index for active model
CREATE INDEX IF NOT EXISTS idx_muzzle_model_versions_active 
  ON muzzle_model_versions(is_active) 
  WHERE is_active = true;

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to search for similar muzzles using cosine similarity
CREATE OR REPLACE FUNCTION search_similar_muzzles(
  query_embedding vector(512),
  similarity_threshold DECIMAL DEFAULT 0.7,
  max_results INTEGER DEFAULT 5
)
RETURNS TABLE (
  registration_id UUID,
  animal_id UUID,
  user_id UUID,
  similarity DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.id as registration_id,
    mr.animal_id,
    mr.user_id,
    (1 - (mr.embedding <=> query_embedding))::DECIMAL as similarity
  FROM muzzle_registrations mr
  WHERE mr.is_active = true
    AND (1 - (mr.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY mr.embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for duplicate muzzles before registration
CREATE OR REPLACE FUNCTION check_muzzle_duplicate(
  query_embedding vector(512),
  threshold DECIMAL DEFAULT 0.85
)
RETURNS TABLE (
  is_duplicate BOOLEAN,
  existing_registration_id UUID,
  existing_animal_id UUID,
  existing_user_id UUID,
  similarity_score DECIMAL
) AS $$
DECLARE
  match_record RECORD;
BEGIN
  SELECT 
    mr.id,
    mr.animal_id,
    mr.user_id,
    (1 - (mr.embedding <=> query_embedding))::DECIMAL as similarity
  INTO match_record
  FROM muzzle_registrations mr
  WHERE mr.is_active = true
    AND (1 - (mr.embedding <=> query_embedding)) >= threshold
  ORDER BY mr.embedding <=> query_embedding
  LIMIT 1;
  
  IF match_record IS NOT NULL THEN
    RETURN QUERY SELECT 
      true,
      match_record.id,
      match_record.animal_id,
      match_record.user_id,
      match_record.similarity;
  ELSE
    RETURN QUERY SELECT 
      false,
      NULL::UUID,
      NULL::UUID,
      NULL::UUID,
      NULL::DECIMAL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_muzzle_registration_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_muzzle_registration_updated_at ON muzzle_registrations;
CREATE TRIGGER trigger_muzzle_registration_updated_at
  BEFORE UPDATE ON muzzle_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_muzzle_registration_timestamp();

-- ============================================================================
-- Add muzzle_status column to animals table
-- ============================================================================
ALTER TABLE animals 
ADD COLUMN IF NOT EXISTS muzzle_status VARCHAR(20) DEFAULT 'not_registered'
  CHECK (muzzle_status IN ('not_registered', 'registered', 'pending_update'));

-- Index for muzzle status filtering
CREATE INDEX IF NOT EXISTS idx_animals_muzzle_status 
  ON animals(muzzle_status);

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE muzzle_registrations IS 'Stores muzzle biometric embeddings for animal identification';
COMMENT ON TABLE muzzle_identification_logs IS 'Audit log for all muzzle identification attempts';
COMMENT ON TABLE muzzle_duplicate_events IS 'Records potential duplicate muzzle detections for fraud prevention';
COMMENT ON TABLE ownership_transfers IS 'Tracks animal ownership transfers with muzzle verification';
COMMENT ON TABLE muzzle_model_versions IS 'Tracks ML model versions for embedding compatibility';
COMMENT ON FUNCTION search_similar_muzzles IS 'Searches for similar muzzle patterns using cosine similarity';
COMMENT ON FUNCTION check_muzzle_duplicate IS 'Checks if a muzzle embedding already exists in the database';
