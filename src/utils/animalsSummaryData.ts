import { AnimalData } from '@/types';

export const calculateSummaryData = (animals: AnimalData[]) => {
  return {
    totalAnimals: animals.length,
    healthyAnimals: animals.filter(a => a.health_status === 'healthy').length,
    sickAnimals: animals.filter(a => a.health_status === 'sick' || a.health_status === 'critical').length,
    needsAttention: animals.filter(a => a.health_status === 'attention').length,
    vaccinatedAnimals: animals.filter(a => a.last_vaccination).length,
    recentlyAdded: animals.filter(a => {
      const addedDate = new Date(a.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return addedDate > weekAgo;
    }).length
  };
};