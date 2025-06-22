
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Heart, DollarSign, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStat {
  id: string;
  title: string;
  titleAm: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  badgeAm?: string;
  navigateTo: string;
  disabled?: boolean;
}

interface InteractiveDashboardProps {
  language: 'am' | 'en';
  stats: {
    totalAnimals: number;
    healthyAnimals: number;
    weeklyRevenue: number;
    pendingTasks: number;
    growthRate: number;
    vaccinationRate: number;
    sickAnimals: number;
    upcomingVaccinations: number;
  };
}

export const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({ language, stats }) => {
  const navigate = useNavigate();

  const dashboardStats: DashboardStat[] = [
    {
      id: 'total-animals',
      title: 'Total Animals',
      titleAm: 'ጠቅላላ እንስሳት',
      value: stats.totalAnimals,
      icon: <Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />,
      color: 'from-blue-500 to-blue-600',
      badge: `+${stats.growthRate}% growth`,
      badgeAm: `+${stats.growthRate}% ዕድገት`,
      navigateTo: '/animals',
    },
    {
      id: 'healthy-animals',
      title: 'Healthy Animals',
      titleAm: 'ጤናማ እንስሳት',
      value: stats.healthyAnimals,
      icon: <Heart className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />,
      color: 'from-green-500 to-green-600',
      badge: `${stats.vaccinationRate}% vaccinated`,
      badgeAm: `${stats.vaccinationRate}% ክትባት`,
      navigateTo: '/animals?filter=healthy',
    },
    {
      id: 'weekly-revenue',
      title: 'Weekly Revenue',
      titleAm: 'ሳምንታዊ ገቢ',
      value: stats.weeklyRevenue,
      icon: <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />,
      color: 'from-purple-500 to-purple-600',
      badge: '+22%',
      badgeAm: '+22%',
      navigateTo: '/market',
    },
    {
      id: 'pending-tasks',
      title: 'Pending Tasks',
      titleAm: 'ቀሪ ስራዎች',
      value: stats.pendingTasks,
      icon: <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />,
      color: 'from-orange-500 to-orange-600',
      badge: 'urgent',
      badgeAm: 'አስቸኳይ',
      navigateTo: '/health?tab=reminders',
    },
    {
      id: 'upcoming-vaccinations',
      title: 'Upcoming Vaccines',
      titleAm: 'ቀሪ ክትባቶች',
      value: stats.upcomingVaccinations,
      icon: <Calendar className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />,
      color: 'from-teal-500 to-teal-600',
      badge: 'this week',
      badgeAm: 'በዚህ ሳምንት',
      navigateTo: '/health?tab=scheduled',
      disabled: stats.upcomingVaccinations === 0,
    },
    {
      id: 'sick-animals',
      title: 'Need Attention',
      titleAm: 'ትኩረት ያስፈልጋቸው',
      value: stats.sickAnimals,
      icon: <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />,
      color: 'from-red-500 to-red-600',
      badge: 'immediate care',
      badgeAm: 'አስቸኳይ ክትትል',
      navigateTo: '/animals?filter=sick',
      disabled: stats.sickAnimals === 0,
    },
  ];

  const handleCardClick = (stat: DashboardStat) => {
    if (stat.disabled) return;
    navigate(stat.navigateTo);
  };

  const DashboardCard: React.FC<{ stat: DashboardStat }> = ({ stat }) => {
    const isDisabled = stat.disabled && stat.value === 0;

    return (
      <Card 
        className={`
          cursor-pointer 
          transition-all 
          duration-300 
          ease-in-out 
          transform
          hover:shadow-lg
          active:scale-95 
          border-2
          ${isDisabled 
            ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' 
            : 'hover:border-green-300 border-gray-200 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 hover:scale-105'
          }
          touch-manipulation
          min-h-[100px] sm:min-h-[120px] lg:min-h-[140px]
        `}
        onClick={() => handleCardClick(stat)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-2 sm:px-4 lg:px-6 pt-2 sm:pt-4 lg:pt-6">
          <CardTitle className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${
            isDisabled ? 'text-gray-400' : 'text-gray-600 group-hover:text-green-700'
          }`}>
            {language === 'am' ? stat.titleAm : stat.title}
          </CardTitle>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className={`transition-colors duration-200 ${
              isDisabled ? 'text-gray-400' : 'text-green-600 group-hover:text-green-700'
            }`}>
              {stat.icon}
            </div>
            {!isDisabled && (
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-green-600 transition-all duration-200 transform group-hover:translate-x-1" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-1 sm:space-y-2 px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6">
          <div className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold transition-colors duration-200 ${
            isDisabled ? 'text-gray-400' : 'text-gray-900 group-hover:text-green-800'
          }`}>
            {stat.id === 'weekly-revenue' ? `₹${stat.value.toLocaleString()}` : stat.value}
          </div>
          {stat.badge && !isDisabled && (
            <Badge className={`text-[10px] sm:text-xs transition-colors duration-200 px-1 sm:px-2 py-0.5 sm:py-1 ${
              stat.id === 'healthy-animals' ? 'bg-blue-100 text-blue-800' :
              stat.id === 'weekly-revenue' ? 'bg-purple-100 text-purple-800' :
              stat.id === 'pending-tasks' || stat.id === 'sick-animals' ? 'bg-orange-100 text-orange-800' :
              'bg-green-100 text-green-800'
            }`}>
              {stat.id === 'weekly-revenue' && <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />}
              {language === 'am' ? stat.badgeAm : stat.badge}
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
      {dashboardStats.map((stat) => (
        <DashboardCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
};
