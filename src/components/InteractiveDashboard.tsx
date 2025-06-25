
import React from 'react';
import { InteractiveSummaryCard } from '@/components/InteractiveSummaryCard';
import { Users, Heart, TrendingUp, ShoppingCart } from 'lucide-react';
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
        title="Growth Rate"
        titleAm="የእድገት መጠን"
        titleOr="Saffisa Guddina"
        titleSw="Kiwango cha Ukuaji"
        value={`${stats.growthRate}%`}
        icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
        color="purple"
        language={language}
      />

      <InteractiveSummaryCard
        title="Revenue"
        titleAm="ገቢ"
        titleOr="Galii"
        titleSw="Mapato"
        value={`${stats.weeklyRevenue} ETB`}
        icon={<ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />}
        color="orange"
        language={language}
      />
    </div>
  );
};
