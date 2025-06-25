
import React from 'react';
import { InteractiveSummaryCard } from './InteractiveSummaryCard';
import { Users, Heart, TrendingUp, DollarSign, Syringe, AlertTriangle, Calendar, Shield } from 'lucide-react';
import { Language } from '@/types';

interface InteractiveDashboardProps {
  language: Language;
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

export const InteractiveDashboard = ({ language, stats }: InteractiveDashboardProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 lg:gap-4">
      <InteractiveSummaryCard
        title="Total Animals"
        titleAm="ጠቅላላ እንስሳት"
        titleOr="Horii Hundaa"
        titleSw="Jumla ya Wanyama"
        value={stats.totalAnimals}
        icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
        color="blue"
        language={language}
      />

      <InteractiveSummaryCard
        title="Healthy"
        titleAm="ጤናማ"
        titleOr="Fayyaa"
        titleSw="Wenye Afya"
        value={stats.healthyAnimals}
        icon={<Heart className="w-4 h-4 sm:w-5 sm:h-5" />}
        color="green"
        language={language}
      />

      <InteractiveSummaryCard
        title="Weekly Revenue"
        titleAm="ሳምንታዊ ገቢ"
        titleOr="Galii Torbanaa"
        titleSw="Mapato ya Wiki"
        value={`$${stats.weeklyRevenue}`}
        icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />}
        color="emerald"
        language={language}
      />

      <InteractiveSummaryCard
        title="Pending Tasks"
        titleAm="በመጠባበቅ ላይ"
        titleOr="Hojiiwwan Eegaman"
        titleSw="Kazi Zinazongoja"
        value={stats.pendingTasks}
        icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
        color="orange"
        language={language}
      />

      <InteractiveSummaryCard
        title="Growth Rate"
        titleAm="የእድገት መጠን"
        titleOr="Sadarkaa Guddina"
        titleSw="Kiwango cha Ukuaji"
        value={`${stats.growthRate}%`}
        icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
        color="purple"
        language={language}
      />

      <InteractiveSummaryCard
        title="Vaccination Rate"
        titleAm="የክትባት መጠን"
        titleOr="Sadarkaa Tallaa"
        titleSw="Kiwango cha Chanjo"
        value={`${stats.vaccinationRate}%`}
        icon={<Syringe className="w-4 h-4 sm:w-5 sm:h-5" />}
        color="blue"
        language={language}
      />

      <InteractiveSummaryCard
        title="Sick Animals"
        titleAm="ህሙማን እንስሳት"
        titleOr="Horii Dhukkubsaa"
        titleSw="Wanyama Wagonjwa"
        value={stats.sickAnimals}
        icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
        color="red"
        language={language}
      />

      <InteractiveSummaryCard
        title="Upcoming Vaccinations"
        titleAm="ቀሪ ክትባቶች"
        titleOr="Tallaawwan Dhufan"
        titleSw="Chanjo Zinazokuja"
        value={stats.upcomingVaccinations}
        icon={<Shield className="w-4 h-4 sm:w-5 sm:h-5" />}
        color="blue"
        language={language}
      />
    </div>
  );
};
