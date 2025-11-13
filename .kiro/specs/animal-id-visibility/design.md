# Animal ID Visibility & Search - Design Document

## Overview

This design implements comprehensive animal ID visibility and search functionality across the application, ensuring farmers can easily identify, track, and search for animals using their unique IDs while maintaining privacy in marketplace contexts.

## Architecture

### Component Structure

```
src/
├── components/
│   ├── AnimalCard.tsx (UPDATE - add ID display)
│   ├── AnimalSearchBar.tsx (NEW - search by ID)
│   └── AnimalIdBadge.tsx (NEW - reusable ID display)
├── pages/
│   ├── MyAnimals.tsx (UPDATE - add search)
│   ├── RegisterAnimal.tsx (UPDATE - add ID preview)
│   ├── AnimalDetail.tsx (UPDATE - prominent ID display)
│   └── RecordMilk.tsx (UPDATE - show ID in dropdown)
└── hooks/
    └── useAnimalSearch.tsx (NEW - search logic)
```

## Components and Interfaces

### 1. AnimalIdBadge Component

**Purpose:** Reusable component for displaying animal IDs consistently

**Props:**
```typescript
interface AnimalIdBadgeProps {
  animalId: string;
  size?: 'sm' | 'md' | 'lg';
  showCopyButton?: boolean;
  className?: string;
}
```

**Features:**
- Monospace font for clarity
- Copy to clipboard functionality
- Responsive sizing
- Consistent styling across app

### 2. AnimalSearchBar Component

**Purpose:** Search input with real-time filtering

**Props:**
```typescript
interface AnimalSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}
```

**Features:**
- Debounced input (300ms)
- Clear button
- Search icon
- Bilingual placeholder

### 3. useAnimalSearch Hook

**Purpose:** Centralized search logic

```typescript
interface UseAnimalSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredAnimals: Animal[];
  isSearching: boolean;
}

function useAnimalSearch(animals: Animal[]): UseAnimalSearchReturn
```

**Search Logic:**
- Case-insensitive matching
- Partial ID matching
- Also searches by name
- Returns filtered results

## Data Models

### Animal Interface (Extended)

```typescript
interface Animal {
  id: string;
  animal_id: string; // NEW - Professional ID
  user_id: string;
  name: string;
  type: 'cattle' | 'goat' | 'sheep';
  subtype: string;
  photo_url?: string;
  status: 'active' | 'sold' | 'deceased' | 'transferred';
  registration_date: string;
  sold_date?: string;
  deceased_date?: string;
  transferred_date?: string;
}
```

## Implementation Details

### 1. Animal Card Updates

**Location:** `src/components/AnimalCard.tsx`

**Changes:**
- Add animal ID badge at top of card
- Format: `FARM-TYPE-###`
- Monospace font
- Subtle background color
- Copy button on hover

**Visual Design:**
```
┌─────────────────────────┐
│ [FEDBF-GOA-001] 📋     │ ← ID Badge with copy
│                         │
│   [Animal Photo]        │
│                         │
│   Chaltu (Boer Goat)   │
│   Registered: 2 days ago│
└─────────────────────────┘
```

### 2. My Animals Page Updates

**Location:** `src/pages/MyAnimals.tsx`

**Changes:**
- Add search bar at top
- Filter animals by ID or name
- Show "No animals found" when search has no results
- Clear search button

**Layout:**
```
┌─────────────────────────────────┐
│ My Animals                      │
│                                 │
│ [🔍 Search by ID or name...] ✕ │
│                                 │
│ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │ GOA │ │ SHP │ │ COW │       │
│ │ 001 │ │ 001 │ │ 001 │       │
│ └─────┘ └─────┘ └─────┘       │
└─────────────────────────────────┘
```

### 3. Register Animal Page Updates

**Location:** `src/pages/RegisterAnimal.tsx`

**Changes:**
- Add ID format preview section
- Show example based on selected type
- Explain ID structure
- Bilingual explanation

**Preview Section:**
```
┌─────────────────────────────────┐
│ ℹ️ Animal ID Preview            │
│                                 │
│ Your animals will have IDs like:│
│ FEDBF-GOA-001                   │
│                                 │
│ Format: FARM-TYPE-NUMBER        │
│ • FEDBF = Your farm prefix      │
│ • GOA = Goat type code          │
│ • 001 = Sequential number       │
└─────────────────────────────────┘
```

### 4. Animal Detail Page Updates

**Location:** `src/pages/AnimalDetail.tsx`

**Changes:**
- Display animal ID prominently at top
- Large, bold format
- Copy button
- Show ID in page title

### 5. Milk Recording Updates

**Location:** `src/pages/RecordMilk.tsx`

**Changes:**
- Show animal ID in dropdown options
- Format: "Chaltu (FEDBF-GOA-001)"
- Make ID searchable in dropdown

### 6. Marketplace Privacy

**Location:** `src/components/ListingCard.tsx`, `src/pages/ListingDetail.tsx`

**Changes:**
- Hide animal_id from buyers
- Show animal_id only to listing owner
- Add conditional rendering based on user_id

**Logic:**
```typescript
const showAnimalId = listing.user_id === currentUser.id;

{showAnimalId && (
  <AnimalIdBadge animalId={listing.animal_id} />
)}
```

## Error Handling

### Missing Animal ID

**Scenario:** Old animals without animal_id

**Handling:**
- Show placeholder: "ID not assigned"
- Offer "Generate ID" button
- Run migration script to assign IDs

### Search No Results

**Scenario:** Search query matches no animals

**Handling:**
- Show friendly message
- Suggest clearing search
- Show total animal count

## Testing Strategy

### Unit Tests

1. **AnimalIdBadge Component**
   - Renders ID correctly
   - Copy button works
   - Different sizes render properly

2. **useAnimalSearch Hook**
   - Filters by ID correctly
   - Case-insensitive search works
   - Partial matching works

### Integration Tests

1. **Search Functionality**
   - Type in search bar
   - Results filter correctly
   - Clear search works

2. **Marketplace Privacy**
   - Buyer cannot see animal ID
   - Seller can see animal ID
   - Conditional rendering works

### Manual Testing

1. Register new animal → See ID in success message
2. Go to My Animals → See IDs on all cards
3. Search by ID → Find specific animal
4. View animal detail → See prominent ID
5. Record milk → See ID in dropdown
6. Create listing → ID hidden from buyers

## Performance Considerations

### Search Optimization

- Debounce search input (300ms)
- Use memoization for filtered results
- Index animal_id column in database (already done)

### Rendering Optimization

- Lazy load animal cards
- Virtual scrolling for large lists
- Memoize AnimalIdBadge component

## Accessibility

- Animal ID copyable via keyboard (Ctrl+C)
- Search bar has proper ARIA labels
- Screen reader announces search results count
- High contrast for ID badges

## Localization

### English
- "Animal ID"
- "Search by ID or name"
- "Copy ID"
- "ID copied!"

### Amharic
- "የእንስሳ መለያ"
- "በመለያ ወይም ስም ይፈልጉ"
- "መለያ ቅዳ"
- "መለያ ተቀድቷል!"

## Migration Strategy

### Existing Animals Without IDs

**Script:** `scripts/assign-animal-ids.ts`

```typescript
// For each animal without animal_id:
// 1. Get user's farm prefix
// 2. Get next sequence number for type
// 3. Generate and assign ID
// 4. Update database
```

## Security Considerations

- Animal IDs are not sensitive (just identifiers)
- RLS policies already protect animal data
- Marketplace privacy enforced at component level
- No PII in animal IDs

## Future Enhancements

- QR code generation for animal IDs
- Barcode scanning
- NFC tag integration
- Export animal list with IDs
- Bulk ID assignment tool

---

## Implementation Checklist

- [ ] Create AnimalIdBadge component
- [ ] Create AnimalSearchBar component
- [ ] Create useAnimalSearch hook
- [ ] Update AnimalCard with ID display
- [ ] Update MyAnimals with search
- [ ] Update RegisterAnimal with preview
- [ ] Update AnimalDetail with prominent ID
- [ ] Update RecordMilk dropdown
- [ ] Implement marketplace privacy
- [ ] Add translations
- [ ] Write tests
- [ ] Update documentation
