# Test Guide: Milk Recording Enhancements

## Quick Test Scenarios

### Test 1: Custom Input Validation

**Steps:**
1. Navigate to Profile → Click "Record Milk"
2. Select any cow
3. Click the "Custom" button (✏️ icon)
4. Try entering different values

**Test Cases:**

| Input | Expected Result | Status |
|-------|----------------|--------|
| `5` | ✅ Confirm button enabled | ⬜ |
| `5.5` | ✅ Confirm button enabled | ⬜ |
| `0.5` | ✅ Confirm button enabled | ⬜ |
| `0` | ❌ Confirm button disabled | ⬜ |
| `-5` | ❌ Cannot type minus sign | ⬜ |
| `abc` | ❌ Cannot type letters | ⬜ |
| `101` | ❌ Confirm button disabled | ⬜ |
| Empty | ❌ Confirm button disabled | ⬜ |

**Expected Behavior:**
- Only positive numbers and decimals can be entered
- Confirm button only enabled for values > 0 and <= 100
- Cancel button clears input and closes custom field

---

### Test 2: Animal Photos in Cow Selection

**Steps:**
1. Navigate to Profile → Click "Record Milk"
2. Observe the cow selection grid

**Verify:**
- [ ] Each cow card shows a photo (if uploaded) or 🐄 emoji
- [ ] Photos are 20x20 size, rounded corners
- [ ] Photos load correctly from database
- [ ] Star icon visible on top-right of photo
- [ ] Click star marks/unmarks favorite
- [ ] Favorites appear at top of list

**Screenshot Locations:**
- Cow selection grid
- Individual cow card with photo
- Favorite star interaction

---

### Test 3: Animal Photos in Milk Records

**Steps:**
1. Record some milk for different animals
2. Navigate to Milk Production Records page
3. Observe the record cards

**Verify:**
- [ ] Each record shows animal photo (12x12 thumbnail)
- [ ] Photo appears on left side of card
- [ ] Animal name displayed next to photo
- [ ] Layout remains clean and responsive
- [ ] Missing photos handled gracefully

**Screenshot Locations:**
- Milk production records list
- Individual record card with photo

---

### Test 4: End-to-End Flow

**Complete Milk Recording:**
1. Go to Profile page
2. Click "Record Milk" quick action
3. **Verify:** No error messages appear
4. **Verify:** Cow selection page loads with photos
5. Select a cow with a photo
6. **Verify:** Selected cow photo shown in confirmation
7. Click "Custom" amount button
8. Enter `7.5` liters
9. Click "Confirm"
10. **Verify:** Amount shows as 7.5L
11. Click "Record Milk" button
12. **Verify:** Success message appears
13. Navigate to Milk Production Records
14. **Verify:** New record shows with animal photo

---

### Test 5: Favorite Functionality

**Steps:**
1. Navigate to Record Milk page
2. Find a cow without favorite star (outline icon)
3. Click the star icon
4. **Verify:** Star becomes filled and yellow
5. Refresh the page
6. **Verify:** Star remains filled
7. **Verify:** Favorited cow appears at top of list
8. Click star again to unfavorite
9. **Verify:** Star becomes outline again

---

### Test 6: Photo Accessibility Across Views

**Verify photos appear in all these locations:**

| Location | Photo Visible | Notes |
|----------|---------------|-------|
| RecordMilk - Cow Selection | ⬜ | Grid view |
| RecordMilk - Selected Cow | ⬜ | Confirmation view |
| MilkProductionRecords - List | ⬜ | Record cards |
| MyAnimals - Animal Cards | ⬜ | Already implemented |
| AnimalDetail - Header | ⬜ | Already implemented |

---

## Edge Cases to Test

### No Photo Scenarios
- [ ] Cow with no photo shows 🐄 emoji in selection
- [ ] Record with no photo skips photo display (or shows emoji)
- [ ] Layout doesn't break when photo missing

### Large Numbers
- [ ] Enter `99.99` - should work
- [ ] Enter `100` - should work
- [ ] Enter `100.01` - should be disabled

### Decimal Precision
- [ ] Enter `5.123456` - should accept
- [ ] Display shows reasonable precision
- [ ] Database stores full precision

### Network Issues
- [ ] Photos load with slow connection
- [ ] Fallback emoji shows if photo fails to load
- [ ] Custom input works offline

---

## Regression Testing

**Ensure existing functionality still works:**

- [ ] Preset amount buttons (2, 3, 5, 7, 10) work
- [ ] Search functionality filters cows
- [ ] Milk recording saves to database
- [ ] Offline queue works
- [ ] Success/error toasts appear
- [ ] Navigation back button works
- [ ] Profile quick actions work

---

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers

---

## Mobile Testing

Test on mobile devices:
- [ ] Photos display correctly on small screens
- [ ] Custom input keyboard shows numeric keypad
- [ ] Touch interactions work (star, buttons)
- [ ] Layout responsive
- [ ] Photos don't slow down page

---

## Performance Testing

- [ ] Page loads quickly with many cows
- [ ] Photos load progressively
- [ ] No lag when typing in custom input
- [ ] Favorite toggle is instant
- [ ] Smooth scrolling in records list

---

## Accessibility Testing

- [ ] Star button has aria-label
- [ ] Custom input has proper label
- [ ] Photos have alt text
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes

---

## Database Verification

**Check data integrity:**

```sql
-- Verify milk records include animal data
SELECT 
  mp.id,
  mp.amount,
  mp.production_date,
  a.name as animal_name,
  a.photo_url
FROM milk_production mp
LEFT JOIN animals a ON mp.animal_id = a.id
WHERE mp.user_id = 'YOUR_USER_ID'
ORDER BY mp.production_date DESC
LIMIT 10;
```

**Verify:**
- [ ] Animal name populated
- [ ] Photo URL present (if animal has photo)
- [ ] Amount stored correctly (including decimals)
- [ ] Foreign key relationship works

---

## Known Issues

Document any issues found during testing:

1. **Issue:** _____
   - **Severity:** Low/Medium/High
   - **Steps to Reproduce:** _____
   - **Expected:** _____
   - **Actual:** _____

---

## Sign-Off

**Tester:** _____________________  
**Date:** _____________________  
**Status:** ⬜ Pass / ⬜ Fail / ⬜ Pass with Issues

**Notes:**
_____________________________________
_____________________________________
_____________________________________
