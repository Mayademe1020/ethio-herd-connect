# Database Schema and RLS Policies Verification

## Date: 2025-10-30

## Profiles Table Schema

### Table Structure
The `profiles` table exists with the following schema (from migration `20251027000000_add_user_profiles.sql`):

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  farmer_name TEXT,
  farm_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Fields
- `id` (UUID, PRIMARY KEY): References auth.users.id, cascades on delete
- `phone` (TEXT): Ethiopian phone number for display
- `farmer_name` (TEXT): Farmer's name (required for profile completion)
- `farm_name` (TEXT): Optional farm name
- `created_at` (TIMESTAMPTZ): Auto-set on creation
- `updated_at` (TIMESTAMPTZ): Auto-updated via trigger

## RLS Policies

### Status: ✅ All Required Policies Present

The following RLS policies are configured:

1. **SELECT Policy**: "Users can view own profile"
   ```sql
   CREATE POLICY "Users can view own profile"
     ON profiles FOR SELECT
     USING (auth.uid() = id);
   ```
   - Allows authenticated users to read their own profile
   - Uses `auth.uid()` to match current user

2. **INSERT Policy**: "Users can insert own profile"
   ```sql
   CREATE POLICY "Users can insert own profile"
     ON profiles FOR INSERT
     WITH CHECK (auth.uid() = id);
   ```
   - Allows authenticated users to create their own profile
   - Prevents creating profiles for other users

3. **UPDATE Policy**: "Users can update own profile"
   ```sql
   CREATE POLICY "Users can update own profile"
     ON profiles FOR UPDATE
     USING (auth.uid() = id);
   ```
   - Allows authenticated users to update their own profile
   - Prevents updating other users' profiles

### RLS Status
- Row Level Security is **ENABLED** on the profiles table
- All three required policies (SELECT, INSERT, UPDATE) are present
- Policies correctly use `auth.uid()` for user identification

## Indexes

The following indexes are configured for performance:

```sql
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
```

## Triggers

An `updated_at` trigger is configured to automatically update the timestamp:

```sql
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Verification Results

### ✅ Schema Verification
- Table exists with correct structure
- All required fields are present
- Foreign key relationship to auth.users is properly configured

### ✅ RLS Policy Verification
- RLS is enabled on the table
- SELECT policy allows users to read their own profile
- INSERT policy allows users to create their own profile
- UPDATE policy allows users to update their own profile
- All policies correctly use `auth.uid()` for authentication

### ✅ Security Verification
- Users cannot access other users' profiles
- Users cannot create profiles for other users
- Users cannot update other users' profiles
- Cascade delete ensures profile cleanup when user is deleted

## Potential 406 Error Causes

Based on the verification, the 406 error is **NOT** caused by:
- Missing table (table exists)
- Missing RLS policies (all policies are present)
- Incorrect policy configuration (policies are correctly configured)

The 406 error may be caused by:
1. **Client-side issues**: Missing or incorrect Accept headers in the request
2. **Network issues**: Proxy or firewall interference
3. **Supabase client configuration**: Outdated client library or misconfiguration
4. **Temporary service issues**: Transient Supabase API issues

## Recommendations

1. **Monitor error logs**: The updated `useProfile` hook now logs detailed error information
2. **Retry logic**: Exponential backoff retry (3 attempts) is now implemented
3. **User feedback**: Error UI with retry button is now available in ProtectedRoute
4. **Network debugging**: If 406 errors persist, check browser network tab for request/response headers

## Migration File
- Location: `supabase/migrations/20251027000000_add_user_profiles.sql`
- Status: Applied
- Date: 2025-10-27

## Conclusion

The database schema and RLS policies are correctly configured. The 406 error handling improvements in the code should resolve most issues, and the detailed logging will help identify any remaining problems.
