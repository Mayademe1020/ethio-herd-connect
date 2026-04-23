-- Migrate muzzle embeddings from 512-dim to 1280-dim for MobileNetV2
-- This is a breaking change: existing embeddings will be incompatible

-- Drop existing pgvector indexes (they reference the old dimension)
DROP INDEX IF EXISTS idx_muzzle_registrations_embedding;
DROP INDEX IF EXISTS idx_muzzle_embeddings_hnsw;

-- Alter the embedding column in muzzle_registrations
ALTER TABLE muzzle_registrations 
  ALTER COLUMN embedding TYPE vector(1280);

-- Recreate the IVFFlat index for muzzle_registrations
CREATE INDEX IF NOT EXISTS idx_muzzle_registrations_embedding 
  ON muzzle_registrations USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Update the search_similar_muzzles function to use 1280-dim
CREATE OR REPLACE FUNCTION search_similar_muzzles(
  query_embedding vector(1280),
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

-- Update the check_muzzle_duplicate function to use 1280-dim
CREATE OR REPLACE FUNCTION check_muzzle_duplicate(
  query_embedding vector(1280),
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

-- Update model versions table to reflect new dimension
UPDATE muzzle_model_versions 
SET embedding_dimension = 1280, is_active = false
WHERE is_active = true;

-- Insert new model version record
INSERT INTO muzzle_model_versions (version, model_url, embedding_dimension, is_active, notes)
VALUES ('2.0.0-mobilenetv2', '/models/mobilenetv2/', 1280, true, 'MobileNetV2 feature extraction')
ON CONFLICT (version) DO UPDATE SET 
  embedding_dimension = 1280,
  is_active = true;

-- Clear existing muzzle registrations (incompatible with new dimension)
-- This is intentional — old embeddings won't work with the new model
TRUNCATE TABLE muzzle_registrations, muzzle_identification_logs, muzzle_duplicate_events CASCADE;
