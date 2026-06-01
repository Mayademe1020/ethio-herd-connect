import { Heart } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PregnancyTracker } from '@/components/PregnancyTracker';
import { PregnancyAlert } from '@/components/PregnancyAlert';
import { type PregnancyRecord } from '@/services/pregnancyService';
import { calculateDaysRemaining } from '@/utils/pregnancyCalculations';

interface PregnancySectionProps {
  pregnancyStatus: string;
  pregnancyData: PregnancyRecord[];
  animalName: string;
  animalId: string;
  animalSubtype: string;
  showPregnancyTracker: boolean;
  showDeliveryAlert: boolean;
  currentPregnancy: PregnancyRecord | null;
  onRecordPregnancy: () => void;
  onSavePregnancy: (breedingDate: string, expectedDelivery: string) => void;
  onCancelTracker: () => void;
  onRecordBirth: () => void;
}

export const PregnancySection = ({
  pregnancyStatus,
  pregnancyData,
  animalName,
  animalId,
  animalSubtype,
  showPregnancyTracker,
  showDeliveryAlert,
  currentPregnancy,
  onRecordPregnancy,
  onSavePregnancy,
  onCancelTracker,
  onRecordBirth,
}: PregnancySectionProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-500" />
          Pregnancy Records
        </h2>
      </div>

      {showDeliveryAlert && currentPregnancy && (
        <div className="mb-4">
          <PregnancyAlert
            expectedDelivery={currentPregnancy.expected_delivery}
            animalName={animalName}
            onRecordBirth={onRecordBirth}
          />
        </div>
      )}

      {currentPregnancy && pregnancyStatus === 'pregnant' && (
        <div className="mb-4 p-4 bg-pink-50 border border-pink-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-pink-900">Currently Pregnant</span>
            <span className="text-sm px-2 py-1 bg-pink-200 text-pink-800 rounded-full">Active</span>
          </div>
          <div className="space-y-1 text-sm text-pink-800">
            <p>
              <span className="font-medium">Breeding Date:</span>{' '}
              {format(new Date(currentPregnancy.breeding_date), 'MMM dd, yyyy')}
            </p>
            <p>
              <span className="font-medium">Expected Delivery:</span>{' '}
              {format(new Date(currentPregnancy.expected_delivery), 'MMM dd, yyyy')}
            </p>
            <p>
              <span className="font-medium">Days Remaining:</span>{' '}
              {calculateDaysRemaining(currentPregnancy.expected_delivery)} days
            </p>
          </div>
        </div>
      )}

      {showPregnancyTracker && (
        <div className="mb-4">
          <PregnancyTracker
            animalId={animalId}
            animalSubtype={animalSubtype}
            onRecordPregnancy={onSavePregnancy}
            onCancel={onCancelTracker}
          />
        </div>
      )}

      {!showPregnancyTracker && pregnancyStatus !== 'pregnant' && (
        <Button onClick={onRecordPregnancy} className="w-full bg-pink-500 hover:bg-pink-600 text-white">
          <Heart className="w-4 h-4 mr-2" />
          Record New Pregnancy
        </Button>
      )}

      {pregnancyData && pregnancyData.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Pregnancy History</h3>
          <div className="space-y-2">
            {pregnancyData.map((pregnancy, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Pregnancy #{pregnancyData.length - index}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      pregnancy.status === 'pregnant'
                        ? 'bg-pink-100 text-pink-700'
                        : pregnancy.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {pregnancy.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Breeding: {format(new Date(pregnancy.breeding_date), 'MMM dd, yyyy')}</p>
                  <p>Expected: {format(new Date(pregnancy.expected_delivery), 'MMM dd, yyyy')}</p>
                  {pregnancy.actual_delivery && (
                    <p>Delivered: {format(new Date(pregnancy.actual_delivery), 'MMM dd, yyyy')}</p>
                  )}
                  {pregnancy.notes && <p className="text-gray-500 italic">Note: {pregnancy.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!pregnancyData || pregnancyData.length === 0) && !showPregnancyTracker && (
        <div className="text-center py-8 text-gray-500">
          <Heart className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No pregnancy records yet</p>
          <p className="text-sm">Track breeding dates and expected deliveries</p>
        </div>
      )}
    </Card>
  );
};
