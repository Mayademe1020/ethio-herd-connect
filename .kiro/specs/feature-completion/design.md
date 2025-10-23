# Feature Completion - Technical Design Document

## Overview

This design document outlines the technical approach for completing 6 features in EthioHerd Connect. The design focuses on leveraging existing infrastructure (database tables, hooks, components) and filling in the missing UI and business logic.

**Features to Complete:**
1. Private Market Listings (30% remaining)
2. Health Records (15% remaining)
3. Dashboard (25% remaining)
4. Feed Inventory (100% new)
5. Breeding Management (100% new)
6. Vaccination Schedules (100% new)

---

## Architecture Overview

### Existing Infrastructure (Leverage)
- ✅ Database tables exist for all features
- ✅ RLS policies configured
- ✅ Authentication system working
- ✅ Offline sync system ready
- ✅ Multi-language support in place
- ✅ Component library available

### What Needs Building
- UI components for new features
- Business logic for calculations
- Integration with existing hooks
- Form validation and error handling
- Real-time updates and notifications

---

## Feature 1: Private Market Listings

### Current State
- ✅ MyListings page exists
- ✅ Can view listings by status
- ✅ Can delete listings
- ❌ Edit functionality not implemented
- ❌ Analytics not shown
    

### Architecture

**Components:**
```
src/pages/MyListings.tsx (exists, needs edit modal)
src/components/MarketListingForm.tsx (exists, needs edit mode)
src/pages/SellerAnalytics.tsx (exists, needs data connection)
src/hooks/useMarketListingManagement.tsx (exists, has edit/delete)
```

**Data Flow:**
```
User clicks Edit
  → MarketListingForm opens with listing data
  → User modifies fields
  → Form validates
  → useMarketListingManagement.updateListing()
  → Database updates 
  → UI refreshes
```

### Implementation Details

**Edit Modal:**
```typescript
// Add to MyListings.tsx
const [editingListing, setEditingListing] = useState<Listing | null>(null);

<MarketListingForm
  listing={editingListing}
  mode="edit"
  onClose={() => setEditingListing(null)}
  onSuccess={() => {
    setEditingListing(null);
    refetch();
  }}
/>
```

**Analytics Dashboard:**
```typescript
// SellerAnalytics.tsx
const { data: analytics } = useQuery({
  queryKey: ['seller-analytics', user?.id],
  queryFn: async () => {
    // Fetch view counts
    const views = await supabase
      .from('listing_views')
      .select('listing_id, count')
      .eq('user_id', user.id);
    
    // Fetch interest expressions
    const interests = await supabase
      .from('buyer_interests')
      .select('listing_id, count')
      .eq('seller_id', user.id);
    
    return { views, interests };
  }
});
```

---

## Feature 2: Health Records

### Current State
- ✅ Health page exists
- ✅ Can record vaccinations
- ✅ Can report illness
- ❌ Records display uses mock data
- ❌ No filtering or export

### Architecture

**Components:**
```
src/pages/Health.tsx (exists, needs records display)
src/components/HealthRecordsList.tsx (new)
src/components/HealthRecordDetail.tsx (new)
src/hooks/useHealthRecords.tsx (new)
```

**Data Flow:**
```
User views Health page
  → useHealthRecords.fetchRecords()
  → Database query with filters
  → Display in HealthRecordsList
  → User clicks record
  → HealthRecordDetail shows full info
```

### Implementation Details

**Health Records Hook:**
```typescript
// src/hooks/useHealthRecords.tsx
export const useHealthRecords = (animalId?: string) => {
  return useQuery({
    queryKey: ['health-records', user?.id, animalId],
    queryFn: async () => {
      let query = supabase
        .from('health_records')
        .select(`
          *,
          animals (name, animal_code, type)
        `)
        .eq('user_id', user.id)
        .order('administered_date', { ascending: false });
      
      if (animalId) {
        query = query.eq('animal_id', animalId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
};
```

**Records Display Component:**
```typescript
// src/components/HealthRecordsList.tsx
export const HealthRecordsList = ({ animalId, language }) => {
  const { data: records, isLoading } = useHealthRecords(animalId);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-4">
      {records?.map(record => (
        <HealthRecordCard key={record.id} record={record} />
      ))}
    </div>
  );
};
```

---

## Feature 3: Dashboard Real Data

### Current State
- ✅ Dashboard exists
- ✅ useDashboardStats hook exists
- ❌ Some stats still use mock data
- ❌ Recent activity not from database

### Architecture

**Components:**
```
src/components/HomeScreen.tsx (exists, needs full integration)
src/hooks/useDashboardStats.tsx (exists, needs completion)
src/hooks/useRecentActivity.tsx (new)
```

**Data Flow:**
```
User opens app
  → useDashboardStats.fetch()
  → Parallel queries for all stats
  → useRecentActivity.fetch()
  → Display real-time data
  → Auto-refresh every 5 minutes
```

### Implementation Details

**Complete Dashboard Stats:**
```typescript
// Update useDashboardStats.tsx
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      // Parallel queries for performance
      const [animals, health, market, growth, financial] = await Promise.all([
        supabase.from('animals').select('count').eq('user_id', user.id),
        supabase.from('health_records').select('count').eq('user_id', user.id),
        supabase.from('market_listings').select('count, price').eq('user_id', user.id),
        supabase.from('growth_records').select('weight, recorded_date').eq('user_id', user.id),
        supabase.from('financial_records').select('amount, type').eq('user_id', user.id)
      ]);
      
      return {
        totalAnimals: animals.count,
        healthRecords: health.count,
        marketListings: market.count,
        totalRevenue: calculateRevenue(market.data),
        growthRate: calculateGrowthRate(growth.data),
        netIncome: calculateNetIncome(financial.data)
      };
    },
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });
};
```

**Recent Activity Feed:**
```typescript
// src/hooks/useRecentActivity.tsx
export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity', user?.id],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Fetch recent events from multiple tables
      const [animals, health, market] = await Promise.all([
        supabase.from('animals').select('*').eq('user_id', user.id).gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from('health_records').select('*').eq('user_id', user.id).gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from('market_listings').select('*').eq('user_id', user.id).gte('created_at', sevenDaysAgo.toISOString())
      ]);
      
      // Combine and sort by date
      const activities = [
        ...animals.data.map(a => ({ type: 'animal', ...a })),
        ...health.data.map(h => ({ type: 'health', ...h })),
        ...market.data.map(m => ({ type: 'market', ...m }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return activities.slice(0, 10); // Latest 10
    }
  });
};
```

---

## Feature 4: Feed Inventory Management

### Current State
- ✅ Database table exists (feed_inventory)
- ✅ RLS policies configured
- ❌ No UI implemented
- ❌ No hooks created

### Architecture

**New Components:**
```
src/pages/FeedInventory.tsx (new)
src/components/FeedStockCard.tsx (new)
src/components/AddFeedStockForm.tsx (new)
src/components/RecordFeedConsumptionForm.tsx (new)
src/components/FeedAnalytics.tsx (new)
src/hooks/useFeedInventory.tsx (new)
```

**Database Schema:**
```sql
-- Already exists
feed_inventory (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  feed_type text NOT NULL,
  quantity_kg numeric NOT NULL,
  cost_per_kg numeric,
  supplier text,
  purchase_date date,
  expiry_date date,
  created_at timestamp
)
```

**Data Flow:**
```
User adds feed stock
  → AddFeedStockForm
  → Validate inputs
  → useFeedInventory.addStock()
  → Insert into feed_inventory
  → Update UI

User records consumption
  → RecordFeedConsumptionForm
  → Select animals
  → Enter quantity
  → useFeedInventory.recordConsumption()
  → Deduct from inventory
  → Create consumption record
```

### Implementation Details

**Feed Inventory Hook:**
```typescript
// src/hooks/useFeedInventory.tsx
export const useFeedInventory = () => {
  const { user } = useAuth();
  
  const { data: inventory, refetch } = useQuery({
    queryKey: ['feed-inventory', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feed_inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
  
  const addStock = async (feedData: FeedStock) => {
    const { error } = await supabase
      .from('feed_inventory')
      .insert({
        user_id: user.id,
        ...feedData
      });
    
    if (error) throw error;
    refetch();
  };
  
  const recordConsumption = async (consumptionData: FeedConsumption) => {
    // Deduct from inventory
    const { error } = await supabase
      .from('feed_inventory')
      .update({
        quantity_kg: supabase.raw(`quantity_kg - ${consumptionData.quantity}`)
      })
      .eq('id', consumptionData.feed_id);
    
    if (error) throw error;
    refetch();
  };
  
  return { inventory, addStock, recordConsumption };
};
```

---

## Feature 5: Breeding Management

### Current State
- ❌ No database table
- ❌ No UI
- ❌ No hooks

### Architecture

**New Database Tables:**
```sql
-- Need to create
CREATE TABLE breeding_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  male_parent_id uuid REFERENCES animals(id),
  female_parent_id uuid REFERENCES animals(id),
  breeding_date date NOT NULL,
  breeding_method text, -- natural, artificial
  expected_due_date date,
  pregnancy_status text, -- confirmed, suspected, not_pregnant
  birth_date date,
  offspring_count integer,
  notes text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE heat_cycles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  animal_id uuid REFERENCES animals(id) NOT NULL,
  heat_date date NOT NULL,
  next_expected_heat date,
  notes text,
  created_at timestamp DEFAULT now()
);
```

**New Components:**
```
src/pages/Breeding.tsx (new)
src/components/BreedingRecordForm.tsx (new)
src/components/PregnancyTracker.tsx (new)
src/components/HeatCycleTracker.tsx (new)
src/components/LineageView.tsx (new)
src/hooks/useBreedingManagement.tsx (new)
```

**Data Flow:**
```
User records breeding
  → BreedingRecordForm
  → Select parents
  → Enter breeding date
  → useBreedingManagement.recordBreeding()
  → Insert into breeding_records
  → Calculate expected due date
  → Create pregnancy tracker

User tracks pregnancy
  → PregnancyTracker
  → Update pregnancy status
  → Record health checks
  → When birth occurs
  → Create offspring records
  → Link to parents
```

---

## Feature 6: Vaccination Schedules

### Current State
- ✅ Database table exists (vaccination_schedules)
- ✅ Preloaded schedule data
- ❌ Not displayed in UI
- ❌ No reminder system

### Architecture

**Components:**
```
src/pages/VaccinationSchedule.tsx (new)
src/components/VaccinationScheduleCard.tsx (new)
src/components/AnimalVaccinationStatus.tsx (new)
src/hooks/useVaccinationSchedules.tsx (new)
```

**Data Flow:**
```
User views vaccination schedules
  → useVaccinationSchedules.fetch()
  → Get schedules for animal type
  → Get completed vaccinations
  → Calculate due/overdue
  → Display with status indicators

System checks for due vaccinations
  → Daily cron job
  → Query animals with upcoming vaccines
  → Create notifications
  → Send reminders
```

### Implementation Details

**Vaccination Schedules Hook:**
```typescript
// src/hooks/useVaccinationSchedules.tsx
export const useVaccinationSchedules = (animalId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vaccination-schedules', animalId],
    queryFn: async () => {
      // Get animal details
      const { data: animal } = await supabase
        .from('animals')
        .select('type, birth_date')
        .eq('id', animalId)
        .single();
      
      // Get schedules for animal type
      const { data: schedules } = await supabase
        .from('vaccination_schedules')
        .select('*')
        .eq('animal_type', animal.type);
      
      // Get completed vaccinations
      const { data: completed } = await supabase
        .from('health_records')
        .select('medicine_name, administered_date')
        .eq('animal_id', animalId)
        .eq('record_type', 'vaccination');
      
      // Calculate due dates and status
      const schedulesWithStatus = schedules.map(schedule => {
        const dueDate = calculateDueDate(animal.birth_date, schedule.age_days);
        const isCompleted = completed.some(c => 
          c.medicine_name.toLowerCase() === schedule.vaccine_name.toLowerCase()
        );
        const isOverdue = !isCompleted && new Date() > dueDate;
        const isDueSoon = !isCompleted && daysUntil(dueDate) <= 7;
        
        return {
          ...schedule,
          dueDate,
          isCompleted,
          isOverdue,
          isDueSoon,
          status: isCompleted ? 'completed' : isOverdue ? 'overdue' : isDueSoon ? 'due_soon' : 'upcoming'
        };
      });
      
      return schedulesWithStatus;
    }
  });
};
```

---

## Testing Strategy

### Unit Tests
- Test all new hooks
- Test calculation functions
- Test form validation

### Integration Tests
- Test complete user flows
- Test offline sync
- Test data consistency

### Manual Testing
- Test on mobile devices
- Test with real data
- Test edge cases

---

## Success Metrics

- All 6 features 100% functional
- Zero TypeScript errors
- All database queries < 1 second
- All forms validate correctly
- All calculations accurate
- Mobile responsive
- Offline mode working

