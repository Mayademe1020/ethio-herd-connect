
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Sun, Cloud } from 'lucide-react';
import { Language } from '@/types';

interface EthiopianDashboardWelcomeProps {
  language: Language;
}

export const EthiopianDashboardWelcome = ({ language }: EthiopianDashboardWelcomeProps) => {
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  
  const getGreeting = () => {
    if (currentHour < 12) {
      return {
        am: 'እንደምን አደሩ',
        en: 'Good Morning',
        or: 'Akkam bultan',
        sw: 'Habari za asubuhi'
      };
    } else if (currentHour < 17) {
      return {
        am: 'እንደምን ዋላችሁ',
        en: 'Good Afternoon', 
        or: 'Akkam guyyaa',
        sw: 'Habari za mchana'
      };
    } else {
      return {
        am: 'እንደምን አመሹ',
        en: 'Good Evening',
        or: 'Akkam galgala',
        sw: 'Habari za jioni'
      };
    }
  };

  const getSeasonalMessage = () => {
    const month = currentDate.getMonth();
    // Ethiopian seasons context
    if (month >= 5 && month <= 8) { // Jun-Sep (Kiremt - Rainy season)
      return {
        am: 'የክረምት ወቅት - የእንስሳት ጤንነት ላይ ልዩ ትኩረት ይስጡ',
        en: 'Rainy Season - Pay special attention to animal health',
        or: 'Yeroo Roobaa - Fayyaa horii irratti xiyyeeffannaa addaa kennuu',
        sw: 'Msimu wa mvua - Zingatia hasa afya ya wanyama'
      };
    } else if (month >= 9 && month <= 11) { // Oct-Dec (Bega - Dry season)
      return {
        am: 'የደረቅ ወቅት - የመኖ እና የውሃ አቅርቦት አስቡ',
        en: 'Dry Season - Consider feed and water supply',
        or: 'Yeroo Goggogaa - Nyaataa fi bishaan yaaduu',
        sw: 'Msimu mkavu - Zingatia chakula na maji'
      };
    } else { // Belg season or other
      return {
        am: 'የዝናብ ወቅት - የተመጣጠነ መኖ ያቅርቡ',
        en: 'Growing Season - Provide balanced nutrition',
        or: 'Yeroo Guddina - Soorata madaalawaa kennuu',
        sw: 'Msimu wa ukuaji - Toa lishe bora'
      };
    }
  };

  const greeting = getGreeting();
  const seasonalMessage = getSeasonalMessage();

  return (
    <Card className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white border-0 shadow-xl overflow-hidden relative">
      {/* Ethiopian Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-400 rounded-full transform -translate-x-12 translate-y-12"></div>
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Greeting Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🇪🇹</div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {greeting[language]}!
                </h1>
                <p className="text-green-100 text-sm sm:text-base">
                  {language === 'am' ? 'MyLivestock ዳሽቦርድ' : 
                   language === 'or' ? 'Daashboordii MyLivestock' :
                   language === 'sw' ? 'Dashibodi ya MyLivestock' :
                   'MyLivestock Dashboard'}
                </p>
              </div>
            </div>
            
            <p className="text-green-100 text-sm max-w-md leading-relaxed">
              {language === 'am' 
                ? 'የእርስዎ እንስሳዎች እና ግብርና አስተዳደር ማእከል። ዛሬ የሚያስፈልጉ ተግባራት እና መረጃዎች እዚህ ይገኛሉ።'
                : language === 'or'
                ? 'Bakka bulchiinsa horii fi qonnaa keessanii. Hojiiwwan fi odeeffannoo har\'aa barbaachisan asitti argamu.'
                : language === 'sw'
                ? 'Kituo chako cha usimamizi wa mifugo na kilimo. Kazi na habari muhimu za leo zinapatikana hapa.'
                : 'Your comprehensive livestock and farm management center. Today\'s essential tasks and information are available here.'
              }
            </p>
          </div>

          {/* Info Cards */}
          <div className="flex flex-col sm:flex-row lg:flex-col space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-3">
            {/* Date Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 min-w-fit">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-green-200" />
                <div className="text-sm">
                  <div className="font-semibold">
                    {currentDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-green-200 text-xs">
                    {language === 'am' ? 'ዛሬ' : 
                     language === 'or' ? 'Har\'aa' :
                     language === 'sw' ? 'Leo' :
                     'Today'}
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-yellow-300" />
                <div className="text-sm">
                  <div className="font-semibold">25°C</div>
                  <div className="text-green-200 text-xs">
                    {language === 'am' ? 'አዲስ አበባ' : 
                     language === 'or' ? 'Finfinnee' :
                     language === 'sw' ? 'Addis Ababa' :
                     'Addis Ababa'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seasonal Message */}
        <div className="mt-4 pt-4 border-t border-green-400/30">
          <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30">
            <MapPin className="w-3 h-3 mr-1" />
            {seasonalMessage[language]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
