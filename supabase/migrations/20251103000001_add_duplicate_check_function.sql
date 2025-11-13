-- Add function to check for duplicate animal IDs
-- Date: 2025-11-03

CREATE OR REPLACE FUNCTION get_duplicate_animal_ids()
RETURNS TABLE(animal_id TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT a.animal_id, COUNT(*) as count
  FROM animals a
  WHERE a.animal_id IS NOT NULL
  GROUP BY a.animal_id
  HAVING COUNT(*) > 1
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;