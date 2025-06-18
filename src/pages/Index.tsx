import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Heart, DollarSign, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');

  // Mock data - replace with real Supabase data
  const dashboardStats = {
    totalAnimals: 24,
    healthyAnimals: 22,
    weeklyRevenue: 2450,
    pendingTasks: 3,
    growthRate: 15,
    vaccinationRate: 98
  };

  const recentActivities = [
    {
      icon: '💉',
      titleAm: 'ሞላ - ክትባት ተሰጥቷል',
      titleEn: 'Mola - Vaccinated',
      timeAm: '2 ሰዓት በፊት',
      timeEn: '2 hours ago',
      type: 'health'
    },
    {
      icon: '📊',
      titleAm: 'ውለታ - ክብደት ተመዝግቧል (285kg)',
      titleEn: 'Weleta - Weight recorded (285kg)',
      timeAm: '4 ሰዓት በፊት',
      timeEn: '4 hours ago',
      type: 'growth'
    },
    {
      icon: '🐄',
      titleAm: 'አዲስ ላም ተመዝግቧል - ድንቅ',
      titleEn: 'New cow registered - Dinq',
      timeAm: '1 ቀን በፊት',
      timeEn: '1 day ago',
      type: 'new'
    }
  ];

  const quickActions = [
    {
      icon: '📷',
      titleAm: 'እንስሳ ምዝገባ',
      titleEn: 'Register Animal',
      descAm: 'አዲስ እንስሳ ጨምር',
      descEn: 'Add new livestock',
      color: 'from-blue-500 to-blue-600',
      link: '/animals'
    },
    {
      icon: '💉',
      titleAm: 'ጅምላ ክትባት',
      titleEn: 'Bulk Vaccination',
      descAm: 'ብዙ እንስሳትን ክተቡ',
      descEn: 'Vaccinate multiple animals',
      color: 'from-green-500 to-green-600',
      link: '/health'
    },
    {
      icon: '📊',
      titleAm: 'እድገት ይከታተሉ',
      titleEn: 'Track Growth',
      descAm: 'ክብደት እና ምርት',
      descEn: 'Weight and production',
      color: 'from-purple-500 to-purple-600',
      link: '/growth'
    },
    {
      icon: '🛒',
      titleAm: 'ለሽያጭ ይለጥፉ',
      titleEn: 'Post for Sale',
      descAm: 'እንስሳትዎን ይሽጡ',
      descEn: 'Sell your animals',
      color: 'from-orange-500 to-orange-600',
      link: '/market'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-24">
      <Header language={language} setLanguage={setLanguage} />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Simplified Welcome Section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {language === 'am' ? 'ቤት-ግጦሽ ዳሽቦርድ' : 'Bet-Gitosa Dashboard'}
          </h1>
          <Link to="/animals">
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <Zap className="w-4 h-4 mr-2" />
              {language === 'am' ? 'እንስሳ ምዝገባ' : 'Register Animal'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {language === 'am' ? 'ጠቅላላ እንስሳት' : 'Total Animals'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {dashboardStats.totalAnimals}
              </div>
              <Badge className="bg-green-100 text-green-800">
                +{dashboardStats.growthRate}% {language === 'am' ? 'ዕድገት' : 'growth'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                {language === 'am' ? 'ጤናማ' : 'Healthy'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {dashboardStats.healthyAnimals}
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {dashboardStats.vaccinationRate}% {language === 'am' ? 'ክትባት' : 'vaccinated'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                {language === 'am' ? 'ሳምንታዊ ገቢ' : 'Weekly Revenue'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₹{dashboardStats.weeklyRevenue.toLocaleString()}
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                <TrendingUp className="w-3 h-3 mr-1" />
                +22%
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {language === 'am' ? 'ቀሪ ስራዎች' : 'Pending Tasks'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {dashboardStats.pendingTasks}
              </div>
              <Badge className="bg-orange-100 text-orange-800">
                {language === 'am' ? 'አስቸኳይ' : 'urgent'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              {language === 'am' ? '⚡ ፈጣን እርምጃዎች' : '⚡ Quick Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.link}>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-3 hover:shadow-lg transition-all duration-300 hover:scale-105 border-gray-200 group"
                  >
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900 text-sm mb-1">
                        {language === 'am' ? action.titleAm : action.titleEn}
                      </div>
                      <div className="text-xs text-gray-500">
                        {language === 'am' ? action.descAm : action.descEn}
                      </div>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              {language === 'am' ? '📊 የቅርብ ጊዜ እንቅስቃሴዎች' : '📊 Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xl">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {language === 'am' ? activity.titleAm : activity.titleEn}
                    </p>
                    <p className="text-sm text-gray-500">
                      {language === 'am' ? activity.timeAm : activity.timeEn}
                    </p>
                  </div>
                  <Badge 
                    className={
                      activity.type === 'health' ? 'bg-green-100 text-green-800' :
                      activity.type === 'growth' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }
                  >
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Index;
