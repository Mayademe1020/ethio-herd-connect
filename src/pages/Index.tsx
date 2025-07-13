
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { InteractiveDashboard } from '@/components/InteractiveDashboard';
import { QuickActions } from '@/components/QuickActions';
import { RecentActivity } from '@/components/RecentActivity';
import { StaffManagement } from '@/components/StaffManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

const Index = () => {
  const { language } = useLanguage();
  const [showStaffManagement, setShowStaffManagement] = useState(false);

  // Mock data - replace with real Supabase data
  const dashboardStats = {
    totalAnimals: 24,
    healthyAnimals: 22,
    weeklyRevenue: 2450,
    pendingTasks: 3,
    growthRate: 15,
    vaccinationRate: 98,
    sickAnimals: 2,
    upcomingVaccinations: 5
  };

  const handleActionComplete = () => {
    console.log('Action completed, refreshing data...');
  };

  const handleShowStaffManagement = () => {
    console.log('Opening Staff Management');
    setShowStaffManagement(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20 sm:pb-24">
      <Header />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-2">
            {language === 'am' ? 'MyLivestock ዳሽቦርድ' : 
             language === 'or' ? 'Daashboordii MyLivestock' :
             language === 'sw' ? 'Dashibodi ya MyLivestock' :
             'MyLivestock Dashboard'}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4 max-w-2xl mx-auto">
            {language === 'am' 
              ? 'የእርስዎ እንስሳዎች እና ግብርና አስተዳደር ማእከል'
              : language === 'or'
              ? 'Horii fi qonnaa keessanii bulchiinsa gaafa'
              : language === 'sw'
              ? 'Kituo chako cha usimamizi wa mifugo na kilimo'
              : 'Your livestock and farm management center'
            }
          </p>
        </div>

        {/* Interactive Dashboard Cards */}
        <div className="mb-6 sm:mb-8">
          <InteractiveDashboard language={language} stats={dashboardStats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Quick Actions - Takes more space on larger screens */}
          <div className="lg:col-span-2 xl:col-span-2">
            <QuickActions language={language} onActionComplete={handleActionComplete} />
          </div>
          
          {/* Staff Management Card */}
          <div className="lg:col-span-1 xl:col-span-1">
            <Card className="border-green-100 hover:shadow-md transition-shadow h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 flex items-center space-x-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <span className="truncate">
                    {language === 'am' ? 'የሰራተኞች አስተዳደር' : 
                     language === 'or' ? 'Bulchiinsa Hojjettootaa' :
                     language === 'sw' ? 'Usimamizi wa Wafanyakazi' :
                     'Staff Management'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {language === 'am' 
                    ? 'የእርሻ ሰራተኞችን ያክሉ እና ያስተዳድሩ'
                    : language === 'or'
                    ? 'Hojjettoo qonnaa dabaluu fi bulchuu'
                    : language === 'sw'
                    ? 'Ongeza na usimamie wafanyakazi wa shamba'
                    : 'Add and manage farm staff members'
                  }
                </p>
                <Button
                  onClick={handleShowStaffManagement}
                  className="w-full bg-green-600 hover:bg-green-700 text-sm h-10 sm:h-12 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
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
          </div>

          {/* Recent Activity - Spans remaining space */}
          <div className="lg:col-span-3 xl:col-span-1">
            <Card className="border-green-100 hover:shadow-md transition-shadow h-full">
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
