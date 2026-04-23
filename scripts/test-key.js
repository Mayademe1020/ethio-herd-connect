import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbtaolycccmmqmwurinp.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBidGFvbHljY2NtbXFtd3VyaW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTAzMzIsImV4cCI6MjA2NTc2NjMzMn0.yRMyz5je_YUJCgpwi-cbx8G-yocjfriRfyliTtk5p28';

console.log('Anon key length:', ANON_KEY.length);

const supabase = createClient(SUPABASE_URL, ANON_KEY);

// Simple test - query a known table
const { data, error } = await supabase.from('animals').select('id').limit(1);
console.log('Animals query:', error ? `ERROR: ${error.message}` : `OK, found ${data?.length || 0} rows`);

// Try muzzle_registrations
const { data: muzzle, error: muzzleError } = await supabase.from('muzzle_registrations').select('id').limit(1);
console.log('Muzzle query:', muzzleError ? `ERROR: ${muzzleError.message}` : `OK, found ${muzzle?.length || 0} rows`);
