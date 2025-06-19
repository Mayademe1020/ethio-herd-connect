
import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { VaccinationForm } from '@/components/VaccinationForm';
import { IllnessReportForm } from '@/components/IllnessReportForm';
import { HealthReminderSystem } from '@/components/HealthReminderSystem';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Syringe, AlertTriangle, Calendar, Activity, TrendingUp, Bell } from 'lucide-react';

const Health = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [showIllnessForm, setShowIllnessForm] = useState(false);
  const [vaccinationMode, setVaccinationMode] = useState<'single' | 'bulk'>('bulk');

  // Mock data - in real app this would come from storage/API
  const healthStats = {
    totalVaccinations: 12,
    scheduledTasks: 3,
    healthyAnimals: 8,
    needAttention: 2
  };

  const handleVaccinationClick = (mode: 'single' | 'bulk') => {
    setVaccinationMode(mode);
    setShowVaccinationForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <Header language={language} setLanguage={setLanguage} />
      <OfflineIndicator language={language} />
      
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button 
            className="h-20 flex flex-col space-y-2 bg-blue-600 hover:bg-blue-700 touch-manipulation"
            onClick={() => handleVaccinationClick('bulk')}
          >
            <Syringe className="w-6 h-6" />
            <span className="text-sm font-medium">
              {language === 'am' ? 'ጅምላ ክትባት' : 'Bulk Vaccination'}
            </span>
          </Button>

          <Button 
            variant="outline" 
            className="h-20 flex flex-col space-y-2 border-blue-200 hover:bg-blue-50 touch-manipulation"
            onClick={() => handleVaccinationClick('single')}
          >
            <Syringe className="w-6 h-6 text-blue-500" />
            <span className="text-sm font-medium">
              {language === 'am' ? 'ነጠላ ክትባት' : 'Single Vaccination'}
            </span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex flex-col space-y-2 border-red-200 hover:bg-red-50 touch-manipulation col-span-2 md:col-span-1"
            onClick={() => setShowIllnessForm(true)}
          >
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span className="text-sm font-medium">
              {language === 'am' ? 'በሽታ ሪፖርት' : 'Report Illness'}
            </span>
          </Button>
        </div>

        {/* Health Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Syringe className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'am' ? 'ክትባቶች' : 'Vaccinations'}
                </p>
                <p className="text-2xl font-bold text-gray-800">{healthStats.totalVaccinations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'am' ? 'መርሐ ግብር' : 'Scheduled'}
                </p>
                <p className="text-2xl font-bold text-gray-800">{healthStats.scheduledTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Health Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'am' ? 'ጤናማ' : 'Healthy'}
                </p>
                <p className="text-2xl font-bold text-gray-800">{healthStats.healthyAnimals}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'am' ? 'ትኩረት ያስፈልጋል' : 'Need Attention'}
                </p>
                <p className="text-2xl font-bold text-gray-800">{healthStats.needAttention}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="reminders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reminders" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>{language === 'am' ? 'አስታወሾች' : 'Reminders'}</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
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
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
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
                  <Button size="sm" variant="ghost" className="text-xs">
                    {language === 'am' ? 'ዝርዝር' : 'Details'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
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
                  <Button size="sm" variant="ghost" className="text-xs">
                    {language === 'am' ? 'ዝርዝር' : 'Details'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation language={language} />

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
