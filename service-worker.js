const CACHE_NAME = 'firewatch-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  // URLs from importmap
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client',
  'https://esm.sh/@google/generative-ai',
  // Note: Prefixed imports like "react/" are harder to cache explicitly here without knowing all specific files.
  // The browser's HTTP cache will still work for these after the first load.
  // Caching the main entry points for react and react-dom should cover most cases.
  'https://esm.sh/react@^19.1.0/', // Base for react modules
  'https://esm.sh/react-dom@^19.1.0/' // Base for react-dom modules
];

// Install event: opens the cache and adds core assets to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching core assets');
        // Use addAll which fetches and caches.
        // It's atomic: if one file fails, the entire operation fails.
        return Promise.all(ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => {
            console.warn(`Failed to cache ${url}: ${err}`);
            // Optionally, decide if this failure is critical. For non-critical assets,
            // you might not want to fail the entire install.
            // For this basic setup, we'll let it try to cache all.
          });
        }));
      })
      .then(() => {
        console.log('Core assets cached successfully.');
      })
      .catch(error => {
        console.error('Cache open or core asset caching failed during install:', error);
      })
  );
});

// Activate event: cleans up old caches.
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
    }).then(() => {
        console.log('Service worker activated and old caches cleaned.');
        // Force the activated service worker to take control of the page immediately.
        return self.clients.claim();
    })
  );
});

// Fetch event: serves assets from cache if available, otherwise fetches from network.
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests (HTML pages), try network first, then cache.
  // This ensures users get the latest HTML if online, but can still access
  // the app offline if it was previously cached.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If response is valid, cache it and return it
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try to serve from cache
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || caches.match('/'); // Fallback to root if specific page not cached
          });
        })
    );
    return;
  }

  // For other requests (CSS, JS, images), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200) { // Removed type check for opaque responses from CDNs
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Only cache if it's one of our assets or from a trusted CDN.
                // This check helps prevent caching too much from third-party scripts like Google Maps.
                const url = new URL(event.request.url);
                if (ASSETS_TO_CACHE.includes(event.request.url) || 
                    ASSETS_TO_CACHE.includes(url.origin + url.pathname) || // For paths like '/'
                    url.hostname === 'cdn.tailwindcss.com' ||
                    url.hostname === 'esm.sh') {
                  cache.put(event.request, responseToCache);
                }
              });
            return networkResponse;
          }
        ).catch(error => {
          console.warn('Fetch failed; returning offline page instead.', error);
          // Optionally, return a custom offline fallback page or image here
          // For now, just let the browser handle the fetch error if not in cache.
        });
      })
  );
});

// Listen for messages from clients.
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
