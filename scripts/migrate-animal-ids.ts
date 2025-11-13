#!/usr/bin/env tsx

/**
 * Migration Script: Add Animal IDs to Existing Animals
 *
 * This script generates professional animal IDs for animals that don't have them yet.
 * It processes animals in batches to avoid overwhelming the database.
 */

import { createClient } from '@supabase/supabase-js';
import { generateAnimalId } from '../src/utils/animalIdGenerator';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const BATCH_SIZE = 10; // Process 10 animals at a time
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function migrateAnimalIds() {
  console.log('🚀 Starting animal ID migration...');

  try {
    // Get count of animals without IDs
    const { count: totalCount } = await supabase
      .from('animals')
      .select('*', { count: 'exact', head: true })
      .is('animal_id', null);

    console.log(`📊 Found ${totalCount} animals without IDs`);

    if (!totalCount || totalCount === 0) {
      console.log('✅ All animals already have IDs!');
      return;
    }

    let processed = 0;
    let successCount = 0;
    let errorCount = 0;

    // Process in batches
    while (processed < totalCount) {
      console.log(`\n📦 Processing batch ${Math.floor(processed / BATCH_SIZE) + 1}...`);

      // Get next batch of animals without IDs
      const { data: animals, error: fetchError } = await supabase
        .from('animals')
        .select('id, user_id, type, subtype, name')
        .is('animal_id', null)
        .range(processed, processed + BATCH_SIZE - 1);

      if (fetchError) {
        console.error('❌ Error fetching animals:', fetchError);
        break;
      }

      if (!animals || animals.length === 0) {
        break; // No more animals to process
      }

      // Process each animal in the batch
      for (const animal of animals) {
        try {
          console.log(`  🔄 Processing ${animal.name || 'Unnamed'} (${animal.type})...`);

          // Generate ID using the professional system
          const animalId = await generateAnimalId(animal.user_id, animal.type);

          // Update the animal with the new ID
          const { error: updateError } = await supabase
            .from('animals')
            .update({
              animal_id: animalId,
              updated_at: new Date().toISOString()
            })
            .eq('id', animal.id);

          if (updateError) {
            console.error(`    ❌ Failed to update animal ${animal.id}:`, updateError);
            errorCount++;
          } else {
            console.log(`    ✅ Assigned ID: ${animalId}`);
            successCount++;
          }

        } catch (error) {
          console.error(`    ❌ Error processing animal ${animal.id}:`, error);
          errorCount++;
        }
      }

      processed += animals.length;

      // Progress update
      console.log(`📈 Progress: ${processed}/${totalCount} animals processed`);

      // Delay between batches to avoid overwhelming the database
      if (processed < totalCount) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
        await sleep(DELAY_BETWEEN_BATCHES);
      }
    }

    // Final summary
    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully processed: ${successCount} animals`);
    console.log(`❌ Errors: ${errorCount} animals`);
    console.log(`📊 Total processed: ${processed} animals`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some animals failed to migrate. Check the logs above for details.');
      console.log('You may need to run the migration again for failed animals.');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Verification function
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');

  try {
    // Check for animals without IDs
    const { count: nullCount } = await supabase
      .from('animals')
      .select('*', { count: 'exact', head: true })
      .is('animal_id', null);

    // Check for duplicate IDs using raw SQL
    const { data: duplicates } = await supabase
      .rpc('get_duplicate_animal_ids');

    console.log(`📊 Animals without IDs: ${nullCount || 0}`);
    console.log(`📊 Duplicate IDs found: ${duplicates?.length || 0}`);

    if (nullCount === 0 && (!duplicates || duplicates.length === 0)) {
      console.log('✅ Migration verification passed!');
    } else {
      console.log('⚠️  Migration verification found issues.');
      if (nullCount && nullCount > 0) {
        console.log(`   - ${nullCount} animals still missing IDs`);
      }
      if (duplicates && duplicates.length > 0) {
        console.log(`   - ${duplicates.length} duplicate IDs found`);
      }
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  if (command === 'verify') {
    await verifyMigration();
  } else {
    await migrateAnimalIds();
    await verifyMigration();
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});