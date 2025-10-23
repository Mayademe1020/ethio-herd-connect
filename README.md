# Ethio Herd Connect

A comprehensive livestock management platform designed for Ethiopian farmers, optimized for basic smartphones and limited connectivity.

## Project info

**URL**: https://lovable.dev/projects/671400f7-f753-4d5c-8596-ba7f63f8d43d

## Overview

Ethio Herd Connect helps Ethiopian livestock farmers manage their animals, track health records, record milk production, and participate in a marketplace - all with offline-first capabilities designed for rural connectivity challenges.

### Key Features

- 🐄 **Animal Management**: Register and track cattle, goats, sheep, and poultry
- 🏥 **Health Tracking**: Record vaccinations, treatments, and health events
- 🥛 **Milk Production**: Track daily milk production and trends
- 🛒 **Marketplace**: Buy and sell livestock with integrated messaging
- 📊 **Analytics**: View herd statistics and production insights
- 📱 **Offline-First**: Core features work without internet connectivity
- 🌍 **Multi-Language**: Supports Amharic, English, Oromo, and Swahili
- 📅 **Ethiopian Calendar**: Native support for Ethiopian calendar system

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/671400f7-f753-4d5c-8596-ba7f63f8d43d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/671400f7-f753-4d5c-8596-ba7f63f8d43d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## Architecture Overview

### Technology Stack

**Frontend**:
- React 18 with TypeScript
- Vite for build tooling
- TanStack Query (React Query) for data fetching
- Zustand for global state management
- Tailwind CSS + shadcn/ui for styling
- i18next for internationalization

**Backend**:
- Supabase (PostgreSQL database)
- Row Level Security (RLS) for data protection
- Real-time subscriptions
- Authentication and authorization

**Offline Support**:
- IndexedDB for local data caching
- Offline action queue for sync
- Service Worker for asset caching

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── forms/          # Standard form components
│   └── ...
├── pages/              # Page components (routes)
│   ├── Animals.tsx
│   ├── HealthRecords.tsx
│   ├── MilkProductionRecords.tsx
│   └── PublicMarketplaceEnhanced.tsx
├── hooks/              # Custom React hooks
│   ├── usePaginatedAnimals.tsx
│   ├── useOfflineCache.tsx
│   └── useOfflineActionQueue.tsx
├── utils/              # Utility functions
│   ├── logger.ts
│   ├── indexedDB.ts
│   ├── offlineActionQueue.ts
│   └── securityUtils.ts
├── contexts/           # React contexts
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
├── i18n/               # Internationalization
└── docs/               # Documentation
    ├── adr/            # Architecture Decision Records
    ├── CONSOLIDATION_SUMMARY.md
    ├── MIGRATION_GUIDE.md
    ├── REMOVED_FEATURES.md
    ├── DESIGN_SYSTEM.md
    ├── OFFLINE_FUNCTIONALITY.md
    └── PERFORMANCE_OPTIMIZATION.md
```

### Core Architecture Patterns

#### 1. Offline-First Architecture

The platform uses an offline-first approach to handle poor connectivity:

- **IndexedDB Caching**: Critical data cached locally for offline access
- **Action Queue**: Create/update/delete operations queued when offline
- **Automatic Sync**: Queued actions sync when connection restored
- **Optimistic Updates**: UI updates immediately, syncs in background

See [Offline Functionality Documentation](./src/docs/OFFLINE_FUNCTIONALITY.md) for details.

#### 2. Pagination Strategy

All list views use pagination for performance:

- **usePaginatedQuery**: Base pagination hook
- **usePaginatedAnimals**: Animals list pagination
- **usePaginatedHealthRecords**: Health records pagination
- **usePaginatedMilkProduction**: Milk production pagination
- **usePaginatedMarketListings**: Marketplace pagination

Benefits:
- Faster initial load times
- Reduced data usage
- Better performance on low-end devices

#### 3. Component Consolidation

Single implementation per feature:

- **Animals**: `Animals.tsx` (consolidated from 3 versions)
- **Health Records**: `HealthRecords.tsx` (consolidated from 3 versions)
- **Milk Production**: `MilkProductionRecords.tsx` (consolidated from 2 versions)
- **Marketplace**: `PublicMarketplaceEnhanced.tsx` (consolidated from 4 versions)

See [Consolidation Summary](./src/docs/CONSOLIDATION_SUMMARY.md) for details.

#### 4. Design System

Standardized components and patterns:

- **Standard Form Components**: Consistent form UX
- **Color Palette**: Defined color system
- **Typography**: Consistent text styles
- **Touch Targets**: Minimum 44x44px for mobile
- **Loading States**: Consistent loading indicators

See [Design System Documentation](./src/docs/DESIGN_SYSTEM.md) for details.

### Data Flow

```
User Action
    ↓
Component
    ↓
Custom Hook (e.g., usePaginatedAnimals)
    ↓
React Query (TanStack Query)
    ↓
Supabase Client
    ↓
PostgreSQL Database (with RLS)
    ↓
Response cached in React Query
    ↓
Also cached in IndexedDB (for offline)
    ↓
Component updates
```

### Offline Data Flow

```
User Action (while offline)
    ↓
Component
    ↓
Optimistic Update (UI updates immediately)
    ↓
Action added to Offline Queue (IndexedDB)
    ↓
Connection restored
    ↓
Offline Queue syncs to Supabase
    ↓
Success: Remove from queue
    ↓
Failure: Retry with exponential backoff
```

### Security Architecture

- **Row Level Security (RLS)**: Users can only access their own data
- **Input Sanitization**: All user inputs sanitized before processing
- **Secure API Client**: Rate limiting and authentication built-in
- **No Sensitive Logging**: Sensitive data never logged
- **Encryption**: Sensitive fields encrypted at rest

See [Security Audit Report](./SECURITY_AUDIT_REPORT.md) for details.

### Performance Optimizations

- **Code Splitting**: Routes lazy-loaded
- **Image Optimization**: Lazy loading and responsive images
- **Bundle Size**: Reduced from 800KB to 450KB (gzipped)
- **Database Indexes**: Optimized queries with proper indexes
- **Caching Strategy**: Multi-layer caching (React Query + IndexedDB)

See [Performance Optimization Documentation](./src/docs/PERFORMANCE_OPTIMIZATION.md) for details.

### Ethiopian Farmer Optimizations

The platform is specifically optimized for Ethiopian farmers:

1. **Low-Literacy Support**:
   - Icon-based navigation
   - Visual indicators (color-coded health status)
   - Minimal text entry (dropdowns, buttons)
   - Simple, clear language

2. **Basic Smartphone Support**:
   - Optimized for 2GB RAM devices
   - Fast performance on slow processors
   - Large touch targets (44x44px minimum)
   - Mobile-first responsive design

3. **Limited Connectivity**:
   - Offline-first architecture
   - Core features work without internet
   - Automatic sync when online
   - Reduced data usage (pagination, caching)

4. **Cultural Considerations**:
   - Ethiopian calendar support
   - Multi-language (Amharic, English, Oromo, Swahili)
   - Culturally appropriate icons and imagery
   - Local units and measurements

### Key Architectural Decisions

All major architectural decisions are documented in Architecture Decision Records (ADRs):

- [ADR-001: Page Consolidation Strategy](./src/docs/adr/001-page-consolidation-strategy.md)
- [ADR-002: Component Consolidation Strategy](./src/docs/adr/002-component-consolidation-strategy.md)
- [ADR-003: Marketplace Consolidation](./src/docs/adr/003-marketplace-consolidation.md)
- [ADR-004: Logging Infrastructure](./src/docs/adr/004-logging-infrastructure.md)
- [ADR-005: Offline-First Architecture](./src/docs/adr/005-offline-first-architecture.md)

See [ADR Index](./src/docs/adr/README.md) for complete list.

### Quality Metrics

**Performance**:
- First Contentful Paint: < 2s on 3G ✅
- Time to Interactive: < 4s on 3G ✅
- Bundle Size: 450KB (gzipped) ✅
- Lighthouse Score: 92/100 ✅

**Code Quality**:
- Zero duplicate implementations ✅
- Zero console.log statements ✅
- TypeScript strict mode ✅
- Centralized logging ✅

**User Experience**:
- Offline functionality for core features ✅
- Consistent UX across all pages ✅
- Mobile-optimized (44x44px touch targets) ✅
- Multi-language support ✅

---

## Documentation

### For Developers

- [Migration Guide](./src/docs/MIGRATION_GUIDE.md) - Guide for working with consolidated codebase
- [Consolidation Summary](./src/docs/CONSOLIDATION_SUMMARY.md) - Overview of quality audit changes
- [Removed Features](./src/docs/REMOVED_FEATURES.md) - What was removed and why
- [Design System](./src/docs/DESIGN_SYSTEM.md) - Component and style guidelines
- [Architecture Decision Records](./src/docs/adr/README.md) - Major architectural decisions

### For Features

- [Offline Functionality](./src/docs/OFFLINE_FUNCTIONALITY.md) - How offline support works
- [Offline Action Queue](./src/docs/OFFLINE_ACTION_QUEUE.md) - Action queue implementation
- [Performance Optimization](./src/docs/PERFORMANCE_OPTIMIZATION.md) - Performance improvements

### For Users

- [Ethiopian Calendar Feature](./README_CALENDAR_FEATURE.md) - Ethiopian calendar integration
- [Phase 3 Completion](./README_PHASE3_COMPLETE.md) - Recent feature updates

---

## Contributing

### Development Workflow

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Make changes
5. Test thoroughly (especially offline functionality)
6. Commit with clear message
7. Push changes

### Code Standards

- Use TypeScript for all new code
- Follow existing patterns (see Design System)
- Use standard form components
- Use logger utility (not console.log)
- Sanitize all user inputs
- Test offline functionality
- Ensure accessibility (WCAG AA)
- Maintain touch target size (44x44px)

### Before Committing

- [ ] Run TypeScript check: `npm run type-check`
- [ ] Test on mobile device or emulator
- [ ] Test offline functionality
- [ ] Check accessibility
- [ ] Update documentation if needed
- [ ] Add/update tests

---

## Support

For questions or issues:

1. Check the [documentation](./src/docs/)
2. Review [Architecture Decision Records](./src/docs/adr/README.md)
3. Check [Migration Guide](./src/docs/MIGRATION_GUIDE.md)
4. Contact the development team

---

## License

[Add license information here]
