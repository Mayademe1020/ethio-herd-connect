import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pbtaolycccmmqmwurinp.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

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
