#!/usr/bin/env tsx
/**
 * Demo Data Seeding Script
 * 
 * This script seeds the database with realistic demo data for exhibition purposes.
 * It creates 3 demo accounts with animals, milk records, and marketplace listings.
 * 
 * Usage:
 *   npm run seed:demo    - Seed demo data
 *   npm run reset:demo   - Clear demo data
 *   npm run verify:demo  - Verify demo data
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

// Use service role key for admin operations if available, otherwise use anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Demo account configuration
const DEMO_ACCOUNTS = [
  {
    phone: '+251911234567',
    farmer_name: 'Abebe Kebede',
    farm_name: 'Abebe Farm',
    location: 'Bahir Dar, Amhara'
  },
  {
    phone: '+251922345678',
    farmer_name: 'Chaltu Tadesse',
    farm_name: 'Chaltu Dairy',
    location: 'Addis Ababa'
  },
  {
    phone: '+251933456789',
    farmer_name: 'Dawit Haile',
    farm_name: 'Haile Ranch',
    location: 'Hawassa, SNNPR'
  }
];

// Ethiopian animal names
const ANIMAL_NAMES = {
  cattle: ['Chaltu', 'Beza', 'Abebe', 'Tigist', 'Kebede', 'Almaz', 'Girma', 'Hanna'],
  goat: ['Mulu', 'Desta', 'Fikir', 'Genet', 'Hailu', 'Kassa'],
  sheep: ['Selam', 'Tewodros', 'Yeshi', 'Zewdu']
};

// Placeholder images (using Unsplash for realistic animal photos)
const PLACEHOLDER_IMAGES = {
  cattle: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800',
  goat: 'https://images.unsplash.com/photo-1533318087102-b3ad366ed041?w=800',
  sheep: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800'
};

/**
 * Generate a unique animal ID following the existing pattern
 */
function generateAnimalId(farmName: string, type: string, subtype: string, index: number, year: number): string {
  const prefix = farmName.substring(0, 10).replace(/\s+/g, '');

  const ANIMAL_CODES: Record<string, string> = {
    'Cow': 'COW',
    'Bull': 'BUL',
    'Ox': 'OXX',
    'Calf': 'CAL',
    'Male': type === 'goat' ? 'MGT' : 'RAM',
    'Female': type === 'goat' ? 'FGT' : 'EWE',
    'Ram': 'RAM',
    'Ewe': 'EWE'
  };

  const animalCode = ANIMAL_CODES[subtype] || 'ANM';
  const number = String(index).padStart(3, '0');

  return `${prefix}-${animalCode}-${number}-${year}`;
}

/**
 * Create demo accounts with Supabase Auth
 * Note: This requires SUPABASE_SERVICE_ROLE_KEY in .env for admin operations
 */
async function createDemoAccounts() {
  console.log('\n📝 Creating demo accounts...');

  if (!supabaseServiceKey) {
    console.log('\n⚠️  WARNING: No SUPABASE_SERVICE_ROLE_KEY found in .env');
    console.log('   Demo accounts must be created manually or via Supabase Dashboard');
    console.log('\n   To create accounts manually:');
    console.log('   1. Go to Supabase Dashboard → Authentication → Users');
    console.log('   2. Click "Add user" → "Create new user"');
    console.log('   3. Use phone numbers from DEMO_ACCOUNTS');
    console.log('\n   Or add SUPABASE_SERVICE_ROLE_KEY to .env and run again\n');

    // Try to find existing demo accounts
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('phone', DEMO_ACCOUNTS.map(a => a.phone));

    if (profiles && profiles.length > 0) {
      console.log(`   ✅ Found ${profiles.length} existing demo accounts`);
      return profiles.map(p => ({
        phone: p.phone,
        farmer_name: p.farmer_name,
        farm_name: p.farm_name,
        location: p.location,
        user_id: p.id
      }));
    }

    console.log('   ❌ No existing demo accounts found. Please create them manually first.');
    return [];
  }

  const createdAccounts = [];

  for (const account of DEMO_ACCOUNTS) {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', account.phone)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid error if not found

      if (existingProfile) {
        console.log(`   ⏭️  Account ${account.phone} already exists, using existing...`);
        createdAccounts.push({ ...account, user_id: existingProfile.id });
        continue;
      }

      // Create user with phone auth (requires service role key)
      const { data, error } = await supabase.auth.admin.createUser({
        phone: account.phone,
        phone_confirm: true,
        user_metadata: {
          farmer_name: account.farmer_name,
          farm_name: account.farm_name,
          location: account.location
        }
      });

      if (error) {
        console.error(`   ❌ Failed to create account ${account.phone}:`, error.message);
        continue;
      }

      console.log(`   ✅ Created account: ${account.farmer_name} (${account.phone})`);
      createdAccounts.push({ ...account, user_id: data.user.id });

      // Create user profile (without location - it doesn't exist in profiles table)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          farmer_name: account.farmer_name,
          farm_name: account.farm_name,
          phone: account.phone
        });

      if (profileError) {
        console.error(`   ⚠️  Failed to create profile for ${account.farmer_name}:`, profileError.message);
      } else {
        console.log(`   ✅ Created profile for ${account.farmer_name}`);
      }

    } catch (error: any) {
      console.error(`   ❌ Error creating account ${account.phone}:`, error.message);
    }
  }

  return createdAccounts;
}

/**
 * Seed animals for demo accounts
 */
async function seedAnimals(accounts: any[]) {
  console.log('\n🐄 Seeding animals...');

  const animalDistribution = [
    { cattle: 7, goats: 0, sheep: 0 }, // Account 1: 7 cattle
    { cattle: 5, goats: 2, sheep: 0 }, // Account 2: 5 cattle, 2 goats
    { cattle: 3, goats: 4, sheep: 4 }  // Account 3: 3 cattle, 4 goats, 4 sheep
  ];

  const allAnimals = [];
  const year = new Date().getFullYear();

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const distribution = animalDistribution[i];
    let animalIndex = 1;

    // Seed cattle
    for (let j = 0; j < distribution.cattle; j++) {
      const subtypes = ['Cow', 'Bull', 'Ox', 'Calf'];
      const subtype = subtypes[j % subtypes.length];
      const name = ANIMAL_NAMES.cattle[j % ANIMAL_NAMES.cattle.length];
      const hasPhoto = Math.random() > 0.5; // 50% have photos

      const animal = {
        user_id: account.user_id,
        // animal_id: generateAnimalId(account.farm_name, 'cattle', subtype, animalIndex++, year), // Commented out until migration is applied
        name: `${name}`,
        type: 'cattle',
        subtype: subtype,
        photo_url: hasPhoto ? PLACEHOLDER_IMAGES.cattle : null,
        registration_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      };

      allAnimals.push(animal);
    }

    // Seed goats
    for (let j = 0; j < distribution.goats; j++) {
      const subtype = j % 2 === 0 ? 'Male' : 'Female';
      const name = ANIMAL_NAMES.goat[j % ANIMAL_NAMES.goat.length];
      const hasPhoto = Math.random() > 0.5;

      const animal = {
        user_id: account.user_id,
        // animal_id: generateAnimalId(account.farm_name, 'goat', subtype, animalIndex++, year), // Commented out until migration is applied
        name: `${name}`,
        type: 'goat',
        subtype: subtype,
        photo_url: hasPhoto ? PLACEHOLDER_IMAGES.goat : null,
        registration_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      };

      allAnimals.push(animal);
    }

    // Seed sheep
    for (let j = 0; j < distribution.sheep; j++) {
      const subtype = j % 2 === 0 ? 'Ram' : 'Ewe';
      const name = ANIMAL_NAMES.sheep[j % ANIMAL_NAMES.sheep.length];
      const hasPhoto = Math.random() > 0.5;

      const animal = {
        user_id: account.user_id,
        // animal_id: generateAnimalId(account.farm_name, 'sheep', subtype, animalIndex++, year), // Commented out until migration is applied
        name: `${name}`,
        type: 'sheep',
        subtype: subtype,
        photo_url: hasPhoto ? PLACEHOLDER_IMAGES.sheep : null,
        registration_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      };

      allAnimals.push(animal);
    }
  }

  // Insert all animals
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
 * Seed milk production records
 */
async function seedMilkRecords(animals: any[]) {
  console.log('\n🥛 Seeding milk production records...');

  // Filter for milk-producing animals (cows and female goats/sheep)
  const milkProducers = animals.filter(a =>
    (a.type === 'cattle' && a.subtype === 'Cow') ||
    (a.type === 'goat' && a.subtype === 'Female') ||
    (a.type === 'sheep' && a.subtype === 'Ewe')
  );

  if (milkProducers.length === 0) {
    console.log('   ⚠️  No milk-producing animals found');
    return [];
  }

  const milkRecords = [];
  const now = new Date();

  // Generate records for past 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);

    // Morning session (6-8 AM)
    const morningTime = new Date(date);
    morningTime.setHours(6 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);

    // Evening session (5-7 PM)
    const eveningTime = new Date(date);
    eveningTime.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);

    // Each milk producer gets 2 records per day
    for (const animal of milkProducers) {
      // Morning record
      milkRecords.push({
        user_id: animal.user_id,
        animal_id: animal.id,
        liters: 2 + Math.random() * 6, // 2-8 liters
        session: 'morning',
        recorded_at: morningTime.toISOString()
      });

      // Evening record
      milkRecords.push({
        user_id: animal.user_id,
        animal_id: animal.id,
        liters: 2 + Math.random() * 6, // 2-8 liters
        session: 'evening',
        recorded_at: eveningTime.toISOString()
      });
    }
  }

  // Insert milk records
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
 * Seed marketplace listings
 */
async function seedMarketplaceListings(animals: any[]) {
  console.log('\n🏪 Seeding marketplace listings...');

  // Select 10 random animals for listings
  const listingAnimals = animals
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(10, animals.length));

  const listings = listingAnimals.map(animal => {
    const basePrice = animal.type === 'cattle' ? 20000 : animal.type === 'goat' ? 8000 : 6000;
    const price = basePrice + Math.floor(Math.random() * 30000);

    return {
      user_id: animal.user_id,
      animal_id: animal.id,
      price: price,
      is_negotiable: Math.random() > 0.3, // 70% negotiable
      location: null, // Will use user profile location
      contact_phone: null, // Will use user profile phone
      status: 'active',
      views_count: Math.floor(Math.random() * 50),
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
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
async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...\n');
  console.log('═'.repeat(50));

  try {
    // Step 1: Create demo accounts
    const accounts = await createDemoAccounts();

    if (accounts.length === 0) {
      console.error('\n❌ No accounts created. Aborting seeding.');
      process.exit(1);
    }

    // Step 2: Seed animals
    const animals = await seedAnimals(accounts);

    if (animals.length === 0) {
      console.error('\n❌ No animals created. Aborting seeding.');
      process.exit(1);
    }

    // Step 3: Seed milk records
    await seedMilkRecords(animals);

    // Step 4: Seed marketplace listings
    await seedMarketplaceListings(animals);

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
 * Reset demo data
 */
async function resetDemoData() {
  console.log('🗑️  Resetting demo data...\n');
  console.log('═'.repeat(50));

  try {
    const demoPhones = DEMO_ACCOUNTS.map(a => a.phone);

    // Get demo user IDs
    const { data: users } = await supabase.auth.admin.listUsers();
    const demoUsers = users?.users.filter(u => demoPhones.includes(u.phone || '')) || [];
    const demoUserIds = demoUsers.map(u => u.id);

    if (demoUserIds.length === 0) {
      console.log('   ℹ️  No demo data found to reset.');
      return;
    }

    console.log(`\n🔍 Found ${demoUserIds.length} demo accounts to clean up...`);

    // Delete in correct order (respecting foreign keys)
    console.log('\n🗑️  Deleting marketplace listings...');
    const { error: listingsError } = await supabase
      .from('market_listings')
      .delete()
      .in('user_id', demoUserIds);

    if (listingsError) console.error('   ⚠️ ', listingsError.message);
    else console.log('   ✅ Marketplace listings deleted');

    console.log('\n🗑️  Deleting milk production records...');
    const { error: milkError } = await supabase
      .from('milk_production')
      .delete()
      .in('user_id', demoUserIds);

    if (milkError) console.error('   ⚠️ ', milkError.message);
    else console.log('   ✅ Milk production records deleted');

    console.log('\n🗑️  Deleting animals...');
    const { error: animalsError } = await supabase
      .from('animals')
      .delete()
      .in('user_id', demoUserIds);

    if (animalsError) console.error('   ⚠️ ', animalsError.message);
    else console.log('   ✅ Animals deleted');

    console.log('\n🗑️  Deleting user profiles...');
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .in('id', demoUserIds);

    if (profilesError) console.error('   ⚠️ ', profilesError.message);
    else console.log('   ✅ User profiles deleted');

    console.log('\n🗑️  Deleting auth users...');
    for (const user of demoUsers) {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) console.error(`   ⚠️  Failed to delete user ${user.phone}:`, error.message);
    }
    console.log('   ✅ Auth users deleted');

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Demo data reset completed!');

  } catch (error: any) {
    console.error('\n❌ Reset failed:', error.message);
    process.exit(1);
  }
}

/**
 * Verify demo data
 */
async function verifyDemoData() {
  console.log('🔍 Verifying demo data...\n');
  console.log('═'.repeat(50));

  try {
    const demoPhones = DEMO_ACCOUNTS.map(a => a.phone);

    // Get demo user IDs
    const { data: users } = await supabase.auth.admin.listUsers();
    const demoUsers = users?.users.filter(u => demoPhones.includes(u.phone || '')) || [];
    const demoUserIds = demoUsers.map(u => u.id);

    console.log(`\n👥 Demo Accounts: ${demoUsers.length}/${DEMO_ACCOUNTS.length}`);
    demoUsers.forEach(u => console.log(`   ✅ ${u.phone}`));

    // Count animals
    const { count: animalCount } = await supabase
      .from('animals')
      .select('*', { count: 'exact', head: true })
      .in('user_id', demoUserIds);

    console.log(`\n🐄 Animals: ${animalCount || 0}`);

    // Count milk records
    const { count: milkCount } = await supabase
      .from('milk_production')
      .select('*', { count: 'exact', head: true })
      .in('user_id', demoUserIds);

    console.log(`🥛 Milk Records: ${milkCount || 0}`);

    // Count listings
    const { count: listingCount } = await supabase
      .from('market_listings')
      .select('*', { count: 'exact', head: true })
      .in('user_id', demoUserIds);

    console.log(`🏪 Marketplace Listings: ${listingCount || 0}`);

    console.log('\n' + '═'.repeat(50));

    const isComplete =
      demoUsers.length === DEMO_ACCOUNTS.length &&
      (animalCount || 0) >= 15 &&
      (milkCount || 0) >= 20 &&
      (listingCount || 0) >= 5;

    if (isComplete) {
      console.log('✅ Demo data verification passed!');
    } else {
      console.log('⚠️  Demo data incomplete. Run: npm run seed:demo');
    }

  } catch (error: any) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// CLI handling
const command = process.argv[2];

switch (command) {
  case 'seed':
    seedDemoData();
    break;
  case 'reset':
    resetDemoData();
    break;
  case 'verify':
    verifyDemoData();
    break;
  default:
    console.log('Usage:');
    console.log('  npm run seed:demo    - Seed demo data');
    console.log('  npm run reset:demo   - Clear demo data');
    console.log('  npm run verify:demo  - Verify demo data');
    process.exit(1);
}
