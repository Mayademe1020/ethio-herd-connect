import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { InfiniteScrollContainer, ListSkeleton, EmptyState } from '@/components/InfiniteScrollContainer';
import { usePaginatedHealthRecords } from '@/hooks/usePaginatedHealthRecords';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, Syringe, AlertTriangle, Calendar, Search, Plus, Activity } from 'lucide-react';
import { format } from 'date-fns';

// HealthRecords component
const HealthRecords = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  
  // Main health records with filters
  const {
    healthRecords,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    isOffline,
    isEmpty,
    totalCount,
    refresh
  } = usePaginatedHealthRecords({
    pageSize: 20,
    filters: {
      recordType: recordTypeFilter || undefined,
      severity: severityFilter || undefined,
    },
  });

  const translations = {
    am: {
      title: 'የጤና መዝገቦች',
      subtitle: 'የእንስሳቶችዎን ጤና እና የሕክምና ታሪክ ይከታተሉ',
      search: 'መዝገቦችን ይፈልጉ...',
      filterType: 'በአይነት ያጣሩ',
      filterSeverity: 'በክብደት ያጣሩ',
      noRecords: 'ገና የጤና መዝገቦች የሉም',
      startTracking: 'የክትባት እና የሕክምና መዝገቦችን በመጨመር የእንስሳቶችዎን ጤና መከታተል ይጀምሩ',
      addRecord: 'የጤና መዝገብ ይጨምሩ',
      vaccination: 'ክትባት',
      treatment: 'ሕክምና',
      checkup: 'ምርመራ',
      illness: 'ሕመም',
      mild: 'ቀላል',
      moderate: 'መካከለኛ',
      severe: 'ከባድ',
      critical: 'ወሳኝ',
      totalRecords: 'ጠቅላላ መዝገቦች',
      medicine: 'መድሃኒት'
    },
    en: {
      title: 'Health Records',
      subtitle: 'Monitor your animals\' health and medical history',
      search: 'Search records...',
      filterType: 'Filter by type',
      filterSeverity: 'Filter by severity',
      noRecords: 'No health records yet',
      startTracking: 'Start tracking your animals\' health by adding vaccination and treatment records',
      addRecord: 'Add Health Record',
      vaccination: 'Vaccination',
      treatment: 'Treatment',
      checkup: 'Checkup',
      illness: 'Illness',
      mild: 'Mild',
      moderate: 'Moderate',
      severe: 'Severe',
      critical: 'Critical',
      totalRecords: 'Total Records',
      medicine: 'Medicine'
    },
    or: {
      title: 'Galmee Fayyaa',
      subtitle: 'Fayyaa fi seenaa yaalaa horii keessanii hordofaa',
      search: 'Galmee barbaadi...',
      filterType: 'Gosa waliin cali',
      filterSeverity: 'Hammeenyaan cali',
      noRecords: 'Galmeen fayyaa hin jiru',
      startTracking: 'Galmee walaloo fi yaalaa dabaluun fayyaa horii keessanii hordofuu jalqabaa',
      addRecord: 'Galmee Fayyaa Dabaluu',
      vaccination: 'Walaloo',
      treatment: 'Yaalaa',
      checkup: 'Qorannoo',
      illness: 'Dhukkuba',
      mild: 'Salphaa',
      moderate: 'Giddu-galeessa',
      severe: 'Hamaa',
      critical: 'Murteessaa',
      totalRecords: 'Galmee Hundaa',
      medicine: 'Qoricha'
    },
    sw: {
      title: 'Rekodi za Afya',
      subtitle: 'Fuatilia afya na historia ya matibabu ya wanyama wako',
      search: 'Tafuta rekodi...',
      filterType: 'Chuja kwa aina',
      filterSeverity: 'Chuja kwa ukali',
      noRecords: 'Hakuna rekodi za afya bado',
      startTracking: 'Anza kufuatilia afya ya wanyama wako kwa kuongeza rekodi za chanjo na matibabu',
      addRecord: 'Ongeza Rekodi ya Afya',
      vaccination: 'Chanjo',
      treatment: 'Matibabu',
      checkup: 'Uchunguzi',
      illness: 'Ugonjwa',
      mild: 'Nyepesi',
      moderate: 'Wastani',
      severe: 'Kali',
      critical: 'Hatari',
      totalRecords: 'Jumla ya Rekodi',
      medicine: 'Dawa'
    }
  };

  const t = translations[language];

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'severe': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'mild': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'vaccination': return <Syringe className="w-4 h-4" />;
      case 'treatment': return <Stethoscope className="w-4 h-4" />;
      case 'illness': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const HealthRecordCard = ({ record }: { record: any }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getRecordTypeIcon(record.record_type)}
            <span className="font-medium capitalize">{record.record_type || 'Health Record'}</span>
            {record.severity && (
              <Badge className={getSeverityColor(record.severity)}>
                {t[record.severity.toLowerCase()] || record.severity}
              </Badge>
            )}
          </div>
          <span className="text-sm text-gray-500">
            {record.administered_date ? format(new Date(record.administered_date), 'MMM dd, yyyy') : 'N/A'}
          </span>
        </div>
        
        {record.animal_name && (
          <p className="text-sm text-gray-600 mb-1">
            <strong>Animal:</strong> {record.animal_name}
          </p>
        )}
        
        {record.medicine_name && (
          <p className="text-sm text-gray-600 mb-1">
            <strong>{t.medicine}:</strong> {record.medicine_name}
          </p>
        )}
        
        {record.notes && (
          <p className="text-sm text-gray-600 mt-2">{record.notes}</p>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-16 sm:pb-20 lg:pb-24">
        <EnhancedHeader />
        <OfflineIndicator language={language} />
        <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
          <ListSkeleton count={5} />
        </main>
        <BottomNavigation language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.totalRecords}</p>
                  <p className="text-xl font-bold">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Syringe className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.vaccination}</p>
                  <p className="text-xl font-bold">
                    {healthRecords.filter(r => r.record_type === 'vaccination').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.critical}</p>
                  <p className="text-xl font-bold">
                    {healthRecords.filter(r => r.severity === 'critical').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={recordTypeFilter || 'all'}
            onValueChange={(v) => setRecordTypeFilter(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t.filterType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filterType}</SelectItem>
              <SelectItem value="vaccination">{t.vaccination}</SelectItem>
              <SelectItem value="treatment">{t.treatment}</SelectItem>
              <SelectItem value="checkup">{t.checkup}</SelectItem>
              <SelectItem value="illness">{t.illness}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={severityFilter || 'all'}
            onValueChange={(v) => setSeverityFilter(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t.filterSeverity} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filterSeverity}</SelectItem>
              <SelectItem value="mild">{t.mild}</SelectItem>
              <SelectItem value="moderate">{t.moderate}</SelectItem>
              <SelectItem value="severe">{t.severe}</SelectItem>
              <SelectItem value="critical">{t.critical}</SelectItem>
            </SelectContent>
          </Select>

          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            {t.addRecord}
          </Button>
        </div>

        {/* Health Records List */}
        {isEmpty ? (
          <EmptyState
            title={t.noRecords}
            description={t.startTracking}
            icon={<Stethoscope className="w-10 h-10 text-gray-400" />}
            action={
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                {t.addRecord}
              </Button>
            }
          />
        ) : (
          <InfiniteScrollContainer
            onLoadMore={fetchNextPage}
            hasMore={hasNextPage}
            isLoading={isFetchingNextPage}
            isOffline={isOffline}
            loadingMessage="Loading more health records..."
            endMessage={`All ${totalCount} health records loaded`}
            offlineMessage="Offline - showing cached health records"
          >
            <div className="space-y-4">
              {healthRecords.map((record) => (
                <HealthRecordCard key={record.id} record={record} />
              ))}
            </div>
          </InfiniteScrollContainer>
        )}
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default HealthRecords;
