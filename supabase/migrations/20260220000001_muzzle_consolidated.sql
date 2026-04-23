-- Consolidated migration for muzzle identification enhancements
-- Migration: 20260220000001_muzzle_consolidated.sql

-- ============================================================================
-- Part 1: Add missing columns to muzzle_embeddings table
-- ============================================================================

-- Add columns if they don't exist
ALTER TABLE muzzle_embeddings 
ADD COLUMN IF NOT EXISTS confirmed_match BOOLEAN,
ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS model_version TEXT DEFAULT 'mobilenetv3-feature-v1',
ADD COLUMN IF NOT EXISTS crop_info JSONB,
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5,2);

-- Add index for confirmation queries
CREATE INDEX IF NOT EXISTS idx_muzzle_embeddings_confirmed 
ON muzzle_embeddings(confirmed_match) 
WHERE confirmed_match IS NOT NULL;

-- ============================================================================
-- Part 2: Add HNSW index for faster vector similarity search
-- ============================================================================

-- Drop existing IVFFlat index if you want to replace with HNSW
-- DROP INDEX IF EXISTS idx_muzzle_embeddings_cosine;

-- Add HNSW index (cosine is perfect for L2-normalized embeddings)
CREATE INDEX IF NOT EXISTS idx_muzzle_embeddings_hnsw_cosine
ON muzzle_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- Part 3: Add muzzle_rescan reminder type
-- ============================================================================

-- Add muzzle_rescan to reminder types if user_reminders exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_reminders') THEN
    ALTER TABLE user_reminders 
    DROP CONSTRAINT IF EXISTS user_reminders_type_check;
    
    ALTER TABLE user_reminders 
    ADD CONSTRAINT user_reminders_type_check 
    CHECK (type IN (
      'milk_morning',
      'milk_afternoon',
      'vaccination',
      'health_check',
      'breeding',
      'muzzle_rescan',
      'custom'
    ));
  END IF;
END
$$;

-- ============================================================================
-- Part 4: Functions for re-scan reminders
-- ============================================================================

-- Function to check if animal needs re-scan based on age
CREATE OR REPLACE FUNCTION needs_muzzle_rescan(p_animal_id UUID)
RETURNS TABLE (
  needs_rescan BOOLEAN,
  age_months INTEGER,
  last_scan_date TIMESTAMPTZ,
  days_since_scan INTEGER
) AS $$
DECLARE
  v_birth_date DATE;
  v_age_months INTEGER;
  v_last_scan TIMESTAMPTZ;
  v_days_since_scan INTEGER;
BEGIN
  SELECT birth_date INTO v_birth_date
  FROM animals WHERE id = p_animal_id;

  SELECT MAX(capture_date) INTO v_last_scan
  FROM muzzle_embeddings
  WHERE animal_id = p_animal_id;

  IF v_birth_date IS NOT NULL THEN
    v_age_months := EXTRACT(YEAR FROM AGE(v_birth_date)) * 12 + 
                    EXTRACT(MONTH FROM AGE(v_birth_date));
  ELSE
    v_age_months := NULL;
  END IF;

  IF v_last_scan IS NOT NULL THEN
    v_days_since_scan := EXTRACT(DAY FROM NOW() - v_last_scan);
  ELSE
    v_days_since_scan := NULL;
  END IF;

  needs_rescan := (
    v_age_months IS NOT NULL AND 
    v_age_months < 12 AND 
    (v_last_scan IS NULL OR v_days_since_scan > 60)
  );

  RETURN QUERY SELECT needs_rescan, v_age_months, v_last_scan, v_days_since_scan;
END;
$$ LANGUAGE plpgsql;

-- Function to get animals needing re-scan
CREATE OR REPLACE FUNCTION get_animals_needing_rescan(user_uuid UUID)
RETURNS TABLE (
  animal_id UUID,
  animal_name TEXT,
  breed TEXT,
  age_months INTEGER,
  last_scan_date TIMESTAMPTZ,
  days_since_scan INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.breed,
    (EXTRACT(YEAR FROM AGE(a.birth_date)) * 12 + EXTRACT(MONTH FROM AGE(a.birth_date)))::INTEGER AS age_months,
    mr.last_scan_date,
    EXTRACT(DAY FROM NOW() - mr.last_scan_date)::INTEGER AS days_since_scan
  FROM animals a
  CROSS JOIN LATERAL (
    SELECT MAX(capture_date) as last_scan_date
    FROM muzzle_embeddings
    WHERE animal_id = a.id
  ) mr
  WHERE a.user_id = user_uuid
    AND a.birth_date > NOW() - INTERVAL '12 months'
    AND a.birth_date IS NOT NULL
    AND (
      mr.last_scan_date IS NULL 
      OR mr.last_scan_date < NOW() - INTERVAL '60 days'
    )
  ORDER BY a.birth_date DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Part 5: Update match function to include owner_id
-- ============================================================================

CREATE OR REPLACE FUNCTION match_muzzle_embeddings(
  query_embedding vector(512),
  match_threshold DECIMAL(5,4) DEFAULT 0.7,
  match_count INTEGER DEFAULT 10,
  owner_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  animal_id UUID,
  similarity DECIMAL(5,4),
  image_url TEXT,
  capture_date TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    me.id,
    me.animal_id,
    (me.embedding <=> query_embedding) AS similarity,
    me.image_url,
    me.capture_date
  FROM muzzle_embeddings me
  WHERE me.embedding <=> query_embedding < (1 - match_threshold)
    AND (owner_id IS NULL OR me.user_id = owner_id)
  ORDER BY me.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

SELECT 'Muzzle identification consolidated migration completed' AS status;
