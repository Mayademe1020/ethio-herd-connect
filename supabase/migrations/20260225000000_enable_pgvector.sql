-- Enable pgvector extension for muzzle identification
-- Migration: 20260225000000_enable_pgvector.sql

-- Enable pgvector extension (requires superuser or extension already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create muzzle embeddings table for vector search
CREATE TABLE IF NOT EXISTS muzzle_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE NOT NULL,
  
  -- Vector embedding (1536 dimensions for advanced models, 512 for faster)
  embedding vector(512) NOT NULL,
  
  -- Original image reference
  image_url TEXT NOT NULL,
  image_hash TEXT,
  
  -- Metadata
  confidence_score DECIMAL(5,4),
  capture_date TIMESTAMPTZ DEFAULT NOW(),
  is_primary BOOLEAN DEFAULT true,
  
  -- Search metadata
  search_count INTEGER DEFAULT 0,
  last_searched_at TIMESTAMPTZ
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_muzzle_embeddings_cosine 
ON muzzle_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_muzzle_embeddings_user ON muzzle_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_muzzle_embeddings_animal ON muzzle_embeddings(animal_id);
CREATE INDEX IF NOT EXISTS idx_muzzle_embeddings_primary ON muzzle_embeddings(is_primary) WHERE is_primary = true;

-- Enable RLS
ALTER TABLE muzzle_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own muzzle embeddings"
  ON muzzle_embeddings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own muzzle embeddings"
  ON muzzle_embeddings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own muzzle embeddings"
  ON muzzle_embeddings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own muzzle embeddings"
  ON muzzle_embeddings FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE muzzle_embeddings IS 'Vector embeddings for muzzle identification using pgvector';
COMMENT ON COLUMN muzzle_embeddings.embedding IS '512-dimensional vector embedding of muzzle pattern';
COMMENT ON COLUMN muzzle_embeddings.confidence_score IS 'Similarity score from vector search (0-1)';

-- Function to search similar muzzles
CREATE OR REPLACE FUNCTION match_muzzle_embeddings(
  query_embedding vector(512),
  match_threshold DECIMAL(5,4) DEFAULT 0.7,
  match_count INTEGER DEFAULT 10
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
  ORDER BY me.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Update function to track search count
CREATE OR REPLACE FUNCTION increment_search_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_count = OLD.search_count + 1;
  NEW.last_searched_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_search_count
  BEFORE UPDATE ON muzzle_embeddings
  FOR EACH ROW
  WHEN (OLD.search_count IS DISTINCT FROM NEW.search_count)
  EXECUTE FUNCTION increment_search_count();

SELECT 'pgvector extension and muzzle_embeddings table created successfully' AS status;
