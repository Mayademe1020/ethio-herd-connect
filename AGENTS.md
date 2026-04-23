# AGENTS.md - AI Agent Guidelines for EthioHerd Connect

## Project Overview
EthioHerd Connect is a mobile-first livestock management platform designed for Ethiopian farmers. The app works offline-first and supports multiple languages (English, Amharic, Oromo, Swahili).

## Technology Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL)
- **State Management:** Zustand + TanStack Query
- **UI:** Tailwind CSS + Radix UI
- **Offline:** IndexedDB + Service Workers
- **Authentication:** Phone OTP (Ethiopia-specific)

## Code Conventions

### File Organization
```
src/
├── components/     # Reusable UI components
├── pages/         # Route pages
├── hooks/         # Custom React hooks
├── contexts/      # React context providers
├── services/      # Business logic & API
├── stores/        # Zustand stores
├── types/         # TypeScript types
├── utils/         # Utility functions
└── i18n/         # Translations
```

### Naming Conventions
- **Components:** PascalCase (`AnimalCard.tsx`, `SellAnimalModal.tsx`)
- **Hooks:** camelCase with `use` prefix (`useAuth.ts`, `useAnimals.ts`)
- **Utils:** camelCase (`securityUtils.ts`, `logger.ts`)
- **Types:** PascalCase (`AnimalData`, `MarketListing`)

### Security Requirements
1. **NEVER** expose API keys or credentials in code
2. Use `import.meta.env.VITE_*` for environment variables
3. **ALWAYS** sanitize user inputs before database insertion
4. Use parameterized queries - never string concatenation for SQL
5. Add RLS (Row Level Security) policies to all database tables

**Critical Update:**
- `src/utils/securityUtils.ts:31` - No hardcoded encryption key fallback allowed
- `VITE_ENCRYPTION_KEY` is required for production; missing key will throw error

### Accessibility (WCAG AA)
- All interactive elements must have `aria-label` or `aria-labelledby`
- Use semantic HTML (`<button>`, `<input>`, not `<div>`)
- Ensure color contrast meets 4.5:1 ratio
- Support keyboard navigation

### Offline-First Architecture
The app must work without internet. Key patterns:
1. Use TanStack Query with `networkMode: 'offlineFirst'`
2. Store data in IndexedDB for offline access
3. Queue mutations when offline, sync when online
4. Show offline indicators to users

### Internationalization
All user-facing text must support:
- English (en)
- Amharic (am)
- Oromo (or)
- Swahili (sw)

Use the translation system:
```typescript
const { t } = useTranslations();
return <p>{t.welcome}</p>;
```

## Common Tasks

### Adding a New Feature
1. Create component in `src/components/`
2. Add page route in `App.tsx`
3. Add translations to `src/i18n/`
4. Test offline functionality

### Database Changes
1. Create migration in `supabase/migrations/`
2. Update types in `src/integrations/supabase/types.ts`
3. Add RLS policies
4. Update securityUtils if needed

### Running Tests
```bash
# Unit tests
npm run test:run

# E2E tests
npm run test:e2e

# Build
npm run build
```

## Critical Files
- `src/App.tsx` - Main application entry
- `src/contexts/AuthContext.tsx` - Authentication
- `src/integrations/supabase/client.ts` - Database client
- `src/utils/securityUtils.ts` - Security utilities
- `vite.config.ts` - Build configuration

## Performance Targets
- Initial load: <300KB
- Time to interactive: <3s on 3G
- Offline support: Required

## Important Notes
- Phone numbers are the primary auth (not email)
- Ethiopian format: 9 digits starting with 9
- Currency: Ethiopian Birr (ETB)
- Service worker disabled - use online event fallback
