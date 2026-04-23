import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pbtaolycccmmqmwurinp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMigration() {
  console.log('🔍 Verifying vaccination system migration...\n');
  
  try {
    // Check vaccine_presets table
    console.log('1. Checking vaccine_presets table...');
    const { data: vaccines, error: vaccineError } = await supabase
      .from('vaccine_presets')
      .select('*')
      .order('name');
    
    if (vaccineError) {
      console.error('   ❌ Error:', vaccineError.message);
    } else {
      console.log(`   ✅ Found ${vaccines.length} vaccines:`);
      vaccines.forEach(v => {
        console.log(`      • ${v.name} (${v.animal_type}) - every ${v.interval_months} months`);
      });
    }
    
    // Check health_records columns
    console.log('\n2. Checking health_records table columns...');
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'health_records' });
    
    if (columnError) {
      // Alternative: try to select specific columns
      const { data: testRecord, error: testError } = await supabase
        .from('health_records')
        .select('reminder_sent_14, reminder_sent_7, reminder_sent_3, reminder_sent_0, next_due_date')
        .limit(1);
      
      if (testError) {
        console.error('   ❌ Error:', testError.message);
      } else {
        console.log('   ✅ Reminder columns exist in health_records table');
      }
    } else {
      const reminderColumns = columns?.filter((c: any) => 
        c.column_name?.includes('reminder') || c.column_name === 'next_due_date'
      );
      console.log(`   ✅ Found ${reminderColumns?.length || 0} reminder-related columns`);
    }
    
    // Check indexes
    console.log('\n3. Checking indexes...');
    const { data: indexes, error: indexError } = await supabase
      .rpc('get_indexes', { table_name: 'health_records' });
    
    if (indexError) {
      console.log('   ⚠️  Could not verify indexes (RPC not available)');
    } else {
      const vaccinationIndex = indexes?.find((i: any) => 
        i.indexname?.includes('vaccination')
      );
      if (vaccinationIndex) {
        console.log('   ✅ Vaccination index exists');
      } else {
        console.log('   ⚠️  Vaccination index not found');
      }
    }
    
    console.log('\n✅ Migration verification complete!');
    
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
  }
}

verifyMigration();
