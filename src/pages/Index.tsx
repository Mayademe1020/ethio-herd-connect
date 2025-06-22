
import { EnhancedHeader } from '@/components/EnhancedHeader';
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
    // Refresh data after action completion
    console.log('Action completed, refreshing data...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20 sm:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Welcome Section */}
        <div className="text-center mb-3 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            {language === 'am' ? 'MyLivestock ዳሽቦርድ' : 'MyLivestock Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 px-2">
            {language === 'am' 
              ? 'የእርስዎ እንስሳዎች እና ግብርና አስተዳደር ማእከል'
              : 'Your livestock and farm management center'
            }
          </p>
        </div>

        {/* Interactive Dashboard Cards */}
        <InteractiveDashboard language={language} stats={dashboardStats} />

        {/* Quick Actions with Staff Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="lg:col-span-2">
            <QuickActions language={language} onActionComplete={handleActionComplete} />
          </div>
          
          {/* Staff Management Card */}
          <Card className="border-green-100">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 flex items-center space-x-1 sm:space-x-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-600" />
                <span>{language === 'am' ? 'የሰራተኞች አስተዳደር' : 'Staff Management'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm text-gray-600">
                {language === 'am' 
                  ? 'የእርሻ ሰራተኞችን ያክሉ እና ያስተዳድሩ'
                  : 'Add and manage farm staff members'
                }
              </p>
              <Button
                onClick={() => setShowStaffManagement(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-8 sm:h-10"
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {language === 'am' ? 'ሰራተኞችን አስተዳድር' : 'Manage Staff'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-green-100">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
              {language === 'am' ? '📊 የቅርብ ጊዜ እንቅስቃሴዎች' : '📊 Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity language={language} />
          </CardContent>
        </Card>
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
