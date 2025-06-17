
import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { User, Settings, Phone, MapPin, Calendar, Award } from 'lucide-react';

const Profile = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">
                {language === 'am' ? 'የገበሬ ስም' : 'Farmer Name'}
              </h2>
              <p className="text-gray-600">
                {language === 'am' ? 'ከብት እና ዶሮ አርቢ' : 'Cattle & Poultry Farmer'}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'am' ? 'የመገናኛ መረጃ' : 'Contact Information'}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">+251 912 345 678</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">
                {language === 'am' ? 'አዲስ አበባ፣ ኢትዮጵያ' : 'Addis Ababa, Ethiopia'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">
                {language === 'am' ? 'ወደ እዚህ የተቀላቀለው ዛሬ' : 'Joined today'}
              </span>
            </div>
          </div>
        </div>

        {/* Farm Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'am' ? 'የእርሻ ስታትስቲክስ' : 'Farm Statistics'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'ጠቅላላ እንስሳት' : 'Total Animals'}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'ክትባቶች' : 'Vaccinations'}
              </p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">0</div>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'ሽያጮች' : 'Sales'}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'ዓመት' : 'Years'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'am' ? 'ቅንብሮች' : 'Quick Settings'}
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <User className="w-4 h-4 mr-2" />
              {language === 'am' ? 'መለያ ቀይር' : 'Edit Profile'}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              {language === 'am' ? 'ቅንብሮች' : 'App Settings'}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Award className="w-4 h-4 mr-2" />
              {language === 'am' ? 'እርዳታ እና ድጋፍ' : 'Help & Support'}
            </Button>
          </div>
        </div>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Profile;
