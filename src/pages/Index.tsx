
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { InteractiveDashboard } from '@/components/InteractiveDashboard';
import { QuickActions } from '@/components/QuickActions';
import { RecentActivity } from '@/components/RecentActivity';
import { StaffManagement } from '@/components/StaffManagement';
import { EthiopianDashboardWelcome } from '@/components/EthiopianDashboardWelcome';
import { EthiopianStatsOverview } from '@/components/EthiopianStatsOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

const Index = () => {
  const { language } = useLanguage();
  const [showStaffManagement, setShowStaffManagement] = useState(false);

  // Enhanced mock data with Ethiopian context
  const dashboardStats = {
    totalAnimals: 24,
    healthyAnimals: 22,
    weeklyRevenue: 2450,
    pendingTasks: 3,
    growthRate: 15,
    vaccinationRate: 98,
    sickAnimals: 2,
    upcomingVaccinations: 5,
    cattleCount: 12,
    goatCount: 8,
    sheepCount: 4,
    marketPrice: 850 // ETB per kg
  };

  const handleActionComplete = () => {
    console.log('Action completed, refreshing data...');
  };

  const handleShowStaffManagement = () => {
    console.log('Opening Staff Management');
    setShowStaffManagement(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50 pb-20 sm:pb-24">
      <Header />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl">
        {/* Ethiopian Welcome Section */}
        <EthiopianDashboardWelcome language={language} />

        {/* Enhanced Stats Overview */}
        <EthiopianStatsOverview language={language} stats={dashboardStats} />

        {/* Interactive Dashboard Cards */}
        <div className="mb-6 sm:mb-8">
          <InteractiveDashboard language={language} stats={dashboardStats} />
        </div>

        {/* Main Content Grid - Enhanced Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Quick Actions - Enhanced for Ethiopian users */}
          <div className="lg:col-span-7">
            <QuickActions language={language} onActionComplete={handleActionComplete} />
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-5 space-y-4">
            {/* Staff Management Card */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-200 h-fit">
              <CardHeader className="pb-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold flex items-center space-x-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">
                    {language === 'am' ? 'የሰራተኞች አስተዳደር' : 
                     language === 'or' ? 'Bulchiinsa Hojjettootaa' :
                     language === 'sw' ? 'Usimamizi wa Wafanyakazi' :
                     'Staff Management'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {language === 'am' 
                    ? 'የእርሻ ሰራተኞችን ያክሉ እና ያስተዳድሩ። የደመወዝ፣ የስራ መርሃ ግብር እና ቀልጣፋነት።'
                    : language === 'or'
                    ? 'Hojjettoo qonnaa dabaluu fi bulchuu. Mindaa, sagantaa hojii fi gahumsa.'
                    : language === 'sw'
                    ? 'Ongeza na usimamie wafanyakazi wa shamba. Mshahara, ratiba, na utendaji.'
                    : 'Add and manage farm staff members. Handle payroll, scheduling, and performance.'
                  }
                </p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>
                    {language === 'am' ? '3 ንቁ ሰራተኞች' : 
                     language === 'or' ? '3 Hojjettoo Ka\'aa' :
                     language === 'sw' ? '3 Wafanyakazi Hai' :
                     '3 Active Staff'}
                  </span>
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
                <Button
                  onClick={handleShowStaffManagement}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm h-10 sm:h-12 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation shadow-md"
                >
                  <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {language === 'am' ? 'ሰራተኞችን አስተዳድር' : 
                     language === 'or' ? 'Hojjettoo Bulchuu' :
                     language === 'sw' ? 'Usimamie Wafanyakazi' :
                     'Manage Staff'}
                  </span>
                </Button>
              </CardContent>
            </Card>

            {/* Market Alert Card */}
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-amber-800 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>
                    {language === 'am' ? 'የገበያ ዜና' : 
                     language === 'or' ? 'Oduu Gabaa' :
                     language === 'sw' ? 'Habari za Soko' :
                     'Market Update'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-amber-700">
                  {language === 'am' ? 'የዛሬው የከብት ዋጋ:' : 
                   language === 'or' ? 'Gatiin loonii har\'aa:' :
                   language === 'sw' ? 'Bei ya ng\'ombe leo:' :
                   'Today\'s cattle price:'}
                </div>
                <div className="text-lg font-bold text-amber-800">
                  {dashboardStats.marketPrice} ETB/kg ↗️
                </div>
                <p className="text-xs text-amber-600">
                  {language === 'am' ? 'ካለፈ ሳምንት 5% ጨምሯል' : 
                   language === 'or' ? 'Torban darbe irraa 5% dabaleera' :
                   language === 'sw' ? 'Imeongezeka 5% kutoka wiki iliyopita' :
                   '5% increase from last week'}
                </p>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
                  {language === 'am' ? '📊 የቅርብ ጊዜ እንቅስቃሴዎች' : 
                   language === 'or' ? '📊 Sochiiwwan Yeroo Dhiyoo' :
                   language === 'sw' ? '📊 Shughuli za Hivi Karibuni' :
                   '📊 Recent Activity'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity language={language} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNavigation language={language} />

      {/* Staff Management Modal */}
      {showStaffManagement && (
        <StaffManagement
          language={language}
          onClose={() => setShowStaffManagement(false)}
        />
      )}
    </div>
  );
};

export default Index;
