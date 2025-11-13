# 🚀 START TESTING NOW - Quick Start

## ⚡ 3 Steps to Begin Testing

### Step 1: Start the Server (30 seconds)

Open your terminal in this project directory and run:

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.4.1  ready in 500 ms

  ➜  Local:   http://127.0.0.1:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**✅ Server is running!**

---

### Step 2: Open the App (10 seconds)

**Option A: Desktop Testing**
1. Open Chrome
2. Go to: `http://127.0.0.1:5173`
3. Press `F12` to open DevTools
4. Check Console tab for errors

**Option B: Mobile Testing**
1. Open Chrome
2. Go to: `http://127.0.0.1:5173`
3. Press `F12` to open DevTools
4. Click device toolbar icon (or press `Ctrl+Shift+M`)
5. Select "iPhone 12 Pro" from device dropdown
6. Refresh the page

**✅ App is loaded!**

---

### Step 3: Start Testing (2 minutes)

**Follow this exact flow:**

1. **Login** (if not already logged in)
   - Enter phone: `+251912345678`
   - Get OTP from Supabase dashboard
   - Enter OTP and login

2. **Navigate to Register Animal**
   - Click "+" button or "Register Animal"
   - You should see the registration page

3. **Register Your First Animal**
   - Click on **Cattle (🐄)**
   - Click on **Female**
   - Click on **Cow (🐄)**
   - Type name: **"Meron"**
   - Click **"Register"** (skip photo for now)
   - **Success!** You should see "Meron" in My Animals

**✅ Core functionality works!**

---

## 📋 What to Test Next

Now that you've confirmed the basics work, follow these guides:

### For Detailed Testing:
👉 **Open:** `MANUAL_TESTING_GUIDE_ANIMAL_REGISTRATION.md`
- Complete step-by-step testing guide
- All test scenarios with expected results
- Bug tracking templates

### For Quick Reference:
👉 **Open:** `VISUAL_TESTING_CHECKLIST.md`
- Printable checklist
- Quick status tracker
- 5-minute smoke test

### For Bug Tracking:
👉 **Open:** `BUGS_FOUND.md`
- Document any issues you find
- Use the bug template provided

---

## 🎯 Recommended Testing Order

### Phase 1: Core Functionality (15 minutes)
1. ✅ Register Cattle (4-step flow)
2. ✅ Register Goat (3-step flow)
3. ✅ Register Sheep (3-step flow)
4. ✅ Test photo upload
5. ✅ Test skip name/photo

### Phase 2: Mobile Testing (10 minutes)
1. ✅ Switch to mobile view
2. ✅ Test touch interactions
3. ✅ Test layout on small screen
4. ✅ Test landscape orientation

### Phase 3: Advanced Features (15 minutes)
1. ✅ Test draft restoration
2. ✅ Test language switching
3. ✅ Test error handling
4. ✅ Test performance

---

## 🐛 How to Report Bugs

When you find an issue:

1. **Take a screenshot** (Windows: `Win+Shift+S`, Mac: `Cmd+Shift+4`)
2. **Open:** `BUGS_FOUND.md`
3. **Copy the bug template**
4. **Fill in the details:**
   - What you did
   - What you expected
   - What actually happened
   - Screenshot

**Example:**
```markdown
### BUG-001: Photo upload fails on mobile

**Severity:** High

**Steps:**
1. Open app on mobile view
2. Select Cattle → Female → Cow
3. Click camera icon
4. Select photo
5. Upload fails with error

**Expected:** Photo should upload and compress

**Actual:** Error message "Upload failed"

**Screenshot:** [Attach]

**Status:** 🔴 Open
```

---

## 📱 Mobile Testing Setup

### Chrome DevTools Device Mode

1. Press `F12` to open DevTools
2. Click device toolbar icon (top-left) or press `Ctrl+Shift+M`
3. Select device from dropdown:
   - **iPhone 12 Pro** (390 x 844)
   - **Pixel 5** (393 x 851)
   - **iPad** (768 x 1024)
4. Refresh the page
5. Test touch interactions

### Test Both Orientations
- **Portrait:** Default view
- **Landscape:** Click rotate icon in DevTools

---

## 🌐 Language Testing

### Switch to Amharic

1. Look for language selector (usually top-right)
2. Click and select **አማርኛ (Amharic)**
3. Verify all text changes to Amharic
4. Complete a registration in Amharic
5. Switch back to English

### What to Check
- ✅ All UI text translates
- ✅ Buttons show Amharic text
- ✅ Error messages in Amharic
- ✅ Success messages in Amharic
- ✅ No English text visible

---

## 🎬 Demo Mode Testing

If demo mode is available:

1. Enable demo mode (check for toggle)
2. Register animals in demo mode
3. Verify data doesn't affect production
4. Check demo indicator is visible
5. Disable demo mode

---

## ⚡ Quick Smoke Test (5 Minutes)

Run this to verify everything works:

```
✅ Test 1: Register Cattle
   - Cattle → Female → Cow → "Meron" → Register
   - Should work end-to-end

✅ Test 2: Register Goat  
   - Goat → Male → Skip → Register
   - Should work without name/photo

✅ Test 3: Mobile View
   - Switch to mobile (Ctrl+Shift+M)
   - Register Sheep → Ewe → Register
   - Should work on mobile

✅ Test 4: Language
   - Switch to Amharic
   - Register any animal
   - Should work in Amharic
```

**If all 4 pass → Core functionality is good! 🎉**

---

## 🔧 Troubleshooting

### Server won't start?
```bash
# Try this:
npm install
npm run dev
```

### Port already in use?
```bash
# Kill the process and restart:
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

### App not loading?
1. Check console for errors (F12)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try incognito mode (Ctrl+Shift+N)
4. Check .env file has correct Supabase keys

### Photo upload fails?
1. Check Supabase dashboard
2. Verify storage bucket exists
3. Check bucket permissions (public read)
4. Try smaller image first

---

## 📊 Track Your Progress

```
Testing Session: [Date/Time]
Tester: [Your Name]

Tests Completed:
☐ Cattle registration
☐ Goat registration  
☐ Sheep registration
☐ Photo upload
☐ Mobile view
☐ Draft restoration
☐ Language switching
☐ Error handling

Bugs Found: _____
Critical: _____
High: _____
Medium: _____
Low: _____

Status: ☐ In Progress  ☐ Complete
Ready for Exhibition: ☐ Yes  ☐ No  ☐ With Cautions
```

---

## 🎯 Success Criteria

You're done testing when:

```
✅ All animal types can be registered
✅ Photo upload works (with compression)
✅ Mobile experience is good
✅ Language switching works
✅ No critical bugs found
✅ Performance is acceptable
✅ All bugs documented
✅ Screenshots taken
```

---

## 📞 Quick Reference

**Dev Server:** `npm run dev`
**App URL:** `http://127.0.0.1:5173`
**DevTools:** `F12`
**Mobile Mode:** `Ctrl+Shift+M`
**Screenshot:** `Win+Shift+S` (Windows) or `Cmd+Shift+4` (Mac)

**Test Data:**
- Phone: `+251912345678`
- Animal Names: Meron, Almaz, Tigist, Chaltu
- Prices: 15000, 25000, 35000 ETB

---

## 🚀 You're Ready!

**Your next 3 actions:**

1. ✅ Run `npm run dev` in terminal
2. ✅ Open `http://127.0.0.1:5173` in Chrome
3. ✅ Follow the 5-minute smoke test above

**Then:**
- Open `MANUAL_TESTING_GUIDE_ANIMAL_REGISTRATION.md` for detailed testing
- Open `VISUAL_TESTING_CHECKLIST.md` for quick reference
- Document bugs in `BUGS_FOUND.md`

**Good luck testing! 🎉**

---

**Need help?** Check the troubleshooting section above or review the detailed testing guides.
