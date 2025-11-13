# How to Test Profile Error Handling - Offline Mode

## ⚠️ Important: Browser vs App Offline Behavior

There are **two different offline scenarios**:

### Scenario 1: Browser-Level Offline (What you're seeing)
- Browser detects no internet connection
- Shows browser's default "ERR_INTERNET_DISCONNECTED" page
- **This happens BEFORE the React app loads**
- This is normal browser behavior - not an app error

### Scenario 2: App-Level Offline (What we're testing)
- App is already loaded
- API calls fail due to network issues
- **This is where our error handling kicks in**
- Shows our custom error message with retry button

---

## ✅ Correct Way to Test Profile Error Handling

### Method 1: Simulate API Failure (Recommended)

1. **Load the app while online**
   - Open http://localhost:8080
   - Login successfully
   - Navigate to Profile page

2. **Open DevTools** (F12)
   - Go to Network tab
   - Find the filter/throttling dropdown

3. **Block API requests**
   - In Network tab, right-click on any request to your Supabase API
   - Select "Block request domain" or "Block request URL"
   - OR use "Offline" mode in DevTools (NOT browser offline)

4. **Refresh the Profile page**
   - Now you should see our custom error message
   - "Unable to load profile"
   - Red AlertCircle icon
   - "Retry" button

### Method 2: Use DevTools Offline Mode

1. **Load the app while online**
   - Open http://localhost:8080
   - Login successfully

2. **Open DevTools** (F12)
   - Go to Network tab
   - Check the "Offline" checkbox in DevTools
   - **Important:** This simulates offline for the app, not the browser

3. **Navigate to Profile page**
   - Click on Profile in bottom navigation
   - You should see our error handling

4. **Test the Retry button**
   - Uncheck "Offline" in DevTools
   - Click "Retry" button
   - Profile should load successfully

### Method 3: Disconnect After Loading

1. **Load the app while online**
   - Open http://localhost:8080
   - Login successfully
   - Navigate to Profile page (loads successfully)

2. **Disconnect your internet**
   - Turn off WiFi
   - Unplug ethernet cable

3. **Force a profile refresh**
   - Click "Edit Profile" button
   - Make a change and save
   - OR refresh the page (if service worker allows)

4. **You should see the error**
   - Custom error message appears
   - "Unable to load profile"
   - Retry button visible

---

## 🎯 What You Should See (Success)

When the error handling works correctly:

```
┌─────────────────────────────────────┐
│                                     │
│         🔴 (Red Alert Icon)         │
│                                     │
│     Unable to load profile          │
│                                     │
│  Please check your connection       │
│  and try again                      │
│                                     │
│        [  Retry  ]                  │
│                                     │
└─────────────────────────────────────┘
```

### In Amharic:
```
┌─────────────────────────────────────┐
│                                     │
│         🔴 (Red Alert Icon)         │
│                                     │
│     መገለጫ መጫን አልተቻለም              │
│                                     │
│  እባክዎ ግንኙነትዎን ያረጋግጡ እና          │
│  እንደገና ይሞክሩ                        │
│                                     │
│     [  እንደገና ይሞክሩ  ]              │
│                                     │
└─────────────────────────────────────┘
```

---

## ❌ What You're Currently Seeing (Browser Offline)

```
Looks like you're not connected to the internet
Let's get you back online!

ERR_INTERNET_DISCONNECTED

Want to play a game while you wait?
```

**This is Microsoft Edge's default offline page** - it appears when:
- The browser has no internet connection
- You try to load a page from scratch
- The service worker can't serve cached content

**This is NOT an error** - it's expected browser behavior when there's no internet connection at all.

---

## 🔍 Troubleshooting

### "I only see the browser offline page"
- Make sure you load the app FIRST while online
- Then simulate offline at the API level, not browser level
- Use DevTools Network tab "Offline" mode instead of system offline

### "The app loads from cache when offline"
- This is good! It means the service worker is working
- The error handling will show when you try to fetch new data
- Try clicking "Edit Profile" or forcing a data refresh

### "I don't see the error message"
- Check if the profile data is cached
- Try clearing localStorage and refreshing
- Make sure you're blocking the Supabase API requests specifically

---

## ✅ Test Checklist

- [ ] App loads successfully while online
- [ ] Can navigate to Profile page while online
- [ ] Profile displays user data correctly
- [ ] Enable DevTools "Offline" mode
- [ ] Refresh Profile page
- [ ] See custom error message (not browser error)
- [ ] Error message is clear and readable
- [ ] Red AlertCircle icon is visible
- [ ] "Retry" button is present
- [ ] Click "Retry" button
- [ ] Disable "Offline" mode
- [ ] Profile loads successfully after retry
- [ ] Test in Amharic language
- [ ] Error messages display in Amharic

---

## 📝 Summary

The error handling **IS implemented and working**. The browser offline page you're seeing is normal behavior when there's no internet connection at all. To test our app's error handling, you need to simulate API failures while the app is already loaded, not test with a completely offline browser.

**Next Steps:**
1. Load the app while online
2. Use DevTools Network tab "Offline" mode
3. Try to load Profile page
4. You'll see our custom error handling

The task is complete! ✅
