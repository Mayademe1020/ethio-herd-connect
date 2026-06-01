# AGENTS.md - AI Agent Guidelines for EthioHerd Connect

## Project Overview
EthioHerd Connect is a mobile-first livestock management platform designed for Ethiopian farmers. The app works offline-first and supports multiple languages (English, Amharic, Oromo, Swahili).

## Technology Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL)
- **State Management:** Zustand + TanStack Query
- **UI:** Tailwind CSS + Radix UI
- **Offline:** IndexedDB + Service Workers
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
- `src/utils/securityUtils.ts:18` - No hardcoded encryption key fallback allowed
- `VITE_ENCRYPTION_KEY` is optional; when unset, local encryption is disabled and plain storage is used

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

### Testing with IndexedDB
Use `fake-indexeddb` for all IndexedDB operations in tests. Import at top of setup:
```typescript
import 'fake-indexeddb/auto';
```
This provides a full in-memory IDB implementation. The hand-rolled mock in `src/test/setup.ts`
has been replaced. The offline queue (`src/lib/offlineQueue.ts`) keeps a synchronous
`memoryStore` as a safety net — all read/write operations update both `memoryStore`
and IndexedDB to ensure consistency regardless of environment.

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

## Authentication (MVP)
- **Local-first**: On first launch, a UUID is generated and stored in localStorage
- **No OTP required** for basic app usage — farmers start using the app immediately
- A Supabase session will be used if available (for cloud sync), but the app works fully offline
- Phone OTP registration can be added later for cross-device sync & account recovery
- Ethiopian phone format: 9 digits starting with 9

## Important Notes
- Currency: Ethiopian Birr (ETB)
- Service worker disabled - use online event fallback

## Session Protocol (3-Skill System)

Every session should follow this protocol to compound knowledge over time.

### Files
- `PROJECT_BRIEF.md` — Living strategy document (read at start, update at end)
- `SESSION_LOG.md` — Compounding knowledge base (append new entry each session)
- `VALUE_TRACKER.md` — Income progress tracker (update numbers each session)

### Workflow
1. **RESEARCH** (start of session): Read PROJECT_BRIEF.md. Ask: "What's the #1 thing to focus on RIGHT NOW?"
2. **WORK** (middle of session): Do the actual task.
3. **BUT-FOR-REAL** (after working): "What's wrong with what I just did? What would a real farmer say?"
4. **LEARNINGS** (end of session): Update all 3 files with what was learned.

### Key Prompts

**Research (start):**
```
I'm working on EthioHerd Connect. Before I start, research:
1. What's the #1 thing I should focus on RIGHT NOW?
2. What would Josh Shpigford say?
3. What's the minimum that ships in 24 hours?
4. What Ethiopian-specific factor am I missing?
```

**But-For-Real (after working):**
```
I just [what you did]. Be brutally honest:
1. What's wrong with what I did?
2. What would a real Ethiopian farmer say?
3. What's the one thing I should fix before next session?
4. On a scale of 1-10, how much closer am I to 5,000 ETB/month?
```

**Learnings (end):**
```
Update my project brief based on what we did today:
- What worked: [specific]
- What didn't: [specific]
- Key decision made: [if any]
- ONE thing to remember next session
```
