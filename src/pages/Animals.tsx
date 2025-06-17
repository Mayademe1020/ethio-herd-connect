
import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Plus, Camera, List } from 'lucide-react';

const Animals = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {language === 'am' ? 'የእንስሳት አስተዳደር' : 'Animal Management'}
          </h1>
          <p className="text-gray-600">
            {language === 'am' 
              ? 'የከብት እና የዶሮ መዝገብ ይያዙ'
              : 'Register and manage your cattle and poultry'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button className="h-24 flex flex-col space-y-2 bg-green-600 hover:bg-green-700">
            <Camera className="w-8 h-8" />
            <span className="text-lg font-medium">
              {language === 'am' ? 'አዲስ እንስሳ ይመዝግቡ' : 'Register New Animal'}
            </span>
          </Button>
          
          <Button variant="outline" className="h-24 flex flex-col space-y-2 border-green-200 hover:bg-green-50">
            <List className="w-8 h-8" />
            <span className="text-lg font-medium">
              {language === 'am' ? 'የእንስሳት ዝርዝር' : 'View Animals'}
            </span>
          </Button>
        </div>

        {/* Animal Categories */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {language === 'am' ? 'እንስሳት ምድቦች' : 'Animal Categories'}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
              <div className="text-center">
                <div className="text-4xl mb-2">🐄</div>
                <h3 className="font-semibold text-gray-800">
                  {language === 'am' ? 'ከብቶች' : 'Cattle'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">0 {language === 'am' ? 'ጥንድ' : 'head'}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
              <div className="text-center">
                <div className="text-4xl mb-2">🐔</div>
                <h3 className="font-semibold text-gray-800">
                  {language === 'am' ? 'ዶሮዎች' : 'Poultry'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">0 {language === 'am' ? 'ዝርያ' : 'birds'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'am' ? 'የቅርብ ጊዜ መዝገቦች' : 'Recent Registrations'}
          </h3>
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{language === 'am' ? 'ገና የተመዘገቡ እንስሳት የሉም' : 'No animals registered yet'}</p>
          </div>
        </div>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Animals;
