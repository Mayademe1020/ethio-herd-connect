# Fix Missing Database Tables - Quick Guide

## Problem

You're seeing these errors:
- `relation "public.reminders" does not exist` (404)
- `relation "public.user_profiles" does not exist` (404)

## Root Cause

The migrations exist in your codebase but haven't been applied to your Supabase database.

## Solution: Apply Migrations

### Option 1: Using Supabase CLI (Recommended)

```bash
# Make sure you're logged in
npx supabase login

# Link to your project (if not already linked)
npx supabase link --project-ref pbtaolycccmmqmwurinp

# Push all migrations to your database
npx supabase db push
```

### Option 2: Manual SQL Execution

If the CLI doesn't work, run these migrations manually in Supabase Dashboard:

1. Go to https://supabase.com/dashboard/project/pbtaolycccmmqmwurinp/sql/new

2. Run these migrations in order:

#### Step 1: Create user_profiles table
```sql
-- From: supabase/migrations/20251027000000_add_user_profiles.sql
-- Run this migration file
```

#### Step 2: Create reminders table
```sql
-- From: supabase/migrations/20251105000004_add_reminders_system.sql
-- Run this migration file
```

#### Step 3: Create notifications table
```sql
-- From: supabase/migrations/20251105000003_add_notifications_system.sql
-- Run this migration file
```

### Option 3: Quick Fix - Make Components Handle Missing Tables

If you can't apply migrations right now, I can make the components gracefully handle missing tables:

1. **ReminderSettings** - Show "Feature coming soon" instead of error
2. **MarketAlertPreferences** - Show "Feature coming soon" instead of error
3. **NotificationService** - Silently fail WebSocket connections

## Recommended Action

**Use Option 1** - Apply the migrations properly. This is the correct fix.

Run these commands:

```bash
npx supabase db push
```

If you get an error, try:

```bash
npx supabase db reset
```

⚠️ **Warning:** `db reset` will delete all your data! Only use in development.

## After Fixing

1. Refresh your browser
2. The 404 errors should be gone
3. Reminders and Market Alerts will work

## Need Help?

If migrations fail, let me know the error message and I'll help troubleshoot.
