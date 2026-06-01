// src/pages/AnimalDetail.tsx - Detailed view of a single animal

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card } from '@/components/ui/card';
import { AnimalIdBadge } from '@/components/AnimalIdBadge';
import { MilkProductionSection, PregnancySection, AnimalPhotoAndInfo } from '@/components/animal-detail';
import { differenceInMonths, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAnimalDeletion } from '@/hooks/useAnimalDeletion';
import { useAnimalUpdate } from '@/hooks/useAnimalUpdate';
import { EditAnimalModal } from '@/components/EditAnimalModal';
import { milkQueries } from '@/lib/milkQueries';
import { RecordBirthModal } from '@/components/RecordBirthModal';
import { TransferOwnershipModal } from '@/components/TransferOwnershipModal';
import { recordPregnancy, recordBirth, type PregnancyRecord } from '@/services/pregnancyService';
import { isDeliverySoon, canBePregnant } from '@/utils/pregnancyCalculations';

interface Animal {
  id: string;
  animal_id?: string;
  name: string;
  type: 'cattle' | 'goat' | 'sheep';
  subtype?: string;
  photo_url?: string;
  registration_date?: string;
  is_active?: boolean;
  status?: string;
  pregnancy_status?: 'not_pregnant' | 'pregnant' | 'delivered';
  pregnancy_data?: PregnancyRecord[];
  created_at: string;
}

const MILK_PRODUCING_SUBTYPES = ['Cow', 'Female Goat', 'Ewe'];

export const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPregnancyTracker, setShowPregnancyTracker] = useState(false);
  const [showBirthModal, setShowBirthModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteAnimal, isDeleting } = useAnimalDeletion();
  const { updateAnimal, isUpdating } = useAnimalUpdate();

  const { data: animal, isLoading } = useQuery({
    queryKey: ['animal', id],
    queryFn: async () => {
      if (!user || !id) return null;
      const { data, error } = await supabase
        .from('animals')
        .select('id, animal_id, name, type, subtype, photo_url, registration_date, is_active, status, pregnancy_status, pregnancy_data, created_at')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return {
        id: data.id,
        animal_id: (data as any).animal_id,
        name: data.name,
        type: data.type as 'cattle' | 'goat' | 'sheep',
        subtype: (data as any).subtype || data.type,
        photo_url: data.photo_url,
        registration_date: (data as any).registration_date || data.created_at,
        is_active: (data as any).is_active !== false,
        status: (data as any).status || 'active',
        pregnancy_status: (data as any).pregnancy_status || 'not_pregnant',
        pregnancy_data: (data as any).pregnancy_data || [],
        created_at: data.created_at,
      } as Animal;
    },
    enabled: !!user && !!id,
    staleTime: 30000,
  });

  const { data: milkRecords = [] } = useQuery({
    queryKey: ['milk-records', id],
    queryFn: async () => {
      if (!user || !id) return [];
      try {
        return await milkQueries.getAnimalMilkRecords(id);
      } catch (error) {
        console.error('Error fetching milk records:', error);
        return [];
      }
    },
    enabled: !!user && !!id && MILK_PRODUCING_SUBTYPES.includes(animal?.subtype || ''),
    staleTime: 30000,
  });

  const canProduceMilk = animal && MILK_PRODUCING_SUBTYPES.includes(animal.subtype || animal.type);
  const canGetPregnant = animal && canBePregnant(animal.subtype || animal.type);

  const currentPregnancy =
    animal?.pregnancy_status === 'pregnant' && animal?.pregnancy_data && animal.pregnancy_data.length > 0
      ? animal.pregnancy_data[animal.pregnancy_data.length - 1]
      : null;

  const showDeliveryAlert = currentPregnancy && isDeliverySoon(currentPregnancy.expected_delivery);

  const weeklyTotal = milkRecords.reduce((sum, record) => sum + Number(record.liters), 0);
  const dailyAverage = milkRecords.length > 0 ? (weeklyTotal / 7).toFixed(1) : '0';

  const getTrend = (): 'increasing' | 'decreasing' | 'stable' => {
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

  const handleSavePregnancy = async (breedingDate: string, expectedDelivery: string) => {
    try {
      await recordPregnancy({ animalId: id!, breedingDate, expectedDelivery });
      toast.success('Pregnancy recorded successfully! / እርግዝና በተሳካ ሁኔታ ተመዝግቧል!');
      setShowPregnancyTracker(false);
      queryClient.invalidateQueries({ queryKey: ['animal', id] });
    } catch (error) {
      console.error('Error recording pregnancy:', error);
      toast.error('Failed to record pregnancy / እርግዝና መመዝገብ አልተሳካም');
    }
  };

  const handleRecordBirth = async (actualDelivery: string, notes?: string) => {
    try {
      await recordBirth({ animalId: id!, actualDelivery, notes });
      toast.success('Birth recorded successfully! / ልደት በተሳካ ሁኔታ ተመዝግቧል!');
      setShowBirthModal(false);
      queryClient.invalidateQueries({ queryKey: ['animal', id] });
    } catch (error) {
      console.error('Error recording birth:', error);
      toast.error('Failed to record birth / ልደት መመዝገብ አልተሳካም');
    }
  };

  const handleSaveEdit = async (updates: { name: string; subtype: string; photo_url?: string }) => {
    const success = await updateAnimal(id!, updates);
    if (success) {
      setShowEditModal(false);
      queryClient.invalidateQueries({ queryKey: ['animal', id] });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
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
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="mb-2">
            <BackButton to="/my-animals" label="ተመለስ / Back" />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{animal.name}</h1>
              <p className="text-sm text-gray-600">{animal.subtype || animal.type}</p>
            </div>
            {animal.animal_id && (
              <div className="flex-shrink-0">
                <AnimalIdBadge animalId={animal.animal_id} size="lg" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <AnimalPhotoAndInfo
          animal={animal}
          canProduceMilk={!!canProduceMilk}
          canGetPregnant={!!canGetPregnant}
          onRecordMilk={() => navigate('/record-milk', { state: { animalId: id, animalName: animal.name } })}
          onRecordPregnancy={() => setShowPregnancyTracker(true)}
          onEdit={() => setShowEditModal(true)}
          onListForSale={() => navigate('/create-listing', { state: { animalId: id } })}
          onTransfer={() => setShowTransferModal(true)}
          onDelete={() => setShowDeleteConfirm(true)}
        />

        {canProduceMilk && (
          <MilkProductionSection
            milkRecords={milkRecords}
            weeklyTotal={weeklyTotal}
            dailyAverage={dailyAverage}
            trend={getTrend()}
            onRecordMilk={() => navigate('/record-milk', { state: { animalId: id, animalName: animal.name } })}
          />
        )}

        {canGetPregnant && (
          <PregnancySection
            pregnancyStatus={animal.pregnancy_status || 'not_pregnant'}
            pregnancyData={animal.pregnancy_data || []}
            animalName={animal.name}
            animalId={id!}
            animalSubtype={animal.subtype || animal.type}
            showPregnancyTracker={showPregnancyTracker}
            showDeliveryAlert={!!showDeliveryAlert}
            currentPregnancy={currentPregnancy}
            onRecordPregnancy={() => setShowPregnancyTracker(true)}
            onSavePregnancy={handleSavePregnancy}
            onCancelTracker={() => setShowPregnancyTracker(false)}
            onRecordBirth={() => setShowBirthModal(true)}
          />
        )}

        <Card className="p-6 bg-gray-50 border-dashed">
          <h3 className="font-semibold text-gray-700 mb-3">Coming Soon</h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2"><span>💉</span><span>Health Records</span></div>
            <div className="flex items-center gap-2"><span>📈</span><span>Growth Tracking</span></div>
            <div className="flex items-center gap-2"><span>💰</span><span>Financial History</span></div>
            <div className="flex items-center gap-2"><span>📊</span><span>Analytics</span></div>
          </div>
        </Card>
      </div>

      {showEditModal && animal && (
        <EditAnimalModal
          animalId={id!}
          currentData={{ name: animal.name, type: animal.type, subtype: animal.subtype || animal.type, photo_url: animal.photo_url }}
          onSave={handleSaveEdit}
          onClose={() => setShowEditModal(false)}
          isSaving={isUpdating}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete {animal.name}?</h3>
            <p className="text-gray-600 mb-2">Are you sure you want to delete this animal? This action cannot be undone.</p>
            <p className="text-sm text-gray-500 mb-6">ይህን እንስሳ ለመሰረዝ እርግጠኛ ነዎት? ይህ ድርጊት መልሰው ማግኘት አይችሉም።</p>
            <div className="flex gap-3">
              <EnhancedButton onClick={() => setShowDeleteConfirm(false)} variant="outline" className="flex-1" disabled={isDeleting}>
                Cancel / ሰርዝ
              </EnhancedButton>
              <EnhancedButton
                onClick={async () => {
                  const success = await deleteAnimal(id!);
                  if (success) { setShowDeleteConfirm(false); navigate('/my-animals'); }
                }}
                variant="destructive"
                className="flex-1"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete / ሰርዝ'}
              </EnhancedButton>
            </div>
          </Card>
        </div>
      )}

      {showBirthModal && currentPregnancy && (
        <RecordBirthModal
          isOpen={showBirthModal}
          onClose={() => setShowBirthModal(false)}
          animalId={id!}
          animalName={animal.name}
          expectedDelivery={currentPregnancy.expected_delivery}
          onRecordBirth={handleRecordBirth}
        />
      )}

      {showTransferModal && id && (
        <TransferOwnershipModal
          open={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          animalId={id}
          animalName={animal?.name}
          onTransferComplete={() => { setShowTransferModal(false); navigate('/my-animals'); }}
        />
      )}
    </div>
  );
};
