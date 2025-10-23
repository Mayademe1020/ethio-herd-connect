import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { InteractiveSummaryCard } from '@/components/InteractiveSummaryCard';
import { useAnalytics } from '@/hooks/useAnalytics';
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
  Target,
  Heart,
  Droplets
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDateDisplay } from '@/hooks/useDateDisplay';

const Analytics = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const analytics = useAnalytics();

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

  // Get real analytics data
  const totalAnimals = analytics.totalAnimals;
  const healthyAnimals = analytics.healthStatus.healthy || 0;
  const totalIncome = analytics.financial.totalIncome;
  const netRevenue = analytics.financial.netRevenue;

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
                value={`$${netRevenue.toFixed(2)}`}
                icon={<DollarSign className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
                color="blue"
                language={language}
              />
              <InteractiveSummaryCard
                title={t.newUsers}
                titleAm="ጠቅላላ እንስሳት"
                titleOr="Bineensota Waliigalaa"
                titleSw="Jumla ya Wanyama"
                value={totalAnimals}
                icon={<Heart className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
                color="green"
                language={language}
              />
              <InteractiveSummaryCard
                title={t.activeUsers}
                titleAm="ጤነኛ እንስሳት"
                titleOr="Bineensota Fayyaa"
                titleSw="Wanyama Wenye Afya"
                value={healthyAnimals}
                icon={<Activity className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
                color="purple"
                language={language}
              />
              <InteractiveSummaryCard
                title={t.weeklyGrowth}
                titleAm="ሳምንታዊ ወተት"
                titleOr="Aannan Torbanii"
                titleSw="Maziwa ya Wiki"
                value={`${analytics.milkProduction.weeklyAverage.toFixed(1)}L`}
                icon={<Droplets className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
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
                      <span>60%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{language === 'am' ? 'ስጋ' : language === 'or' ? 'Foon' : language === 'sw' ? 'Nyama' : 'Meat'}</span>
                      <span>30%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{language === 'am' ? 'ሌላ' : language === 'or' ? 'Kan biraa' : language === 'sw' ? 'Nyinginezo' : 'Other'}</span>
                      <span>10%</span>
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
                    <Badge variant="secondary">{analytics.market.activeListings}</Badge>
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
                    <Badge variant="secondary">{analytics.growth.averageWeight.toFixed(1)} kg</Badge>
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
                    <Badge variant="secondary">{analytics.health.totalRecords}</Badge>
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
                      <span>{language === 'am' ? 'የእንስሳት ቁጥር' : language === 'or' ? 'Lakkoofsa Bineensotaa' : language === 'sw' ? 'Idadi ya Wanyama' : 'Animal Count'}</span>
                      <span>{totalAnimals}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{language === 'am' ? 'ጤናማ' : language === 'or' ? 'Fayyaa Qabeessa' : language === 'sw' ? 'Afya' : 'Healthy'}</span>
                      <span>{healthyAnimals}</span>
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
                    <span>{language === 'am' ? 'ወተት ምርት' : language === 'or' ? 'Oomisha Aannan' : language === 'sw' ? 'Uzalishaji wa Maziwa' : 'Milk Records'}</span>
                    <Badge variant="secondary">{analytics.milkProduction.totalRecords}</Badge>
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
                <Badge variant="secondary">{healthyAnimals}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t.marketTrends}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>{language === 'am' ? 'አሁን ያሉ ዝርዝሮች' : language === 'or' ? 'Tarreewwan Hojjatoo' : language === 'sw' ? 'Orodha Amilifu' : 'Active Listings'}</span>
                <Badge variant="secondary">{analytics.market.activeListings}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t.performance}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>{language === 'am' ? 'የግብይት እሴት' : language === 'or' ? 'Gatii Gabaa' : language === 'sw' ? 'Thamani ya Soko' : 'Market Value'}</span>
                <Badge variant="secondary">${analytics.market.totalValue.toFixed(2)}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t.engagement}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>{language === 'am' ? 'ወተት ምርት' : language === 'or' ? 'Oomisha Aannan' : language === 'sw' ? 'Uzalishaji wa Maziwa' : 'Milk Records'}</span>
                <Badge variant="secondary">{analytics.milkProduction.totalRecords}</Badge>
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
