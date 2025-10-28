// src/pages/MyAnimals.tsx - Page to display user's animals with filtering

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { AnimalCard } from '@/components/AnimalCard';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type AnimalType = 'all' | 'cattle' | 'goat' | 'sheep';

interface Animal {
  id: string;
  name: string;
  type: 'cattle' | 'goat' | 'sheep';
  subtype?: string; // Optional until migration is run
  photo_url?: string;
  registration_date?: string; // Optional, fallback to created_at
  is_active?: boolean; // Optional, default to true
  created_at: string;
}

export const MyAnimals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<AnimalType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page] = useState(0); // Pagination support (currently showing first page only)
  const ITEMS_PER_PAGE = 20;

  // Fetch animals with TanStack Query (with pagination)
  const { data: animals = [], isLoading, refetch } = useQuery<Animal[]>({
    queryKey: ['animals', user?.id, page],
    queryFn: async (): Promise<Animal[]> => {
      if (!user) return [];

      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // @ts-ignore - Supabase type instantiation issue with complex queries
      const result: any = await supabase
        .from('animals')
        .select('id, name, type, subtype, photo_url, registration_date, is_active, created_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (result.error) {
        toast.error('❌ Error loading animals');
        throw result.error;
      }

      // Map to include default values for MVP fields
      const data = result.data as any[];
      return (data || []).map((animal: any) => ({
        id: animal.id,
        name: animal.name,
        type: animal.type,
        subtype: animal.subtype || animal.type, // Fallback: use type as subtype
        photo_url: animal.photo_url,
        registration_date: animal.registration_date || animal.created_at,
        is_active: animal.is_active !== false,
        created_at: animal.created_at
      })) as Animal[];
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  // Filter animals by type
  const filteredAnimals = animals.filter(animal => 
    selectedType === 'all' || animal.type === selectedType
  );

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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                የእኔ እንስሳት / My Animals
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredAnimals.length} {filteredAnimals.length === 1 ? 'animal' : 'animals'}
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              disabled={isRefreshing}
              className="mr-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <FilterButton
              active={selectedType === 'all'}
              onClick={() => setSelectedType('all')}
              icon="🐾"
              label="All"
              count={animals.length}
            />
            <FilterButton
              active={selectedType === 'cattle'}
              onClick={() => setSelectedType('cattle')}
              icon="🐄"
              label="Cattle"
              count={animals.filter(a => a.type === 'cattle').length}
            />
            <FilterButton
              active={selectedType === 'goat'}
              onClick={() => setSelectedType('goat')}
              icon="🐐"
              label="Goats"
              count={animals.filter(a => a.type === 'goat').length}
            />
            <FilterButton
              active={selectedType === 'sheep'}
              onClick={() => setSelectedType('sheep')}
              icon="🐑"
              label="Sheep"
              count={animals.filter(a => a.type === 'sheep').length}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
              <p className="text-gray-600">Loading animals...</p>
            </div>
          </div>
        ) : filteredAnimals.length === 0 ? (
          <EmptyState 
            hasAnimals={animals.length > 0}
            selectedType={selectedType}
            onAddAnimal={handleAddAnimal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnimals.map(animal => (
              <AnimalCard
                key={animal.id}
                id={animal.id}
                name={animal.name}
                type={animal.type}
                subtype={animal.subtype || animal.type}
                photo_url={animal.photo_url}
                registration_date={animal.registration_date || animal.created_at}
                is_active={animal.is_active !== false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleAddAnimal}
        className="fixed bottom-20 right-6 w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-20"
        aria-label="Add Animal"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
};

// Filter Button Component
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  count: number;
}

const FilterButton = ({ active, onClick, icon, label, count }: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
      active
        ? 'bg-green-600 text-white shadow-md'
        : 'bg-white text-gray-700 border border-gray-300 hover:border-green-600'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
    <span className={`text-xs px-2 py-0.5 rounded-full ${
      active ? 'bg-white/20' : 'bg-gray-100'
    }`}>
      {count}
    </span>
  </button>
);

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
