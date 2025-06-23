
import React from 'react';
import { Users, Heart, AlertTriangle, Shield } from 'lucide-react';
import { InteractiveSummaryCard } from '@/components/InteractiveSummaryCard';
import { AnimalData, Language } from '@/types';

interface AnimalsSummaryCardsProps {
  animals: AnimalData[];
  language: Language;
}

export const AnimalsSummaryCards = ({ animals, language }: AnimalsSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
      <InteractiveSummaryCard
        title="Total Animals"
        titleAm="ጠቅላላ እንስሳት"
        titleOr="Horii Hundaa"
        titleSw="Jumla ya Wanyama"
        value={animals.length}
        icon={<Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
        color="blue"
        language={language}
      />
      
      <InteractiveSummaryCard
        title="Healthy"
        titleAm="ጤናማ"
        titleOr="Fayyaa"
        titleSw="Wenye Afya"
        value={animals.filter(a => a.health_status === 'healthy').length}
        icon={<Heart className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
        color="green"
        language={language}
      />

      <InteractiveSummaryCard
        title="Need Attention"
        titleAm="ትኩረት ያስፈልጋል"
        titleOr="Xalayaa Barbaada"
        titleSw="Inahitaji Uangalifu"
        value={animals.filter(a => a.health_status === 'attention').length}
        icon={<AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
        color="yellow"
        language={language}
      />

      <InteractiveSummaryCard
        title="Verified"
        titleAm="የተረጋገጠ"
        titleOr="Mirkaneeffame"
        titleSw="Imethibitishwa"
        value={animals.filter(a => a.is_vet_verified).length}
        icon={<Shield className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
        color="purple"
        language={language}
      />
    </div>
  );
};
