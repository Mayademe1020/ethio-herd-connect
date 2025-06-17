
import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Syringe, FileText, Calendar, AlertTriangle } from 'lucide-react';

const Health = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {language === 'am' ? 'የጤንነት አስተዳደር' : 'Health Management'}
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
          <Button className="h-24 flex flex-col space-y-2 bg-blue-600 hover:bg-blue-700">
            <Syringe className="w-8 h-8" />
            <span className="text-lg font-medium">
              {language === 'am' ? 'ክትባት ይስጡ' : 'Bulk Vaccination'}
            </span>
          </Button>
          
          <Button variant="outline" className="h-24 flex flex-col space-y-2 border-red-200 hover:bg-red-50">
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
                <p className="text-2xl font-bold text-gray-800">0</p>
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
                <p className="text-2xl font-bold text-gray-800">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'am' ? 'አስቸኳይ ስራዎች' : 'Upcoming Tasks'}
          </h3>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{language === 'am' ? 'የታቀዱ ስራዎች የሉም' : 'No scheduled tasks'}</p>
          </div>
        </div>

        {/* Recent Health Records */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'am' ? 'የቅርብ ጊዜ መዝገቦች' : 'Recent Health Records'}
          </h3>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{language === 'am' ? 'የጤንነት መዝገቦች የሉም' : 'No health records yet'}</p>
          </div>
        </div>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Health;
