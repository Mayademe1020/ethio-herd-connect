import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', SUPABASE_URL);
console.log('Key length:', SERVICE_ROLE_KEY?.length);
console.log('Key preview:', SERVICE_ROLE_KEY?.slice(0, 20) + '...' + SERVICE_ROLE_KEY?.slice(-20));

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Check what exists
const checks = [
  { name: 'muzzle_registrations', fn: () => supabase.from('muzzle_registrations').select('id').limit(1) },
  { name: 'muzzle_identification_logs', fn: () => supabase.from('muzzle_identification_logs').select('id').limit(1) },
  { name: 'muzzle_duplicate_events', fn: () => supabase.from('muzzle_duplicate_events').select('id').limit(1) },
  { name: 'ownership_transfers', fn: () => supabase.from('ownership_transfers').select('id').limit(1) },
  { name: 'muzzle_model_versions', fn: () => supabase.from('muzzle_model_versions').select('*').limit(1) },
  { name: 'search_similar_muzzles', fn: () => supabase.rpc('search_similar_muzzles', { query_embedding: new Array(512).fill(0), similarity_threshold: 0.7, max_results: 1 }) },
  { name: 'check_muzzle_duplicate', fn: () => supabase.rpc('check_muzzle_duplicate', { query_embedding: new Array(512).fill(0), threshold: 0.85 }) },
];

for (const check of checks) {
  try {
    const { data, error } = await check.fn();
    if (error && error.code === '42P01') {
      console.log(`${check.name}: TABLE DOES NOT EXIST`);
    } else if (error && error.code === '42883') {
      console.log(`${check.name}: FUNCTION DOES NOT EXIST`);
    } else if (error && error.code === 'PGRST202') {
      console.log(`${check.name}: EXISTS (function returns 0 rows)`);
    } else if (error && error.code === 'PGRST116') {
      console.log(`${check.name}: EXISTS (table empty)`);
    } else if (error) {
      console.log(`${check.name}: ERROR - ${error.message.slice(0, 80)}`);
    } else {
      console.log(`${check.name}: EXISTS`);
      if (data && data.length > 0) {
        console.log(`  Sample: ${JSON.stringify(data[0]).slice(0, 100)}`);
      }
    }
  } catch (e) {
    console.log(`${check.name}: EXCEPTION - ${e.message.slice(0, 80)}`);
  }
}
