# 🚀 Complete Deployment Guide - Step by Step

## Overview

This guide will help you:
1. Push code to GitHub
2. Apply database migrations to Supabase
3. Deploy to production

---

## Part 1: Push to GitHub (10 minutes)

### Step 1: Initialize Git (if not already done)

```bash
# Check if git is initialized
git status

# If you see "not a git repository", initialize:
git init
```

### Step 2: Create .gitignore (if not exists)

```bash
# Check if .gitignore exists
type .gitignore

# If not, create it with essential ignores
```

Create `.gitignore` file with:
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.production.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Supabase
.supabase/
```

### Step 3: Stage All Changes

```bash
# Add all files
git add .

# Check what will be committed
git status
```

### Step 4: Commit Changes

```bash
# Commit with descriptive message
git commit -m "feat: Add UX improvements - Phone auth, Animal ID, Bottom nav, Language toggle"
```

### Step 5: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ethio-herd-connect` (or your choice)
3. Description: "Ethiopian Livestock Management System"
4. Choose: **Private** (recommended) or Public
5. **DO NOT** initialize with README (you already have code)
6. Click "Create repository"

### Step 6: Connect to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ethio-herd-connect.git

# Verify remote
git remote -v

# Push to GitHub
git push -u origin main

# If you get an error about 'master' vs 'main', try:
git branch -M main
git push -u origin main
```

### Step 7: Verify on GitHub

1. Go to your repository URL
2. Refresh the page
3. You should see all your files!

---

## Part 2: Apply Supabase Migrations (15 minutes)

### Step 1: Check Supabase Connection

```bash
# Check if Supabase CLI is installed
npx supabase --version

# If not installed, it will install automatically
```

### Step 2: Login to Supabase

```bash
# Login to Supabase
npx supabase login

# This will open a browser window
# Login with your Supabase account
```

### Step 3: Link to Your Project

```bash
# List your projects
npx supabase projects list

# Link to your project (replace PROJECT_ID with your actual project ID)
npx supabase link --project-ref YOUR_PROJECT_ID

# You can find PROJECT_ID in Supabase Dashboard URL:
# https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

### Step 4: Check Migration Files

```bash
# List migration files
dir supabase\migrations

# You should see:
# - 20251023000000_mvp_schema_cleanup.sql
# - 20251023000001_mvp_rls_policies.sql
# - 20251025000000_performance_indexes.sql
# - 20251027000000_add_user_profiles.sql
# - 20251027000001_add_animal_id.sql
```

### Step 5: Apply Migrations

```bash
# Push migrations to Supabase
npx supabase db push

# This will:
# 1. Connect to your Supabase project
# 2. Apply all migration files
# 3. Create tables: profiles, animals (with animal_id)
# 4. Set up RLS policies
# 5. Create indexes
```

### Step 6: Verify in Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Table Editor"
4. You should see:
   - `profiles` table (with farmer_name, farm_name columns)
   - `animals` table (with animal_id column)
   - Other tables

---

## Part 3: Environment Variables (5 minutes)

### Step 1: Check Current .env File

```bash
# View your .env file
type .env
```

### Step 2: Verify Supabase Credentials

Your `.env` should have:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3: Get Credentials from Supabase

1. Go to Supabase Dashboard
2. Click "Settings" (gear icon)
3. Click "API"
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`

### Step 4: Update .env (if needed)

```bash
# Edit .env file with correct values
# Make sure .env is in .gitignore (never commit it!)
```

---

## Part 4: Test Locally (5 minutes)

### Step 1: Restart Dev Server

```bash
# Stop current server (Ctrl+C)

# Restart
npm run dev
```

### Step 2: Test Onboarding

1. Open http://localhost:5173
2. Logout if logged in
3. Login with new phone: `944556677`, PIN: `1234`
4. You should see onboarding page with:
   - Farmer Name field (required)
   - Farm Name field (optional)
5. Fill both fields
6. Click Continue
7. Should redirect to home with bottom nav

### Step 3: Test Animal Registration

1. Click "Add Animal" or go to /register-animal
2. Select Cattle → Should auto-advance
3. Select Cow → Should auto-advance
4. Enter name
5. Register
6. Check database for animal_id

---

## Part 5: Deploy to Vercel (Optional - 10 minutes)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# Deploy to Vercel
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? ethio-herd-connect
# - Directory? ./
# - Override settings? No
```

### Step 4: Add Environment Variables

```bash
# Add Supabase URL
vercel env add VITE_SUPABASE_URL

# Add Supabase Key
vercel env add VITE_SUPABASE_ANON_KEY

# Redeploy with env vars
vercel --prod
```

### Step 5: Test Production

1. Open the Vercel URL (e.g., https://ethio-herd-connect.vercel.app)
2. Test login
3. Test onboarding
4. Test animal registration

---

## 🎯 Quick Command Reference

### GitHub Commands:
```bash
# Stage changes
git add .

# Commit
git commit -m "your message"

# Push
git push

# Check status
git status

# View remote
git remote -v
```

### Supabase Commands:
```bash
# Login
npx supabase login

# Link project
npx supabase link --project-ref YOUR_PROJECT_ID

# Push migrations
npx supabase db push

# Check status
npx supabase status
```

### Development Commands:
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🐛 Troubleshooting

### Git Issues:

**"fatal: not a git repository"**
```bash
git init
```

**"failed to push"**
```bash
git pull origin main --rebase
git push
```

**"remote already exists"**
```bash
git remote remove origin
git remote add origin YOUR_GITHUB_URL
```

### Supabase Issues:

**"Project not found"**
```bash
# Check project ID in dashboard
# Re-link with correct ID
npx supabase link --project-ref CORRECT_PROJECT_ID
```

**"Migration failed"**
```bash
# Check migration files for syntax errors
# Try applying manually in Supabase SQL Editor
```

**"404 on profiles table"**
```bash
# Migrations not applied
npx supabase db push
```

### Vercel Issues:

**"Build failed"**
```bash
# Check build locally first
npm run build

# Fix any errors, then redeploy
vercel --prod
```

**"Environment variables not working"**
```bash
# Add them via Vercel dashboard
# Or use CLI:
vercel env add VARIABLE_NAME
```

---

## ✅ Success Checklist

### GitHub:
- [ ] Code pushed to GitHub
- [ ] Repository is private/public as desired
- [ ] .env file NOT in repository
- [ ] All files visible on GitHub

### Supabase:
- [ ] Migrations applied successfully
- [ ] `profiles` table exists
- [ ] `animals` table has `animal_id` column
- [ ] Can query tables in SQL Editor

### Local Testing:
- [ ] Dev server runs without errors
- [ ] Login works
- [ ] Onboarding shows both fields
- [ ] Animal registration works
- [ ] Animal ID generated

### Production (Optional):
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] Production URL works
- [ ] All features work in production

---

## 📝 Next Steps After Deployment

1. **Test with real users** (5-10 farmers)
2. **Gather feedback**
3. **Fix critical bugs**
4. **Build Smart Feed** (Phase 3 - Highest GMV)
5. **Measure transactions**

---

## 🎉 You're Done!

Your app is now:
- ✅ Version controlled (GitHub)
- ✅ Database deployed (Supabase)
- ✅ Ready for users

**Time to build Smart Feed and make money!** 💰

