import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { InfiniteScrollContainer, ListSkeleton, EmptyState } from '@/components/InfiniteScrollContainer';
import { usePaginatedMilkProduction } from '@/hooks/usePaginatedMilkProduction';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Milk, TrendingUp, Calendar, BarChart3, Plus } from 'lucide-react';
import { format } from 'date-fns';

// MilkProductionRecords component
const MilkProductionRecords = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  
  // Filter states
  const [qualityFilter, setQualityFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'quality'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Main milk production records with filters
  const {
    milkRecords,
    statistics,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    isOffline,
    isEmpty,
    totalCount,
    refresh
  } = usePaginatedMilkProduction({
    pageSize: 30,
    filters: {
      qualityGrade: qualityFilter || undefined,
    },
    sortBy,
    sortOrder,
  });

  const translations = {
    am: {
      title: 'የወተት ምርት',
      subtitle: 'የወተት ምርት መዝገቦችዎን ይከታተሉ እና ይተንትኑ',
      totalProduction: 'አጠቃላይ ምርት',
      averageDaily: 'አማካይ ዕለታዊ',
      highestDay: 'ከፍተኛ ቀን',
      recordCount: 'አጠቃላይ መዝገቦች',
      filterQuality: 'በጥራት ያጣሩ',
      sortBy: 'ደርድር በ',
      date: 'ቀን',
      amount: 'መጠን',
      quality: 'ጥራት',
      noRecords: 'ገና የወተት ምርት መዝገቦች የሉም',
      startTracking: 'አፈጻጸም እና አዝማሚያዎችን ለመከታተል ዕለታዊ የወተት ምርትዎን መከታተል ይጀምሩ',
      addRecord: 'የምርት መዝገብ ይጨምሩ',
      liters: 'ሊትር',
      gradeA: 'ደረጃ ሀ',
      gradeB: 'ደረጃ ለ',
      gradeC: 'ደረጃ ሐ',
      newest: 'አዲስ መጀመሪያ',
      oldest: 'አሮጌ መጀመሪያ'
    },
    en: {
      title: 'Milk Production',
      subtitle: 'Track and analyze your milk production records',
      totalProduction: 'Total Production',
      averageDaily: 'Average Daily',
      highestDay: 'Highest Day',
      recordCount: 'Total Records',
      filterQuality: 'Filter by quality',
      sortBy: 'Sort by',
      date: 'Date',
      amount: 'Amount',
      quality: 'Quality',
      noRecords: 'No milk production records yet',
      startTracking: 'Start tracking your daily milk production to monitor performance and trends',
      addRecord: 'Add Production Record',
      liters: 'liters',
      gradeA: 'Grade A',
      gradeB: 'Grade B',
      gradeC: 'Grade C',
      newest: 'Newest First',
      oldest: 'Oldest First'
    },
    or: {
      title: 'Oomisha Aannan',
      subtitle: 'Galmee oomisha aannan keessanii hordofuu fi xiinxaluu',
      totalProduction: 'Oomisha Waliigalaa',
      averageDaily: 'Giddugaleessa Guyyaa',
      highestDay: 'Guyyaa Olaanaa',
      recordCount: 'Galmee Hundaa',
      filterQuality: 'Qulqullina waliin cali',
      sortBy: 'Tartiiba',
      date: 'Guyyaa',
      amount: 'Hamma',
      quality: 'Qulqullina',
      noRecords: 'Galmeen oomisha aannan hin jiru',
      startTracking: 'Raawwii fi haala hordofuuf oomisha aannan guyyaa keessanii hordofuu jalqabaa',
      addRecord: 'Galmee Oomishaa Dabaluu',
      liters: 'liitirii',
      gradeA: 'Sadarkaa A',
      gradeB: 'Sadarkaa B',
      gradeC: 'Sadarkaa C',
      newest: 'Haaraa Jalqaba',
      oldest: 'Moofaa Jalqaba'
    },
    sw: {
      title: 'Uzalishaji wa Maziwa',
      subtitle: 'Fuatilia na uchanganue rekodi za uzalishaji wa maziwa',
      totalProduction: 'Jumla ya Uzalishaji',
      averageDaily: 'Wastani wa Kila Siku',
      highestDay: 'Siku ya Juu',
      recordCount: 'Jumla ya Rekodi',
      filterQuality: 'Chuja kwa ubora',
      sortBy: 'Panga kwa',
      date: 'Tarehe',
      amount: 'Kiasi',
      quality: 'Ubora',
      noRecords: 'Hakuna rekodi za uzalishaji wa maziwa bado',
      startTracking: 'Anza kufuatilia uzalishaji wako wa maziwa kila siku ili kufuatilia utendaji na mwenendo',
      addRecord: 'Ongeza Rekodi ya Uzalishaji',
      liters: 'lita',
      gradeA: 'Daraja A',
      gradeB: 'Daraja B',
      gradeC: 'Daraja C',
      newest: 'Mpya Kwanza',
      oldest: 'Za Zamani Kwanza'
    }
  };

  const t = translations[language];

  const getQualityColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const MilkRecordCard = ({ record }: { record: any }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Milk className="w-4 h-4 text-blue-600" />
            <span className="font-medium">{record.amount || record.total_yield || 0} {t.liters}</span>
            {record.quality_grade && (
              <Badge className={getQualityColor(record.quality_grade)}>
                {t[`grade${record.quality_grade}`] || `Grade ${record.quality_grade}`}
              </Badge>
            )}
          </div>
          <span className="text-sm text-gray-500">
            {record.production_date ? format(new Date(record.production_date), 'MMM dd, yyyy') : 'N/A'}
          </span>
        </div>
        
        {record.animal_name && (
          <p className="text-sm text-gray-600 mb-1">
            <strong>Animal:</strong> {record.animal_name}
          </p>
        )}
        
        {record.notes && (
          <p className="text-sm text-gray-600">{record.notes}</p>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Milk className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.totalProduction}</p>
                  <p className="text-xl font-bold">{statistics?.totalAmount?.toFixed(1) || 0}L</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.averageDaily}</p>
                  <p className="text-xl font-bold">{statistics?.averageAmount?.toFixed(1) || 0}L</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.highestDay}</p>
                  <p className="text-xl font-bold">{statistics?.highestAmount?.toFixed(1) || 0}L</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.recordCount}</p>
                  <p className="text-xl font-bold">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select
            value={qualityFilter || 'all'}
            onValueChange={(v) => setQualityFilter(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t.filterQuality} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filterQuality}</SelectItem>
              <SelectItem value="A">{t.gradeA}</SelectItem>
              <SelectItem value="B">{t.gradeB}</SelectItem>
              <SelectItem value="C">{t.gradeC}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: 'date' | 'amount' | 'quality') => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">{t.date}</SelectItem>
              <SelectItem value="amount">{t.amount}</SelectItem>
              <SelectItem value="quality">{t.quality}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">{t.newest}</SelectItem>
              <SelectItem value="asc">{t.oldest}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            {t.addRecord}
          </Button>
        </div>

        {/* Milk Production Records */}
        {isEmpty ? (
          <EmptyState
            title={t.noRecords}
            description={t.startTracking}
            icon={<Milk className="w-10 h-10 text-gray-400" />}
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
            loadingMessage="Loading more milk production records..."
            endMessage={`All ${totalCount} production records loaded`}
            offlineMessage="Offline - showing cached production records"
          >
            <div className="space-y-4">
              {milkRecords.map((record) => (
                <MilkRecordCard key={record.id} record={record} />
              ))}
            </div>
          </InfiniteScrollContainer>
        )}
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default MilkProductionRecords;
