
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Milk, 
  Plus, 
  TrendingUp, 
  Calendar,
  Cow,
  BarChart3,
  Target
} from 'lucide-react';

const MilkProduction = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [dailyProduction, setDailyProduction] = useState('');

  const translations = {
    am: {
      title: 'የወተት ምርት',
      subtitle: 'ወተት ምርት መከታተያ እና ትንተና',
      addProduction: 'ወተት ምርት ይመዝግቡ',
      dailyProduction: 'የዕለት ምርት',
      totalToday: 'ዛሬ ጠቅላላ',
      weeklyAverage: 'የሳምንት አማካይ',
      monthlyTarget: 'የወር ኢላማ',
      liters: 'ሊትር',
      record: 'መዝግብ',
      cancel: 'ሰርዝ',
      enterAmount: 'የወተት መጠን ያስገቡ (ሊትር)',
      noRecords: 'ምንም የወተት ምርት መዝገብ የለም'
    },
    en: {
      title: 'Milk Production',
      subtitle: 'Track and analyze milk production',
      addProduction: 'Record Milk Production',
      dailyProduction: 'Daily Production',
      totalToday: 'Total Today',
      weeklyAverage: 'Weekly Average',
      monthlyTarget: 'Monthly Target',
      liters: 'Liters',
      record: 'Record',
      cancel: 'Cancel',
      enterAmount: 'Enter milk amount (liters)',
      noRecords: 'No milk production records yet'
    },
    or: {
      title: 'Oomisha Aannan',
      subtitle: 'Oomisha aannan hordofuu fi xiinxaluu',
      addProduction: 'Oomisha Aannan Galmeessi',
      dailyProduction: 'Oomisha Guyyaa',
      totalToday: 'Waliigala Har\'aa',
      weeklyAverage: 'Giddugaleessa Torban',
      monthlyTarget: 'Galma Ji\'a',
      liters: 'Liitirii',
      record: 'Galmeessi',
      cancel: 'Dhiisi',
      enterAmount: 'Hamma aannan galchi (liitirii)',
      noRecords: 'Galmeen oomisha aannan hin jiru'
    },
    sw: {
      title: 'Uzalishaji wa Maziwa',
      subtitle: 'Fuatilia na uchanganue uzalishaji wa maziwa',
      addProduction: 'Rekodi Uzalishaji wa Maziwa',
      dailyProduction: 'Uzalishaji wa Kila Siku',
      totalToday: 'Jumla ya Leo',
      weeklyAverage: 'Wastani wa Wiki',
      monthlyTarget: 'Lengo la Mwezi',
      liters: 'Lita',
      record: 'Rekodi',
      cancel: 'Ghairi',
      enterAmount: 'Ingiza kiasi cha maziwa (lita)',
      noRecords: 'Hakuna rekodi za uzalishaji wa maziwa bado'
    }
  };

  const t = translations[language];

  // Mock data for demonstration
  const stats = {
    todayTotal: 45.5,
    weeklyAverage: 42.3,
    monthlyTarget: 1200,
    progress: 65
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyProduction) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setShowForm(false);
      setDailyProduction('');
    }, 1000);
  };

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

        {/* Action Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.addProduction}
          </Button>
        </div>

        {/* Production Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{t.addProduction}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder={t.enterAmount}
                    value={dailyProduction}
                    onChange={(e) => setDailyProduction(e.target.value)}
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? <LoadingSpinner /> : t.record}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    {t.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

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

        {/* Production Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Cow className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500">{t.noRecords}</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default MilkProduction;
