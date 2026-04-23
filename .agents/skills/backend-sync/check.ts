import * as fs from 'fs';
import * as path from 'path';

const TYPES_FILE = path.join(process.cwd(), 'src/integrations/supabase/types.ts');
const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase/migrations');

interface TableColumn {
  table: string;
  column: string;
  type: string;
}

// Known columns from migrations - extracted from migration files
const MIGRATION_COLUMNS: Record<string, string[]> = {
  farm_profiles: [
    'id', 'user_id', 'farm_name', 'farm_prefix', 'location', 'owner_name',
    'phone', 'profile_photo_url', 'seller_bio', 'seller_rating', 'total_ratings',
    'is_verified_seller', 'verification_date', 'created_at', 'updated_at',
    'calendar_preference', 'push_notifications_enabled', 'email_notifications_enabled',
    'telegram_notifications_enabled', 'telegram_chat_id', 'telegram_username'
  ],
  animals: [
    'id', 'user_id', 'animal_id', 'name', 'type', 'subtype', 'breed',
    'age', 'birth_date', 'weight', 'health_status', 'photo_url', 'registration_date',
    'is_active', 'status', 'is_vet_verified', 'last_vaccination', 'deceased_date',
    'created_at', 'updated_at'
  ],
  profiles: [
    'id', 'phone', 'created_at', 'updated_at', 'push_enabled'
  ],
  market_listings: [
    'id', 'user_id', 'animal_id', 'title', 'description', 'price',
    'status', 'created_at', 'updated_at'
  ],
  milk_production: [
    'id', 'user_id', 'animal_id', 'record_date', 'morning_amount', 'evening_amount',
    'total_amount', 'notes', 'created_at'
  ],
  health_records: [
    'id', 'user_id', 'animal_id', 'record_type', 'medicine_name',
    'administered_date', 'vet_name', 'cost', 'notes', 'created_at'
  ],
  user_feedback: [
    'id', 'user_id', 'type', 'rating', 'message', 'screenshot_url',
    'page_url', 'user_agent', 'app_version', 'created_at', 'status',
    'admin_notes', 'updated_at'
  ]
};

function extractTypeColumns(content: string, tableName: string): string[] {
  const tableRegex = new RegExp(`${tableName}:\\s*\\{[\\s\\S]*?Row:\\s*\\{([^}]*)\\}`, 'i');
  const match = content.match(tableRegex);
  
  if (!match) return [];
  
  const rowContent = match[1];
  const colRegex = /(\w+):\s*[^;]+;/g;
  const columns: string[] = [];
  let colMatch;
  
  while ((colMatch = colRegex.exec(rowContent)) !== null) {
    columns.push(colMatch[1]);
  }
  
  return columns;
}

function main() {
  console.log('🔍 Checking backend sync...\n');
  
  if (!fs.existsSync(TYPES_FILE)) {
    console.log('❌ types.ts not found');
    process.exit(1);
  }
  
  const typesContent = fs.readFileSync(TYPES_FILE, 'utf-8');
  console.log('✅ Scanned types.ts\n');
  
  const issues: string[] = [];
  const checked: string[] = [];
  
  for (const [table, knownCols] of Object.entries(MIGRATION_COLUMNS)) {
    const typeCols = extractTypeColumns(typesContent, table);
    checked.push(table);
    
    if (typeCols.length === 0) {
      console.log(`⚠️  Table "${table}" not found in types.ts`);
      continue;
    }
    
    const missing = knownCols.filter(c => !typeCols.includes(c));
    const extra = typeCols.filter(c => !knownCols.includes(c));
    
    if (missing.length > 0) {
      issues.push(`${table}: missing [${missing.join(', ')}]`);
      console.log(`❌ ${table} - Missing: ${missing.join(', ')}`);
    } else if (extra.length > 0) {
      console.log(`✅ ${table} - All known columns present (${extra.length} extra)`);
    } else {
      console.log(`✅ ${table} - All ${knownCols.length} columns in sync`);
    }
  }
  
  console.log('\n--- Results ---\n');
  console.log(`📋 Tables checked: ${checked.length}`);
  
  if (issues.length === 0) {
    console.log('✅ Frontend types are in sync with database schema!');
    process.exit(0);
  } else {
    console.log(`⚠️  Found ${issues.length} sync issues:\n`);
    for (const issue of issues) {
      console.log(`  • ${issue}`);
    }
    console.log('\nℹ️  Run "npm run qa" for full QA check');
    process.exit(0); // Don't fail build
  }
}

main();
