import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pbtaolycccmmqmwurinp.supabase.co',
  'eyJhbGciOiJzdXBhYmFzZSIsInJlZiI6InBidGFvbHljY2NtbXFtd3VyaW5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5MDMzMiwiZXhwIjoyMDY1NzY2MzMyfQ.SWe6iaYO7tP9xnJ5A26LcVcFZ5RUsj-TJUid6xbYxPo'
);

// Check embedding column dimension
const { data, error } = await supabase
  .from('muzzle_registrations')
  .select('embedding')
  .limit(1);

console.log('Query result:', data);
console.log('Error:', error);

// Try calling search_similar_muzzles with 512-dim vector
const test512 = new Array(512).fill(0);
const { data: result512, error: err512 } = await supabase.rpc('search_similar_muzzles', {
  query_embedding: test512,
  similarity_threshold: 0.7,
  max_results: 1
});
console.log('512-dim search:', err512 ? `ERROR: ${err512.message}` : 'OK');

// Try with 1280-dim vector
const test1280 = new Array(1280).fill(0);
const { data: result1280, error: err1280 } = await supabase.rpc('search_similar_muzzles', {
  query_embedding: test1280,
  similarity_threshold: 0.7,
  max_results: 1
});
console.log('1280-dim search:', err1280 ? `ERROR: ${err1280.message}` : 'OK');

// Check model versions
const { data: models } = await supabase.from('muzzle_model_versions').select('*');
console.log('Model versions:', models);
