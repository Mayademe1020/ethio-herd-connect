import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getAllHealthRecords, deleteHealthRecord } from '@/services/healthRecordService';
import { exportService } from '@/services/exportService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Syringe, 
  Stethoscope, 
  Pill,
  Download,
  Plus,
  ChevronRight,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Search,
  X,
  Filter,
  Loader2
} from 'lucide-react';
import { format, parseISO, subMonths, isSameMonth, subDays } from 'date-fns';
import type { HealthRecord, HealthRecordType } from '@/types/healthRecord';

// Constants for optimization
const ITEMS_PER_PAGE = 20;
const ANIMALS_MAX_DISPLAY = 10;

// Types
interface AnimalOption {
  id: string;
  name: string;
  type: string;
}

interface HealthTrendMonth {
  month: string;
  vaccinations: number;
  illnesses: number;
  treatments: number;
  checkups: number;
}

interface Stats {
  total: number;
  vaccinations: number;
  illnesses: number;
  treatments: number;
  checkups: number;
  severe: number;
}

// Optimized stats calculation
const calculateStats = (records: HealthRecord[]): Stats => {
  const stats: Stats = {
    total: records.length,
    vaccinations: 0,
    illnesses: 0,
    treatments: 0,
    checkups: 0,
    severe: 0,
  };

  for (const record of records) {
    stats.total++;
    if (record.record_type === 'vaccination') stats.vaccinations++;
    else if (record.record_type === 'illness') stats.illnesses++;
    else if (record.record_type === 'treatment') stats.treatments++;
    else if (record.record_type === 'checkup') stats.checkups++;
    if (record.severity === 'severe') stats.severe++;
  }

  return stats;
};

// Optimized trend calculation
const calculateTrends = (records: HealthRecord[]): HealthTrendMonth[] => {
  const now = new Date();
  const months: HealthTrendMonth[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthRecords = records.filter(r => {
      const recordDate = parseISO(r.administered_date);
      return isSameMonth(recordDate, monthDate);
    });

    months.push({
      month: format(monthDate, 'MMM'),
      vaccinations: monthRecords.filter(r => r.record_type === 'vaccination').length,
      illnesses: monthRecords.filter(r => r.record_type === 'illness').length,
      treatments: monthRecords.filter(r => r.record_type === 'treatment').length,
      checkups: monthRecords.filter(r => r.record_type === 'checkup').length,
    });
  }
  return months;
};

// Record type icon component (memoized)
const RecordTypeIcon: React.FC<{ type: HealthRecordType }> = React.memo(({ type }) => {
  const iconProps = { className: 'w-4 h-4' };
  switch (type) {
    case 'vaccination':
      return <Syringe {...iconProps} className="w-4 h-4 text-blue-500" />;
    case 'illness':
      return <Activity {...iconProps} className="w-4 h-4 text-red-500" />;
    case 'checkup':
      return <Stethoscope {...iconProps} className="w-4 h-4 text-green-500" />;
    case 'treatment':
      return <Pill {...iconProps} className="w-4 h-4 text-purple-500" />;
    default:
      return null;
  }
});

RecordTypeIcon.displayName = 'RecordTypeIcon';

// Stat Card component (memoized)
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}> = React.memo(({ title, value, icon, colorClass }) => (
  <Card className={`bg-${colorClass}-50 border-${colorClass}-100`}>
    <CardContent className="p-3">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 bg-${colorClass}-100 rounded-lg`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-2xl font-bold text-${colorClass}-700`}>{value}</p>
          <p className={`text-xs text-${colorClass}-600 truncate`}>{title}</p>
        </div>
      </div>
    </CardContent>
  </Card>
));

StatCard.displayName = 'StatCard';

// Trend bar component
const TrendBar: React.FC<{
  month: string;
  value: number;
  max: number;
  color: string;
}> = React.memo(({ month, value, max, color }) => {
  const height = max > 0 ? Math.max((value / max) * 100, 4) : 4;
  return (
    <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
      <div
        className={`w-full bg-${color}-500 rounded-t transition-all duration-300`}
        style={{ height: `${height}%` }}
        role="img"
        aria-label={`${month}: ${value} records`}
      />
      <span className="text-xs text-gray-500 truncate w-full text-center">{month}</span>
    </div>
  );
});

TrendBar.displayName = 'TrendBar';

// Main page component
const HealthRecordsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useTranslations();
  const { language } = useLanguage();

  // State
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Queries
  const { data: animals = [], isLoading: animalsLoading } = useQuery({
    queryKey: ['animals-for-health', user?.id],
    queryFn: async (): Promise<AnimalOption[]> => {
      const { data, error } = await supabase
        .from('animals')
        .select('id, name, type')
        .eq('user_id', user?.id)
        .order('name', { ascending: true })
        .limit(50);

      if (error) throw error;
      return (data || []) as AnimalOption[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: healthRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ['health-records-all', selectedAnimalId],
    queryFn: async (): Promise<HealthRecord[]> => {
      if (!user) return [];
      return getAllHealthRecords({
        animalId: selectedAnimalId === 'all' ? undefined : selectedAnimalId
      });
    },
    enabled: !!user,
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Mutation for deleting records
  const deleteMutation = useMutation({
    mutationFn: deleteHealthRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records-all'] });
    },
  });

  // Memoized calculations
  const stats = useMemo(() => calculateStats(healthRecords), [healthRecords]);
  const healthTrends = useMemo(() => calculateTrends(healthRecords), [healthRecords]);
  const maxTrendValue = useMemo(
    () => Math.max(...healthTrends.map(m => m.vaccinations + m.illnesses + m.treatments + m.checkups), 1),
    [healthTrends]
  );

  // Filtered and paginated records
  const filteredRecords = useMemo(() => {
    let records = healthRecords;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      records = records.filter(r => 
        (r.medicine_name?.toLowerCase().includes(query)) ||
        (r.symptoms?.toLowerCase().includes(query)) ||
        (r.notes?.toLowerCase().includes(query))
      );
    }
    
    return records;
  }, [healthRecords, searchQuery]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRecords.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);

  // Handlers
  const handleAnimalChange = useCallback((id: string) => {
    setSelectedAnimalId(id);
    setCurrentPage(1);
    setSearchQuery('');
  }, []);

  const handleExport = useCallback(() => {
    exportService.exportHealthRecordsToCSV(filteredRecords, {
      filename: `health_records_${selectedAnimalId === 'all' ? 'all' : selectedAnimalId}`
    });
  }, [filteredRecords, selectedAnimalId]);

  const handleDelete = useCallback((recordId: string) => {
    if (window.confirm(t('health.confirmDelete') || 'Delete this record?')) {
      deleteMutation.mutate(recordId);
    }
  }, [deleteMutation, t]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  // Loading skeleton
  if (recordsLoading) {
    return (
      <HealthRecordsSkeleton t={t} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-6 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {t('navigation.health') || 'Health Records'}
            </h1>
            <p className="text-green-100 text-xs sm:text-sm">
              {stats.total} {t('health.totalRecords') || 'total records'}
            </p>
          </div>
          <Button
            onClick={() => navigate('/animals')}
            variant="secondary"
            size="sm"
            className="hidden sm:flex"
          >
            <Plus className="w-4 h-4 mr-1" />
            {t('health.addRecord') || 'Add'}
          </Button>
        </div>

        {/* Animal Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedAnimalId === 'all' ? 'secondary' : 'outline'}
            size="sm"
            className="whitespace-nowrap flex-shrink-0"
            onClick={() => handleAnimalChange('all')}
          >
            {t('health.allAnimals') || 'All'}
          </Button>
          {animals.slice(0, ANIMALS_MAX_DISPLAY).map(animal => (
            <Button
              key={animal.id}
              variant={selectedAnimalId === animal.id ? 'secondary' : 'outline'}
              size="sm"
              className="whitespace-nowrap flex-shrink-0"
              onClick={() => handleAnimalChange(animal.id)}
            >
              {animal.name || animal.type}
            </Button>
          ))}
          {animals.length > ANIMALS_MAX_DISPLAY && (
            <Badge variant="secondary" className="whitespace-nowrap flex-shrink-0">
              +{animals.length - ANIMALS_MAX_DISPLAY}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <StatCard
            title={t('health.vaccinations') || 'Vaccinations'}
            value={stats.vaccinations}
            icon={<Syringe className="w-4 h-4 text-blue-600" />}
            colorClass="blue"
          />
          <StatCard
            title={t('health.illnesses') || 'Illnesses'}
            value={stats.illnesses}
            icon={<Activity className="w-4 h-4 text-red-600" />}
            colorClass="red"
          />
          <StatCard
            title={t('health.treatments') || 'Treatments'}
            value={stats.treatments}
            icon={<Pill className="w-4 h-4 text-purple-600" />}
            colorClass="purple"
          />
          <StatCard
            title={t('health.checkups') || 'Checkups'}
            value={stats.checkups}
            icon={<Stethoscope className="w-4 h-4 text-green-600" />}
            colorClass="green"
          />
        </div>

        {/* Severe Cases Alert */}
        {stats.severe > 0 && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-red-800 text-sm sm:text-base">
                  {stats.severe} {t('health.severeCases') || 'severe case(s) recorded'}
                </p>
                <p className="text-xs text-red-600 truncate">
                  {t('health.monitorClosely') || 'Monitor these animals closely'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('health.searchPlaceholder') || 'Search records...'}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            aria-label="Search health records"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Trends Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t('health.trends') || 'Health Trends (6 months)'}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">{t('common.export') || 'Export'}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-20 sm:h-24 gap-1">
              {healthTrends.map((month, idx) => (
                <TrendBar
                  key={idx}
                  month={month.month}
                  value={month.vaccinations + month.illnesses + month.treatments + month.checkups}
                  max={maxTrendValue}
                  color="green"
                />
              ))}
            </div>
            <div className="flex gap-3 justify-center mt-2 text-xs flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="hidden sm:inline">{t('health.vaccinations') || 'Vaccinations'}</span>
                <span className="sm:hidden">V</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="hidden sm:inline">{t('health.illnesses') || 'Illnesses'}</span>
                <span className="sm:hidden">I</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="hidden sm:inline">{t('health.treatments') || 'Treatments'}</span>
                <span className="sm:hidden">T</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('health.recentRecords') || 'Recent Records'}
              <Badge variant="secondary" className="ml-auto">
                {filteredRecords.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {paginatedRecords.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 text-sm">
                  {searchQuery
                    ? t('health.noSearchResults') || 'No matching records found'
                    : t('health.noRecords') || 'No health records found'
                  }
                </p>
                {!searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate('/animals')}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t('health.addFirst') || 'Add First Record'}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {paginatedRecords.map((record, index) => (
                    <button
                      key={record.id}
                      className="w-full flex items-center gap-3 p-3 sm:p-4 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-100"
                      onClick={() => navigate(`/animals/${record.animal_id}`)}
                      aria-label={`View ${record.record_type} record for ${record.medicine_name || 'animal'}`}
                    >
                      <RecordTypeIcon type={record.record_type} />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {record.medicine_name || record.symptoms || record.record_type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(parseISO(record.administered_date), 'MMM d, yyyy')}
                          {record.notes && <span className="ml-2 text-gray-400">• {record.notes}</span>}
                        </p>
                      </div>
                      {record.severity && (
                        <Badge
                          variant={record.severity === 'severe' ? 'destructive' : 'secondary'}
                          className="text-xs flex-shrink-0"
                        >
                          {record.severity}
                        </Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-3 border-t border-gray-100 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                      {t('common.previous') || 'Previous'}
                    </Button>
                    <span className="text-xs text-gray-500">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                      {t('common.next') || 'Next'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile FAB for adding records */}
      <button
        onClick={() => navigate('/animals')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center z-40 sm:hidden"
        aria-label={t('health.addRecord') || 'Add Record'}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

// Loading skeleton component
const HealthRecordsSkeleton: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="min-h-screen bg-gray-50 pb-24">
    {/* Header Skeleton */}
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton className="h-7 w-40 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-8 w-20 flex-shrink-0" />
        ))}
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="p-3 sm:p-4 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <div>
                  <Skeleton className="h-6 w-8 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Skeleton className="h-10 w-full" />

      {/* Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>

      {/* Records List */}
      <Card>
        <CardContent className="p-0">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

export default HealthRecordsPage;
