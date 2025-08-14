import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { 
  Droplets, 
  TrendingUp, 
  Calendar,
  Download,
  FileText,
  BarChart3,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const MilkProduction = () => {
  const { language } = useLanguage();
  const [selectedTab, setSelectedTab] = useState('overview');

  const translations = {
    am: {
      title: 'ወተት ምርት',
      subtitle: 'የወተት ምርት መረጃዎችን ይከታተሉ',
      overview: 'አጠቃላይ እይታ',
      records: 'መዝገቦች',
      analytics: 'ትንታኔ',
      downloadReport: 'ሪፖርት ያውርዱ',
      totalProduction: 'ጠቅላላ ምርት',
      dailyAverage: 'ዕለታዊ አማካይ',
      weeklyTrend: 'ሳምንታዊ አዝማሚያ',
      storageLevel: 'የማከማቻ ደረጃ',
      recentRecords: 'የቅርብ ጊዜ መዝገቦች',
      date: 'ቀን',
      quantity: 'ብዛት',
      details: 'ዝርዝሮች',
      noRecords: 'ምንም መዝገቦች የሉም',
      productionStats: 'የምርት ስታቲስቲክስ',
      milkQuality: 'የወተት ጥራት',
      feedEfficiency: 'የምግብ ውጤታማነት',
      healthImpact: 'በጤና ላይ ተጽዕኖ',
      downloadData: 'መረጃን ያውርዱ',
      generateReport: 'ሪፖርት ይፍጠሩ',
      productionHistory: 'የምርት ታሪክ',
      monthlyComparison: 'ወርሃዊ ንጽጽር',
      animalContribution: 'የእንስሳት አስተዋፅኦ',
      alerts: 'ማስጠንቀቂያዎች',
      lowProduction: 'ዝቅተኛ ምርት',
      qualityConcerns: 'የጥራት ስጋቶች',
      viewAll: 'ሁሉንም ይመልከቱ'
    },
    en: {
      title: 'Milk Production',
      subtitle: 'Track milk production data',
      overview: 'Overview',
      records: 'Records',
      analytics: 'Analytics',
      downloadReport: 'Download Report',
      totalProduction: 'Total Production',
      dailyAverage: 'Daily Average',
      weeklyTrend: 'Weekly Trend',
      storageLevel: 'Storage Level',
      recentRecords: 'Recent Records',
      date: 'Date',
      quantity: 'Quantity',
      details: 'Details',
      noRecords: 'No records available',
      productionStats: 'Production Statistics',
      milkQuality: 'Milk Quality',
      feedEfficiency: 'Feed Efficiency',
      healthImpact: 'Health Impact',
      downloadData: 'Download Data',
      generateReport: 'Generate Report',
      productionHistory: 'Production History',
      monthlyComparison: 'Monthly Comparison',
      animalContribution: 'Animal Contribution',
      alerts: 'Alerts',
      lowProduction: 'Low Production',
      qualityConcerns: 'Quality Concerns',
      viewAll: 'View All'
    },
    or: {
      title: 'Oomisha Aannanii',
      subtitle: 'Oomisha aannanii hordofaa',
      overview: 'Ibsa Waliigalaa',
      records: 'Galmeewwan',
      analytics: 'Xiinxala',
      downloadReport: 'Gabaasa Buufadhu',
      totalProduction: 'Oomisha Waliigalaa',
      dailyAverage: 'Giddugaleessa Guyyaa',
      weeklyTrend: 'Haala Torbanii',
      storageLevel: 'Sadarkaa Kuusaa',
      recentRecords: 'Galmeewwan Dhihoo',
      date: 'Guyyaa',
      quantity: 'Baay\'ina',
      details: 'Bal\'ina',
      noRecords: 'Galmeen hin jiru',
      productionStats: 'Lakkoofsa Oomishaa',
      milkQuality: 'Qulqullina Aannanii',
      feedEfficiency: 'Bu\'aa Qubaa',
      healthImpact: 'Dhiibbaa Fayyaa',
      downloadData: 'Dataa Buufadhu',
      generateReport: 'Gabaasa Uumi',
      productionHistory: 'Seenaa Oomishaa',
      monthlyComparison: 'Walbira Qabuu Ji\'ootaa',
      animalContribution: 'Gumaacha Bineensotaa',
      alerts: 'Akeekkachiisa',
      lowProduction: 'Oomisha Gad Aanaa',
      qualityConcerns: 'Yaaddoo Qulqullinaa',
      viewAll: 'Hunda Agarsiisi'
    },
    sw: {
      title: 'Uzalishaji wa Maziwa',
      subtitle: 'Fuatilia data ya uzalishaji wa maziwa',
      overview: 'Muhtasari',
      records: 'Rekodi',
      analytics: 'Uchambuzi',
      downloadReport: 'Pakua Ripoti',
      totalProduction: 'Jumla ya Uzalishaji',
      dailyAverage: 'Wastani wa Siku',
      weeklyTrend: 'Mwenendo wa Wiki',
      storageLevel: 'Kiwango cha Hifadhi',
      recentRecords: 'Rekodi za Hivi Karibuni',
      date: 'Tarehe',
      quantity: 'Kiasi',
      details: 'Maelezo',
      noRecords: 'Hakuna rekodi zinazopatikana',
      productionStats: 'Takwimu za Uzalishaji',
      milkQuality: 'Ubora wa Maziwa',
      feedEfficiency: 'Ufanisi wa Chakula',
      healthImpact: 'Athari za Kiafya',
      downloadData: 'Pakua Data',
      generateReport: 'Tengeneza Ripoti',
      productionHistory: 'Historia ya Uzalishaji',
      monthlyComparison: 'Ulinganisho wa Kila Mwezi',
      animalContribution: 'Mchango wa Wanyama',
      alerts: 'Tahadhari',
      lowProduction: 'Uzalishaji Mdogo',
      qualityConcerns: 'Masuala ya Ubora',
      viewAll: 'Onyesha Zote'
    }
  };

  const t = translations[language];

  // Mock data for demonstration
  const productionData = {
    totalProduction: 15000, // liters
    dailyAverage: 500, // liters
    weeklyTrend: 5, // percentage increase
    storageLevel: 75, // percentage full
    recentRecords: [
      { date: '2024-06-05', quantity: 520, details: 'Morning milking' },
      { date: '2024-06-04', quantity: 480, details: 'Evening milking' },
      { date: '2024-06-03', quantity: 550, details: 'Morning milking' }
    ],
    alerts: [
      { type: 'lowProduction', message: t.lowProduction },
      { type: 'qualityConcerns', message: t.qualityConcerns }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Page Title */}
        <div className="text-center px-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            <Droplets className="inline-block w-5 h-5 mr-2 align-middle" />
            {t.title}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
            {t.subtitle}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="records">{t.records}</TabsTrigger>
            <TabsTrigger value="analytics">{t.analytics}</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{t.totalProduction}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{productionData.totalProduction} L</div>
                  <div className="text-xs text-gray-500">{t.dailyAverage}: {productionData.dailyAverage} L</div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{t.weeklyTrend}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{productionData.weeklyTrend}%</div>
                  <div className="text-xs text-gray-500">
                    <TrendingUp className="inline-block w-4 h-4 mr-1 align-middle text-green-500" />
                    {t.weeklyTrend}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{t.storageLevel}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{productionData.storageLevel}%</div>
                  <div className="text-xs text-gray-500">
                    {t.storageLevel}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Records */}
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">{t.recentRecords}</CardTitle>
              </CardHeader>
              <CardContent>
                {productionData.recentRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left">
                          <th className="py-2 px-3 text-xs font-semibold text-gray-600">{t.date}</th>
                          <th className="py-2 px-3 text-xs font-semibold text-gray-600">{t.quantity}</th>
                          <th className="py-2 px-3 text-xs font-semibold text-gray-600">{t.details}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productionData.recentRecords.map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-2 px-3 text-xs">{record.date}</td>
                            <td className="py-2 px-3 text-xs">{record.quantity} L</td>
                            <td className="py-2 px-3 text-xs">{record.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">{t.noRecords}</div>
                )}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">{t.alerts}</CardTitle>
              </CardHeader>
              <CardContent>
                {productionData.alerts.length > 0 ? (
                  <ul className="list-none space-y-2">
                    {productionData.alerts.map((alert, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-700">{alert.message}</span>
                      </li>
                    ))}
                    <li>
                      <Button variant="link" className="text-sm">{t.viewAll}</Button>
                    </li>
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">No alerts at this time.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">{t.recentRecords}</CardTitle>
              </CardHeader>
              <CardContent>
                {productionData.recentRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left">
                          <th className="py-2 px-3 text-xs font-semibold text-gray-600">{t.date}</th>
                          <th className="py-2 px-3 text-xs font-semibold text-gray-600">{t.quantity}</th>
                          <th className="py-2 px-3 text-xs font-semibold text-gray-600">{t.details}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productionData.recentRecords.map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-2 px-3 text-xs">{record.date}</td>
                            <td className="py-2 px-3 text-xs">{record.quantity} L</td>
                            <td className="py-2 px-3 text-xs">{record.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">{t.noRecords}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{t.productionStats}</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                  <p className="text-sm text-gray-500">{t.productionHistory}</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{t.milkQuality}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Activity className="w-6 h-6 text-green-500" />
                  <p className="text-sm text-gray-500">{t.monthlyComparison}</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{t.feedEfficiency}</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                  <p className="text-sm text-gray-500">{t.animalContribution}</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{t.healthImpact}</CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <p className="text-sm text-gray-500">{t.alerts}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t.downloadData}
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            {t.generateReport}
          </Button>
        </div>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default MilkProduction;
