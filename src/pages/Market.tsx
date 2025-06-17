
import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Plus, Search, MapPin, Phone } from 'lucide-react';

const Market = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {language === 'am' ? 'የእንስሳት ገበያ' : 'Livestock Market'}
          </h1>
          <p className="text-gray-600">
            {language === 'am' 
              ? 'እንስሳትዎን ይሽጡ ወይም ይግዙ'
              : 'Buy or sell your livestock'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button className="h-24 flex flex-col space-y-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-8 h-8" />
            <span className="text-lg font-medium">
              {language === 'am' ? 'ለሽያጭ ያስቀምጡ' : 'List for Sale'}
            </span>
          </Button>
          
          <Button variant="outline" className="h-24 flex flex-col space-y-2 border-emerald-200 hover:bg-emerald-50">
            <Search className="w-8 h-8" />
            <span className="text-lg font-medium">
              {language === 'am' ? 'እንስሳት ይፈልጉ' : 'Browse Animals'}
            </span>
          </Button>
        </div>

        {/* Market Categories */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {language === 'am' ? 'ገበያ ምድቦች' : 'Market Categories'}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
              <div className="text-center">
                <div className="text-4xl mb-2">🐄</div>
                <h3 className="font-semibold text-gray-800">
                  {language === 'am' ? 'ከብቶች' : 'Cattle'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">0 {language === 'am' ? 'ዝርዝር' : 'listings'}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
              <div className="text-center">
                <div className="text-4xl mb-2">🐔</div>
                <h3 className="font-semibold text-gray-800">
                  {language === 'am' ? 'ዶሮዎች' : 'Poultry'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">0 {language === 'am' ? 'ዝርዝር' : 'listings'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'am' ? 'የቅርብ ጊዜ ዝርዝሮች' : 'Recent Listings'}
          </h3>
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{language === 'am' ? 'የገበያ ዝርዝሮች የሉም' : 'No market listings yet'}</p>
          </div>
        </div>

        {/* My Listings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'am' ? 'የእኔ ዝርዝሮች' : 'My Listings'}
          </h3>
          <div className="text-center py-8 text-gray-500">
            <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{language === 'am' ? 'ለሽያጭ ያስቀመጡ እንስሳት የሉም' : 'You have no active listings'}</p>
          </div>
        </div>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Market;
