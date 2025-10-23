# Supabase CLI Setup Guide

## 🚀 **Quick Install**

### **Windows (PowerShell)**
```powershell
# Using Scoop (recommended)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# OR using npm
npm install -g supabase
```

### **Verify Installation**
```powershell
supabase --version
```

---

## 📝 **Run Migration**

Once installed, run:

```powershell
# Navigate to project directory
cd D:\ethio-herd-connect\ethio-herd-connect-1

# Login to Supabase (if not already)
supabase login

# Link to your project (if not already)
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push
```

---

## **Option 2: Manual Migration (If CLI Install Fails)**

If you can't install Supabase CLI, you can run the migration manually:

### **Steps:**
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Copy the migration SQL from: `supabase/migrations/20250119_add_calendar_preference.sql`
5. Paste and run it

### **Migration SQL:**
```sql
-- Add calendar preference to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS calendar_preference TEXT 
DEFAULT 'gregorian' 
CHECK (calendar_preference IN ('gregorian', 'ethiopian'));

-- Add comment
COMMENT ON COLUMN profiles.calendar_preference IS 'User calendar preference: gregorian or ethiopian';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_calendar_preference 
ON profiles(calendar_preference);
```

---

## ✅ **Verify Migration**

After running migration, verify in SQL Editor:

```sql
-- Check column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'calendar_preference';

-- Check a user's preference
SELECT id, email, calendar_preference 
FROM profiles 
LIMIT 5;
```

---

## 🎯 **What This Does**

The migration adds a `calendar_preference` column to the `profiles` table:
- **Default value:** 'gregorian'
- **Allowed values:** 'gregorian' or 'ethiopian'
- **Indexed:** For fast queries
- **Safe:** Uses `IF NOT EXISTS` so it won't fail if already run

---

## 🧪 **Test After Migration**

1. Open your app
2. Go to Profile page
3. Select "Ethiopian Calendar"
4. Check database:
   ```sql
   SELECT calendar_preference FROM profiles WHERE id = 'YOUR_USER_ID';
   ```
5. Should show: `'ethiopian'`

---

## 🆘 **Troubleshooting**

### **Issue: Scoop not found**
Install Scoop first:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### **Issue: npm install fails**
Try with admin privileges:
```powershell
# Run PowerShell as Administrator
npm install -g supabase --force
```

### **Issue: Can't link project**
Get your project ref from Supabase Dashboard:
- Settings → General → Reference ID

---

## ✅ **Success Indicators**

You'll know it worked when:
- ✅ Migration runs without errors
- ✅ Column appears in database
- ✅ Profile page shows calendar selector
- ✅ Selecting calendar saves to database
- ✅ Dates display in selected calendar format

---

**Choose your path and let me know if you need help!** 🚀
