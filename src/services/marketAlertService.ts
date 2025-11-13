import { supabase } from '@/integrations/supabase/client';
import { createNotification } from './notificationService';

export interface MarketAlert {
  type: 'new_listing' | 'price_change' | 'opportunity';
  title: string;
  message: string;
  listing_id?: string;
  price_data?: {
    current: number;
    previous: number;
    change_percentage: number;
  };
  location_data?: {
    distance_km: number;
    region: string;
  };
}

export interface PriceTrend {
  animal_type: string;
  current_avg_price: number;
  previous_avg_price: number;
  change_percentage: number;
  listing_count: number;
}

/**
 * Calculate distance between two locations (simplified Haversine formula)
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Parse location string to extract coordinates if available
 * Format: "City, Region" or "City, Region (lat,lon)"
 */
function parseLocation(location: string | null): {
  city?: string;
  region?: string;
  lat?: number;
  lon?: number;
} {
  if (!location) return {};

  const coordMatch = location.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
  if (coordMatch) {
    return {
      lat: parseFloat(coordMatch[1]),
      lon: parseFloat(coordMatch[2]),
    };
  }

  const parts = location.split(',').map(p => p.trim());
  return {
    city: parts[0],
    region: parts[1],
  };
}

/**
 * Detect new listings posted in the last 24 hours
 */
export async function detectNewListings(
  userLocation?: { lat: number; lon: number },
  distanceThresholdKm: number = 50
): Promise<any[]> {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data, error } = await supabase
      .from('market_listings')
      .select(`
        id,
        title,
        price,
        location,
        created_at,
        animal_id,
        animals (
          type,
          breed
        )
      `)
      .eq('status', 'active')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    let listings = data || [];

    // Filter by distance if user location is provided
    if (userLocation) {
      listings = listings
        .map(listing => {
          const listingLocation = parseLocation(listing.location);
          if (listingLocation.lat && listingLocation.lon) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lon,
              listingLocation.lat,
              listingLocation.lon
            );
            return { ...listing, distance };
          }
          return { ...listing, distance: null };
        })
        .filter(listing => listing.distance === null || listing.distance <= distanceThresholdKm)
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    return listings;
  } catch (error) {
    console.error('Error detecting new listings:', error);
    return [];
  }
}

/**
 * Analyze price changes for different animal types
 * Compares current week average with previous week
 */
export async function analyzePriceChanges(): Promise<PriceTrend[]> {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Get current week listings
    const { data: currentWeekData, error: currentError } = await supabase
      .from('market_listings')
      .select(`
        price,
        animal_id,
        animals (
          type
        )
      `)
      .eq('status', 'active')
      .gte('created_at', oneWeekAgo.toISOString());

    if (currentError) throw currentError;

    // Get previous week listings
    const { data: previousWeekData, error: previousError } = await supabase
      .from('market_listings')
      .select(`
        price,
        animal_id,
        animals (
          type
        )
      `)
      .eq('status', 'active')
      .gte('created_at', twoWeeksAgo.toISOString())
      .lt('created_at', oneWeekAgo.toISOString());

    if (previousError) throw previousError;

    // Calculate averages by animal type
    const trends: Map<string, PriceTrend> = new Map();

    // Process current week data
    const currentPrices: Map<string, number[]> = new Map();
    currentWeekData?.forEach((listing: any) => {
      const animalType = listing.animals?.type || 'unknown';
      if (!currentPrices.has(animalType)) {
        currentPrices.set(animalType, []);
      }
      currentPrices.get(animalType)!.push(listing.price);
    });

    // Process previous week data
    const previousPrices: Map<string, number[]> = new Map();
    previousWeekData?.forEach((listing: any) => {
      const animalType = listing.animals?.type || 'unknown';
      if (!previousPrices.has(animalType)) {
        previousPrices.set(animalType, []);
      }
      previousPrices.get(animalType)!.push(listing.price);
    });

    // Calculate trends
    currentPrices.forEach((prices, animalType) => {
      const currentAvg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const previousPricesForType = previousPrices.get(animalType) || [];
      const previousAvg = previousPricesForType.length > 0
        ? previousPricesForType.reduce((sum, p) => sum + p, 0) / previousPricesForType.length
        : currentAvg;

      const changePercentage = previousAvg > 0
        ? ((currentAvg - previousAvg) / previousAvg) * 100
        : 0;

      trends.set(animalType, {
        animal_type: animalType,
        current_avg_price: currentAvg,
        previous_avg_price: previousAvg,
        change_percentage: changePercentage,
        listing_count: prices.length,
      });
    });

    return Array.from(trends.values());
  } catch (error) {
    console.error('Error analyzing price changes:', error);
    return [];
  }
}

/**
 * Get competitive pricing recommendations for an animal type
 */
async function getCompetitivePricing(animalType: string): Promise<{
  min: number;
  max: number;
  avg: number;
  recommended: number;
}> {
  try {
    const { data, error } = await supabase
      .from('market_listings')
      .select('price')
      .eq('status', 'active')
      .eq('animals.type', animalType);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { min: 0, max: 0, avg: 0, recommended: 0 };
    }

    const prices = data.map(l => l.price).sort((a, b) => a - b);
    const min = prices[0];
    const max = prices[prices.length - 1];
    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    
    // Recommended price: slightly below average for competitive advantage
    const recommended = Math.round(avg * 0.95);

    return { min, max, avg, recommended };
  } catch (error) {
    console.error('Error getting competitive pricing:', error);
    return { min: 0, max: 0, avg: 0, recommended: 0 };
  }
}

/**
 * Find market opportunities by comparing user's animals with current market demand
 */
export async function findOpportunities(userId: string): Promise<MarketAlert[]> {
  try {
    // Get user's animals that are not currently listed
    const { data: userAnimals, error: animalsError } = await supabase
      .from('animals')
      .select('id, type, breed, status')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (animalsError) throw animalsError;

    if (!userAnimals || userAnimals.length === 0) {
      return [];
    }

    // Filter out animals already listed
    const { data: existingListings } = await supabase
      .from('market_listings')
      .select('animal_id')
      .eq('user_id', userId)
      .eq('status', 'active');

    const listedAnimalIds = new Set(existingListings?.map(l => l.animal_id) || []);
    const unlistedAnimals = userAnimals.filter(a => !listedAnimalIds.has(a.id));

    if (unlistedAnimals.length === 0) {
      return [];
    }

    // Get price trends to identify high-demand animal types
    const priceTrends = await analyzePriceChanges();
    
    // Filter for significant positive trends (>15% increase)
    const highDemandTypes = priceTrends
      .filter(trend => trend.change_percentage > 15)
      .map(trend => trend.animal_type);

    // Find opportunities
    const opportunities: MarketAlert[] = [];

    for (const animal of unlistedAnimals) {
      if (highDemandTypes.includes(animal.type)) {
        const trend = priceTrends.find(t => t.animal_type === animal.type);
        const pricing = await getCompetitivePricing(animal.type);
        
        if (trend && pricing.avg > 0) {
          opportunities.push({
            type: 'opportunity',
            title: '💰 Market Opportunity',
            message: `${animal.type} demand is high! Prices up ${trend.change_percentage.toFixed(1)}%. Recommended price: ${pricing.recommended} ETB`,
            price_data: {
              current: trend.current_avg_price,
              previous: trend.previous_avg_price,
              change_percentage: trend.change_percentage,
            },
          });
        }
      }
    }

    return opportunities;
  } catch (error) {
    console.error('Error finding opportunities:', error);
    return [];
  }
}

/**
 * Create opportunity alert notifications
 */
export async function createOpportunityAlerts(userId: string): Promise<void> {
  try {
    const opportunities = await findOpportunities(userId);
    
    for (const opportunity of opportunities) {
      await createNotification({
        type: 'market_alert',
        title: opportunity.title,
        message: opportunity.message,
        priority: 'medium',
        action_url: '/my-animals',
        metadata: {
          alert_type: 'opportunity',
          price_data: opportunity.price_data,
        },
      });
    }
  } catch (error) {
    console.error('Error creating opportunity alerts:', error);
  }
}

/**
 * Create price trend alert notifications
 */
export async function createPriceTrendAlerts(
  userId: string,
  priceChangeThreshold: number = 15
): Promise<void> {
  try {
    const priceTrends = await analyzePriceChanges();
    
    // Filter for significant changes (above threshold)
    const significantChanges = priceTrends.filter(
      trend => Math.abs(trend.change_percentage) >= priceChangeThreshold
    );

    for (const trend of significantChanges) {
      const direction = trend.change_percentage > 0 ? 'increased' : 'decreased';
      const emoji = trend.change_percentage > 0 ? '📈' : '📉';

      await createNotification({
        type: 'market_alert',
        title: `${emoji} Price Alert: ${trend.animal_type}`,
        message: `${trend.animal_type} prices ${direction} by ${Math.abs(trend.change_percentage).toFixed(1)}% this week`,
        priority: 'medium',
        action_url: '/marketplace',
        metadata: {
          alert_type: 'price_change',
          animal_type: trend.animal_type,
          price_data: {
            current: trend.current_avg_price,
            previous: trend.previous_avg_price,
            change_percentage: trend.change_percentage,
          },
          listing_count: trend.listing_count,
        },
      });
    }
  } catch (error) {
    console.error('Error creating price trend alerts:', error);
  }
}

/**
 * Create location-based alerts for new listings nearby
 */
export async function createLocationBasedAlerts(
  userId: string,
  userLocation?: { lat: number; lon: number },
  distanceThresholdKm: number = 50
): Promise<void> {
  try {
    const newListings = await detectNewListings(userLocation, distanceThresholdKm);

    for (const listing of newListings) {
      const animalType = listing.animals?.type || 'Animal';
      const distanceText = listing.distance
        ? ` (${listing.distance.toFixed(1)}km away)`
        : '';

      await createNotification({
        type: 'market_alert',
        title: 'New Listing Nearby',
        message: `${animalType} listed for ${listing.price} ETB${distanceText}`,
        priority: 'medium',
        action_url: `/listing/${listing.id}`,
        metadata: {
          alert_type: 'new_listing',
          listing_id: listing.id,
          animal_type: animalType,
          price: listing.price,
          distance_km: listing.distance,
          location: listing.location,
        },
      });
    }
  } catch (error) {
    console.error('Error creating location-based alerts:', error);
  }
}

/**
 * Background job to run daily market analysis and send alerts
 * This should be called by a scheduler (e.g., cron job, edge function)
 */
export async function runDailyMarketAnalysis(userId: string): Promise<void> {
  try {
    // Get user preferences
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('alert_preferences')
      .eq('user_id', userId)
      .single();

    const preferences = profile?.alert_preferences || {
      new_listings: true,
      price_changes: true,
      opportunities: true,
      distance_threshold_km: 50,
      price_change_threshold: 15,
    };

    // Detect new listings with location filtering
    if (preferences.new_listings) {
      // Get user location from profile if available
      const userLocation = profile?.location_coordinates
        ? {
            lat: profile.location_coordinates.lat,
            lon: profile.location_coordinates.lon,
          }
        : undefined;

      const distanceThreshold = preferences.distance_threshold_km || 50;

      await createLocationBasedAlerts(userId, userLocation, distanceThreshold);
    }

    // Analyze price changes
    if (preferences.price_changes) {
      const priceChangeThreshold = preferences.price_change_threshold || 15;
      await createPriceTrendAlerts(userId, priceChangeThreshold);
    }

    // Find opportunities
    if (preferences.opportunities) {
      await createOpportunityAlerts(userId);
    }
  } catch (error) {
    console.error('Error running daily market analysis:', error);
  }
}
