# Design Document: Ethiopian Livestock Breed Management

## Overview

The Ethiopian Livestock Breed Management feature provides a dynamic, context-aware breed selection system that adapts to the selected animal type. The system maintains a comprehensive database of Ethiopian livestock breeds while allowing flexibility for farmers who may not know exact breed names. The design integrates seamlessly with the existing animal registration workflow and supports multi-language display.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Animal Registration UI                    │
│  ┌────────────────┐         ┌──────────────────────────┐   │
│  │ Animal Type    │────────▶│  Breed Selection         │   │
│  │ Selector       │         │  Component               │   │
│  └────────────────┘         └──────────────────────────┘   │
│                                      │                       │
│                                      ▼                       │
│                             ┌─────────────────┐             │
│                             │ Breed Search/   │             │
│                             │ Filter          │             │
│                             └─────────────────┘             │
│                                      │                       │
│                                      ▼                       │
│                             ┌─────────────────┐             │
│                             │ Custom Breed    │             │
│                             │ Input (Optional)│             │
│                             └─────────────────┘             │
└─────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Breed Data Layer                          │
│  ┌──────────────────┐      ┌──────────────────────────┐    │
│  │ Breed Registry   │      │ Translation Service      │    │
│  │ (Static Data)    │      │ (i18n)                   │    │
│  └──────────────────┘      └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Persistence                          │
│                    (Supabase)                                │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

1. **EnhancedAnimalRegistrationForm** (existing)
   - Contains animal type selection
   - Integrates BreedSelector component

2. **BreedSelector** (new)
   - Manages breed selection logic
   - Handles dynamic breed filtering
   - Provides search functionality
   - Manages custom breed input

3. **BreedRegistry** (new utility)
   - Centralized breed data management
   - Provides breed lookup by animal type
   - Supports extensibility

## Components and Interfaces

### 1. Breed Data Structure

```typescript
// src/data/ethiopianBreeds.ts

export interface BreedInfo {
  id: string;
  name: {
    en: string;
    am: string;
  };
  animalType: AnimalType;
  description?: {
    en: string;
    am: string;
  };
  characteristics?: {
    size?: string;
    color?: string[];
    distinguishingFeatures?: string;
  };
}

export type AnimalType = 'cattle' | 'sheep' | 'goat' | 'poultry' | 'camel' | 'donkey' | 'horse';

export interface BreedRegistry {
  [animalType: string]: BreedInfo[];
}

// Comprehensive Ethiopian breed database
export const ETHIOPIAN_BREEDS: BreedRegistry = {
  cattle: [
    {
      id: 'cattle-boran',
      name: { en: 'Boran', am: 'ቦራን' },
      animalType: 'cattle',
      description: {
        en: 'Hardy breed from southern Ethiopia',
        am: 'ከደቡብ ኢትዮጵያ የመጣ ጠንካራ ዝርያ'
      },
      characteristics: {
        size: 'Large',
        color: ['White', 'Grey'],
        distinguishingFeatures: 'Large hump, long horns'
      }
    },
    {
      id: 'cattle-horro',
      name: { en: 'Horro', am: 'ሆሮ' },
      animalType: 'cattle',
      // ... more details
    },
    // ... more cattle breeds
  ],
  sheep: [
    {
      id: 'sheep-menz',
      name: { en: 'Menz', am: 'መንዝ' },
      animalType: 'sheep',
      // ... details
    },
    // ... more sheep breeds
  ],
  goat: [
    {
      id: 'goat-woyto-guji',
      name: { en: 'Woyto-Guji', am: 'ወይቶ-ጉጂ' },
      animalType: 'goat',
      // ... details
    },
    // ... more goat breeds
  ],
  poultry: [
    {
      id: 'poultry-local',
      name: { en: 'Local/Indigenous', am: 'የአገር ውስጥ' },
      animalType: 'poultry',
      // ... details
    },
    // ... more poultry breeds
  ]
};
```

### 2. Breed Selector Component

```typescript
// src/components/BreedSelector.tsx

interface BreedSelectorProps {
  animalType: AnimalType | '';
  selectedBreed: string;
  customBreed?: string;
  onBreedChange: (breed: string, isCustom: boolean) => void;
  onCustomBreedChange?: (customBreed: string) => void;
  language: Language;
  disabled?: boolean;
}

export const BreedSelector: React.FC<BreedSelectorProps> = ({
  animalType,
  selectedBreed,
  customBreed,
  onBreedChange,
  onCustomBreedChange,
  language,
  disabled
}) => {
  // Component implementation
  // - Fetches breeds for selected animal type
  // - Provides search/filter functionality
  // - Handles "Other/Unknown" selection
  // - Manages custom breed input
};
```

### 3. Breed Registry Utility

```typescript
// src/utils/breedRegistry.ts

export class BreedRegistryService {
  /**
   * Get all breeds for a specific animal type
   */
  static getBreedsByAnimalType(
    animalType: AnimalType,
    language: Language = 'en'
  ): Array<{ value: string; label: string }> {
    // Returns formatted breed options for the given animal type
  }

  /**
   * Search breeds by query string
   */
  static searchBreeds(
    animalType: AnimalType,
    query: string,
    language: Language = 'en'
  ): Array<{ value: string; label: string }> {
    // Returns filtered breed options matching the query
  }

  /**
   * Get breed information by ID
   */
  static getBreedInfo(
    breedId: string,
    language: Language = 'en'
  ): BreedInfo | null {
    // Returns detailed breed information
  }

  /**
   * Validate if a breed exists for an animal type
   */
  static isValidBreed(
    animalType: AnimalType,
    breedId: string
  ): boolean {
    // Returns true if breed exists for the animal type
  }
}
```

### 4. Updated Animal Data Type

```typescript
// Update to src/types/index.ts

export interface AnimalData {
  // ... existing fields
  breed: string;
  breed_custom?: string; // For user-provided breed descriptions
  is_custom_breed?: boolean; // Flag to indicate custom breed entry
}
```

## Data Models

### Database Schema Updates

```sql
-- Add columns to animals table for custom breed support
ALTER TABLE animals 
ADD COLUMN breed_custom TEXT,
ADD COLUMN is_custom_breed BOOLEAN DEFAULT FALSE;

-- Create index for breed queries
CREATE INDEX idx_animals_breed ON animals(breed);
CREATE INDEX idx_animals_type_breed ON animals(type, breed);
```

### Breed Data Storage

Breed data will be stored as static configuration files:

1. **Primary Storage**: `src/data/ethiopianBreeds.ts`
   - TypeScript file with breed definitions
   - Type-safe and compile-time validated
   - Easy to version control

2. **Translation Integration**: Leverage existing i18n system
   - Breed names stored in translation files
   - Fallback to English if translation missing

3. **Future Extensibility**: Support for external breed data
   - JSON configuration file support
   - API endpoint for dynamic breed loading (future enhancement)

## User Interface Design

### Breed Selection Flow

```
1. User selects animal type (e.g., "Cattle")
   ↓
2. Breed dropdown becomes enabled
   ↓
3. Breed options filtered to show only cattle breeds
   ↓
4. User can:
   a) Select from predefined breeds
   b) Search/filter breeds
   c) Select "Other/Unknown" for custom entry
   ↓
5. If "Other/Unknown" selected:
   - Text field appears
   - User enters custom breed description
   ↓
6. Breed selection saved with animal data
```

### UI Components

1. **Breed Dropdown**
   - Searchable select component
   - Grouped by relevance (common breeds first)
   - "Other/Unknown" option at the bottom
   - Optional breed info tooltip

2. **Custom Breed Input**
   - Appears when "Other/Unknown" selected
   - Placeholder text: "Describe the breed (e.g., 'White with black spots, medium size')"
   - Character limit: 200 characters
   - Helper text explaining what to include

3. **Breed Display**
   - In animal cards: Show breed name
   - If custom: Show with indicator (e.g., badge "Custom")
   - In animal details: Full breed information or custom description

## Error Handling

### Validation Rules

1. **Breed Selection Validation**
   - Breed required when animal type is selected
   - If "Other/Unknown" selected, custom description required
   - Custom description minimum length: 3 characters

2. **Data Integrity**
   - Validate breed exists for selected animal type
   - Sanitize custom breed input
   - Handle missing translations gracefully

### Error Messages

```typescript
const BREED_ERROR_MESSAGES = {
  en: {
    breedRequired: 'Please select a breed',
    customBreedRequired: 'Please describe the breed',
    customBreedTooShort: 'Breed description must be at least 3 characters',
    invalidBreedForType: 'Selected breed is not valid for this animal type'
  },
  am: {
    breedRequired: 'እባክዎ ዝርያ ይምረጡ',
    customBreedRequired: 'እባክዎ ዝርያውን ይግለጹ',
    customBreedTooShort: 'የዝርያ መግለጫ ቢያንስ 3 ቁምፊዎች መሆን አለበት',
    invalidBreedForType: 'የተመረጠው ዝርያ ለዚህ የእንስሳ አይነት ትክክል አይደለም'
  }
};
```

## Testing Strategy

### Unit Tests

1. **BreedRegistryService Tests**
   - Test breed retrieval by animal type
   - Test breed search functionality
   - Test breed validation
   - Test language fallback

2. **BreedSelector Component Tests**
   - Test breed filtering when animal type changes
   - Test custom breed input toggle
   - Test search functionality
   - Test disabled state

### Integration Tests

1. **Animal Registration Flow**
   - Test complete registration with standard breed
   - Test registration with custom breed
   - Test breed persistence and retrieval
   - Test breed display in animal cards

2. **Multi-language Tests**
   - Test breed names in Amharic
   - Test breed names in English
   - Test fallback behavior

### Manual Testing Checklist

- [ ] Select each animal type and verify correct breeds appear
- [ ] Search for breeds in English and Amharic
- [ ] Enter custom breed description and verify it saves
- [ ] Edit animal and change breed
- [ ] Verify breed displays correctly in animal cards
- [ ] Test with long breed names and descriptions
- [ ] Test validation messages in both languages

## Performance Considerations

1. **Breed Data Loading**
   - Breeds loaded statically at build time
   - No API calls required for breed data
   - Minimal memory footprint (~50KB for all breeds)

2. **Search Performance**
   - Client-side filtering for instant results
   - Debounced search input (300ms)
   - Maximum 100 breeds per animal type

3. **Rendering Optimization**
   - Virtualized list for large breed sets (if needed)
   - Memoized breed options
   - Lazy loading of breed descriptions

## Security Considerations

1. **Input Sanitization**
   - Sanitize custom breed descriptions
   - Prevent XSS attacks in breed display
   - Validate breed IDs against known breeds

2. **Data Validation**
   - Server-side validation of breed data
   - Ensure breed matches animal type
   - Limit custom breed description length

## Migration Strategy

### Phase 1: Add Breed Infrastructure
- Create breed data files
- Implement BreedRegistryService
- Add database columns

### Phase 2: Update UI Components
- Create BreedSelector component
- Integrate into EnhancedAnimalRegistrationForm
- Update animal cards to display breed

### Phase 3: Data Migration
- Migrate existing breed data
- Mark existing custom entries
- Validate data integrity

### Phase 4: Testing and Rollout
- Comprehensive testing
- User acceptance testing
- Gradual rollout with monitoring

## Future Enhancements

1. **Breed Analytics**
   - Track most common breeds
   - Suggest breeds based on location
   - Breed performance metrics

2. **Crossbreed Support**
   - Track parent breeds for crossbreeds
   - Calculate breed percentages
   - Crossbreed naming conventions

3. **Breed Images**
   - Visual breed identification
   - Photo gallery for each breed
   - AI-powered breed recognition

4. **Community Contributions**
   - Allow users to suggest new breeds
   - Crowdsourced breed information
   - Breed verification system
