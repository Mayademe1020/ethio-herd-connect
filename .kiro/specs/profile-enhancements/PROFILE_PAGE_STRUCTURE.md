# Profile Page Structure - After Task 7

## Visual Layout

```
┌─────────────────────────────────────────────────┐
│  Profile                        [Edit Profile]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Personal Info Card                             │
│  ┌───────────────────────────────────────────┐ │
│  │ Farmer Name: [Real Name from DB]          │ │
│  │ Farm Name: [Real Farm Name] (if exists)   │ │
│  │ Phone: [Real Phone Number]                │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Farm Statistics Card                           │
│  ┌───────────────────────────────────────────┐ │
│  │  🐄 Animals  💧 Milk (30d)  🛍️ Listings   │ │
│  │     [#]         [# L]          [#]        │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Quick Actions                                  │
│  ┌───────────────────────────────────────────┐ │
│  │ [Register]  [Record Milk]  [Create List]  │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Analytics Dashboard                            │
│  ┌───────────────────────────────────────────┐ │
│  │ [Charts and Analytics]                    │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Settings                                       │
│  ┌───────────────────────────────────────────┐ │
│  │ 🌐 Language        [Amharic ▼]            │ │
│  │ ─────────────────────────────────────     │ │
│  │ 📅 Calendar        [Ethiopian ▼]          │ │
│  │ ─────────────────────────────────────     │ │
│  │ 🔔 Notifications   [Toggle]               │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Help & Support                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ❓ FAQ                                     │ │
│  │ ✉️  Contact Us                             │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │         🚪 Logout (Red Button)            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
     [Bottom Navigation Bar]
```

## Component Hierarchy

```
Profile
├── Loading State (if loading)
│   ├── Skeleton for header
│   ├── Skeleton for profile card
│   ├── Skeleton for stats card
│   └── Skeleton for other sections
│
├── Error State (if error)
│   ├── AlertCircle icon
│   ├── Error message
│   └── Retry button
│
└── Main Content (if loaded)
    ├── Header
    │   ├── Title: "Profile"
    │   └── Edit Button → Opens EditProfileModal
    │
    ├── Personal Info Card
    │   ├── Farmer Name (from profile.farmer_name)
    │   ├── Farm Name (from profile.farm_name, conditional)
    │   └── Phone (from profile.phone)
    │
    ├── FarmStatsCard
    │   ├── Total Animals count
    │   ├── Milk last 30 days (liters)
    │   └── Active Listings count
    │
    ├── QuickActionsSection
    │   ├── Register Animal button → /register-animal
    │   ├── Record Milk button → /record-milk (requires animals)
    │   └── Create Listing button → /create-listing (requires animals)
    │
    ├── AnalyticsDashboard
    │   └── [Existing analytics component]
    │
    ├── Settings Card (Simplified)
    │   ├── Language Selector (Amharic/English)
    │   ├── Calendar Selector (Gregorian/Ethiopian)
    │   └── Notifications Toggle
    │
    ├── Help & Support Card
    │   ├── FAQ link
    │   └── Contact Us link
    │
    ├── Logout Card
    │   └── Logout Button → Opens LogoutConfirmDialog
    │
    ├── BottomNavigation
    │
    ├── EditProfileModal (conditional)
    │   ├── Farmer Name input (required, 2+ words)
    │   ├── Farm Name input (optional)
    │   ├── Cancel button
    │   └── Save button
    │
    └── LogoutConfirmDialog (conditional)
        ├── Confirmation message
        ├── Cancel button
        └── Logout button (destructive)
```

## Data Flow

```
User Opens Profile Page
         ↓
useProfile Hook Fetches Data
         ↓
    ┌────┴────┐
    │         │
Loading?    Error?
    │         │
    ↓         ↓
Skeleton   Error State
Loaders    + Retry
    │         │
    └────┬────┘
         ↓
   Profile Loaded
         ↓
    ┌────┴────┐
    │         │
Display    useFarmStats
Real Data  Fetches Stats
    │         │
    └────┬────┘
         ↓
   Full UI Rendered
         ↓
    ┌────┴────┐
    │         │
User Edits  User Logs Out
Profile        │
    │          ↓
    ↓     Confirmation
Modal Opens   Dialog
    │          │
    ↓          ↓
Save Changes  Sign Out
    │          │
    ↓          ↓
Update DB   Clear Storage
    │          │
    ↓          ↓
Refetch    Redirect to
Profile      Login
```

## State Management

### Local State
```typescript
const [notificationsEnabled, setNotificationsEnabled] = useState(true);
const [showLogoutDialog, setShowLogoutDialog] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
```

### Server State (React Query)
```typescript
// Profile data
const { profile, isLoading, error, refetch } = useProfile();

// Farm statistics
const { stats, isLoading: statsLoading } = useFarmStats();
```

### Context State
```typescript
// Language context
const { language, setLanguage } = useLanguage();

// Calendar context
const { calendarSystem, setCalendarSystem } = useCalendar();
```

## Key Features

### ✅ Real Data Integration
- Fetches actual user profile from database
- Displays real farmer name, farm name, and phone
- Shows live farm statistics

### ✅ Loading States
- Skeleton loaders for smooth UX
- Loading indicators during updates
- Prevents interaction during loading

### ✅ Error Handling
- Comprehensive error states
- User-friendly error messages
- Retry functionality

### ✅ Profile Editing
- Modal-based editing
- Name validation (2+ words)
- Optional farm name
- Optimistic UI updates

### ✅ Quick Actions
- One-tap access to common tasks
- Smart validation (requires animals for milk/listing)
- Clear visual feedback

### ✅ Simplified Settings
- Only essential options
- Language switching
- Calendar preference
- Notifications toggle

### ✅ Logout Flow
- Confirmation dialog
- Clears local storage
- Signs out from Supabase
- Redirects to login

## Removed Features

### ❌ Placeholder Data
- No more hardcoded names
- No fake email addresses
- No dummy phone numbers
- No placeholder addresses

### ❌ Unnecessary Settings
- Dark mode toggle
- Sound effects toggle
- Font size selector
- Accessibility options
- Developer options
- Experimental features

### ❌ Unused Sections
- Email field
- Address field
- Birthdate field
- Security settings (password, 2FA)
- Social profiles
- Display settings
- Profile picture/avatar

## Mobile Optimization

- ✅ Responsive layout (max-width: 2xl)
- ✅ Touch-friendly buttons (44px+ targets)
- ✅ Proper spacing for bottom navigation
- ✅ Smooth scrolling
- ✅ Optimized for small screens

## Accessibility

- ✅ Proper ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast text
- ✅ Clear error messages
- ✅ Loading announcements

## Performance

- ✅ React Query caching (5 min for stats)
- ✅ Lazy loading of components
- ✅ Optimized re-renders
- ✅ Efficient data fetching
- ✅ Minimal bundle size impact
