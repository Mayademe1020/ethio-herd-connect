# Backend Sync Validator Skill

This skill validates that frontend types match the database schema.

## What it checks

1. **Types match DB**: Compares types.ts with actual database columns
2. **RLS policies**: Checks that RLS policies exist for all tables
3. **Query validity**: Verifies queries match table structures

## Usage

```bash
npx tsx .agents/skills/backend-sync/check.ts
```

## How it works

1. Parses types.ts for table definitions
2. Compares with database schema (if available locally)
3. Reports missing columns or types

## Example Output

```
🔍 Checking backend sync...

✅ Scanned types.ts

⚠️  farm_profiles missing columns in types.ts:
    - push_notifications_enabled
    - email_notifications_enabled
    - telegram_notifications_enabled
    - calendar_preference

Found 4 sync issues
```
