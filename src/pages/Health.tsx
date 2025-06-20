
import { useState } from 'react';
import { VaccinationForm } from '@/components/VaccinationForm';
import { IllnessReportForm } from '@/components/IllnessReportForm';
import { HealthReminderSystem } from '@/components/HealthReminderSystem';
import { InteractiveSummaryCard } from '@/components/InteractiveSummaryCard';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Syringe, AlertTriangle, Calendar, Activity, TrendingUp, Bell, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Health = () => {
  const { language } = useLanguage();
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [showIllnessForm, setShowIllnessForm] = useState(false);
  const [vaccinationMode, setVaccinationMode] = useState<'single' | 'bulk'>('bulk');
  const [selectedDetailView, setSelectedDetailView] = useState<string | null>(null);

  // Mock data - in real app this would come from storage/API
  const healthStats = {
    totalVaccinations: 12,
    scheduledTasks: 3,
    healthyAnimals: 8,
    needAttention: 2,
    overdueVaccinations: 0,
    upcomingCheckups: 2
  };

  const handleVaccinationClick = (mode: 'single' | 'bulk') => {
    setVaccinationMode(mode);
    setShowVaccinationForm(true);
  };

  const handleDetailViewClick = (cardType: string) => {
    setSelectedDetailView(cardType);
  };

  const DetailView = ({ type }: { type: string }) => {
    const getDetailContent = () => {
      switch (type) {
        case 'vaccinations':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'am' ? 'የክትባት ዝርዝር' : 'Vaccination Records'}
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {language === 'am' ? `እንስሳ ${i}` : `Animal ${i}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'am' ? 'ክትባት ዓይነት: FMD' : 'Vaccine: FMD'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {language === 'am' ? '2 ቀናት በፊት' : '2 days ago'}
                        </p>
                      </div>
                      <div className="text-green-600">
                        <Syringe className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'scheduled':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'am' ? 'የተመደቡ ስራዎች' : 'Scheduled Tasks'}
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {language === 'am' ? `የክትባት ቀጠሮ ${i}` : `Vaccination Schedule ${i}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'am' ? 'በ 3 ቀናት ውስጥ' : 'In 3 days'}
                        </p>
                      </div>
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'healthy':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'am' ? 'ጤናማ እንስሳት' : 'Healthy Animals'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-medium">
                          {language === 'am' ? `እንስሳ ${i}` : `Animal ${i}`}
                        </p>
                        <p className="text-sm text-green-600">
                          {language === 'am' ? 'ጤናማ' : 'Healthy'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'attention':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'am' ? 'ትኩረት የሚፈልጉ እንስሳት' : 'Animals Needing Attention'}
              </h3>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {language === 'am' ? `እንስሳ ${i}` : `Animal ${i}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'am' ? 'ምልክቶች: ብርድ' : 'Symptoms: Cold'}
                        </p>
                        <p className="text-sm text-yellow-600">
                          {language === 'am' ? 'ትኩረት ያስፈልጋል' : 'Needs attention'}
                        </p>
                      </div>
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        default:
          return <div>No data available</div>;
      }
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedDetailView(null)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'am' ? 'ተመለስ' : 'Back'}
          </Button>
        </div>
        {getDetailContent()}
      </div>
    );
  };

  if (selectedDetailView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
        <EnhancedHeader />
        <OfflineIndicator />
        
        <main className="container mx-auto px-4 py-6">
          <DetailView type={selectedDetailView} />
        </main>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <EnhancedHeader />
      <OfflineIndicator />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            💉 {language === 'am' ? 'የጤንነት አስተዳደር' : 'Health Management'}
          </h1>
          <p className="text-gray-600">
            {language === 'am' 
              ? 'ክትባቶችን እና ህክምናዎችን ይከታተሉ'
              : 'Track vaccinations and treatments'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button 
            className="h-20 flex flex-col space-y-2 bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
            onClick={() => handleVaccinationClick('bulk')}
          >
            <Syringe className="w-6 h-6" />
            <span className="text-sm font-medium">
              {language === 'am' ? 'ጅምላ ክትባት' : 'Bulk Vaccination'}
            </span>
          </Button>

          <Button 
            variant="outline" 
            className="h-20 flex flex-col space-y-2 border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
            onClick={() => handleVaccinationClick('single')}
          >
            <Syringe className="w-6 h-6 text-blue-500" />
            <span className="text-sm font-medium">
              {language === 'am' ? 'ነጠላ ክትባት' : 'Single Vaccination'}
            </span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex flex-col space-y-2 border-red-200 hover:bg-red-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation sm:col-span-2 lg:col-span-1"
            onClick={() => setShowIllnessForm(true)}
          >
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span className="text-sm font-medium">
              {language === 'am' ? 'በሽታ ሪፖርት' : 'Report Illness'}
            </span>
          </Button>
        </div>

        {/* Interactive Health Overview - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4">
          <InteractiveSummaryCard
            title="Vaccinations"
            titleAm="ክትባቶች"
            value={healthStats.totalVaccinations}
            icon={<Syringe className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="green"
            onClick={() => handleDetailViewClick('vaccinations')}
          />
          
          <InteractiveSummaryCard
            title="Scheduled"
            titleAm="መርሐ ግብር"
            value={healthStats.scheduledTasks}
            icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="orange"
            onClick={() => handleDetailViewClick('scheduled')}
          />

          <InteractiveSummaryCard
            title="Healthy"
            titleAm="ጤናማ"
            value={healthStats.healthyAnimals}
            icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="emerald"
            onClick={() => handleDetailViewClick('healthy')}
          />
          
          <InteractiveSummaryCard
            title="Need Attention"
            titleAm="ትኩረት ያስፈልጋል"
            value={healthStats.needAttention}
            icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="yellow"
            onClick={() => handleDetailViewClick('attention')}
          />

          <InteractiveSummaryCard
            title="Overdue Vaccines"
            titleAm="ያለፉ ክትባቶች"
            value={healthStats.overdueVaccinations}
            icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="red"
            onClick={() => handleDetailViewClick('overdue')}
            disabled={healthStats.overdueVaccinations === 0}
          />

          <InteractiveSummaryCard
            title="Upcoming Checkups"
            titleAm="ቀሪ ምርመራዎች"
            value={healthStats.upcomingCheckups}
            icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="blue"
            onClick={() => handleDetailViewClick('checkups')}
          />
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="reminders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reminders" className="flex items-center space-x-2 transition-all duration-200">
              <Bell className="w-4 h-4" />
              <span>{language === 'am' ? 'አስታወሾች' : 'Reminders'}</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2 transition-all duration-200">
              <TrendingUp className="w-4 h-4" />
              <span>{language === 'am' ? 'ታሪክ' : 'History'}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="reminders" className="mt-6">
            <HealthReminderSystem language={language} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            {/* Recent Health Records */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                {language === 'am' ? 'የቅርብ ጊዜ መዝገቦች' : 'Recent Health Records'}
              </h3>
              
              {/* Mock recent records */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Syringe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {language === 'am' ? 'ክትባት - አበባ, ገብሬ' : 'Vaccination - Abeba, Gebre'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'am' ? '2 ቀናት በፊት' : '2 days ago'}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs hover:bg-blue-50">
                    {language === 'am' ? 'ዝርዝር' : 'Details'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {language === 'am' ? 'በሽታ ሪፖርት - ሞላ' : 'Illness Report - Mola'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'am' ? '1 ሳምንት በፊት' : '1 week ago'}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs hover:bg-red-50">
                    {language === 'am' ? 'ዝርዝር' : 'Details'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />

      {/* Forms */}
      {showVaccinationForm && (
        <VaccinationForm 
          language={language} 
          mode={vaccinationMode}
          onClose={() => setShowVaccinationForm(false)} 
        />
      )}
      
      {showIllnessForm && (
        <IllnessReportForm 
          language={language} 
          onClose={() => setShowIllnessForm(false)} 
        />
      )}
    </div>
  );
};

export default Health;
