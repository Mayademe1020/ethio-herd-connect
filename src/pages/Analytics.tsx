import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { InteractiveSummaryCard } from '@/components/InteractiveSummaryCard';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  FileText,
  PieChart,
  Activity,
  Target
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Analytics = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const translations = {
    am: {
      title: 'ትንታኔ',
      overview: 'አጠቃላይ እይታ',
      sales: 'ሽያጭ',
      growth: 'ዕድገት',
      users: 'ተጠቃሚዎች',
      reports: 'ሪፖርቶች',
      generateReport: 'ሪፖርት ይፍጠሩ',
      downloadReport: 'ሪፖርት ያውርዱ',
      totalRevenue: 'ጠቅላላ ገቢ',
      newUsers: 'አዲስ ተጠቃሚዎች',
      activeUsers: 'አሁን ያሉ ተጠቃሚዎች',
      weeklyGrowth: 'ሳምንታዊ እድገት',
      animalDistribution: 'የእንስሳት ስርጭት',
      revenueBreakdown: 'የገቢ ትንተና',
      userActivity: 'የተጠቃሚ እንቅስቃሴ',
      keyMetrics: 'ቁልፍ መለኪያዎች',
      animalHealth: 'የእንስሳት ጤና',
      marketTrends: 'የገበያ አዝማሚያዎች',
      performance: 'አፈጻጸም',
      engagement: 'ተሳትፎ',
      exportData: 'መረጃን ወደ ውጪ ላክ',
      customReports: 'ብጁ ሪፖርቶች',
      animalTypes: 'የእንስሳት ዓይነቶች',
      healthStatus: 'የጤና ሁኔታ',
      vaccinationStatus: 'የክትባት ሁኔታ',
      averageWeight: 'አማካይ ክብደት',
      milkProduction: 'የወተት ምርት',
      feedConsumption: 'የምግብ ፍጆታ',
      userDemographics: 'የተጠቃሚ ስነ-ህዝብ',
      supportTickets: 'የድጋፍ ትኬቶች',
      resolutionTime: 'የመፍትሄ ጊዜ',
      customerSatisfaction: 'የደንበኞች እርካታ',
      animalGrowth: 'የእንስሳት እድገት',
      salesPerformance: 'የሽያጭ አፈጻጸም',
      userRetention: 'የተጠቃሚ ማቆየት',
      dataExport: 'መረጃ ወደ ውጪ መላክ',
      generateCustomReport: 'ብጁ ሪፖርት ይፍጠሩ',
      downloadData: 'መረጃን ያውርዱ',
      animalAnalytics: 'የእንስሳት ትንታኔ',
      userEngagement: 'የተጠቃሚ ተሳትፎ',
      supportAnalytics: 'የድጋፍ ትንታኔ',
      growthAnalytics: 'የእድገት ትንታኔ',
      salesAnalytics: 'የሽያጭ ትንታኔ',
      userAnalytics: 'የተጠቃሚ ትንታኔ'
    },
    en: {
      title: 'Analytics',
      overview: 'Overview',
      sales: 'Sales',
      growth: 'Growth',
      users: 'Users',
      reports: 'Reports',
      generateReport: 'Generate Report',
      downloadReport: 'Download Report',
      totalRevenue: 'Total Revenue',
      newUsers: 'New Users',
      activeUsers: 'Active Users',
      weeklyGrowth: 'Weekly Growth',
      animalDistribution: 'Animal Distribution',
      revenueBreakdown: 'Revenue Breakdown',
      userActivity: 'User Activity',
      keyMetrics: 'Key Metrics',
      animalHealth: 'Animal Health',
      marketTrends: 'Market Trends',
      performance: 'Performance',
      engagement: 'Engagement',
      exportData: 'Export Data',
      customReports: 'Custom Reports',
      animalTypes: 'Animal Types',
      healthStatus: 'Health Status',
      vaccinationStatus: 'Vaccination Status',
      averageWeight: 'Average Weight',
      milkProduction: 'Milk Production',
      feedConsumption: 'Feed Consumption',
      userDemographics: 'User Demographics',
      supportTickets: 'Support Tickets',
      resolutionTime: 'Resolution Time',
      customerSatisfaction: 'Customer Satisfaction',
      animalGrowth: 'Animal Growth',
      salesPerformance: 'Sales Performance',
      userRetention: 'User Retention',
      dataExport: 'Data Export',
      generateCustomReport: 'Generate Custom Report',
      downloadData: 'Download Data',
      animalAnalytics: 'Animal Analytics',
      userEngagement: 'User Engagement',
      supportAnalytics: 'Support Analytics',
      growthAnalytics: 'Growth Analytics',
      salesAnalytics: 'Sales Analytics',
      userAnalytics: 'User Analytics'
    },
    or: {
      title: 'Analayziisii',
      overview: 'Ibsa Waliigalaa',
      sales: 'Gurgurta',
      growth: 'Guddina',
      users: 'Fayyadamtoota',
      reports: 'Gabaasawwan',
      generateReport: 'Gabaasa Uumuu',
      downloadReport: 'Gabaasa Buufadhu',
      totalRevenue: 'Galii Waliigalaa',
      newUsers: 'Fayyadamtoota Haaraa',
      activeUsers: 'Fayyadamtoota Hojjatoota',
      weeklyGrowth: 'Guddina Torbanii',
      animalDistribution: 'Qoodinsa Bineensotaa',
      revenueBreakdown: 'Cabsaa Galii',
      userActivity: 'Sochii Fayyadamtootaa',
      keyMetrics: 'Safartuuwwan Ijoo',
      animalHealth: 'Fayyaa Bineensotaa',
      marketTrends: 'Haala Gabaa',
      performance: 'Raawwii',
      engagement: 'Hirmaannaa',
      exportData: 'Daataa Al Erguu',
      customReports: 'Gabaasawwan Addaa',
      animalTypes: 'Gosa Bineensotaa',
      healthStatus: 'Haala Fayyaa',
      vaccinationStatus: 'Haala Talaallii',
      averageWeight: 'Ulfaatina Giddugaleessaa',
      milkProduction: 'Oomisha Aannanii',
      feedConsumption: 'Nyiisa Nyaataa',
      userDemographics: 'Demographics Fayyadamtootaa',
      supportTickets: 'Tikkeettiiwwan Deeggarsaa',
      resolutionTime: 'Yeroo Furmaataa',
      customerSatisfaction: 'Qananii Maamiltootaa',
      animalGrowth: 'Guddina Bineensotaa',
      salesPerformance: 'Raawwii Gurgurta',
      userRetention: 'Eeguu Fayyadamtootaa',
      dataExport: 'Daataa Al Erguu',
      generateCustomReport: 'Gabaasa Addaa Uumuu',
      downloadData: 'Daataa Buufadhu',
      animalAnalytics: 'Analayziisii Bineensotaa',
      userEngagement: 'Hirmaannaa Fayyadamtootaa',
      supportAnalytics: 'Analayziisii Deeggarsaa',
      growthAnalytics: 'Analayziisii Guddinaa',
      salesAnalytics: 'Analayziisii Gurgurta',
      userAnalytics: 'Analayziisii Fayyadamtootaa'
    },
    sw: {
      title: 'Takwimu',
      overview: 'Muhtasari',
      sales: 'Mauzo',
      growth: 'Ukuaji',
      users: 'Watumiaji',
      reports: 'Ripoti',
      generateReport: 'Tengeneza Ripoti',
      downloadReport: 'Pakua Ripoti',
      totalRevenue: 'Jumla ya Mapato',
      newUsers: 'Watumiaji Wapya',
      activeUsers: 'Watumiaji Amilifu',
      weeklyGrowth: 'Ukuaji wa Kila Wiki',
      animalDistribution: 'Usambazaji wa Wanyama',
      revenueBreakdown: 'Mgawanyo wa Mapato',
      userActivity: 'Shughuli za Watumiaji',
      keyMetrics: 'Vipimo Muhimu',
      animalHealth: 'Afya ya Wanyama',
      marketTrends: 'Mielekeo ya Soko',
      performance: 'Utendaji',
      engagement: 'Ushirikiano',
      exportData: 'Hamisha Data',
      customReports: 'Ripoti Maalum',
      animalTypes: 'Aina za Wanyama',
      healthStatus: 'Hali ya Afya',
      vaccinationStatus: 'Hali ya Chanjo',
      averageWeight: 'Uzito wa Wastani',
      milkProduction: 'Uzalishaji wa Maziwa',
      feedConsumption: 'Matumizi ya Chakula',
      userDemographics: 'Demografia ya Watumiaji',
      supportTickets: 'Tiketi za Usaidizi',
      resolutionTime: 'Muda wa Utatuzi',
      customerSatisfaction: 'Kuridhika kwa Wateja',
      animalGrowth: 'Ukuaji wa Wanyama',
      salesPerformance: 'Utendaji wa Mauzo',
      userRetention: 'Uhifadhi wa Watumiaji',
      dataExport: 'Hamisha Data',
      generateCustomReport: 'Tengeneza Ripoti Maalum',
      downloadData: 'Pakua Data',
      animalAnalytics: 'Takwimu za Wanyama',
      userEngagement: 'Ushirikiano wa Watumiaji',
      supportAnalytics: 'Takwimu za Usaidizi',
      growthAnalytics: 'Takwimu za Ukuaji',
      salesAnalytics: 'Takwimu za Mauzo',
      userAnalytics: 'Takwimu za Watumiaji'
    }
  };

  const t = translations[language];

  // Mock analytics data
  const analyticsData = {
    totalRevenue: 54200,
    newUsers: 450,
    activeUsers: 2350,
    weeklyGrowth: 7.5,
    animalDistribution: {
      cattle: 120,
      goats: 85,
      sheep: 60
    },
    revenueBreakdown: {
      milk: 0.6,
      meat: 0.3,
      other: 0.1
    },
    userActivity: [
      { date: '2024-01-01', activity: 150 },
      { date: '2024-01-08', activity: 220 },
      { date: '2024-01-15', activity: 180 },
      { date: '2024-01-22', activity: 250 },
      { date: '2024-01-29', activity: 200 }
    ],
    keyMetrics: {
      animalHealth: 0.95,
      marketTrends: 1.10,
      performance: 0.85,
      engagement: 0.78
    },
    animalHealth: {
      healthy: 0.85,
      sick: 0.10,
      needsAttention: 0.05
    },
    marketTrends: {
      demand: 1.2,
      supply: 0.9
    },
    performance: {
      sales: 1.1,
      growth: 0.8
    },
    engagement: {
      activeUsers: 0.75,
      retentionRate: 0.6
    },
    animalTypes: {
      cattle: 0.4,
      goats: 0.3,
      sheep: 0.3
    },
    healthStatus: {
      healthy: 0.8,
      sick: 0.15,
      needsAttention: 0.05
    },
    vaccinationStatus: {
      vaccinated: 0.9,
      notVaccinated: 0.1
    },
    averageWeight: {
      cattle: 500,
      goats: 75,
      sheep: 60
    },
    milkProduction: {
      dailyAverage: 15,
      monthlyTotal: 450
    },
    feedConsumption: {
      dailyAverage: 5,
      monthlyTotal: 150
    },
    userDemographics: {
      male: 0.6,
      female: 0.4
    },
    supportTickets: {
      open: 15,
      resolved: 85
    },
    resolutionTime: {
      average: 24
    },
    customerSatisfaction: {
      satisfied: 0.9,
      neutral: 0.05,
      dissatisfied: 0.05
    },
    animalGrowth: {
      average: 0.15
    },
    salesPerformance: {
      growth: 0.2
    },
    userRetention: {
      rate: 0.7
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />

      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Page Title */}
        <div className="text-center px-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            📊 {t.title}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
            {language === 'am'
              ? 'የእርሻዎን አፈጻጸም ይተንትኑ እና ይከታተሉ።'
              : language === 'or'
                ? 'Raawwii qonna keessanii xiinxalaa fi hordofaa.'
                : language === 'sw'
                  ? 'Changanua na ufuatilie utendaji wa shamba lako.'
                  : 'Analyze and track your farm performance.'}
          </p>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border rounded-lg shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              {t.overview}
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              {t.sales}
            </TabsTrigger>
            <TabsTrigger value="growth" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              {t.growth}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              {t.users}
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              {t.reports}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              <InteractiveSummaryCard
                title={t.totalRevenue}
                titleAm="ጠቅላላ ገቢ"
                titleOr="Galii Waliigalaa"
                titleSw="Jumla ya Mapato"
                value={`$${analyticsData.totalRevenue}`}
                icon={<DollarSign className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
                color="blue"
                language={language}
              />
              <InteractiveSummaryCard
                title={t.newUsers}
                titleAm="አዲስ ተጠቃሚዎች"
                titleOr="Fayyadamtoota Haaraa"
                titleSw="Watumiaji Wapya"
                value={analyticsData.newUsers}
                icon={<Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
                color="green"
                language={language}
              />
              <InteractiveSummaryCard
                title={t.activeUsers}
                titleAm="አሁን ያሉ ተጠቃሚዎች"
                titleOr="Fayyadamtoota Hojjatoota"
                titleSw="Watumiaji Amilifu"
                value={analyticsData.activeUsers}
                icon={<Activity className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
                color="purple"
                language={language}
              />
              <InteractiveSummaryCard
                title={t.weeklyGrowth}
                titleAm="ሳምንታዊ እድገት"
                titleOr="Guddina Torbanii"
                titleSw="Ukuaji wa Kila Wiki"
                value={`${analyticsData.weeklyGrowth}%`}
                icon={<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
                color="orange"
                language={language}
              />
            </div>
          </TabsContent>

          {/* Sales Tab Content */}
          <TabsContent value="sales" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t.revenueBreakdown}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span>{language === 'am' ? 'ወተት' : language === 'or' ? 'Aannan' : language === 'sw' ? 'Maziwa' : 'Milk'}</span>
                      <span>{analyticsData.revenueBreakdown.milk * 100}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{language === 'am' ? 'ስጋ' : language === 'or' ? 'Foon' : language === 'sw' ? 'Nyama' : 'Meat'}</span>
                      <span>{analyticsData.revenueBreakdown.meat * 100}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{language === 'am' ? 'ሌላ' : language === 'or' ? 'Kan biraa' : language === 'sw' ? 'Nyinginezo' : 'Other'}</span>
                      <span>{analyticsData.revenueBreakdown.other * 100}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t.salesPerformance}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span>{language === 'am' ? 'እድገት' : language === 'or' ? 'Guddina' : language === 'sw' ? 'Ukuaji' : 'Growth'}</span>
                    <Badge variant="secondary">{analyticsData.salesPerformance.growth * 100}%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Growth Tab Content */}
          <TabsContent value="growth" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t.animalGrowth}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span>{language === 'am' ? 'አማካይ' : language === 'or' ? 'Giddugaleessa' : language === 'sw' ? 'Wastani' : 'Average'}</span>
                    <Badge variant="secondary">{analyticsData.animalGrowth.average * 100}%</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t.userRetention}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span>{language === 'am' ? 'ተመን' : language === 'or' ? 'Safartuu' : language === 'sw' ? 'Kiwango' : 'Rate'}</span>
                    <Badge variant="secondary">{analyticsData.userRetention.rate * 100}%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab Content */}
          <TabsContent value="users" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t.userDemographics}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span>{language === 'am' ? 'ወንድ' : language === 'or' ? 'Dhiira' : language === 'sw' ? 'Mwanaume' : 'Male'}</span>
                      <span>{analyticsData.userDemographics.male * 100}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{language === 'am' ? 'ሴት' : language === 'or' ? 'Dubara' : language === 'sw' ? 'Mwanamke' : 'Female'}</span>
                      <span>{analyticsData.userDemographics.female * 100}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t.userEngagement}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span>{language === 'am' ? 'አሁን ያሉ ተጠቃሚዎች' : language === 'or' ? 'Fayyadamtoota Hojjatoota' : language === 'sw' ? 'Watumiaji Amilifu' : 'Active Users'}</span>
                    <Badge variant="secondary">{analyticsData.engagement.activeUsers * 100}%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab Content */}
          <TabsContent value="reports" className="mt-4">
            <div className="flex flex-col space-y-4">
              <Button className="bg-green-500 hover:bg-green-700 text-white">
                <FileText className="w-4 h-4 mr-2" />
                {t.generateReport}
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                {t.downloadReport}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.animalHealth}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>{language === 'am' ? 'ጤናማ' : language === 'or' ? 'Fayyaa Qabeessa' : language === 'sw' ? 'Afya' : 'Healthy'}</span>
                <Badge variant="secondary">{analyticsData.animalHealth.healthy * 100}%</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t.marketTrends}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>{language === 'am' ? 'ፍላጎት' : language === 'or' ? 'Fedhii' : language === 'sw' ? 'Mahitaji' : 'Demand'}</span>
                <Badge variant="secondary">{analyticsData.marketTrends.demand * 100}%</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t.performance}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>{language === 'am' ? 'ሽያጭ' : language === 'or' ? 'Gurgurta' : language === 'sw' ? 'Mauzo' : 'Sales'}</span>
                <Badge variant="secondary">{analyticsData.performance.sales * 100}%</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t.engagement}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>{language === 'am' ? 'አሁን ያሉ ተጠቃሚዎች' : language === 'or' ? 'Fayyadamtoota Hojjatoota' : language === 'sw' ? 'Watumiaji Amilifu' : 'Active Users'}</span>
                <Badge variant="secondary">{analyticsData.engagement.activeUsers * 100}%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Analytics;
