// src/components/health-records/HealthRecordList.tsx
// List component to display health records grouped by month

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Syringe, 
  Activity, 
  Stethoscope, 
  Pill,
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { HealthRecordCard } from './HealthRecordCard';
import type { HealthRecord, HealthRecordType } from '@/types/healthRecord';

interface HealthRecordListProps {
  records: HealthRecord[];
  isLoading?: boolean;
  onEdit?: (record: HealthRecord) => void;
  onDelete?: (recordId: string) => void;
  emptyMessage?: string;
  showFilters?: boolean;
}

const RECORD_TYPE_FILTERS: { type: HealthRecordType | 'all'; label: string; icon: React.ReactNode }[] = [
  { type: 'all', label: 'All', icon: null },
  { type: 'vaccination', label: 'Vaccinations', icon: <Syringe className="w-4 h-4" /> },
  { type: 'illness', label: 'Illnesses', icon: <Activity className="w-4 h-4" /> },
  { type: 'checkup', label: 'Checkups', icon: <Stethoscope className="w-4 h-4" /> },
  { type: 'treatment', label: 'Treatments', icon: <Pill className="w-4 h-4" /> }
];

export const HealthRecordList = ({ 
  records, 
  isLoading = false,
  onEdit,
  onDelete,
  emptyMessage = 'No health records found',
  showFilters = true
}: HealthRecordListProps) => {
  const [selectedType, setSelectedType] = useState<HealthRecordType | 'all'>('all');
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

  // Filter records by type
  const filteredRecords = selectedType === 'all' 
    ? records 
    : records.filter(r => r.record_type === selectedType);

  // Group records by month
  const groupedRecords = filteredRecords.reduce((groups, record) => {
    const date = parseISO(record.administered_date);
    const monthKey = format(date, 'yyyy-MM');
    const monthLabel = format(date, 'MMMM yyyy');
    
    if (!groups[monthKey]) {
      groups[monthKey] = { label: monthLabel, records: [] };
    }
    groups[monthKey].records.push(record);
    return groups;
  }, {} as Record<string, { label: string; records: HealthRecord[] }>);

  const sortedMonthKeys = Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => 
      prev.includes(monthKey) 
        ? prev.filter(m => m !== monthKey)
        : [...prev, monthKey]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (filteredRecords.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-full">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">{emptyMessage}</p>
          {showFilters && selectedType !== 'all' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              Clear Filter
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {RECORD_TYPE_FILTERS.map(({ type, label, icon }) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="gap-1"
            >
              {icon}
              {label}
              <Badge variant="secondary" className="ml-1">
                {type === 'all' 
                  ? records.length 
                  : records.filter(r => r.record_type === type).length}
              </Badge>
            </Button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {sortedMonthKeys.map(monthKey => {
          const { label, records: monthRecords } = groupedRecords[monthKey];
          const isExpanded = expandedMonths.includes(monthKey);
          
          return (
            <div key={monthKey} className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-between py-2 h-auto"
                onClick={() => toggleMonth(monthKey)}
              >
                <span className="font-semibold text-gray-700">{label}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{monthRecords.length} records</Badge>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </Button>
              
              {isExpanded && (
                <div className="space-y-2 pl-2">
                  {monthRecords.map(record => (
                    <HealthRecordCard
                      key={record.id}
                      record={record}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HealthRecordList;
