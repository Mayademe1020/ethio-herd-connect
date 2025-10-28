# ✅ DO THIS NOW - Simple Checklist

## 🎯 Goal: Push to GitHub & Apply Database Changes

---

## Step 1: Push to GitHub (5 commands)

```bash
# 1. Stage all changes
git add .

# 2. Commit
git commit -m "feat: UX improvements - Phone auth, Animal ID, Navigation"

# 3. Create GitHub repo at: https://github.com/new
#    Name it: ethio-herd-connect
#    Make it Private
#    DO NOT initialize with README

# 4. Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ethio-herd-connect.git

# 5. Push
git push -u origin main
```

**If error about 'master' vs 'main':**
```bash
git branch -M main
git push -u origin main
```

---

## Step 2: Apply Supabase Migrations (3 commands)

```bash
# 1. Login to Supabase
npx supabase login

# 2. Link to your project (get PROJECT_ID from Supabase dashboard URL)
npx supabase link --project-ref YOUR_PROJECT_ID

# 3. Push migrations
npx supabase db push
```

**Where to find PROJECT_ID:**
- Go to https://supabase.com/dashboard
- Your URL looks like: `https://supabase.com/dashboard/project/pbtaolycccmmqmwurinp`
- PROJECT_ID = `pbtaolycccmmqmwurinp`

---

## Step 3: Test (2 minutes)

```bash
# Restart dev server
npm run dev

# Test:
# 1. Login with new phone: 944556677, PIN: 1234
# 2. Should see onboarding with TWO fields
# 3. Fill farmer name + farm name
# 4. Should work!
```

---

## ✅ Done!

After these steps:
- ✅ Code on GitHub
- ✅ Database updated
- ✅ App working

---

## 🆘 If You Get Stuck

### Git not initialized?
```bash
git init
```

### GitHub repo already exists?
```bash
git remote remove origin
git remote add origin YOUR_NEW_URL
```

### Supabase login fails?
- Make sure you have a Supabase account
- Go to https://supabase.com and sign up

### Migration fails?
- Copy the SQL from `supabase/migrations/20251027000000_add_user_profiles.sql`
- Go to Supabase Dashboard → SQL Editor
- Paste and run manually

---

**That's it! Just follow the commands in order.** 🎉

