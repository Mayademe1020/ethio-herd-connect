// Service Worker for Ethio Herd Connect v2
// Optimized for Ethiopian farmers with stale-while-revalidate caching

const CACHE_NAME = 'ethio-herd-v2';
const STATIC_CACHE = 'ethio-herd-static-v2';
const DYNAMIC_CACHE = 'ethio-herd-dynamic-v2';
const API_CACHE = 'ethio-herd-api-v2';
const ML_MODEL_CACHE = 'ethio-herd-ml-v2';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// Critical resources to preload - cache ALL JS for offline
const CRITICAL_RESOURCES = [
  '/index.html',
  '/assets/js/index-',  // Main bundle
  '/assets/js/Login',
  '/assets/js/Auth',
  '/assets/css/index'
];

// API endpoints with stale-while-revalidate strategy
const SWR_API_PATTERNS = [
  { pattern: /\/rest\/v1\/animals\?.*select=/, maxAge: 5 * 60 * 1000 }, // 5 minutes
  { pattern: /\/rest\/v1\/milk_production/, maxAge: 2 * 60 * 1000 }, // 2 minutes
  { pattern: /\/rest\/v1\/health_records/, maxAge: 5 * 60 * 1000 },
  { pattern: /\/rest\/v1\/farm_profiles/, maxAge: 30 * 60 * 1000 }, // 30 minutes
  { pattern: /\/rest\/v1\/profiles/, maxAge: 30 * 60 * 1000 },
  { pattern: /\/rest\/v1\/reminders/, maxAge: 10 * 60 * 1000 },
  { pattern: /\/rest\/v1\/market_listings.*status=eq.active/, maxAge: 10 * 60 * 1000 },
  { pattern: /\/rest\/v1\/feed_ingredients/, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  { pattern: /\/rest\/v1\/ilri_rations/, maxAge: 24 * 60 * 60 * 1000 }
];

// Cache-only patterns (reference data)
const CACHE_FIRST_PATTERNS = [
  /\/rest\/v1\/feed_ingredients/,
  /\/rest\/v1\/ilri_rations/,
  /\.json$/,  // JSON config files
  /manifest\.json/
];

// Network-first patterns (time-sensitive data)
const NETWORK_FIRST_PATTERNS = [
  /\/rest\/v1\/notifications/,
  /\/rest\/v1\/analytics_events/,
  /\/functions\/v1\/muzzle-inference/
];

// Install event - cache static assets and preload critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => preloadCriticalResources())
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => 
            cacheName.startsWith('ethio-herd-') && 
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== API_CACHE &&
            cacheName !== ML_MODEL_CACHE
          )
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Preload critical resources
async function preloadCriticalResources() {
  const cache = await caches.open(STATIC_CACHE);
  const preloadPromises = CRITICAL_RESOURCES.map(async (resource) => {
    try {
      const response = await fetch(resource, { mode: 'no-cors' });
      if (response.ok || response.type === 'opaque') {
        await cache.put(resource, response);
      }
    } catch (error) {
      console.log('Failed to preload:', resource);
    }
  });
  await Promise.all(preloadPromises);
}

// Main fetch handler with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin requests
  if (request.method !== 'GET' || !url.href.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests with stale-while-revalidate
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request, url));
    return;
  }

  // Handle static assets
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Default: network with cache fallback
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Check if request is an API call
function isAPIRequest(url) {
  return url.pathname.includes('/rest/v1/') || 
         url.pathname.includes('/functions/v1/');
}

// Check if request is a static asset
function isStaticAsset(url) {
  return url.pathname.startsWith('/assets/') ||
         STATIC_ASSETS.includes(url.pathname) ||
         url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2)$/);
}

// Stale-While-Revalidate strategy for API requests
async function handleAPIRequest(request, url) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Find max age for this endpoint
  const swrConfig = SWR_API_PATTERNS.find(cfg => cfg.pattern.test(url.href));
  const maxAge = swrConfig ? swrConfig.maxAge : 5 * 60 * 1000; // Default 5 min

  // Check if cache is fresh
  if (cachedResponse) {
    const cachedTime = new Date(cachedResponse.headers.get('sw-cached-at') || 0).getTime();
    const isFresh = Date.now() - cachedTime < maxAge;
    
    if (isFresh) {
      // Return cached response immediately
      return cachedResponse;
    }
    
    // Stale - return cached but fetch in background
    fetchAndCache(request, cache);
    return cachedResponse;
  }

  // No cache - fetch and store
  try {
    return await fetchAndCache(request, cache);
  } catch (error) {
    // Return offline response for API
    return new Response(
      JSON.stringify({
        error: 'Offline - data unavailable',
        offline: true,
        cached: false,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Fetch and cache response
async function fetchAndCache(request, cache) {
  const response = await fetch(request);
  
  if (response.ok) {
    const responseClone = response.clone();
    const headers = new Headers(responseClone.headers);
    headers.set('sw-cached-at', new Date().toISOString());
    
    const cachedResponse = new Response(responseClone.body, {
      status: responseClone.status,
      statusText: responseClone.statusText,
      headers
    });
    
    await cache.put(request, cachedResponse);
  }
  
  return response;
}

// Handle static asset requests
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('/offline.html');
    }
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Background sync triggered');
  // Clean up expired cache entries
  await cleanupExpiredCaches();
}

// Clean up expired cache entries
async function cleanupExpiredCaches() {
  const now = Date.now();
  const apiCache = await caches.open(API_CACHE);
  const keys = await apiCache.keys();
  
  for (const request of keys) {
    const response = await apiCache.match(request);
    if (response) {
      const cachedTime = new Date(response.headers.get('sw-cached-at') || 0).getTime();
      // Remove entries older than 24 hours
      if (now - cachedTime > 24 * 60 * 60 * 1000) {
        await apiCache.delete(request);
      }
    }
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEANUP_CACHES') {
    event.waitUntil(cleanupExpiredCaches());
  }
});
