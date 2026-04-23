const PROJECT_REF = 'pbtaolycccmmqmwurinp';
const ACCESS_TOKEN = 'sbp_606adf37f1cf2ab0abf0b938d789ef21b821b324';

const sql = `
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%muzzle%'
ORDER BY table_name;
`;

const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
  },
  body: JSON.stringify({ query: sql })
});

const data = await response.json();
console.log('Muzzle-related tables:', JSON.stringify(data, null, 2));
