import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeedModeSelector } from '@/components/FeedModeSelector';
import { FeedSelector } from '@/components/FeedSelector';
import { FeedErrorBoundary } from '@/components/FeedErrorBoundary';
import { useFeedCalculator } from '@/hooks/useFeedCalculator';
import { useTranslations } from '@/hooks/useTranslations';
import { usePaginatedAnimals } from '@/hooks/usePaginatedAnimals';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Save, Share2, Check, Loader2 } from 'lucide-react';
import { shareRationViaTelegram } from '@/services/feedService';
import { toast } from 'sonner';

type Mode = 'selection' | 'user_feeds' | 'recommendations' | 'results';
type FeedMode = 'user_feeds' | 'recommendations';

const FeedRationing = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const {
    loading,
    seasonalFeeds,
    loadSeasonalFeeds,
    calculateWithUserFeeds,
    calculateOptimalRation,
    savePlan,
    currentSeason
  } = useFeedCalculator();

  // Loading state for feed data
  const [feedsLoading, setFeedsLoading] = useState(true);

  // State
  const [currentMode, setCurrentMode] = useState<Mode>('selection');
  const [feedMode, setFeedMode] = useState<FeedMode | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [selectedAnimalId, setSelectedAnimalId] = useState(''); // Specific animal from user's animals
  const [productionGoal, setProductionGoal] = useState('');
  const [selectedFeedIds, setSelectedFeedIds] = useState<string[]>([]);
  const [calculationResult, setCalculationResult] = useState<any>(null);

  // Fetch user's animals for selection
  const { animals, isLoading: animalsLoading } = usePaginatedAnimals({ pageSize: 100 });

  // Load seasonal feeds on mount
  useEffect(() => {
    const loadFeeds = async () => {
      setFeedsLoading(true);
      try {
        await loadSeasonalFeeds();
      } catch (error) {
        console.error('Error loading feeds:', error);
        toast.error(t('feed.loadError') || 'Error loading feed data');
      } finally {
        setFeedsLoading(false);
      }
    };
    loadFeeds();
  }, [loadSeasonalFeeds, t]);

  // Handle mode selection
  const handleModeSelect = (mode: FeedMode) => {
    setFeedMode(mode);
    setCurrentMode(mode);
  };

  // Handle calculation
  const handleCalculate = async () => {
    if (!selectedAnimal || !productionGoal) {
      toast.error(t('feed.selectAnimalGoal') || 'Please select animal and production goal');
      return;
    }

    try {
      let result;
      if (feedMode === 'user_feeds') {
        if (selectedFeedIds.length === 0) {
          toast.error(t('feed.selectFeeds') || 'Please select at least one feed');
          return;
        }
        result = await calculateWithUserFeeds(selectedAnimal, productionGoal, selectedFeedIds);
      } else {
        result = await calculateOptimalRation(selectedAnimal, productionGoal);
      }

      setCalculationResult(result);
      setCurrentMode('results');
    } catch (error) {
      toast.error(t('feed.calculationError') || 'Error calculating ration');
    }
  };

  // Handle save plan
  const handleSavePlan = async () => {
    if (!calculationResult?.ration) return;

    if (!selectedAnimalId) {
      toast.error(t('feed.selectAnimalFirst') || 'Please select a specific animal to save this plan');
      return;
    }

    try {
      await savePlan(
        selectedAnimalId,
        calculationResult.ration.id,
        feedMode === 'user_feeds' ? 'user_driven' : 'app_driven',
        selectedFeedIds,
        'Generated via feed calculator'
      );
      toast.success(t('feed.planSaved') || 'Feed plan saved!');
    } catch (error) {
      toast.error(t('feed.saveError') || 'Error saving plan');
    }
  };

  // Handle share via Telegram
  const handleShareTelegram = () => {
    if (calculationResult?.ration) {
      shareRationViaTelegram(calculationResult.ration, selectedAnimal);
      toast.success(t('feed.sharedTelegram') || 'Shared via Telegram!');
    }
  };

  // Render animal/goal selection
  const renderAnimalSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          🐄 {t('feed.selectAnimal') || 'Select Animal & Goal'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Animal Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('feed.animalType') || 'Animal Type'}
          </label>
          <select
            value={selectedAnimal}
            onChange={(e) => setSelectedAnimal(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">{t('feed.selectAnimal') || 'Select Animal'}</option>
            <option value="cattle">🐄 {t('animals.cattle') || 'Cattle'}</option>
            <option value="goat">🐐 {t('animals.goat') || 'Goat'}</option>
            <option value="sheep">🐑 {t('animals.sheep') || 'Sheep'}</option>
          </select>
        </div>

        {/* Production Goal */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('feed.productionGoal') || 'Production Goal'}
          </label>
          <select
            value={productionGoal}
            onChange={(e) => setProductionGoal(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">{t('feed.selectGoal') || 'Select Goal'}</option>
            <option value="maintenance">🔧 {t('feed.maintenance') || 'Maintenance'}</option>
            <option value="high_milk">🥛 {t('feed.highMilk') || 'High Milk Production'}</option>
            <option value="fattening">📈 {t('feed.fattening') || 'Fattening'}</option>
          </select>
        </div>

        {/* Specific Animal Selection (Optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('feed.selectSpecificAnimal') || 'Select Specific Animal (Optional)'}
          </label>
          <select
            value={selectedAnimalId}
            onChange={(e) => setSelectedAnimalId(e.target.value)}
            disabled={animalsLoading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          >
            <option value="">{t('feed.noSpecificAnimal') || 'No specific animal (general plan)'}</option>
            {animals?.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.name} ({animal.animal_code || animal.id.slice(0, 8)})
              </option>
            ))}
          </select>
          {animalsLoading && (
            <p className="text-xs text-gray-500 mt-1">{t('feed.loadingAnimals') || 'Loading your animals...'}</p>
          )}
        </div>

        {/* Current Season Info */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            📅 {t('feed.currentSeason') || 'Current Season'}: {
              currentSeason === 'dry'
                ? t('feed.drySeason') || 'Dry Season (Oct-May)'
                : t('feed.wetSeason') || 'Wet Season (Jun-Sep)'
            }
          </p>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={loading || !selectedAnimal || !productionGoal}
          className="w-full"
          size="lg"
        >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {t('feed.calculating') || 'Calculating...'}
          </>
        ) : (
          <>
            <Check className="w-5 h-5 mr-2" />
            {t('feed.calculate') || 'Calculate Ration'}
          </>
        )}
      </Button>
      </CardContent>
    </Card>
  );

  // Render results
  const renderResults = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          ✅ {t('feed.recommendedRation') || 'Recommended Ration'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {calculationResult?.ration && (
          <>
            {/* Production Info */}
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-lg font-bold text-green-800">
                {calculationResult.ration.expected_production}
              </p>
              <p className="text-sm text-green-700">
                {t('feed.expectedProduction') || 'Expected Production'}
              </p>
            </div>

            {/* Feed Mixture */}
            <div>
              <h4 className="font-semibold mb-3">
                📋 {t('feed.dailyMixture') || 'Daily Feed Mixture'}
              </h4>
              <div className="space-y-2">
                {Object.entries(calculationResult.ration.ingredient_ratios).map(([feedId, percentage]) => {
                  const feed = seasonalFeeds.find(f => f.id === feedId);
                  return (
                    <div key={feedId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span>{feed?.icon_emoji}</span>
                        <span className="font-medium">{feed?.name_en}</span>
                      </div>
                      <span className="font-bold text-green-600">{String(percentage)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nutritional Balance */}
            <div>
              <h4 className="font-semibold mb-3">
                📊 {t('feed.nutritionalBalance') || 'Nutritional Balance'}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(calculationResult.nutritional_balance).map(([nutrient, value]) => (
                  <div key={nutrient} className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-bold text-blue-800">{String(value)}%</div>
                    <div className="text-xs text-blue-600 capitalize">{nutrient}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advice */}
            {calculationResult.advice && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 {calculationResult.advice}
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-red-50 p-3 rounded-lg text-sm">
              <p className="text-red-800">
                ⚠️ {calculationResult.ration.disclaimer_text_en}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleSavePlan} variant="outline" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {t('feed.savePlan') || 'Save Plan'}
              </Button>
              <Button onClick={handleShareTelegram} variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                {t('feed.shareTelegram') || 'Share'}
              </Button>
            </div>
          </>
        )}

        {!calculationResult?.ration && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-gray-600">
              {calculationResult?.advice || t('feed.noRationFound') || 'No suitable ration found'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <FeedErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <BackButton />
            <h1 className="text-2xl font-bold mt-4 text-center">
              🥛 {t('feed.feedRationing') || 'Feed Rationing'}
            </h1>
          </div>

          {/* Content */}
          <div className="space-y-6">
          {currentMode === 'selection' && (
            <FeedModeSelector onModeSelect={handleModeSelect} />
          )}

          {(currentMode === 'user_feeds' || currentMode === 'recommendations') && (
            <>
              {renderAnimalSelection()}
              {currentMode === 'user_feeds' && (
                feedsLoading ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mr-3" />
                      <span>{t('feed.loadingFeeds') || 'Loading feed data...'}</span>
                    </CardContent>
                  </Card>
                ) : (
                  <FeedSelector
                    feeds={seasonalFeeds}
                    selectedFeedIds={selectedFeedIds}
                    onSelectionChange={setSelectedFeedIds}
                  />
                )
              )}
            </>
          )}

          {currentMode === 'results' && renderResults()}
        </div>

        {/* Navigation */}
        {currentMode !== 'selection' && currentMode !== 'results' && (
          <div className="fixed bottom-20 left-4 right-4 max-w-2xl mx-auto">
            <Button
              onClick={() => setCurrentMode('selection')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back') || 'Back'}
            </Button>
          </div>
        )}
      </div>
    </div>
    </FeedErrorBoundary>
  );
};

export default FeedRationing;