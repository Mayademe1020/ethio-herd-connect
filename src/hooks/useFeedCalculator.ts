import { useState, useCallback } from 'react';
import {
  getSeasonalFeeds,
  getOptimalRation,
  calculateUserDrivenRation,
  saveFeedPlan,
  FeedIngredient,
  ILRIRation
} from '@/services/feedService';
import { useAuth } from '@/contexts/AuthContextMVP';

export interface FeedCalculationResult {
  ration: ILRIRation | null;
  advice: string;
  nutritional_balance: Record<string, number>;
}

export const useFeedCalculator = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [seasonalFeeds, setSeasonalFeeds] = useState<FeedIngredient[]>([]);

  // Get current season (simplified - could be enhanced with Ethiopian calendar)
  const getCurrentSeason = useCallback((): 'dry' | 'wet' => {
    const month = new Date().getMonth() + 1; // 1-12
    // Ethiopian dry season: October-May, Wet season: June-September
    return (month >= 10 || month <= 5) ? 'dry' : 'wet';
  }, []);

  // Load seasonal feeds
  const loadSeasonalFeeds = useCallback(async () => {
    try {
      const season = getCurrentSeason();
      const feeds = await getSeasonalFeeds(season);
      setSeasonalFeeds(feeds);
      return feeds;
    } catch (error) {
      console.error('Error loading seasonal feeds:', error);
      return [];
    }
  }, [getCurrentSeason]);

  // Calculate ration using user's available feeds (Mode A)
  const calculateWithUserFeeds = useCallback(async (
    animalType: string,
    productionGoal: string,
    selectedFeedIds: string[]
  ): Promise<FeedCalculationResult> => {
    setLoading(true);
    try {
      const season = getCurrentSeason();
      const result = await calculateUserDrivenRation(
        animalType,
        productionGoal,
        season,
        selectedFeedIds
      );
      return result;
    } catch (error) {
      console.error('Error calculating user-driven ration:', error);
      return {
        ration: null,
        advice: 'Error calculating ration. Please try again.',
        nutritional_balance: {}
      };
    } finally {
      setLoading(false);
    }
  }, [getCurrentSeason]);

  // Get optimal ILRI ration (Mode B)
  const calculateOptimalRation = useCallback(async (
    animalType: string,
    productionGoal: string
  ): Promise<FeedCalculationResult> => {
    setLoading(true);
    try {
      const season = getCurrentSeason();
      const ration = await getOptimalRation(animalType, productionGoal, season);

      if (ration) {
        return {
          ration,
          advice: 'This is the optimal ILRI-recommended ration for maximum production.',
          nutritional_balance: ration.nutritional_analysis
        };
      } else {
        return {
          ration: null,
          advice: 'No optimal ration found for these conditions.',
          nutritional_balance: {}
        };
      }
    } catch (error) {
      console.error('Error calculating optimal ration:', error);
      return {
        ration: null,
        advice: 'Error calculating ration. Please try again.',
        nutritional_balance: {}
      };
    } finally {
      setLoading(false);
    }
  }, [getCurrentSeason]);

  // Save feed plan
  const savePlan = useCallback(async (
    animalId: string,
    rationId: string | null,
    modeType: 'user_driven' | 'app_driven',
    selectedFeeds: string[],
    customNotes?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const plan = await saveFeedPlan({
        farmer_id: user.id,
        animal_id: animalId,
        ration_id: rationId || '',
        mode_type: modeType,
        selected_feeds: selectedFeeds,
        custom_notes: customNotes,
        telegram_shared: false
      });
      return plan;
    } catch (error) {
      console.error('Error saving feed plan:', error);
      throw error;
    }
  }, [user]);

  return {
    loading,
    seasonalFeeds,
    loadSeasonalFeeds,
    calculateWithUserFeeds,
    calculateOptimalRation,
    savePlan,
    currentSeason: getCurrentSeason()
  };
};