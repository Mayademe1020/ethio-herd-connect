---
name: ethio-herd-database
description: Database conventions for EthioHerd Connect. Use when creating migrations, updating schemas, or modifying Supabase tables.
---

# EthioHerd Connect Database Skill

This skill guides database operations for EthioHerd Connect using Supabase.

## Supabase Setup

### Local Development

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Stop local Supabase
supabase stop
```

### Environment Variables

Required in `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Migration Workflow

### 1. Creating a Migration

```bash
# Create new migration
supabase migration new add_new_column

# This creates: supabase/migrations/20240101_add_new_column.sql
```

### 2. Migration Template

```sql
-- supabase/migrations/20240101_add_feature_table.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table
CREATE TABLE feature_names (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feature_names ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own records
CREATE POLICY "Users can view own records"
  ON feature_names FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own records
CREATE POLICY "Users can insert own records"
  ON feature_names FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own records
CREATE POLICY "Users can update own records"
  ON feature_names FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own records
CREATE POLICY "Users can delete own records"
  ON feature_names FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. Applying Migrations

```bash
# Apply all pending migrations
supabase db push

# Apply to production
supabase db push --db-url $PROD_DB_URL
```

## Common Table Patterns

### Animals Table

```sql
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_id TEXT UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cattle', 'goat', 'sheep')),
  subtype TEXT,
  photo_url TEXT,
  registration_date DATE,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Health Records Table

```sql
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccination', 'treatment', 'checkup')),
  medicine_name TEXT,
  administered_date DATE,
  vet_name TEXT,
  cost DECIMAL(10,2),
  notes TEXT,
  reminder_sent_14 BOOLEAN DEFAULT false,
  reminder_sent_7 BOOLEAN DEFAULT false,
  reminder_sent_3 BOOLEAN DEFAULT false,
  reminder_sent_0 BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Milk Production Table

```sql
CREATE TABLE milk_production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE NOT NULL,
  record_date DATE NOT NULL,
  morning_amount DECIMAL(8,2),
  evening_amount DECIMAL(8,2),
  total_amount DECIMAL(8,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## TypeScript Types

After creating/modifying tables, update types:

```typescript
// src/integrations/supabase/types.ts

export type Animal = {
  id: string;
  user_id: string;
  animal_id: string | null;
  name: string;
  type: 'cattle' | 'goat' | 'sheep';
  subtype: string | null;
  photo_url: string | null;
  registration_date: string | null;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

export type HealthRecord = {
  id: string;
  user_id: string;
  animal_id: string;
  record_type: 'vaccination' | 'treatment' | 'checkup';
  medicine_name: string | null;
  administered_date: string | null;
  vet_name: string | null;
  cost: number | null;
  notes: string | null;
  created_at: string;
};
```

## Query Examples

### Basic Select

```typescript
const { data, error } = await supabase
  .from('animals')
  .select('id, name, type')
  .eq('user_id', user.id);
```

### With Join

```typescript
const { data, error } = await supabase
  .from('health_records')
  .select(`
    *,
    animals (name, type)
  `)
  .eq('user_id', user.id);
```

### Insert

```typescript
const { data, error } = await supabase
  .from('animals')
  .insert({
    user_id: user.id,
    name: 'Cow 1',
    type: 'cattle',
  })
  .select()
  .single();
```

### Update

```typescript
const { data, error } = await supabase
  .from('animals')
  .update({ name: 'New Name' })
  .eq('id', animalId)
  .select()
  .single();
```

### Delete

```typescript
const { error } = await supabase
  .from('animals')
  .delete()
  .eq('id', animalId);
```

## Security Best Practices

1. **Always use RLS** - Every table must have Row Level Security
2. **Parameterize queries** - Never use string interpolation:
   ```typescript
   // ✅ CORRECT
   .eq('user_id', user.id)
   
   // ❌ WRONG
   .eq('user_id', userInput) // SQL injection risk!
   ```
3. **Validate input** - Check data types and ranges
4. **Limit data exposure** - Use `.select('id, name')` not `.select('*')`

## Troubleshooting

### Migration Failed

```bash
# Check migration status
supabase migration list

# Reset local database
supabase db reset
```

### RLS Policy Issues

```sql
-- Check existing policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'your_table';
```

### Connection Issues

```bash
# Check Supabase status
supabase status

# Restart local instance
supabase stop && supabase start
```

## Production Considerations

- Never commit `.env` files with real credentials
- Test migrations locally first
- Use migrations for all schema changes
- Keep migrations small and focused
- Add comments explaining complex changes
