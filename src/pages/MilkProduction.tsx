
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { CowSelectionCard } from '@/components/CowSelectionCard';
import { MilkRecordingForm } from '@/components/MilkRecordingForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useMilkProduction } from '@/hooks/useMilkProduction';
import { 
  Milk, 
  ArrowLeft,
  TrendingUp, 
  Calendar,
  Circle,
  BarChart3,
  Target,
  CheckCircle
} from 'lucide-react';
import { AnimalData } from '@/types';

const MilkProduction = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { recordMilkProduction, isRecording } = useMilkProduction();
  
  const [selectedCows, setSelectedCows] = useState<string[]>([]);
  const [showRecordingForm, setShowRecordingForm] = useState(false);
  const [cowsData] = useState<AnimalData[]>([
    {
      id: '1',
      animal_code: 'COW001',
      name: 'Almaz',
      type: 'Cattle',
      breed: 'Holstein',
      birth_date: '2020-01-15',
      health_status: 'healthy' as const,
      is_vet_verified: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      user_id: 'current-user',
      age: 36
    },
    {
      id: '2',
      animal_code: 'COW002',
      name: 'Meseret',
      type: 'Cattle',
      breed: 'Jersey',
      birth_date: '2021-03-20',
      health_status: 'healthy' as const,
      is_vet_verified: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      user_id: 'current-user',
      age: 24
    },
    {
      id: '3',
      animal_code: 'COW003',
      name: 'Hanan',
      type: 'Cattle',
      breed: 'Local',
      birth_date: '2019-11-10',
      health_status: 'healthy' as const,
      is_vet_verified: false,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      user_id: 'current-user',
      age: 48
    }
  ]);

  const translations = {
    am: {
      title: 'የወተት ምርት',
      subtitle: 'ወተት ምርት መከታተያ እና ትንተና',
      selectCows: 'ላቀት ወተት ምርት ለመመዝገብ ላቀት ምረጥ',
      selectedCount: 'የተመረጡ ላቀቶች',
      recordProduction: 'ወተት ምርት ይመዝግቡ',
      totalToday: 'ዛሬ ጠቅላላ',
      weeklyAverage: 'የሳምንት አማካይ',
      monthlyTarget: 'የወር ኢላማ',
      recentRecords: 'የቅርብ ጊዜ መዝገቦች',
      liters: 'ሊትር',
      noCows: 'የወተት ላቀቶች አልተገኙም',
      selectAtLeastOne: 'ቢያንስ አንድ ላቀት ይምረጡ',
      back: 'ተመለስ'
    },
    en: {
      title: 'Milk Production',
      subtitle: 'Track and analyze milk production',
      selectCows: 'Select cows to record milk production',
      selectedCount: 'Selected Cows',
      recordProduction: 'Record Production',
      totalToday: 'Total Today',
      weeklyAverage: 'Weekly Average',
      monthlyTarget: 'Monthly Target',
      recentRecords: 'Recent Records',
      liters: 'Liters',
      noCows: 'No dairy cows found',
      selectAtLeastOne: 'Select at least one cow',
      back: 'Back'
    },
    or: {
      title: 'Oomisha Aannan',
      subtitle: 'Oomisha aannan hordofuu fi xiinxaluu',
      selectCows: 'Oomisha aannan galmeessuuf saawwan filadhu',
      selectedCount: 'Saawwan Filataman',
      recordProduction: 'Oomisha Galmeessi',
      totalToday: 'Waliigala Har\'aa',
      weeklyAverage: 'Giddugaleessa Torban',
      monthlyTarget: 'Galma Ji\'a',
      recentRecords: 'Galmee Dhihoo',
      liters: 'Liitirii',
      noCows: 'Saawwan aannan hin argamne',
      selectAtLeastOne: 'Yoo xiqqaate saawwa tokko filadhu',
      back: 'Deebi\'i'
    },
    sw: {
      title: 'Uzalishaji wa Maziwa',
      subtitle: 'Fuatilia na uchanganue uzalishaji wa maziwa',
      selectCows: 'Chagua ng\'ombe wa kurekodi uzalishaji wa maziwa',
      selectedCount: 'Ng\'ombe Waliochaguliwa',
      recordProduction: 'Rekodi Uzalishaji',
      totalToday: 'Jumla ya Leo',
      weeklyAverage: 'Wastani wa Wiki',
      monthlyTarget: 'Lengo la Mwezi',
      recentRecords: 'Rekodi za Hivi Karibuni',
      liters: 'Lita',
      noCows: 'Hakuna ng\'ombe wa maziwa',
      selectAtLeastOne: 'Chagua angalau ng\'ombe mmoja',
      back: 'Rudi'
    }
  };

  const t = translations[language];

  // Mock stats data
  const stats = {
    todayTotal: 45.5,
    weeklyAverage: 42.3,
    monthlyTarget: 1200,
    progress: 65
  };

  const handleCowSelection = (cowId: string, selected: boolean) => {
    setSelectedCows(prev => 
      selected 
        ? [...prev, cowId]
        : prev.filter(id => id !== cowId)
    );
  };

  const handleRecordProduction = () => {
    if (selectedCows.length === 0) return;
    setShowRecordingForm(true);
  };

  const handleSaveRecords = async (records: any[]) => {
    try {
      // Here you would call the actual API to save records
      console.log('Saving milk records:', records);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset state after successful save
      setSelectedCows([]);
      setShowRecordingForm(false);
    } catch (error) {
      console.error('Failed to save records:', error);
    }
  };

  const handleCancel = () => {
    setShowRecordingForm(false);
  };

  const getSelectedCowsData = () => {
    return cowsData.filter(cow => selectedCows.includes(cow.id));
  };

  if (showRecordingForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-emerald-50 pb-16 sm:pb-20 lg:pb-24">
        <EnhancedHeader />
        
        <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.back}
            </Button>
          </div>
          
          <MilkRecordingForm
            selectedCows={getSelectedCowsData()}
            language={language}
            onSave={handleSaveRecords}
            onCancel={handleCancel}
            isLoading={isRecording}
          />
        </main>
        
        <BottomNavigation language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-emerald-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />

      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Milk className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              {t.title}
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">{t.subtitle}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Milk className="w-4 h-4 mr-2 text-blue-600" />
                {t.totalToday}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.todayTotal} {t.liters}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                {t.weeklyAverage}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.weeklyAverage} {t.liters}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Target className="w-4 h-4 mr-2 text-purple-600" />
                {t.monthlyTarget}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.monthlyTarget} {t.liters}
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {stats.progress}% Complete
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-orange-600" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                <TrendingUp className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cow Selection Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Milk className="w-5 h-5 text-blue-600" />
                {t.selectCows}
              </CardTitle>
              {selectedCows.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {selectedCows.length} {t.selectedCount}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {cowsData.length === 0 ? (
              <div className="text-center py-8">
                <Circle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">{t.noCows}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cowsData.map((cow) => (
                  <CowSelectionCard
                    key={cow.id}
                    cow={cow}
                    isSelected={selectedCows.includes(cow.id)}
                    onSelectionChange={handleCowSelection}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="sticky bottom-20 z-10">
          <Button
            onClick={handleRecordProduction}
            disabled={selectedCows.length === 0}
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Milk className="w-5 h-5 mr-2" />
            {t.recordProduction}
            {selectedCows.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedCows.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Recent Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {t.recentRecords}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Circle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No recent records</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default MilkProduction;
