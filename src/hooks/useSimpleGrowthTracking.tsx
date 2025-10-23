import { useSecureGrowthTracking } from './useSecureGrowthTracking';

export const useSimpleGrowthTracking = () => {
  const secure = useSecureGrowthTracking();

  const recordWeight = async (animalId: string, weight: number) => {
    return secure.recordWeight({
      animal_id: animalId,
      weight,
      recorded_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  return { recordWeight, loading: secure.loading };
};