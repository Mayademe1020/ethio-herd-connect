import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VoiceInputButton } from './VoiceInputButton';
import { Mic } from 'lucide-react';
import type { HealthRecord, HealthRecordType, HealthRecordSeverity } from '@/types/healthRecord';

const schema = z.object({
  record_type: z.enum(['vaccination', 'illness', 'checkup', 'treatment']),
  medicine_name: z.string().optional(),
  symptoms: z.string().optional(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  notes: z.string().optional(),
  administered_date: z.string().min(1, 'Date is required'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  animalId: string;
  initialData?: HealthRecord;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function HealthRecordForm({ initialData, onSubmit, onCancel, isSubmitting }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      record_type: initialData.record_type,
      medicine_name: initialData.medicine_name || '',
      symptoms: initialData.symptoms || '',
      severity: initialData.severity || undefined,
      notes: initialData.notes || '',
      administered_date: initialData.administered_date,
    } : {
      record_type: 'vaccination',
      administered_date: new Date().toISOString().split('T')[0],
    }
  });

  const recordType = watch('record_type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Record Type</Label>
        <Select value={recordType} onValueChange={(v: HealthRecordType) => setValue('record_type', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vaccination">Vaccination</SelectItem>
            <SelectItem value="illness">Illness</SelectItem>
            <SelectItem value="checkup">Checkup</SelectItem>
            <SelectItem value="treatment">Treatment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Date</Label>
        <Input type="date" {...register('administered_date')} />
        {errors.administered_date && <p className="text-sm text-red-500">{errors.administered_date.message}</p>}
      </div>

      {recordType !== 'checkup' && (
        <div>
          <Label>{recordType === 'vaccination' ? 'Vaccine Name' : 'Medicine Name'}</Label>
          <Input {...register('medicine_name')} placeholder="e.g., Anthrax Vaccine" />
        </div>
      )}

      {(recordType === 'illness' || recordType === 'treatment') && (
        <>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Symptoms</Label>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Mic className="w-3 h-3" />
                Click mic to speak
              </span>
            </div>
            <div className="flex gap-2">
              <Textarea {...register('symptoms')} placeholder="Describe symptoms (or use voice input)" rows={2} className="flex-1" />
              <VoiceInputButton 
                onTranscript={(text) => setValue('symptoms', text)}
                className="shrink-0"
              />
            </div>
          </div>
          <div>
            <Label>Severity</Label>
            <Select onValueChange={(v: HealthRecordSeverity) => setValue('severity', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Notes</Label>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Mic className="w-3 h-3" />
            Click mic to speak
          </span>
        </div>
        <div className="flex gap-2">
          <Textarea {...register('notes')} placeholder="Additional notes (or use voice input)" rows={3} className="flex-1" />
          <VoiceInputButton 
            onTranscript={(text) => setValue('notes', text)}
            className="shrink-0"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving...' : initialData ? 'Update Record' : 'Add Record'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
