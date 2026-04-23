// src/components/health-records/HealthRecordCard.tsx
// Card component to display a single health record

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Syringe, 
  Activity, 
  Stethoscope, 
  Pill, 
  Calendar, 
  Edit2, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import type { HealthRecord, HealthRecordType, HealthRecordSeverity } from '@/types/healthRecord';

interface HealthRecordCardProps {
  record: HealthRecord;
  onEdit?: (record: HealthRecord) => void;
  onDelete?: (recordId: string) => void;
  showActions?: boolean;
}

const RECORD_TYPE_ICONS: Record<HealthRecordType, React.ReactNode> = {
  vaccination: <Syringe className="w-4 h-4" />,
  illness: <Activity className="w-4 h-4" />,
  checkup: <Stethoscope className="w-4 h-4" />,
  treatment: <Pill className="w-4 h-4" />
};

const RECORD_TYPE_LABELS: Record<HealthRecordType, string> = {
  vaccination: 'Vaccination',
  illness: 'Illness',
  checkup: 'Checkup',
  treatment: 'Treatment'
};

const RECORD_TYPE_COLORS: Record<HealthRecordType, string> = {
  vaccination: 'bg-blue-100 text-blue-800 border-blue-200',
  illness: 'bg-red-100 text-red-800 border-red-200',
  checkup: 'bg-green-100 text-green-800 border-green-200',
  treatment: 'bg-purple-100 text-purple-800 border-purple-200'
};

const SEVERITY_COLORS: Record<HealthRecordSeverity, string> = {
  mild: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  moderate: 'bg-orange-100 text-orange-800 border-orange-200',
  severe: 'bg-red-100 text-red-800 border-red-200'
};

export const HealthRecordCard = ({ 
  record, 
  onEdit, 
  onDelete,
  showActions = true 
}: HealthRecordCardProps) => {
  const handleEdit = () => {
    if (onEdit) onEdit(record);
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this health record?')) {
      onDelete(record.id);
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${RECORD_TYPE_COLORS[record.record_type]}`}>
            {RECORD_TYPE_ICONS[record.record_type]}
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">
                {RECORD_TYPE_LABELS[record.record_type]}
              </span>
              <Badge variant="outline" className={RECORD_TYPE_COLORS[record.record_type]}>
                {record.record_type}
              </Badge>
              {record.severity && (
                <Badge variant="outline" className={SEVERITY_COLORS[record.severity]}>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {record.severity}
                </Badge>
              )}
            </div>
            
            {record.medicine_name && (
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Medicine:</span> {record.medicine_name}
              </p>
            )}
            
            {record.symptoms && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Symptoms:</span> {record.symptoms}
              </p>
            )}
            
            {record.notes && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {record.notes}
              </p>
            )}
            
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {format(new Date(record.administered_date), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default HealthRecordCard;
