#!/usr/bin/env tsx
/**
 * Enhanced Demo Data Seeding Script v2.0
 * 
 * Features:
 * - Smart existence checks (idempotent)
 * - Schema awareness (validates columns exist)
 * - Detailed verification reports
 * - Safe repeatability
 * - Force flag for hard reseed
 * - Comprehensive error handling
 * 
 * Usage:
 *   npm run seed:demo           - Seed demo data (idempotent)
 *   npm run seed:demo --force   - Force reseed (delete + reseed)
 *   npm run reset:demo          - Clear demo data
 *   npm run verify:demo         - Detailed verification report
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Demo account configuration
const DEMO_ACCOUNTS = [
  { phone: '+251911234567', farmer_name: 'Abebe Kebede', farm_name: 'Abebe Farm' },
  { phone: '+251922345678', farmer_name: 'Chaltu Tadesse', farm_name: 'Chaltu Dairy' },
  { phone: '+251933456789', farmer_name: 'Dawit Haile', farm_name: 'Haile Ranch' }
];

const ANIMAL_NAMES = {
  cattle: ['Chaltu', 'Beza', 'Abebe', 'Tigist', 'Kebede', 'Almaz', 'Girma', 'Hanna'],
  goat: ['Mulu', 'Desta', 'Fikir', 'Genet', 'Hailu', 'Kassa'],
  sheep: ['Selam', 'Tewodros', 'Yeshi', 'Zewdu']
};

const PLACEHOLDER_IMAGES = {
  cattle: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800',
  goat: 'https://images.unsplash.com/photo-1533318087102-b3ad366ed041?w=800',
  sheep: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800'
};

// Schema cache
let schemaCache: Record<string, string[]> | null = null;

/**
 * Validate that required columns exist in a table
 */
async function validateSchema(tableName: string, requiredColumns: string[]): Promise<boolean> {
  if (!schemaCache) {
    schemaCache = {};
  }

  if (!schemaCache[tableName]) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`   ⚠️  Could not validate schema for ${tableName}:`, error.message);
      return false;
    }

    schemaCache[tableName] = data && data.length > 0 ? Object.keys(data[0]) : [];
  }

  const availableColumns = schemaCache[tableName];
  const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));

  if (missingColumns.length > 0) {
    console.error(`   ❌ Missing columns in ${tableName}:`, missingColumns.join(', '));
    console.error(`   📋 Available columns:`, availableColumns.join(', '));
    console.error(`   💡 You may need to apply a migration to add missing columns`);
    return false;
  }

  console.log(`   ✅ Schema validation passed for ${tableName}`);
  return true;
}


/**
 * Find existing demo accounts
 */
async function findExistingAccounts(): Promise<any[]> {
  const demoPhones = DEMO_ACCOUNTS.map(a => a.phone);

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('phone', demoPhones);

  if (!profiles || profiles.length === 0) {
    return [];
  }

  return profiles.map(p => ({
    phone: p.phone,
    farmer_name: p.farmer_name,
    farm_name: p.farm_name,
    user_id: p.id
  }));
}

/**
 * Create demo accounts with smart existence checks
 */
async function createDemoAccounts(force: boolean = false): Promise<any[]> {
  console.log('\n📝 Creating demo accounts...');

  if (!supabaseServiceKey) {
    console.log('   ⚠️  No SUPABASE_SERVICE_ROLE_KEY - checking for existing accounts...');
    const existing = await findExistingAccounts();
    if (existing.length > 0) {
      console.log(`   ✅ Found ${existing.length} existing demo accounts`);
      return existing;
    }
    console.log('   ❌ No existing accounts. Add SERVICE_ROLE_KEY to create them.');
    return [];
  }

  const createdAccounts = [];

  for (const account of DEMO_ACCOUNTS) {
    try {
      // In force mode, check for and delete any existing auth users with this phone first
      if (force) {
        try {
          const { data: users, error: listError } = await supabase.auth.admin.listUsers();
          if (listError) {
            console.error(`   ⚠️  Error listing users: ${listError.message}`);
          } else {
            // Phone numbers might be stored with or without the + prefix
            const phoneWithoutPlus = account.phone.replace('+', '');
            const existingAuthUser = users?.users.find(u =>
              u.phone === account.phone || u.phone === phoneWithoutPlus
            );
            if (existingAuthUser) {
              console.log(`   🔄 Force mode: Deleting existing auth user ${account.phone} (ID: ${existingAuthUser.id})...`);
              // Delete related data first
              await supabase.from('market_listings').delete().eq('user_id', existingAuthUser.id);
              await supabase.from('milk_production').delete().eq('user_id', existingAuthUser.id);
              await supabase.from('animals').delete().eq('user_id', existingAuthUser.id);
              await supabase.from('profiles').delete().eq('id', existingAuthUser.id);
              // Delete auth user last
              const { error: deleteError } = await supabase.auth.admin.deleteUser(existingAuthUser.id);
              if (deleteError) {
                console.error(`   ⚠️  Error deleting auth user: ${deleteError.message}`);
              } else {
                console.log(`   ✅ Deleted existing user ${account.phone}`);
              }
            }
          }
        } catch (err: any) {
          console.error(`   ⚠️  Error during force deletion: ${err.message}`);
        }
      }

      // Check if account exists (after potential deletion)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', account.phone)
        .maybeSingle();

      if (existingProfile && !force) {
        console.log(`   ℹ️  User ${account.phone} already exists, skipping creation.`);
        createdAccounts.push({ ...account, user_id: existingProfile.id });
        continue;
      }

      // Create new user
      const { data, error } = await supabase.auth.admin.createUser({
        phone: account.phone,
        phone_confirm: true,
        user_metadata: {
          farmer_name: account.farmer_name,
          farm_name: account.farm_name
        }
      });

      if (error) {
        console.error(`   ❌ Failed to create ${account.phone}:`, error.message);
        continue;
      }

      console.log(`   ✅ Created account: ${account.farmer_name} (${account.phone})`);
      createdAccounts.push({ ...account, user_id: data.user.id });

      // Check what columns exist in profiles table
      const { data: sampleProfile } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      const profileColumns = sampleProfile && sampleProfile.length > 0 ? Object.keys(sampleProfile[0]) : [];

      // Try to create profile - skip if table doesn't exist
      if (profileColumns.length > 0 || sampleProfile !== null) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            farmer_name: account.farmer_name,
            farm_name: account.farm_name,
            phone: account.phone
          });

        if (profileError) {
          console.error(`   ⚠️  Failed to create profile for ${account.farmer_name}:`);
          console.error(`      Error: ${profileError.message || 'Unknown error'}`);
          console.error(`      Code: ${profileError.code || 'N/A'}`);
          if (profileError.details) {
            console.error(`      Details: ${JSON.stringify(profileError.details)}`);
          }
        } else {
          console.log(`   ✅ Created profile for ${account.farmer_name}`);
        }
      } else {
        console.log(`   ⚠️  Profiles table not found, skipping profile creation`);
      }

    } catch (error: any) {
      console.error(`   ❌ Error with ${account.phone}:`, error.message);
    }
  }

  return createdAccounts;
}

/**
 * Seed animals with existence checks
 */
async function seedAnimals(accounts: any[], force: boolean = false): Promise<any[]> {
  console.log('\n🐄 Seeding animals...');

  // Validate schema - using actual current schema with 'breed' instead of 'subtype'
  const hasSchema = await validateSchema('animals', ['user_id', 'name', 'type', 'breed']);
  if (!hasSchema) {
    console.error('   ❌ Schema validation failed');
    return [];
  }

  // Check for existing animals
  const userIds = accounts.map(a => a.user_id);
  const { count: existingCount } = await supabase
    .from('animals')
    .select('*', { count: 'exact', head: true })
    .in('user_id', userIds);

  if (existingCount && existingCount > 0 && !force) {
    console.log(`   ℹ️  Found ${existingCount} existing animals, skipping creation.`);
    const { data } = await supabase
      .from('animals')
      .select('*')
      .in('user_id', userIds);
    return data || [];
  }

  if (existingCount && existingCount > 0 && force) {
    console.log(`   🔄 Force mode: Deleting ${existingCount} existing animals...`);
    await supabase.from('animals').delete().in('user_id', userIds);
  }

  const animalDistribution = [
    { cattle: 7, goats: 0, sheep: 0 },
    { cattle: 5, goats: 2, sheep: 0 },
    { cattle: 3, goats: 4, sheep: 4 }
  ];

  const allAnimals = [];
  let animalCounter = 0;

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const distribution = animalDistribution[i];

    // Cattle
    for (let j = 0; j < distribution.cattle; j++) {
      const breeds = ['Borana', 'Fogera', 'Horro', 'Barca', 'Arsi', 'Sheko'];
      const breed = breeds[j % breeds.length];
      const name = ANIMAL_NAMES.cattle[j % ANIMAL_NAMES.cattle.length];
      const hasPhoto = Math.random() > 0.5;
      const animalCode = `C${Date.now()}${animalCounter++}`;

      allAnimals.push({
        animal_code: animalCode,
        user_id: account.user_id,
        name,
        type: 'cattle',
        breed,
        age: Math.floor(Math.random() * 5) + 1,
        weight: Math.floor(Math.random() * 200) + 300,
        photo_url: hasPhoto ? PLACEHOLDER_IMAGES.cattle : null,
        health_status: 'healthy'
      });
    }

    // Goats
    for (let j = 0; j < distribution.goats; j++) {
      const breeds = ['Hararghe Highland', 'Somali', 'Woyto-Guji', 'Afar', 'Abergelle'];
      const breed = breeds[j % breeds.length];
      const name = ANIMAL_NAMES.goat[j % ANIMAL_NAMES.goat.length];
      const hasPhoto = Math.random() > 0.5;
      const animalCode = `G${Date.now()}${animalCounter++}`;

      allAnimals.push({
        animal_code: animalCode,
        user_id: account.user_id,
        name,
        type: 'goat',
        breed,
        age: Math.floor(Math.random() * 4) + 1,
        weight: Math.floor(Math.random() * 30) + 20,
        photo_url: hasPhoto ? PLACEHOLDER_IMAGES.goat : null,
        health_status: 'healthy'
      });
    }

    // Sheep
    for (let j = 0; j < distribution.sheep; j++) {
      const breeds = ['Black Head Somali', 'Menz', 'Horro', 'Washera', 'Adilo'];
      const breed = breeds[j % breeds.length];
      const name = ANIMAL_NAMES.sheep[j % ANIMAL_NAMES.sheep.length];
      const hasPhoto = Math.random() > 0.5;
      const animalCode = `S${Date.now()}${animalCounter++}`;

      allAnimals.push({
        animal_code: animalCode,
        user_id: account.user_id,
        name,
        type: 'sheep',
        breed,
        age: Math.floor(Math.random() * 4) + 1,
        weight: Math.floor(Math.random() * 40) + 30,
        photo_url: hasPhoto ? PLACEHOLDER_IMAGES.sheep : null,
        health_status: 'healthy'
      });
    }
  }

  const { data, error } = await supabase
    .from('animals')
    .insert(allAnimals)
    .select();

  if (error) {
    console.error('   ❌ Failed to seed animals:', error.message);
    return [];
  }

  console.log(`   ✅ Created ${data.length} animals`);
  return data;
}


/**
 * Seed milk records with existence checks
 */
async function seedMilkRecords(animals: any[], force: boolean = false): Promise<any[]> {
  console.log('\n🥛 Seeding milk production records...');

  // All cattle, goats, and sheep can produce milk for demo purposes
  const milkProducers = animals.filter(a =>
    a.type === 'cattle' || a.type === 'goat' || a.type === 'sheep'
  );

  if (milkProducers.length === 0) {
    console.log('   ⚠️  No milk-producing animals found');
    return [];
  }

  // Check what columns exist in milk_production table
  const { data: sampleData } = await supabase
    .from('milk_production')
    .select('*')
    .limit(1);

  const availableColumns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
  console.log(`   📋 Available milk_production columns:`, availableColumns.join(', '));

  // Skip if table doesn't exist or has no columns
  if (availableColumns.length === 0) {
    console.log('   ⚠️  milk_production table not found or empty, skipping...');
    return [];
  }

  const userIds = [...new Set(animals.map(a => a.user_id))];
  const { count: existingCount } = await supabase
    .from('milk_production')
    .select('*', { count: 'exact', head: true })
    .in('user_id', userIds);

  if (existingCount && existingCount > 0 && !force) {
    console.log(`   ℹ️  Found ${existingCount} existing milk records, skipping creation.`);
    return [];
  }

  if (existingCount && existingCount > 0 && force) {
    console.log(`   🔄 Force mode: Deleting ${existingCount} existing milk records...`);
    await supabase.from('milk_production').delete().in('user_id', userIds);
  }

  const milkRecords = [];
  const now = new Date();

  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);

    const morningTime = new Date(date);
    morningTime.setHours(6 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);

    const eveningTime = new Date(date);
    eveningTime.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);

    for (const animal of milkProducers) {
      const morningYield = 2 + Math.random() * 6;
      const eveningYield = 2 + Math.random() * 6;

      milkRecords.push({
        user_id: animal.user_id,
        animal_id: animal.id,
        production_date: date.toISOString().split('T')[0],
        morning_yield: morningYield,
        evening_yield: eveningYield,
        quality_grade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
      });
    }
  }

  const { data, error } = await supabase
    .from('milk_production')
    .insert(milkRecords)
    .select();

  if (error) {
    console.error('   ❌ Failed to seed milk records:', error.message);
    return [];
  }

  console.log(`   ✅ Created ${data.length} milk production records`);
  return data;
}

/**
 * Seed marketplace listings with existence checks
 */
async function seedMarketplaceListings(animals: any[], force: boolean = false): Promise<any[]> {
  console.log('\n🏪 Seeding marketplace listings...');

  // Check what columns exist in market_listings table
  const { data: sampleData } = await supabase
    .from('market_listings')
    .select('*')
    .limit(1);

  const availableColumns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
  console.log(`   📋 Available market_listings columns:`, availableColumns.join(', '));

  // Skip if table doesn't exist or has no columns
  if (availableColumns.length === 0) {
    console.log('   ⚠️  market_listings table not found or empty, skipping...');
    return [];
  }

  const userIds = [...new Set(animals.map(a => a.user_id))];
  const { count: existingCount } = await supabase
    .from('market_listings')
    .select('*', { count: 'exact', head: true })
    .in('user_id', userIds);

  if (existingCount && existingCount > 0 && !force) {
    console.log(`   ℹ️  Found ${existingCount} existing listings, skipping creation.`);
    return [];
  }

  if (existingCount && existingCount > 0 && force) {
    console.log(`   🔄 Force mode: Deleting ${existingCount} existing listings...`);
    await supabase.from('market_listings').delete().in('user_id', userIds);
  }

  const listingAnimals = animals
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(10, animals.length));

  const listings = listingAnimals.map(animal => {
    const basePrice = animal.type === 'cattle' ? 20000 : animal.type === 'goat' ? 8000 : 6000;
    const price = basePrice + Math.floor(Math.random() * 30000);

    return {
      user_id: animal.user_id,
      animal_id: animal.id,
      title: `${animal.breed} ${animal.type} for sale`,
      description: `Healthy ${animal.breed} ${animal.type}, ${animal.age} years old, ${animal.weight}kg`,
      price,
      weight: animal.weight,
      age: animal.age,
      location: 'Addis Ababa',
      contact_method: 'phone',
      contact_value: '+251911234567',
      status: 'active'
    };
  });

  const { data, error } = await supabase
    .from('market_listings')
    .insert(listings)
    .select();

  if (error) {
    console.error('   ❌ Failed to seed marketplace listings:', error.message);
    return [];
  }

  console.log(`   ✅ Created ${data.length} marketplace listings`);
  return data;
}

/**
 * Main seeding function
 */
async function seedDemoData(force: boolean = false) {
  console.log('🌱 Starting demo data seeding...\n');
  console.log('═'.repeat(50));

  if (force) {
    console.log('⚠️  FORCE MODE: Will delete and recreate all demo data\n');
  }

  try {
    const accounts = await createDemoAccounts(force);
    if (accounts.length === 0) {
      console.error('\n❌ No accounts available. Aborting.');
      process.exit(1);
    }

    const animals = await seedAnimals(accounts, force);
    if (animals.length === 0) {
      console.error('\n❌ No animals created. Aborting.');
      process.exit(1);
    }

    await seedMilkRecords(animals, force);
    await seedMarketplaceListings(animals, force);

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Demo data seeding completed successfully!');
    console.log('\nDemo Accounts:');
    accounts.forEach(acc => {
      console.log(`   📱 ${acc.phone} - ${acc.farmer_name} (${acc.farm_name})`);
    });
    console.log('\n💡 Use these phone numbers to log in and test the app.');

  } catch (error: any) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

/**
 * Reset demo data (soft delete)
 */
async function resetDemoData() {
  console.log('🗑️  Resetting demo data...\n');
  console.log('═'.repeat(50));

  try {
    const demoPhones = DEMO_ACCOUNTS.map(a => a.phone);

    if (!supabaseServiceKey) {
      console.log('   ⚠️  No SERVICE_ROLE_KEY - using profile-based cleanup...');
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .in('phone', demoPhones);

      if (!profiles || profiles.length === 0) {
        console.log('   ℹ️  No demo data found to reset.');
        return;
      }

      const demoUserIds = profiles.map(p => p.id);
      console.log(`\n🔍 Found ${demoUserIds.length} demo accounts to clean up...`);

      await supabase.from('market_listings').delete().in('user_id', demoUserIds);
      console.log('   ✅ Marketplace listings deleted');

      await supabase.from('milk_production').delete().in('user_id', demoUserIds);
      console.log('   ✅ Milk production records deleted');

      await supabase.from('animals').delete().in('user_id', demoUserIds);
      console.log('   ✅ Animals deleted');

      await supabase.from('profiles').delete().in('id', demoUserIds);
      console.log('   ✅ User profiles deleted');

      console.log('\n   ⚠️  Auth users NOT deleted (requires SERVICE_ROLE_KEY)');
    } else {
      const { data: users } = await supabase.auth.admin.listUsers();
      const demoUsers = users?.users.filter(u => demoPhones.includes(u.phone || '')) || [];
      const demoUserIds = demoUsers.map(u => u.id);

      if (demoUserIds.length === 0) {
        console.log('   ℹ️  No demo data found to reset.');
        return;
      }

      console.log(`\n🔍 Found ${demoUserIds.length} demo accounts to clean up...`);

      await supabase.from('market_listings').delete().in('user_id', demoUserIds);
      console.log('   ✅ Marketplace listings deleted');

      await supabase.from('milk_production').delete().in('user_id', demoUserIds);
      console.log('   ✅ Milk production records deleted');

      await supabase.from('animals').delete().in('user_id', demoUserIds);
      console.log('   ✅ Animals deleted');

      await supabase.from('profiles').delete().in('id', demoUserIds);
      console.log('   ✅ User profiles deleted');

      for (const user of demoUsers) {
        await supabase.auth.admin.deleteUser(user.id);
      }
      console.log('   ✅ Auth users deleted');
    }

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Demo data reset completed!');

  } catch (error: any) {
    console.error('\n❌ Reset failed:', error.message);
    process.exit(1);
  }
}


/**
 * Detailed verification report
 */
async function verifyDemoData() {
  console.log('🔍 Verifying demo data...\n');
  console.log('═'.repeat(50));

  try {
    const demoPhones = DEMO_ACCOUNTS.map(a => a.phone);

    // Get profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('phone', demoPhones);

    const profileCount = profiles?.length || 0;
    const userIds = profiles?.map(p => p.id) || [];

    console.log(`\n👥 Demo Accounts: ${profileCount}/${DEMO_ACCOUNTS.length}`);
    if (profiles && profiles.length > 0) {
      profiles.forEach(p => console.log(`   ✅ ${p.phone} - ${p.farmer_name}`));
    } else {
      console.log('   ❌ No demo accounts found');
    }

    if (userIds.length === 0) {
      console.log('\n⚠️  No demo accounts found. Run: npm run seed:demo');
      return;
    }

    // Count animals by type
    const { data: animals } = await supabase
      .from('animals')
      .select('type')
      .in('user_id', userIds);

    const animalCount = animals?.length || 0;
    const cattleCount = animals?.filter(a => a.type === 'cattle').length || 0;
    const goatCount = animals?.filter(a => a.type === 'goat').length || 0;
    const sheepCount = animals?.filter(a => a.type === 'sheep').length || 0;

    console.log(`\n🐄 Animals: ${animalCount} total`);
    console.log(`   - Cattle: ${cattleCount}`);
    console.log(`   - Goats: ${goatCount}`);
    console.log(`   - Sheep: ${sheepCount}`);

    if (animalCount < 15) {
      console.log(`   ⚠️  Expected at least 15 animals, found ${animalCount}`);
    }

    // Count milk records
    const { count: milkCount } = await supabase
      .from('milk_production')
      .select('*', { count: 'exact', head: true })
      .in('user_id', userIds);

    console.log(`\n🥛 Milk Records: ${milkCount || 0}`);
    if ((milkCount || 0) < 20) {
      console.log(`   ⚠️  Expected at least 20 milk records, found ${milkCount || 0}`);
    }

    // Count listings by status
    const { data: listings } = await supabase
      .from('market_listings')
      .select('status')
      .in('user_id', userIds);

    const listingCount = listings?.length || 0;
    const activeListings = listings?.filter(l => l.status === 'active').length || 0;

    console.log(`\n🏪 Marketplace Listings: ${listingCount} total`);
    console.log(`   - Active: ${activeListings}`);
    console.log(`   - Other: ${listingCount - activeListings}`);

    if (listingCount < 5) {
      console.log(`   ⚠️  Expected at least 5 listings, found ${listingCount}`);
    }

    // Summary
    console.log('\n' + '═'.repeat(50));

    const isComplete =
      profileCount === DEMO_ACCOUNTS.length &&
      animalCount >= 15 &&
      (milkCount || 0) >= 20 &&
      listingCount >= 5;

    if (isComplete) {
      console.log('✅ Demo data verification PASSED!');
      console.log('\n📊 Summary:');
      console.log(`   ✅ ${profileCount} accounts`);
      console.log(`   ✅ ${animalCount} animals`);
      console.log(`   ✅ ${milkCount} milk records`);
      console.log(`   ✅ ${listingCount} marketplace listings`);
    } else {
      console.log('⚠️  Demo data INCOMPLETE');
      console.log('\n📊 Summary:');
      console.log(`   ${profileCount === DEMO_ACCOUNTS.length ? '✅' : '❌'} ${profileCount}/${DEMO_ACCOUNTS.length} accounts`);
      console.log(`   ${animalCount >= 15 ? '✅' : '❌'} ${animalCount}/15+ animals`);
      console.log(`   ${(milkCount || 0) >= 20 ? '✅' : '❌'} ${milkCount}/20+ milk records`);
      console.log(`   ${listingCount >= 5 ? '✅' : '❌'} ${listingCount}/5+ listings`);
      console.log('\n💡 Run: npm run seed:demo');
    }

  } catch (error: any) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];
const hasForceFlag = args.includes('--force');

switch (command) {
  case 'seed':
    seedDemoData(hasForceFlag);
    break;
  case 'reset':
    resetDemoData();
    break;
  case 'verify':
    verifyDemoData();
    break;
  default:
    console.log('Usage:');
    console.log('  npm run seed:demo           - Seed demo data (idempotent)');
    console.log('  npm run seed:demo --force   - Force reseed (delete + reseed)');
    console.log('  npm run reset:demo          - Clear demo data');
    console.log('  npm run verify:demo         - Detailed verification report');
    process.exit(1);
}
