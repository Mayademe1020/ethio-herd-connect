// src/pages/AnimalDetail.tsx - Detailed view of a single animal

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tantml:function_calls>
<invoke name="query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Milk, 
  Edit, 
  Trash2, 
  ShoppingCart,
  Calendar,
  Heart,
  TrendingUp,
  Activity
} from 'lucide-react';
import { formatDistanceToNow, differenceInMonths, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAnimalDeletion } from '@/hooks/useAnimalDeletion';

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

interface MilkRecord {
  id: string;
  liters: number;
  recorded_at: string;
  session: string;
}

const ANIMAL_ICONS = {
  cattle: '🐄',
  goat: '🐐',
  sheep: '🐑'
};

const MILK_PRODUCING_SUBTYPES = ['Cow', 'Female Goat', 'Ewe'];
const PREGNANCY_CAPABLE_SUBTYPES = ['Cow', 'Female Goat', 'Ewe'];

export const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteAnimal, isDeleting } = useAnimalDeletion();

  // Fetch animal details
  const { data: animal, isLoading } = useQuery({
    queryKey: ['animal', id],
    queryFn: async () => {
      if (!user || !id) return null;

      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      // Map to include default values for MVP fields
      const animal: Animal = {
        id: data.id,
        name: data.name,
        type: data.type as 'cattle' | 'goat' | 'sheep',
        subtype: (data as any).subtype || data.type,
        photo_url: data.photo_url,
        registration_date: (data as any).registration_date || data.created_at,
        is_active: (data as any).is_active !== false,
        created_at: data.created_at
      };
      
      return animal;
    },
    enabled: !!user && !!id,
  });

  // Fetch recent milk records (last 7 days) - optimized with pagination
  const { data: milkRecords = [] } = useQuery({
    queryKey: ['milk-records', id],
    queryFn: async () => {
      if (!user || !id) return [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('milk_production')
        .select('id, liters, recorded_at, session, created_at')
        .eq('animal_id', id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching milk records:', error);
        return [];
      }
      
      // Map to MilkRecord format (handle both old and new schema)
      return (data || []).map((record: any) => ({
        id: record.id,
        liters: record.liters || record.total_yield || 0,
        recorded_at: record.recorded_at || record.created_at,
        session: record.session || (record.morning_yield && record.evening_yield ? 'both' : record.morning_yield ? 'morning' : 'evening')
      })) as MilkRecord[];
    },
    enabled: !!user && !!id && MILK_PRODUCING_SUBTYPES.includes(animal?.subtype || ''),
  });

  const canProduceMilk = animal && MILK_PRODUCING_SUBTYPES.includes(animal.subtype || animal.type);
  const canGetPregnant = animal && PREGNANCY_CAPABLE_SUBTYPES.includes(animal.subtype || animal.type);

  // Calculate age
  const calculateAge = (registrationDate: string) => {
    const months = differenceInMonths(new Date(), new Date(registrationDate));
    const days = differenceInDays(new Date(), new Date(registrationDate));
    
    if (months < 1) {
      return `${days} days old`;
    } else if (months < 12) {
      return `${months} months old`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''} old`;
    }
  };

  // Calculate milk totals and trends
  const weeklyTotal = milkRecords.reduce((sum, record) => sum + Number(record.liters), 0);
  const dailyAverage = milkRecords.length > 0 ? (weeklyTotal / 7).toFixed(1) : '0';
  
  // Calculate trend (compare first half vs second half of week)
  const getTrend = () => {
    if (milkRecords.length < 4) return 'stable';
    
    const midpoint = Math.floor(milkRecords.length / 2);
    const recentRecords = milkRecords.slice(0, midpoint);
    const olderRecords = milkRecords.slice(midpoint);
    
    const recentAvg = recentRecords.reduce((sum, r) => sum + Number(r.liters), 0) / recentRecords.length;
    const olderAvg = olderRecords.reduce((sum, r) => sum + Number(r.liters), 0) / olderRecords.length;
    
    const difference = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (difference > 5) return 'increasing';
    if (difference < -5) return 'decreasing';
    return 'stable';
  };
  
  const trend = getTrend();
  const trendIcons = {
    increasing: { icon: '↑', color: 'text-green-600', label: 'Increasing' },
    decreasing: { icon: '↓', color: 'text-red-600', label: 'Decreasing' },
    stable: { icon: '→', color: 'text-blue-600', label: 'Stable' }
  };

  const handleRecordMilk = () => {
    navigate('/record-milk', { state: { animalId: id, animalName: animal?.name } });
  };

  const handleRecordPregnancy = () => {
    toast.info('🚧 Pregnancy tracking coming soon!');
  };

  const handleEdit = () => {
    toast.info('🚧 Edit feature coming soon!');
  };

  const handleListForSale = () => {
    navigate('/create-listing', { state: { animalId: id } });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading animal details...</p>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Animal not found</p>
          <Button onClick={() => navigate('/my-animals')} className="mt-4">
            Back to My Animals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="mb-2">
            <BackButton to="/my-animals" label="ተመለስ / Back" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {animal.name}
          </h1>
          <p className="text-sm text-gray-600">{animal.subtype || animal.type}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Photo and Basic Info */}
        <Card className="overflow-hidden">
          <div className="relative h-64 bg-gradient-to-br from-green-50 to-green-100">
            {animal.photo_url ? (
              <img 
                src={animal.photo_url} 
                alt={animal.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {ANIMAL_ICONS[animal.type]}
              </div>
            )}
          </div>

          <div className="p-6 space-y-4">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <InfoItem 
                icon={<Calendar className="w-5 h-5" />}
                label="Registered"
                value={formatDistanceToNow(new Date(animal.registration_date || animal.created_at), { addSuffix: true })}
              />
              <InfoItem 
                icon={<Activity className="w-5 h-5" />}
                label="Age"
                value={calculateAge(animal.registration_date || animal.created_at)}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {canProduceMilk && (
                <Button
                  onClick={handleRecordMilk}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Milk className="w-4 h-4 mr-2" />
                  Record Milk
                </Button>
              )}
              {canGetPregnant && (
                <Button
                  onClick={handleRecordPregnancy}
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Record Pregnancy
                </Button>
              )}
              <Button
                onClick={handleEdit}
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleListForSale}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                List for Sale
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 col-span-2"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Animal
              </Button>
            </div>
          </div>
        </Card>

        {/* Milk Production Section */}
        {canProduceMilk && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Milk className="w-6 h-6 text-blue-500" />
                Milk Production
              </h2>
              {milkRecords.length >= 4 && (
                <div className={`flex items-center gap-1 text-sm font-medium ${trendIcons[trend].color}`}>
                  <span className="text-2xl">{trendIcons[trend].icon}</span>
                  <span>{trendIcons[trend].label}</span>
                </div>
              )}
            </div>

            {/* Weekly Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Weekly Total</p>
                <p className="text-sm text-gray-500">የሳምንት ድምር</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{weeklyTotal.toFixed(1)}L</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Daily Average</p>
                <p className="text-sm text-gray-500">የቀን አማካይ</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{dailyAverage}L</p>
              </div>
            </div>

            {/* Recent Records */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Last 7 Days • ባለፉት 7 ቀናት
              </h3>
              {milkRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Milk className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No milk records yet</p>
                  <p className="text-sm">ምንም የወተት መዝገብ የለም</p>
                  <Button
                    onClick={handleRecordMilk}
                    className="mt-4 bg-blue-500 hover:bg-blue-600"
                  >
                    Record First Milk
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {milkRecords.map((record, index) => {
                    // Calculate daily total if there are multiple records for same day
                    const recordDate = new Date(record.recorded_at).toLocaleDateString();
                    const sameDay = milkRecords.filter(r => 
                      new Date(r.recorded_at).toLocaleDateString() === recordDate
                    );
                    const dailyTotal = sameDay.reduce((sum, r) => sum + Number(r.liters), 0);
                    
                    return (
                      <div 
                        key={record.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-lg">{record.liters}L</p>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              {record.session}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(record.recorded_at).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                            {' • '}
                            {new Date(record.recorded_at).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                          </p>
                          {sameDay.length > 1 && index === milkRecords.findIndex(r => 
                            new Date(r.recorded_at).toLocaleDateString() === recordDate
                          ) && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                              Daily total: {dailyTotal.toFixed(1)}L
                            </p>
                          )}
                        </div>
                        <Milk className="w-5 h-5 text-blue-500" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Pregnancy Section Placeholder */}
        {canGetPregnant && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-500" />
                Pregnancy Records
              </h2>
            </div>
            <div className="text-center py-8 text-gray-500">
              <p>🚧 Pregnancy tracking coming soon!</p>
              <p className="text-sm mt-2">Track breeding dates, pregnancy status, and expected delivery</p>
            </div>
          </Card>
        )}

        {/* Future Features Placeholder */}
        <Card className="p-6 bg-gray-50 border-dashed">
          <h3 className="font-semibold text-gray-700 mb-3">Coming Soon</h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>💉</span>
              <span>Health Records</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📈</span>
              <span>Growth Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💰</span>
              <span>Financial History</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📊</span>
              <span>Analytics</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          animalName={animal.name}
          isDeleting={isDeleting}
          onConfirm={async () => {
            const success = await deleteAnimal(id!);
            if (success) {
              setShowDeleteConfirm(false);
              navigate('/my-animals');
            }
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

// Info Item Component
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-600 mt-1">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

// Delete Confirmation Modal
interface DeleteConfirmationModalProps {
  animalName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal = ({ animalName, isDeleting, onConfirm, onCancel }: DeleteConfirmationModalProps) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <Card className="max-w-md w-full p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Delete {animalName}?
      </h3>
      <p className="text-gray-600 mb-2">
        Are you sure you want to delete this animal? This action cannot be undone.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        ይህን እንስሳ ለመሰረዝ እርግጠኛ ነዎት? ይህ ድርጊት መልሰው ማግኘት አይችሉም።
      </p>
      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isDeleting}
        >
          Cancel / ሰርዝ
        </Button>
        <Button
          onClick={onConfirm}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete / ሰርዝ'}
        </Button>
      </div>
    </Card>
  </div>
);
