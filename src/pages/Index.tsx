
import { useState } from 'react';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { InteractiveDashboard } from '@/components/InteractiveDashboard';
import { QuickActions } from '@/components/QuickActions';
import { RecentActivity } from '@/components/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-24">
      <EnhancedHeader language={language} setLanguage={setLanguage} />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {language === 'am' ? 'ቤት-ግጦሽ ዳሽቦርድ' : 'Bet-Gitosa Dashboard'}
          </h1>
          <p className="text-gray-600">
            {language === 'am' 
              ? 'የእርስዎ እንስሳዎች እና ግብርና አስተዳደር ማእከል'
              : 'Your livestock and farm management center'
            }
          </p>
        </div>

        {/* Interactive Dashboard Cards */}
        <InteractiveDashboard language={language} stats={dashboardStats} />

        {/* Quick Actions */}
        <QuickActions language={language} onActionComplete={handleActionComplete} />

        {/* Recent Activity */}
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              {language === 'am' ? '📊 የቅርብ ጊዜ እንቅስቃሴዎች' : '📊 Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity language={language} />
          </CardContent>
        </Card>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Index;
