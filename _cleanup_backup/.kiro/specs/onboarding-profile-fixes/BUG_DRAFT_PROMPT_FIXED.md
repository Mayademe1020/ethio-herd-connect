# Bug Fix: Unwanted Draft Prompt on Animal Registration

## Issue Found During Manual Testing

**Reporter:** User  
**Date:** Testing Task 8  
**Severity:** Medium - UX annoyance

### Problem Description

When a user tries to register an animal for the first time:
1. ❌ Draft restoration prompt appears immediately
2. ❌ Prompt shows even though user hasn't entered any data
3. ❌ Interrupts the registration flow
4. ❌ Confusing for new users

### User Experience Impact

The draft prompt was appearing in two scenarios:
1. **First visit:** User opens registration page → Prompt appears (shouldn't happen)
2. **Return visit:** User previously opened page but didn't fill anything → Prompt appears (shouldn't happen)

This creates a poor first impression and interrupts the user flow.

### Root Cause

The `useFormDraft` hook was saving drafts **immediately** when the component mounted, even with empty/default values:

```typescript
// OLD CODE - Saves draft even with no data
useEffect(() => {
  const formData = {
    selectedType,
    selectedGender,
    selectedSubtype,
    animalName,
    step
  };
  saveDraft(formData); // ❌ Saves even when all values are null/empty
}, [selectedType, selectedGender, selectedSubtype, animalName, step, saveDraft]);
```

This meant:
- User opens page → Draft saved with empty data
- User closes page
- User returns → Prompt shows "Draft Found" (but it's empty!)

### Solution

Added a check to only save drafts when the user has actually entered data:

```typescript
// NEW CODE - Only saves when user has made selections
useEffect(() => {
  // Only save draft if user has actually selected something
  const hasData = selectedType || selectedGender || selectedSubtype || animalName.trim();
  
  if (hasData) {
    const formData = {
      selectedType,
      selectedGender,
      selectedSubtype,
      animalName,
      step
    };
    saveDraft(formData);
  }
}, [selectedType, selectedGender, selectedSubtype, animalName, step, saveDraft]);
```

### Behavior After Fix

**Scenario 1: First Visit**
- User opens registration page
- No draft prompt appears ✅
- User can start fresh

**Scenario 2: User Starts But Doesn't Finish**
- User selects animal type (e.g., "Goat")
- User closes page
- User returns → Draft prompt appears ✅
- Prompt shows: "Contains: goat"

**Scenario 3: User Just Opens and Closes**
- User opens registration page
- User doesn't select anything
- User closes page
- User returns → No draft prompt ✅

### Files Modified

- `src/pages/RegisterAnimal.tsx` - Added data check before saving draft

### Other Forms Checked

✅ `src/components/MilkRecordingForm.tsx` - Already has proper check
✅ `src/components/AnimalListingForm.tsx` - Already has proper check

### Testing Required

After this fix, please test:

1. **Empty Visit:**
   - [ ] Open animal registration
   - [ ] Don't select anything
   - [ ] Close and reopen
   - [ ] Expected: No draft prompt

2. **Partial Entry:**
   - [ ] Open animal registration
   - [ ] Select animal type (e.g., Cattle)
   - [ ] Close and reopen
   - [ ] Expected: Draft prompt appears with "Contains: cattle"

3. **Complete and Submit:**
   - [ ] Fill out entire form
   - [ ] Submit successfully
   - [ ] Reopen registration
   - [ ] Expected: No draft prompt (cleared after submission)

### User Experience Improvement

This fix ensures:
- ✅ No interruption for first-time users
- ✅ Draft feature only activates when useful
- ✅ Cleaner, more professional UX
- ✅ Reduced confusion for new users

### Related Requirements

- Requirement 5.1: Improve error handling and user feedback
- Requirement 5.4: Console error resolution (better UX)
