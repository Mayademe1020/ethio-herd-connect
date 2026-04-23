import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HealthRecordForm } from './HealthRecordForm';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import type { HealthRecord } from '@/types/healthRecord';

interface Props {
  animalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: HealthRecord;
  onSuccess?: () => void;
}

export function AddHealthRecordDialog({ animalId, open, onOpenChange, initialData, onSuccess }: Props) {
  const { createHealthRecordAsync, updateHealthRecordAsync, isCreating, isUpdating } = useHealthRecords(animalId);

  const handleSubmit = async (data: any) => {
    try {
      if (initialData) {
        await updateHealthRecordAsync({ id: initialData.id, ...data });
      } else {
        await createHealthRecordAsync({ animal_id: animalId, ...data });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving health record:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Health Record' : 'Add Health Record'}</DialogTitle>
        </DialogHeader>
        <HealthRecordForm
          animalId={animalId}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isCreating || isUpdating}
        />
      </DialogContent>
    </Dialog>
  );
}
