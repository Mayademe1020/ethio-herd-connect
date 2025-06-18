
import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { BulkVaccinationForm } from '@/components/BulkVaccinationForm';
import { IllnessReportForm } from '@/components/IllnessReportForm';
import { Button } from '@/components/ui/button';
import { Syringe, FileText, Calendar, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

const Health = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [showIllnessForm, setShowIllnessForm] = useState(false);

  // Mock data - in real app this would come from storage/API
  const healthStats = {
    totalVaccinations: 12,
    scheduledTasks: 3,
    healthyAnimals: 8,
    needAttention: 2
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <Header language={language} setLanguage={setLanguage} />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {language === 'am' ? '💉 የጤንነት አስተዳደር' : '💉 Health Management'}
          </h1>
          <p className="text-gray-600">
            {language === 'am' 
              ? 'ክትባቶችን እና ህክምናዎችን ይከታተሉ'
              : 'Track vaccinations and treatments'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            className="h-24 flex flex-col space-y-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowVaccinationForm(true)}
          >
            <Syringe className="w-8 h-8" />
            <span className="text-lg font-medium">
              {language === 'am' ? 'ጅምላ ክትባት' : 'Bulk Vaccination'}
            </span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col space-y-2 border-red-200 hover:bg-red-50"
            onClick={() => setShowIllnessForm(true)}
          >
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <span className="text-lg font-medium">
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

        {/* Upcoming Reminders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            {language === 'am' ? 'የሚመጡ ስራዎች' : 'Upcoming Tasks'}
          </h3>
          
          {/* Mock upcoming tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-blue-100 rounded-lg bg-blue-50">
              <div className="flex items-center space-x-3">
                <Syringe className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-800">
                    {language === 'am' ? 'ቦራ ፍየሎች - FMD ክትባት' : 'Boran Cattle - FMD Vaccination'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'am' ? 'ነገ' : 'Tomorrow'}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                {language === 'am' ? 'ተከናውኗል' : 'Mark Done'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border border-green-100 rounded-lg bg-green-50">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-800">
                    {language === 'am' ? 'ክብደት መለካት - ሞላ' : 'Weight Check - Mola'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'am' ? 'በ 3 ቀናት ውስጥ' : 'In 3 days'}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                {language === 'am' ? 'አስታወስ' : 'Remind'}
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Health Records */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
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
      </main>

      <BottomNavigation language={language} />

      {/* Forms */}
      {showVaccinationForm && (
        <BulkVaccinationForm 
          language={language} 
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
