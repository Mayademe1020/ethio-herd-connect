import { readFileSync } from 'fs';

const PROJECT_REF = 'pbtaolycccmmqmwurinp';
const ACCESS_TOKEN = 'sbp_606adf37f1cf2ab0abf0b938d789ef21b821b324';

// Run the original muzzle schema migration first
const schemaSql = readFileSync('supabase/migrations/20260112000000_muzzle_identification_schema.sql', 'utf-8');
const rlsSql = readFileSync('supabase/migrations/20260112000001_muzzle_identification_rls.sql', 'utf-8');

console.log('Running muzzle schema migration...');

try {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: schemaSql })
  });

  if (response.ok) {
    console.log('Schema migration: OK');
  } else {
    const error = await response.text();
    console.log('Schema migration ERROR:', error.slice(0, 500));
  }
} catch (e) {
  console.log('Schema migration EXCEPTION:', e.message);
}

console.log('\nRunning RLS policies migration...');

try {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: rlsSql })
  });

  if (response.ok) {
    console.log('RLS migration: OK');
  } else {
    const error = await response.text();
    console.log('RLS migration ERROR:', error.slice(0, 500));
  }
} catch (e) {
  console.log('RLS migration EXCEPTION:', e.message);
}
