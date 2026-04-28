/**
 * Centralized Route Configuration
 * Single source of truth for all application routes
 * 
 * Usage: import { ROUTES } from '@/config/routes';
 *        <Link to={ROUTES.ANIMALS}>My Animals</Link>
 */

export const ROUTES = {
  // Public routes
  AUTH: '/auth',
  LOGIN: '/login',
  ADMIN_LOGIN: '/admin/login',

  // Home
  HOME: '/',
  
  // Animal Management
  ANIMALS: '/animals',
  ANIMALS_REGISTER: '/animals/register',
  ANIMALS_DETAIL: (id: string) => `/animals/${id}`,
  
  // Animal Identification
  IDENTIFY: '/identify',
  
  // Milk Production
  MILK_RECORD: '/milk/record',
  MILK_RECORDS: '/milk/records',
  MILK_ANALYTICS: '/milk/analytics',
  MILK_SUMMARY: '/milk/summary',
  
  // Marketplace
  MARKETPLACE: '/marketplace',
  MARKETPLACE_PUBLIC: '/marketplace/public',
  MARKETPLACE_CREATE: '/marketplace/create',
  MARKETPLACE_MY_LISTINGS: '/marketplace/listings',
  MARKETPLACE_LISTING_DETAIL: (id: string) => `/marketplace/listings/${id}`,
  MARKETPLACE_INTERESTS: '/marketplace/interests',
  
  // User
  PROFILE: '/profile',
  FAVORITES: '/favorites',
  SYNC: '/sync',
  SETTINGS: '/settings',
  
  // Onboarding
  ONBOARDING: '/onboarding',
  
  // Admin
  ADMIN: '/admin',
  ADMIN_ANALYTICS: '/admin/analytics',
  
  // Legacy/Other
  HOME_SIMPLE: '/home',
} as const;

// Legacy route aliases for backward compatibility
export const LEGACY_ROUTES = {
  RECORD_MILK: '/milk/record',
  REGISTER_ANIMAL: '/animals/register',
  MY_ANIMALS: '/animals',
  HEALTH_RECORDS: '/health-records',
  BREEDING_RECORDS: '/breeding-records',
} as const;

export type RouteKey = keyof typeof ROUTES;