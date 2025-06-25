
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Stethoscope, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { InteractiveSummaryCard } from '@/components/InteractiveSummaryCard';
import { HealthReminderSystem } from '@/components/HealthReminderSystem';
import { HealthSubmissionForm } from '@/components/HealthSubmissionForm';
import { VaccinationForm } from '@/components/VaccinationForm';
import { IllnessReportForm } from '@/components/IllnessReportForm';
import { useLanguage } from '@/contexts/LanguageContext';

const Health = () => {
  const { language } = useLanguage();
  const [showHealthSubmissionForm, setShowHealthSubmissionForm] = useState(false);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [showIllnessForm, setShowIllnessForm] = useState(false);

  const translations = {
    am: {
      title: 'የጤንነት አስተዳደር',
      subtitle: 'የእንስሳቶችዎን ጤንነት ይከታተሉ እና ያስተዳድሩ',
      addVaccination: 'ክትባት ጨምር',
      reportIllness: 'ህመም ሪፖርት',
      requestSupport: 'ድጋፍ ጠይቅ',
      viewRecords: 'መዝገቦችን ይመልከቱ'
    },
    en: {
      title: 'Health Management',
      subtitle: 'Monitor and manage your animals\' health',
      addVaccination: 'Add Vaccination',
      reportIllness: 'Report Illness',
      requestSupport: 'Request Support',
      viewRecords: 'View Records'
    },
    or: {
      title: 'Bulchiinsa Fayyaa',
      subtitle: 'Fayyaa horii keessanii hordofuu fi bulchuu',
      addVaccination: 'Walaloo Dabaluu',
      reportIllness: 'Dhukkuba Gabaasuu',
      requestSupport: 'Gargaarsa Gaafachuu',
      viewRecords: 'Galmee Ilaaluu'
    },
    sw: {
      title: 'Usimamizi wa Afya',
      subtitle: 'Fuatilia na simamia afya ya wanyama wako',
      addVaccination: 'Ongeza Chanjo',
      reportIllness: 'Ripoti Ugonjwa',
      requestSupport: 'Omba Msaada',
      viewRecords: 'Ona Rekodi'
    }
  };

  const t = translations[language];

  // Mock health statistics
  const healthStats = {
    totalAnimals: 24,
    healthyAnimals: 20,
    sickAnimals: 2,
    needsAttention: 2,
    vaccinatedAnimals: 22,
    upcomingVaccinations: 5,
    recentVaccinations: 8,
    healthChecksDue: 3
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Page Title */}
        <div className="text-center px-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            🏥 {t.title}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
            {t.subtitle}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Button 
            onClick={() => setShowVaccinationForm(true)}
            className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            <span className="font-medium text-center leading-tight">
              {t.addVaccination}
            </span>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setShowIllnessForm(true)}
            className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 border-red-200 hover:bg-red-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-500" />
            <span className="font-medium text-center leading-tight">
              {t.reportIllness}
            </span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowHealthSubmissionForm(true)}
            className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-500" />
            <span className="font-medium text-center leading-tight">
              {t.requestSupport}
            </span>
          </Button>

          <Button 
            variant="outline" 
            className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 border-purple-200 hover:bg-purple-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-500" />
            <span className="font-medium text-center leading-tight">
              {t.viewRecords}
            </span>
          </Button>
        </div>

        {/* Health Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <InteractiveSummaryCard
            title="Total Animals"
            titleAm="ጠቅላላ እንስሳት"
            titleOr="Horii Hundaa"
            titleSw="Jumla ya Wanyama"
            value={healthStats.totalAnimals}
            icon={<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            color="blue"
            language={language}
          />
          
          <InteractiveSummaryCard
            title="Healthy"
            titleAm="ጤናማ"
            titleOr="Fayyaa"
            titleSw="Wenye Afya"
            value={healthStats.healthyAnimals}
            icon={<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            color="green"
            language={language}
          />

          <InteractiveSummaryCard
            title="Sick"
            titleAm="ታሞ"
            titleOr="Dhukkuba"
            titleSw="Wagonjwa"
            value={healthStats.sickAnimals}
            icon={<AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            color="red"
            language={language}
          />

          <InteractiveSummaryCard
            title="Needs Attention"
            titleAm="ትኩረት ያስፈልጋል"
            titleOr="Xiyyeeffannaa Barbaada"
            titleSw="Wanahitaji Umakini"
            value={healthStats.needsAttention}
            icon={<AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            color="orange"
            language={language}
          />
        </div>

        {/* Health Reminder System */}
        <HealthReminderSystem language={language} />
      </main>

      <BottomNavigation language={language} />

      {/* Health Submission Form */}
      {showHealthSubmissionForm && (
        <HealthSubmissionForm
          language={language}
          onClose={() => setShowHealthSubmissionForm(false)}
        />
      )}

      {/* Vaccination Form */}
      {showVaccinationForm && (
        <VaccinationForm
          language={language}
          mode="single"
          onClose={() => setShowVaccinationForm(false)}
        />
      )}

      {/* Illness Report Form */}
      {showIllnessForm && (
        <IllnessReportForm
          language={language}
          onClose={() => setShowIllnessForm(false)}
          onSubmit={(data) => {
            console.log('Illness report submitted:', data);
            setShowIllnessForm(false);
          }}
        />
      )}
    </div>
  );
};

export default Health;
