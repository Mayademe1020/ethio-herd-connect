import { AnimalData } from '@/types';

export const calculateOverallGrowthRate = (animals: AnimalData[]): number => {
  let totalGrowthRate = 0;
  let animalsWithGrowth = 0;

  animals.forEach(animal => {
    if (animal.growth_records && animal.growth_records.length >= 2) {
      const sortedRecords = [...animal.growth_records].sort(
        (a, b) => new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()
      );

      const latestRecord = sortedRecords[0];
      const previousRecord = sortedRecords[1];

      if (latestRecord.weight && previousRecord.weight > 0) {
        const growthRate = ((latestRecord.weight - previousRecord.weight) / previousRecord.weight) * 100;
        totalGrowthRate += growthRate;
        animalsWithGrowth++;
      }
    }
  });

  if (animalsWithGrowth === 0) {
    return 0;
  }

  return totalGrowthRate / animalsWithGrowth;
};

export const calculateSummaryData = (animals: AnimalData[]) => {
  const growthRate = calculateOverallGrowthRate(animals);

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
    }).length,
    growthRate: growthRate
  };
};