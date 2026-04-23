import { readFileSync } from 'fs';

const PROJECT_REF = 'pbtaolycccmmqmwurinp';
const ACCESS_TOKEN = 'sbp_606adf37f1cf2ab0abf0b938d789ef21b821b324';

const sql = readFileSync('supabase/migrations/20260331000000_migrate_to_mobilenetv2_1280dim.sql', 'utf-8');

console.log('Executing entire migration SQL via Management API...');

try {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (response.ok) {
    console.log('Migration executed successfully!');
  } else {
    const error = await response.text();
    console.log('ERROR:', error.slice(0, 500));
  }
} catch (e) {
  console.log('EXCEPTION:', e.message);
}
