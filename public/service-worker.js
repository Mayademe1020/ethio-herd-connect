// Ethio Herd Connect Service Worker
// Optimized for intermittent connectivity in rural Ethiopia

const CACHE_NAME = 'ethio-herd-connect-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/js/vendor-core-[hash].js',
  '/assets/js/vendor-ui-[hash].js',
  '/assets/css/main.css',
  '/assets/fonts/amharic-font.woff2',
  '/assets/fonts/oromo-font.woff2',
  '/assets/images/logo.svg',
  '/manifest.json'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to determine if a request is an API call
const isApiRequest = (url) => {
  return url.includes('/api/');
};

// Helper to determine if a request is for an image
const isImageRequest = (url) => {
  return url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i);
};

// Helper to determine if a request is for a static asset
const isStaticAsset = (url) => {
  return url.match(/\.(css|js|woff2|json)$/i);
};

// Fetch event - network first for API, cache first for static assets
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Clone the request to ensure it's safe to read when
  // adding to cache later
  const requestClone = event.request.clone();
  
  // Different strategies based on request type
  if (isApiRequest(event.request.url)) {
    // Network first strategy for API calls with offline fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If valid response, clone it and store in cache
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              // Cache API responses with a 15-minute expiration
              const headers = new Headers(responseClone.headers);
              headers.append('sw-fetched-on', new Date().getTime().toString());
              
              // Only cache GET requests
              if (event.request.method === 'GET') {
                cache.put(event.request, responseClone);
              }
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                // Check if cached response is too old (15 minutes)
                const fetchedOn = cachedResponse.headers.get('sw-fetched-on');
                if (fetchedOn) {
                  const age = new Date().getTime() - parseInt(fetchedOn);
                  if (age < 15 * 60 * 1000) { // 15 minutes in milliseconds
                    return cachedResponse;
                  }
                } else {
                  return cachedResponse;
                }
              }
              
              // If no cached response, return offline JSON for API
              return new Response(
                JSON.stringify({ 
                  error: 'You are offline',
                  offline: true,
                  timestamp: new Date().toISOString()
                }),
                { 
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
  } 
  else if (isImageRequest(event.request.url)) {
    // Cache first for images, but update cache if online
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              // Update cache with new response
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, networkResponse.clone()));
              return networkResponse;
            })
            .catch(() => {
              // If fetch fails and we have no cache, return fallback image
              if (!cachedResponse) {
                return caches.match('/assets/images/image-placeholder.svg');
              }
              return cachedResponse;
            });
          
          // Return cached response immediately if available, otherwise wait for network
          return cachedResponse || fetchPromise;
        })
    );
  }
  else if (isStaticAsset(event.request.url)) {
    // Cache first strategy for static assets
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          return cachedResponse || fetch(event.request)
            .then(response => {
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, response.clone());
                  return response;
                });
            })
            .catch(() => {
              // If both cache and network fail for HTML, show offline page
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match(OFFLINE_URL);
              }
            });
        })
    );
  }
  else {
    // Network first with cache fallback for everything else
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the response if it's valid
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              // Return cached response or offline page for HTML
              if (cachedResponse) {
                return cachedResponse;
              }
              
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match(OFFLINE_URL);
              }
              
              // For other resources, return a simple offline response
              return new Response('Offline content unavailable', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
        })
    );
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-animal-data') {
    event.waitUntil(syncAnimalData());
  } else if (event.tag === 'sync-marketplace-listing') {
    event.waitUntil(syncMarketplaceListings());
  }
});

// Handle background sync for animal data
async function syncAnimalData() {
  try {
    const db = await openIndexedDB();
    const pendingRecords = await db.getAll('pendingAnimalUpdates');
    
    for (const record of pendingRecords) {
      try {
        const response = await fetch('/api/animals/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(record.data)
        });
        
        if (response.ok) {
          await db.delete('pendingAnimalUpdates', record.id);
        }
      } catch (error) {
        console.error('Failed to sync animal data:', error);
      }
    }
  } catch (error) {
    console.error('Error in syncAnimalData:', error);
  }
}

// Handle background sync for marketplace listings
async function syncMarketplaceListings() {
  try {
    const db = await openIndexedDB();
    const pendingListings = await db.getAll('pendingMarketplaceListings');
    
    for (const listing of pendingListings) {
      try {
        const response = await fetch('/api/marketplace/listings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(listing.data)
        });
        
        if (response.ok) {
          await db.delete('pendingMarketplaceListings', listing.id);
        }
      } catch (error) {
        console.error('Failed to sync marketplace listing:', error);
      }
    }
  } catch (error) {
    console.error('Error in syncMarketplaceListings:', error);
  }
}

// Helper function to open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ethioHerdConnectDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingAnimalUpdates')) {
        db.createObjectStore('pendingAnimalUpdates', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('pendingMarketplaceListings')) {
        db.createObjectStore('pendingMarketplaceListings', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Push notification event handler
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        const url = event.notification.data.url;
        
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window/tab is open or URL doesn't match, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});