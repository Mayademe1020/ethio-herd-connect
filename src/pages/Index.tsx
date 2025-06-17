
import { useState } from 'react';
import { Header } from '@/components/Header';
import { DashboardCards } from '@/components/DashboardCards';
import { RecentActivity } from '@/components/RecentActivity';
import { QuickActions } from '@/components/QuickActions';

const Index = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {language === 'am' ? 'እንኳን ወደ ቤት-ግጦሽ በደህና መጡ' : 'Welcome to Bet-Gitosa'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === 'am' 
              ? 'የእርስዎን የከብት እና የዶሮ እርባታ ያስተዳድሩ፣ ጤንነት ይከታተሉ እና በቀላሉ ይሽጡ'
              : 'Manage your livestock and poultry, track health, and sell with ease'
            }
          </p>
        </div>

        {/* Dashboard Overview */}
        <DashboardCards language={language} />

        {/* Quick Actions */}
        <QuickActions language={language} />

        {/* Recent Activity */}
        <RecentActivity language={language} />
      </main>
    </div>
  );
};

export default Index;
