# Demo Data Seeding Scripts

This directory contains scripts for seeding demo data for exhibition purposes.

## Quick Start

```bash
# Seed demo data
npm run seed:demo

# Reset demo data
npm run reset:demo

# Verify demo data
npm run verify:demo
```

## Demo Accounts

The seeding script creates 3 demo accounts:

| Phone | Farmer Name | Farm Name | Location |
|-------|-------------|-----------|----------|
| +251911234567 | Abebe Kebede | Abebe Farm | Bahir Dar, Amhara |
| +251922345678 | Chaltu Tadesse | Chaltu Dairy | Addis Ababa |
| +251933456789 | Dawit Haile | Haile Ranch | Hawassa, SNNPR |

## What Gets Seeded

### Animals (20 total)
- **Account 1:** 7 cattle (mix of cows, bulls, oxen, calves)
- **Account 2:** 5 cattle + 2 goats
- **Account 3:** 3 cattle + 4 goats + 4 sheep

**Features:**
- Realistic Ethiopian names
- 50% have placeholder photos from Unsplash
- Unique animal IDs following existing pattern
- Registered over past 30 days

### Milk Production Records (30+ records)
- Past 7 days of data
- 2 sessions per day (morning 6-8 AM, evening 5-7 PM)
- Realistic amounts (2-8 liters per session)
- Only for milk-producing animals (cows, female goats/sheep)

### Marketplace Listings (10 listings)
- Mix of animal types
- Realistic prices (5,000-50,000 Birr)
- 70% negotiable
- Various view counts
- Created over past 7 days

## Usage

### Seed Demo Data

```bash
npm run seed:demo
```

This command:
1. Creates 3 demo accounts with Supabase Auth
2. Creates user profiles for each account
3. Seeds 20 animals across the accounts
4. Seeds 30+ milk production records
5. Seeds 10 marketplace listings

**Note:** The script is idempotent - it checks if accounts exist before creating them.

### Reset Demo Data

```bash
npm run reset:demo
```

This command:
1. Finds all demo accounts
2. Deletes marketplace listings
3. Deletes milk production records
4. Deletes animals
5. Deletes user profiles
6. Deletes auth users

**Completes in <30 seconds**

### Verify Demo Data

```bash
npm run verify:demo
```

This command:
1. Counts demo accounts
2. Counts animals
3. Counts milk records
4. Counts marketplace listings
5. Reports if data is complete

## Troubleshooting

### "Missing Supabase credentials"

Make sure your `.env` file has:
```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
```

### "Failed to create account"

Check that:
1. Supabase Auth is enabled
2. Phone auth is configured
3. You have admin permissions

### "No demo data found"

Run `npm run seed:demo` first before trying to reset or verify.

## For Exhibition

### Before Demo
1. Run `npm run seed:demo`
2. Run `npm run verify:demo` to confirm
3. Test login with one of the demo phone numbers

### Between Demos
1. Run `npm run reset:demo`
2. Run `npm run seed:demo`
3. Takes ~1 minute total

### Demo Login
Use any of the demo phone numbers:
- +251911234567
- +251922345678
- +251933456789

**Note:** Since these are demo accounts, OTP verification is auto-confirmed.

## Technical Details

### Script Location
`scripts/seed-demo-data.ts`

### Dependencies
- `@supabase/supabase-js` - Supabase client
- `tsx` - TypeScript execution
- `dotenv` - Environment variables

### Database Tables Used
- `auth.users` - User accounts
- `profiles` - User profiles
- `animals` - Animal records
- `milk_production` - Milk records
- `market_listings` - Marketplace listings

### Placeholder Images
Uses Unsplash API for realistic animal photos:
- Cattle: https://images.unsplash.com/photo-1516467508483-a7212febe31a
- Goats: https://images.unsplash.com/photo-1533318087102-b3ad366ed041
- Sheep: https://images.unsplash.com/photo-1583337130417-3346a1be7dee

## Next Steps

After seeding demo data:
1. Test animal registration flow
2. Test milk recording flow
3. Test marketplace browsing
4. Test offline mode
5. Practice your demo script!

