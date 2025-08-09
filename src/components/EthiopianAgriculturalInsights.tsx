
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Droplets, Thermometer, Sun, Cloud, AlertTriangle } from 'lucide-react';
import { Language } from '@/types';

interface EthiopianAgriculturalInsightsProps {
  language: Language;
}

export const EthiopianAgriculturalInsights = ({ language }: EthiopianAgriculturalInsightsProps) => {
  const translations = {
    am: {
      title: 'የኢትዮጵያ የእርሻ ሁኔታዎች',
      seasonalTrends: 'የወቅት ዝንባሌዎች',
      marketPrices: 'የገበያ ዋጋዎች',
      weatherPatterns: 'የአየር ንብረት ሁኔታ',
      diseaseOutbreaks: 'የበሽታ መስፋፋት',
      feedAvailability: 'የመኖ አቅርቦት',
      rainySeason: 'ዝናብ ወቅት',
      dryseason: 'ደረቅ ወቅት',
      harvest: 'መከር',
      planting: 'መዝራት',
      temperature: 'ሙቀት',
      rainfall: 'ዝናብ',
      humidity: 'እርጥበት',
      highRisk: 'ከፍተኛ ስጋት',
      mediumRisk: 'መካከለኛ ስጋት',
      lowRisk: 'ዝቅተኛ ስጋት',
      cattle: 'ከብት',
      goats: 'ፍየሎች',
      sheep: 'በጎች',
      poultry: 'ዶሮ',
      priceIncrease: 'የዋጋ ጭማሪ',
      priceDecrease: 'የዋጋ ቅናሽ',
      currentWeek: 'በዚህ ሳምንት',
      upcoming: 'የሚመጣ',
      critical: 'ወሳኝ',
      normal: 'መደበኛ'
    },
    en: {
      title: 'Ethiopian Agricultural Insights',
      seasonalTrends: 'Seasonal Trends',
      marketPrices: 'Market Prices',
      weatherPatterns: 'Weather Patterns',
      diseaseOutbreaks: 'Disease Outbreaks',
      feedAvailability: 'Feed Availability',
      rainyeason: 'Rainy Season',
      dryseason: 'Dry Season',
      harvest: 'Harvest',
      planting: 'Planting',
      temperature: 'Temperature',
      rainfall: 'Rainfall',
      humidity: 'Humidity',
      highRisk: 'High Risk',
      mediumRisk: 'Medium Risk',
      lowRisk: 'Low Risk',
      cattle: 'Cattle',
      goats: 'Goats',
      sheep: 'Sheep',
      poultry: 'Poultry',
      priceIncrease: 'Price Increase',
      priceDecrease: 'Price Decrease',
      currentWeek: 'This Week',
      upcoming: 'Upcoming',
      critical: 'Critical',
      normal: 'Normal'
    },
    or: {
      title: 'Hubannoo Qonnaa Itoophiyaa',
      seasonalTrends: 'Adeemsa Waqtii',
      marketPrices: 'Gatii Gabaa',
      weatherPatterns: 'Haala Qilleensaa',
      diseaseOutbreaks: 'Babal\'achuu Dhukkubaa',
      feedAvailability: 'Argama Nyaataa',
      rainyseason: 'Waqti Roobaa',
      dryseason: 'Waqti Goggogaa',
      harvest: 'Galana',
      planting: 'Facaasa',
      temperature: 'Ho\'aa',
      rainfall: 'Rooba',
      humidity: 'Jidhina',
      highRisk: 'Balaa Guddaa',
      mediumRisk: 'Balaa Giddu Galeessaa',
      lowRisk: 'Balaa Xinnaaa',
      cattle: 'Loon',
      goats: 'Re\'ee',
      sheep: 'Hoolaa',
      poultry: 'Lukkuu',
      priceIncrease: 'Ol Ka\'uu Gatii',
      priceDecrease: 'Gadi Bu\'uu Gatii',
      currentWeek: 'Torban Kana',
      upcoming: 'Dhufuuf Jiru',
      critical: 'Murteessaa',
      normal: 'Idilee'
    },
    sw: {
      title: 'Maarifa ya Kilimo ya Ethiopia',
      seasonalTrends: 'Mienendo ya Misimu',
      marketPrices: 'Bei za Soko',
      weatherPatterns: 'Mifumo ya Hali ya Hewa',
      diseaseOutbreaks: 'Milipuko ya Magonjwa',
      feedAvailability: 'Upatikanaji wa Chakula',
      rainyseason: 'Msimu wa Mvua',
      dryseason: 'Msimu Mkavu',
      harvest: 'Mavuno',
      planting: 'Kupanda',
      temperature: 'Joto',
      rainfall: 'Mvua',
      humidity: 'Unyevu',
      highRisk: 'Hatari Kubwa',
      mediumRisk: 'Hatari ya Kati',
      lowRisk: 'Hatari Ndogo',
      cattle: 'Ng\'ombe',
      goats: 'Mbuzi',
      sheep: 'Kondoo',
      poultry: 'Kuku',
      priceIncrease: 'Ongezeko la Bei',
      priceDecrease: 'Kupungua kwa Bei',
      currentWeek: 'Wiki Hii',
      upcoming: 'Inayokuja',
      critical: 'Muhimu',
      normal: 'Kawaida'
    }
  };

  const t = translations[language];

  // Ethiopian seasonal livestock data
  const seasonalData = [
    { month: 'Jan', cattle: 850, goats: 320, sheep: 280, rainfall: 15, temperature: 18 },
    { month: 'Feb', cattle: 870, goats: 330, sheep: 290, rainfall: 25, temperature: 20 },
    { month: 'Mar', cattle: 890, goats: 340, sheep: 300, rainfall: 45, temperature: 22 },
    { month: 'Apr', cattle: 920, goats: 350, sheep: 310, rainfall: 75, temperature: 23 },
    { month: 'May', cattle: 950, goats: 360, sheep: 320, rainfall: 85, temperature: 24 },
    { month: 'Jun', cattle: 980, goats: 370, sheep: 330, rainfall: 120, temperature: 22 },
    { month: 'Jul', cattle: 1000, goats: 380, sheep: 340, rainfall: 180, temperature: 20 },
    { month: 'Aug', cattle: 1020, goats: 390, sheep: 350, rainfall: 200, temperature: 19 },
    { month: 'Sep', cattle: 990, goats: 385, sheep: 345, rainfall: 150, temperature: 20 },
    { month: 'Oct', cattle: 960, goats: 375, sheep: 335, rainfall: 80, temperature: 21 },
    { month: 'Nov', cattle: 920, goats: 360, sheep: 320, rainfall: 30, temperature: 19 },
    { month: 'Dec', cattle: 880, goats: 340, sheep: 300, rainfall: 20, temperature: 17 }
  ];

  // Disease risk data by region and season
  const diseaseRiskData = [
    { disease: 'FMD', risk: 75, region: 'Oromia', color: '#ef4444' },
    { disease: 'PPR', risk: 45, region: 'Amhara', color: '#f59e0b' },
    { disease: 'Anthrax', risk: 25, region: 'SNNP', color: '#10b981' },
    { disease: 'Blackleg', risk: 60, region: 'Tigray', color: '#f59e0b' }
  ];

  // Feed availability throughout the year
  const feedAvailabilityData = [
    { month: 'Jan', hay: 40, pasture: 20, concentrate: 90, total: 50 },
    { month: 'Feb', hay: 35, pasture: 25, concentrate: 90, total: 50 },
    { month: 'Mar', hay: 30, pasture: 35, concentrate: 85, total: 50 },
    { month: 'Apr', hay: 25, pasture: 50, concentrate: 85, total: 53 },
    { month: 'May', hay: 20, pasture: 70, concentrate: 80, total: 57 },
    { month: 'Jun', hay: 15, pasture: 85, concentrate: 80, total: 60 },
    { month: 'Jul', hay: 10, pasture: 95, concentrate: 75, total: 60 },
    { month: 'Aug', hay: 15, pasture: 90, concentrate: 75, total: 60 },
    { month: 'Sep', hay: 25, pasture: 85, concentrate: 80, total: 63 },
    { month: 'Oct', hay: 35, pasture: 70, concentrate: 85, total: 63 },
    { month: 'Nov', hay: 40, pasture: 50, concentrate: 90, total: 60 },
    { month: 'Dec', hay: 45, pasture: 30, concentrate: 90, total: 55 }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-ethiopia-green-800 mb-2">
          🌾 {t.title}
        </h2>
        <p className="text-ethiopia-green-600 text-sm">
          {language === 'am' 
            ? 'ለኢትዮጵያ አርሶ አደሮች ልዩ የተዘጋጁ የእርሻ ምክሮች እና መረጃዎች'
            : language === 'or'
            ? 'Qajeelfama fi odeeffannoo qonnaa addaa qonnaa bultoota Itoophiyaatiif qophaa\'e'
            : language === 'sw'
            ? 'Miongozo na taarifa maalum za kilimo kwa wakulima wa Ethiopia'
            : 'Specialized agricultural insights and guidance for Ethiopian farmers'
          }
        </p>
      </div>

      {/* Current Alerts */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{language === 'am' ? 'አሁኑኑ ማስጠንቀቂያዎች' : 'Current Alerts'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="font-medium text-red-800">
                  {language === 'am' ? 'የእግር እና አፍ በሽታ ስጋት' : 'FMD Risk Alert'}
                </p>
                <p className="text-sm text-red-600">
                  {language === 'am' ? 'በኦሮሚያ ክልል' : 'Oromia Region'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-orange-200">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div>
                <p className="font-medium text-orange-800">
                  {language === 'am' ? 'የመኖ እጥረት' : 'Feed Shortage'}
                </p>
                <p className="text-sm text-orange-600">
                  {language === 'am' ? 'በደረቅ ወቅት' : 'Dry Season'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-ethiopia-green-800 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>{t.marketPrices} (ETB/kg)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seasonalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #10b981',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cattle" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name={t.cattle}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="goats" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name={t.goats}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sheep" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name={t.sheep}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-ethiopia-green-800 flex items-center space-x-2">
              <Cloud className="w-5 h-5" />
              <span>{t.weatherPatterns}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={seasonalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#eff6ff',
                      border: '1px solid #3b82f6',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rainfall" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#bfdbfe"
                    name={`${t.rainfall} (mm)`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stackId="2"
                    stroke="#f59e0b" 
                    fill="#fed7aa"
                    name={`${t.temperature} (°C)`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disease Risk and Feed Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-ethiopia-green-800 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{t.diseaseOutbreaks}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diseaseRiskData.map((disease, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: disease.color }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-800">{disease.disease}</p>
                      <p className="text-sm text-gray-600">{disease.region}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: disease.color }}>
                      {disease.risk}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {disease.risk > 60 ? t.highRisk : disease.risk > 30 ? t.mediumRisk : t.lowRisk}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-ethiopia-green-800 flex items-center space-x-2">
              <Sun className="w-5 h-5" />
              <span>{t.feedAvailability}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedAvailabilityData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fefce8',
                      border: '1px solid #f59e0b',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="hay" stackId="a" fill="#fbbf24" name="Hay" />
                  <Bar dataKey="pasture" stackId="a" fill="#10b981" name="Pasture" />
                  <Bar dataKey="concentrate" stackId="a" fill="#8b5cf6" name="Concentrate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ethiopian Specific Recommendations */}
      <Card className="border-ethiopia-gold-200 bg-gradient-to-r from-ethiopia-gold-50 to-ethiopia-green-50">
        <CardHeader>
          <CardTitle className="text-ethiopia-green-800 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>
              {language === 'am' ? 'የወቅቱ ምክሮች' : 
               language === 'or' ? 'Yaada Waqtii' :
               language === 'sw' ? 'Mapendekezo ya Msimu' :
               'Seasonal Recommendations'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-ethiopia-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-ethiopia-green-800">
                  {language === 'am' ? 'የዝናብ ወቅት' : 'Rainy Season'}
                </h4>
              </div>
              <p className="text-sm text-gray-700">
                {language === 'am' 
                  ? 'የክትባት ፕሮግራሙን አጠናክሩ። የመኖ ተክሎችን ይዝሩ።'
                  : 'Strengthen vaccination programs. Plant fodder crops.'
                }
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-ethiopia-gold-200">
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="w-4 h-4 text-orange-600" />
                <h4 className="font-semibold text-ethiopia-green-800">
                  {language === 'am' ? 'የደረቅ ወቅት' : 'Dry Season'}
                </h4>
              </div>
              <p className="text-sm text-gray-700">
                {language === 'am' 
                  ? 'የውሃ ምንጮችን ያስጠብቁ። ተጨማሪ መኖ ያዘጋጁ።'
                  : 'Conserve water sources. Prepare supplementary feed.'
                }
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-ethiopia-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h4 className="font-semibold text-ethiopia-green-800">
                  {language === 'am' ? 'የገበያ ጊዜ' : 'Market Timing'}
                </h4>
              </div>
              <p className="text-sm text-gray-700">
                {language === 'am' 
                  ? 'በአስቸጋሪ ጊዜ ለመሸጥ ተዘጋጁ።'
                  : 'Time sales for peak demand periods.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
