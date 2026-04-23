import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Syringe, Plus, Calendar } from 'lucide-react';
import { format, parseISO, addMonths } from 'date-fns';
import type { HealthRecord } from '@/types/healthRecord';

interface Props {
  vaccinations: HealthRecord[];
  onAddVaccination?: () => void;
}

export function VaccinationSchedule({ vaccinations, onAddVaccination }: Props) {
  const sortedVaccinations = [...vaccinations]
    .filter(v => v.record_type === 'vaccination')
    .sort((a, b) => new Date(b.administered_date).getTime() - new Date(a.administered_date).getTime());

  const lastVaccination = sortedVaccinations[0];
  const nextDueDate = lastVaccination 
    ? addMonths(parseISO(lastVaccination.administered_date), 6)
    : null;
  const daysUntilNext = nextDueDate 
    ? Math.ceil((nextDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Syringe className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold">Vaccination Schedule</h3>
        </div>
        {onAddVaccination && (
          <Button size="sm" onClick={onAddVaccination}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      {lastVaccination && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">Last Vaccination</span>
            <Badge variant="outline" className="text-xs">
              {format(parseISO(lastVaccination.administered_date), 'MMM d, yyyy')}
            </Badge>
          </div>
          <p className="text-sm font-medium text-blue-900 mt-1">
            {lastVaccination.medicine_name || 'Unknown Vaccine'}
          </p>
        </div>
      )}

      {nextDueDate && (
        <div className={`p-3 rounded-lg ${daysUntilNext && daysUntilNext <= 30 ? 'bg-yellow-50' : 'bg-green-50'}`}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              Next Due: {format(nextDueDate, 'MMM d, yyyy')}
            </span>
          </div>
          {daysUntilNext !== null && (
            <p className={`text-xs mt-1 ${daysUntilNext <= 30 ? 'text-yellow-700' : 'text-green-700'}`}>
              {daysUntilNext <= 0 
                ? '⚠️ Overdue! Schedule now'
                : daysUntilNext <= 30 
                  ? `⚡ Due in ${daysUntilNext} days`
                  : `✓ ${daysUntilNext} days remaining`}
            </p>
          )}
        </div>
      )}

      {sortedVaccinations.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No vaccination records yet</p>
          <p className="text-xs mt-1">Add your first vaccination record</p>
        </div>
      )}
    </Card>
  );
}
