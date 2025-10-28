# UX Improvements Implementation Plan

## 📋 Requirements Breakdown

### 1. ✅ Back Button
- **Requirement:** Always visible, in card component, tappable
- **Implementation:** Add back button component to all pages
- **Status:** Ready to implement

### 2. ✅ Bottom Navigation
- **Requirement:** Add bottom nav with Profile tab
- **Implementation:** Create BottomNav component with Home, Animals, Marketplace, Profile
- **Status:** Ready to implement

### 3. ✅ Language Toggle
- **Requirement:** Visible on platform (not hidden in settings)
- **Implementation:** Add language toggle to top bar or bottom nav
- **Status:** Ready to implement

### 4. ✅ Auto-proceed on Animal Selection
- **Requirement:** No "Continue" button - auto-advance after selection
- **Implementation:** Update RegisterAnimal page to auto-advance
- **Status:** Ready to implement

### 5. ✅ Unique Animal ID
- **Requirement:** Format: `[FarmName]-[AnimalCode]-[###]-[Year]`
- **Example:** `GreenFarm-HFR-001-2025`
- **Rules:**
  - Must be unique across platform
  - Editable but validated
  - Auto-generated on registration
- **Implementation:**
  - Add `animal_id` column to database ✅ (migration created)
  - Generate ID in registration hook
  - Add validation for uniqueness
  - Add edit functionality
- **Status:** Database ready, code needs update

### 6. ⚠️ Label Update - NEEDS CLARIFICATION
- **Requirement:** Replace "ወንድ በሬ" with "ወይፈን" (Heifer)
- **Current Issue:** "ወንድ በሬ" is the label for "Ox" (castrated male)
- **"ወይፈን" (Heifer)** = Young female cattle (not yet had a calf)

**These are different animals!**

**Options:**
- **Option A:** ADD "Heifer" as a new cattle subtype (recommended)
  - Keep: Cow, Bull, Ox, Calf
  - Add: Heifer
  - Result: 5 cattle subtypes

- **Option B:** REPLACE "Ox" with "Heifer"
  - Keep: Cow, Bull, Calf
  - Replace Ox → Heifer
  - Result: 4 cattle subtypes (no Ox)

**Please clarify which option you want!**

---

## 🎯 Animal Code Mapping

For Animal ID generation, here are the short codes:

### Cattle:
- **COW** → Cow (ላም)
- **BUL** → Bull (በሬ)
- **OXX** → Ox (ወንድ በሬ)
- **CAL** → Calf (ጥጃ)
- **HFR** → Heifer (ወይፈን) - if added

### Goat:
- **MGT** → Male Goat (ወንድ ፍየል)
- **FGT** → Female Goat (ሴት ፍየል)

### Sheep:
- **RAM** → Ram (ወንድ በግ)
- **EWE** → Ewe (ሴት በግ)

---

## 📐 Implementation Order

### Phase 1: Database & Core Logic (30 min)
1. ✅ Apply animal_id migration
2. Update animal registration hook with ID generation
3. Add ID uniqueness validation

### Phase 2: UI Components (45 min)
4. Create BackButton component
5. Create BottomNavigation component
6. Add language toggle to UI
7. Update RegisterAnimal for auto-advance

### Phase 3: Animal ID Management (30 min)
8. Add Animal ID display in AnimalDetail
9. Add Animal ID edit functionality
10. Add validation UI

### Phase 4: Label Updates (15 min)
11. Update Amharic translations (after clarification)
12. Update subtype selector (if adding Heifer)

**Total Estimated Time:** 2 hours

---

## 🧪 Testing Checklist

### Back Button:
- [ ] Visible on all pages
- [ ] Tappable (44px+ touch target)
- [ ] Navigates back correctly

### Bottom Navigation:
- [ ] Shows on all main pages
- [ ] Profile tab works
- [ ] Active state shows correctly
- [ ] Icons clear and tappable

### Language Toggle:
- [ ] Visible and accessible
- [ ] Switches language immediately
- [ ] Persists selection

### Auto-advance:
- [ ] Selecting animal type → auto-shows subtypes
- [ ] Selecting subtype → auto-shows name input
- [ ] No "Continue" buttons needed

### Animal ID:
- [ ] Auto-generated on registration
- [ ] Format correct: FarmName-Code-###-Year
- [ ] Unique validation works
- [ ] Edit functionality works
- [ ] Shows in animal detail

### Heifer Label:
- [ ] Correct Amharic label shows
- [ ] Appears in correct places
- [ ] Icon appropriate

---

## ⚠️ DECISION NEEDED

**Before I proceed with implementation, please confirm:**

1. **Heifer Label:** Should I ADD Heifer as a new subtype, or REPLACE Ox with Heifer?
   - [ ] Option A: ADD Heifer (5 cattle subtypes total)
   - [ ] Option B: REPLACE Ox with Heifer (4 cattle subtypes, no Ox)

2. **Animal ID Format:** Confirm the format is correct:
   - Format: `[FarmName]-[AnimalCode]-[###]-[Year]`
   - Example: `GreenFarm-HFR-001-2025`
   - If no farm name, use: `[Phone]-[AnimalCode]-[###]-[Year]`
   - Example: `911234567-HFR-001-2025`

3. **Bottom Nav Tabs:** Which tabs should be included?
   - [ ] Home, Animals, Marketplace, Profile (4 tabs)
   - [ ] Home, Animals, Milk, Marketplace, Profile (5 tabs)
   - [ ] Other combination?

**Once you confirm these, I'll implement everything!**

---

**Created:** October 27, 2025  
**Status:** ⏳ Awaiting clarification  
**Priority:** High
