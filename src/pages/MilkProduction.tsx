
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
import { useAnimalsDatabase } from '@/hooks/useAnimalsDatabase';
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
  const { recordMilkProduction, isRecording, milkRecords, isLoadingRecords } = useMilkProduction();
  const { animals, isLoading: isLoadingAnimals } = useAnimalsDatabase();
  
  const [selectedCows, setSelectedCows] = useState<string[]>([]);
  const [showRecordingForm, setShowRecordingForm] = useState(false);

  // Filter only cattle from animals
  const cowsData = animals.filter(animal => 
    animal.type.toLowerCase() === 'cattle' || animal.type.toLowerCase() === 'cow'
  );

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

  // Calculate stats from real data
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const todayRecords = milkRecords.filter(r => r.production_date === today);
  const weekRecords = milkRecords.filter(r => r.production_date >= weekAgo);
  
  const todayTotal = todayRecords.reduce((sum, r) => sum + (r.total_yield || 0), 0);
  const weeklyAverage = weekRecords.length > 0 
    ? weekRecords.reduce((sum, r) => sum + (r.total_yield || 0), 0) / 7
    : 0;
  
  const monthlyTarget = 1200; // User-defined target
  const monthTotal = milkRecords
    .filter(r => r.production_date.startsWith(today.substring(0, 7)))
    .reduce((sum, r) => sum + (r.total_yield || 0), 0);
  const progress = Math.round((monthTotal / monthlyTarget) * 100);

  const stats = {
    todayTotal: Number(todayTotal.toFixed(1)),
    weeklyAverage: Number(weeklyAverage.toFixed(1)),
    monthlyTarget,
    progress
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
    for (const record of records) {
      const quantity = parseFloat(record.quantity);
      if (quantity > 0) {
        recordMilkProduction({
          animal_id: record.cowId,
          production_date: new Date().toISOString().split('T')[0],
          morning_yield: quantity, // Could be split into morning/evening
          total_yield: quantity,
          notes: `Recorded at ${record.time}`
        });
      }
    }
    
    // Reset state after successful save
    setSelectedCows([]);
    setShowRecordingForm(false);
  };

  const handleCancel = () => {
    setShowRecordingForm(false);
  };

  const getSelectedCowsData = () => {
    return cowsData.filter(cow => selectedCows.includes(cow.id));
  };

  if (isLoadingAnimals || isLoadingRecords) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

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
            {milkRecords.length === 0 ? (
              <div className="text-center py-8">
                <Circle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No recent records</p>
              </div>
            ) : (
              <div className="space-y-3">
                {milkRecords.slice(0, 5).map((record) => {
                  const animal = animals.find(a => a.id === record.animal_id);
                  return (
                    <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{animal?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{record.production_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{record.total_yield} {t.liters}</p>
                        {record.quality_grade && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Grade {record.quality_grade}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default MilkProduction;
