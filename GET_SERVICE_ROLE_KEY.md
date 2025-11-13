# How to Get Your Supabase Service Role Key

The seeding script needs the **Service Role Key** to create user accounts via the Admin API.

## Steps to Get the Key

### 1. Go to Supabase Dashboard
Visit: https://supabase.com/dashboard

### 2. Select Your Project
Click on your project: **pbtaolycccmmqmwurinp**

### 3. Navigate to API Settings
- Click on **Settings** (gear icon) in the left sidebar
- Click on **API**

### 4. Find Service Role Key
Scroll down to the **Project API keys** section.

You'll see two keys:
- **anon / public** - Already in your .env (safe to expose)
- **service_role** - ⚠️ **SECRET** - Never expose this!

### 5. Copy the Service Role Key
Click the copy icon next to **service_role** key.

### 6. Add to .env File
Open your `.env` file and add:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Your `.env` should look like this:
```env
VITE_SUPABASE_PROJECT_ID="pbtaolycccmmqmwurinp"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://pbtaolycccmmqmwurinp.supabase.co"
SUPABASE_ACCESS_TOKEN="sbp_606adf37f1cf2ab0abf0b938d789ef21b821b324"
SUPABASE_DB_PASSWORD="QWERT^&76uiop"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # ADD THIS LINE
```

## ⚠️ Security Warning

**NEVER commit the service role key to Git!**

The `.env` file is already in `.gitignore`, but double-check:
```bash
# Verify .env is ignored
git status
# Should NOT show .env as a changed file
```

## Why Do We Need This?

The service role key allows the seeding script to:
1. Create user accounts via `supabase.auth.admin.createUser()`
2. Bypass Row Level Security (RLS) policies
3. Perform admin operations

Without it, you'll see errors like:
- "Permission denied"
- "Admin API requires service role key"
- "Failed to create account"

## Alternative: Manual Account Creation

If you can't get the service role key, you can create accounts manually:

### Via Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Select **Phone** as sign-in method
4. Enter phone numbers from demo accounts:
   - +251911234567
   - +251922345678
   - +251933456789
5. Click **Create user**

Then run the seeding script - it will detect existing accounts and just add animals/milk/listings.

## Testing

After adding the key, test it:
```bash
npm run seed:demo
```

You should see:
```
📝 Creating demo accounts...
   ✅ Created account: Abebe Kebede (+251911234567)
   ✅ Created account: Chaltu Tadesse (+251922345678)
   ✅ Created account: Dawit Haile (+251933456789)
```

If you see warnings about missing service role key, the key wasn't added correctly.

