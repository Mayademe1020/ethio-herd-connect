---
name: ethio-herd-implementation
description: Guides implementation of features for EthioHerd Connect following project conventions. Use when adding new features, components, pages, or services.
---

# EthioHerd Connect Implementation Skill

This skill guides you through implementing features following EthioHerd Connect's established patterns and conventions.

## Project Structure

```
src/
├── components/     # Reusable UI components (PascalCase)
├── pages/         # Route pages (PascalCase)
├── hooks/         # Custom React hooks (use*.ts)
├── contexts/      # React context providers
├── services/      # Business logic & API
├── stores/        # Zustand stores
├── types/         # TypeScript types
├── utils/         # Utility functions (camelCase)
└── i18n/         # Translations (am.json, en.json, translations.json)
```

## When to Use This Skill

Use this skill when:
- Adding new features to the app
- Creating new components or pages
- Implementing API services
- Adding translations
- Database changes needed

## Implementation Workflow

### 1. Creating a New Component

Follow these steps:

**Step 1: Choose location**
- Reusable UI → `src/components/`
- Page-specific → component lives inside the page file or nearby

**Step 2: Use proper naming**
- Components: `AnimalCard.tsx`, `SellAnimalModal.tsx`
- Hooks: `useAuth.ts`, `useAnimals.ts`
- Utils: `securityUtils.ts`, `logger.ts`

**Step 3: Follow component patterns**

```tsx
// Use existing UI components from @/components/ui
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

// Use lucide-react icons
import { Bell, Download, ChevronRight } from 'lucide-react';

// Use toast for notifications
import { toast } from 'sonner';

// Use TanStack Query for data fetching
import { useQuery, useMutation } from '@tanstack/react-query';
```

**Step 4: Add accessibility**
- All interactive elements need `aria-label` or `aria-labelledby`
- Use semantic HTML (`<button>`, not `<div>`)
- Support keyboard navigation

**Step 5: Add translations if needed**
- Check `src/i18n/am.json` and `src/i18n/en.json`
- Add new keys following existing patterns
- Oromo/Swahili in `src/i18n/translations.json`

### 2. Creating a New Service

**Step 1: Location**
- API logic → `src/services/`
- Database client → `src/integrations/supabase/`

**Step 2: Service pattern**

```typescript
// src/services/newService.ts
import { supabase } from '@/integrations/supabase/client';

export interface ServiceResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function myFunction(param: string): Promise<ServiceResult> {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('column', param);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: String(error) };
  }
}
```

**Step 3: Use parameterized queries - NEVER string concatenation**

```typescript
// ✅ CORRECT
.eq('user_id', user.id)
.ilike('name', `%${searchQuery}%`)

// ❌ WRONG - SQL injection risk
.from(`users_${user.id}`)
```

### 3. Adding a New Page Route

**Step 1: Create the page file**
- Location: `src/pages/YourPageName.tsx`
- Use functional component with TypeScript

**Step 2: Add lazy import in App**

```typescript
// src/AppMVP.tsx
const YourPageName = lazy(() => 
  import("./pages/YourPageName").then(m => ({ default: m.default }))
);
```

**Step 3: Add route**

```tsx
<Route path="/your-path" element={
  <Suspense fallback={<LoadingSpinner />}>
    <YourPageName />
  </Suspense>
} />
```

### 4. Database Changes

**Step 1: Create migration**
- Location: `supabase/migrations/`
- Use Supabase CLI: `supabase migration new migration_name`

**Step 2: Update types**
- Location: `src/integrations/supabase/types.ts`

**Step 3: Add RLS policies**
- Always add Row Level Security policies for new tables

### 5. Translation Pattern

**For Amharic/English (full translations):**
```json
// src/i18n/am.json or en.json
{
  "newFeature": {
    "title": "Translation",
    "description": "Description text"
  }
}
```

**For Oromo/Swahili (partial):**
```json
// src/i18n/translations.json
{
  "or": {
    "newFeature": {
      "title": "Oromo translation"
    }
  },
  "sw": {
    "newFeature": {
      "title": "Swahili translation"
    }
  }
}
```

## Common Implementation Tasks

### Adding a Toggle/Switch
```tsx
import { Switch } from '@/components/ui/switch';

<Switch 
  checked={enabled} 
  onCheckedChange={(checked) => {
    // Handle toggle
    toast.success(checked ? 'Enabled' : 'Disabled');
  }} 
/>
```

### Adding a Button
```tsx
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '@/components/ui/enhanced-button';

<Button variant="outline" size="sm">Label</Button>
<EnhancedButton>Primary Action</EnhancedButton>
```

### Data Fetching Pattern
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', user?.id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    return data;
  },
  enabled: !!user,
});
```

### Export to CSV Pattern
```typescript
import { exportService } from '@/services/exportService';

// Fetch data
const { data } = await supabase.from('table').select('*');

// Export
exportService.exportAnimalsToCSV(data);
```

### Offline-First Pattern
```tsx
// Check online status
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

// Use cached data when offline
if (!isOnline) {
  const cached = localStorage.getItem('cacheKey');
  return JSON.parse(cached);
}
```

## Project-Specific Notes

### Ethiopian Context
- Phone auth: 9 digits starting with 9
- Currency: Ethiopian Birr (ETB)
- Default language: Amharic ('am')
- Calendar: Support Ethiopian calendar

### Offline-First Requirements
- Service worker currently disabled
- Use online event fallback
- Cache data in localStorage/IndexedDB
- Queue mutations when offline

### Security
- Use `import.meta.env.VITE_*` for env vars
- Sanitize user inputs
- Never expose credentials in code

## Quality Checklist

Before marking implementation complete:
- [ ] Build passes: `npm run build`
- [ ] TypeScript compiles without errors
- [ ] Translations added for new UI text
- [ ] Accessibility: aria-labels on interactive elements
- [ ] Offline handling if applicable
- [ ] RLS policies if database changes

## Example: Adding Export Button

1. **Import service**: `import { exportService } from '@/services/exportService';`
2. **Add state**: `const [isExporting, setIsExporting] = useState(false);`
3. **Create handler**:
```tsx
const handleExport = async () => {
  setIsExporting(true);
  try {
    const { data } = await supabase.from('animals').select('*');
    exportService.exportAnimalsToCSV(data);
    toast.success('Exported successfully');
  } catch {
    toast.error('Export failed');
  } finally {
    setIsExporting(false);
  }
};
```
4. **Add button**:
```tsx
<Button onClick={handleExport} disabled={isExporting}>
  <Download className="w-4 h-4 mr-2" />
  Export
</Button>
```
