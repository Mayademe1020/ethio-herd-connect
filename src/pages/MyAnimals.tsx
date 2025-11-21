// src/pages/MyAnimals.tsx - Page to display user's animals with filtering

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { AnimalCard } from '@/components/AnimalCard';
import { AnimalSearchBar } from '@/components/AnimalSearchBar';
import { useAnimalSearch } from '@/hooks/useAnimalSearch';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

type AnimalType = 'all' | 'cattle' | 'goat' | 'sheep';

interface Animal {
  id: string;
  animal_id?: string; // Professional animal ID
  name: string;
  type: 'cattle' | 'goat' | 'sheep';
  subtype?: string; // Optional until migration is run
  photo_url?: string;
  registration_date?: string; // Optional, fallback to created_at
  is_active?: boolean; // Optional, default to true
  status?: string; // Professional status system
  created_at?: string;
  [key: string]: any; // Allow additional properties for search
}

export const MyAnimals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<AnimalType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page] = useState(0); // Pagination support (currently showing first page only)
  const ITEMS_PER_PAGE = 20;
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Track online/offline status to support intermittent connectivity
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

  // Fetch animals with TanStack Query (with pagination)
  const { data: animals = [], isLoading, refetch } = useQuery<Animal[]>({
    queryKey: ['animals', user?.id, page, isOnline],
    queryFn: async (): Promise<Animal[]> => {
      if (!user) return [];

      const cacheKey = `animalsCache_${user.id}`;

      // Offline-first: return cached animals when offline
      if (!isOnline) {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            return Array.isArray(parsed?.items) ? parsed.items : [];
          }
        } catch {}
        return [];
      }

      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      try {
        // @ts-ignore - Supabase type instantiation issue with complex queries
        const result: any = await supabase
          .from('animals')
          .select('id, animal_id, name, type, subtype, photo_url, registration_date, is_active, status, created_at')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (result.error) {
          const msg = String(result.error?.message || '').toLowerCase();
          const isAbort = msg.includes('abort') || msg.includes('aborted') || msg.includes('cancel');
          if (isAbort) {
            try {
              const cached = localStorage.getItem(cacheKey);
              if (cached) {
                const parsed = JSON.parse(cached);
                return Array.isArray(parsed?.items) ? parsed.items : [];
              }
            } catch {}
            return [];
          }
          toast.error('❌ Error loading animals');
          throw result.error;
        }

        // Map to include default values for MVP fields
        const data = result.data as any[];
        const mapped = (data || []).map((animal: any) => ({
          id: animal.id,
          animal_id: animal.animal_id,
          name: animal.name,
          type: animal.type,
          subtype: animal.subtype || animal.type, // Fallback: use type as subtype
          photo_url: animal.photo_url,
          registration_date: animal.registration_date || animal.created_at,
          is_active: animal.is_active !== false,
          status: animal.status || 'active',
          created_at: animal.created_at
        })) as Animal[];

        // Cache result for offline usage; avoid sensitive data
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ items: mapped, timestamp: Date.now() })
          );
        } catch {}

        return mapped;
      } catch (err: any) {
        const msg = String(err?.message || '').toLowerCase();
        const isAbort = err?.name === 'AbortError' || msg.includes('abort') || msg.includes('aborted') || msg.includes('cancel');
        if (isAbort) {
          try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              const parsed = JSON.parse(cached);
              return Array.isArray(parsed?.items) ? parsed.items : [];
            }
          } catch {}
          return [];
        }
        toast.error('❌ Error loading animals');
        throw err;
      }
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  // Search functionality
  const { searchQuery, setSearchQuery, filteredAnimals: searchedAnimals, isSearching, resultsCount } = useAnimalSearch(animals);

  // Filter animals by type, then by search
  const typeFilteredAnimals = searchedAnimals.filter(animal => 
    selectedType === 'all' || animal.type === selectedType
  );

  const filteredAnimals = typeFilteredAnimals;

  // Pull to refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('✓ Refreshed');
    } catch (error) {
      toast.error('❌ Refresh failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddAnimal = () => {
    navigate('/register-animal');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Animals</h1>
            <p className="text-sm text-gray-600">
              {filteredAnimals.length} animals
              {!isOnline && (
                <span className="ml-2 inline-flex items-center text-amber-600">• Offline</span>
              )}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Pill-style Filter Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          <PillTab
            active={selectedType === 'all'}
            onClick={() => setSelectedType('all')}
            label={`All ${animals.length}`}
          />
          <PillTab
            active={selectedType === 'cattle'}
            onClick={() => setSelectedType('cattle')}
            label={`🐄 Cattle ${animals.filter(a => a.type === 'cattle').length}`}
          />
          <PillTab
            active={selectedType === 'goat'}
            onClick={() => setSelectedType('goat')}
            label={`🐐 Goats ${animals.filter(a => a.type === 'goat').length}`}
          />
          <PillTab
            active={selectedType === 'sheep'}
            onClick={() => setSelectedType('sheep')}
            label={`🐑 Sheep ${animals.filter(a => a.type === 'sheep').length}`}
          />
        </div>

        {/* Enhanced Search Results with Animation */}
        {isSearching && (
          <div className="mt-3 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-600">
                Found <span className="font-semibold text-emerald-600">{resultsCount}</span> {resultsCount === 1 ? 'animal' : 'animals'}
              </span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card" style={{ height: '140px' }}>
                <div className="flex items-center gap-4 h-full">
                  <div className="w-16 h-16 skeleton-avatar flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="skeleton-text h-4 w-3/4"></div>
                    <div className="skeleton-text h-3 w-1/2"></div>
                    <div className="skeleton-text h-3 w-1/4"></div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="w-10 h-10 skeleton rounded-lg"></div>
                    <div className="w-10 h-10 skeleton rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAnimals.length === 0 ? (
          isSearching ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600 mb-2">No animals found</p>
              <p className="text-sm text-gray-500">Try a different search term</p>
            </div>
          ) : (
            <EmptyState 
              hasAnimals={animals.length > 0}
              selectedType={selectedType}
              onAddAnimal={handleAddAnimal}
            />
          )
        ) : (
          <div className="space-y-3">
            {filteredAnimals.map(animal => (
              <CompactAnimalCard
                key={animal.id}
                animal={animal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleAddAnimal}
        className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-20"
        aria-label="Add Animal"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

// Pill Tab Component
interface PillTabProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const PillTab = ({ active, onClick, label }: PillTabProps) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
      active
        ? 'bg-emerald-500 text-white shadow-sm'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

// Compact Animal Card Component
interface CompactAnimalCardProps {
  animal: {
    id: string;
    animal_id?: string;
    name: string;
    type: string;
    subtype?: string;
    photo_url?: string;
    registration_date?: string;
    created_at?: string;
  };
}

const CompactAnimalCard = ({ animal }: CompactAnimalCardProps) => {
  const navigate = useNavigate();

  const handleRecordMilk = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/record-milk', { state: { animalId: animal.id, animalName: animal.name } });
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/animals/${animal.id}`);
  };

  const handleCardClick = () => {
    navigate(`/animals/${animal.id}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      style={{ height: '140px' }}
      onClick={handleCardClick}
      data-testid="animal-card"
    >
      <div className="flex items-center gap-4 h-full">
        {/* Photo */}
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {animal.photo_url ? (
            <img
              src={animal.photo_url}
              alt={animal.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl">🐄</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {animal.name}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
              ✓ Active
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {animal.subtype || animal.type}
          </p>
          {animal.animal_id && (
            <p className="text-xs text-gray-500 font-mono">
              {animal.animal_id}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {new Date(animal.registration_date || animal.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            className="btn-icon text-emerald-600 hover:bg-emerald-50 rounded p-1 transition-colors"
            onClick={handleRecordMilk}
            title="Record Milk"
          >
            🥛
          </button>
          <button
            className="btn-icon text-blue-600 hover:bg-blue-50 rounded p-1 transition-colors"
            onClick={handleViewDetails}
            title="View Details"
          >
            👁️
          </button>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
interface EmptyStateProps {
  hasAnimals: boolean;
  selectedType: AnimalType;
  onAddAnimal: () => void;
}

const EmptyState = ({ hasAnimals, selectedType, onAddAnimal }: EmptyStateProps) => {
  if (!hasAnimals) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🐄</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No animals yet!
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Start building your herd by registering your first animal. It only takes 3 clicks!
        </p>
        <Button
          onClick={onAddAnimal}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Register First Animal
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        No {selectedType === 'all' ? '' : selectedType} found
      </h2>
      <p className="text-gray-600">
        Try selecting a different filter or add a new animal
      </p>
    </div>
  );
};

export default MyAnimals;
