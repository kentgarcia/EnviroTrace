
// Service Worker using Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Custom debug flag to help with development
const DEBUG = false;
const log = (...args) => DEBUG && console.log('[ServiceWorker]', ...args);

// Set up precaching
workbox.precaching.precacheAndRoute([
  { url: '/', revision: '1' },
  { url: '/index.html', revision: '1' },
  { url: '/manifest.json', revision: '1' },
  { url: '/install-pwa', revision: '1' },
  { url: '/offline.html', revision: '1' }
]);

// Cache CSS, JS, and Web Worker requests with a Cache First strategy
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'style' ||
                  request.destination === 'script' ||
                  request.destination === 'worker',
  new workbox.strategies.CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Cache fonts with a Cache First strategy - fonts rarely change
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'font',
  new workbox.strategies.CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 Days
      }),
    ],
  })
);

// Cache images with a Cache First strategy
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Cache specifically user roles API with a Network First strategy with backup
workbox.routing.registerRoute(
  new RegExp('/rest/v1/user_roles.*'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'user-roles-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
      {
        // Custom plugin to save API responses to localStorage
        cacheDidUpdate: async ({ cacheName, request, response }) => {
          try {
            if (response && response.status === 200) {
              const clonedResponse = response.clone();
              const data = await clonedResponse.json();
              const timestamp = Date.now();
              localStorage.setItem('cached_user_roles', JSON.stringify({
                data,
                timestamp
              }));
              log('User roles cached in localStorage');
            }
          } catch (error) {
            console.error('Error saving to localStorage:', error);
          }
        }
      }
    ],
    networkTimeoutSeconds: 3, // If network takes more than 3 seconds, use cached data
  })
);

// Cache other API requests
workbox.routing.registerRoute(
  new RegExp('/rest/v1/.*'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
    networkTimeoutSeconds: 5,
  })
);

// Fallback for navigation requests
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'navigation',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// Handle offline fallback
workbox.routing.setCatchHandler(({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});

// Listen for online/offline status changes
self.addEventListener('online', () => {
  log('App is online, syncing data');
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({
      type: 'ONLINE_STATUS_CHANGE',
      payload: { isOnline: true }
    }));
  });
});

self.addEventListener('offline', () => {
  log('App is offline');
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({
      type: 'ONLINE_STATUS_CHANGE',
      payload: { isOnline: false }
    }));
  });
});

// Skip waiting so the service worker activates quickly
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Add a custom fetch handler to support SPA navigation
// This ensures that navigations to routes like /install-pwa work offline
self.addEventListener('fetch', event => {
  // Let Workbox handle most requests
  if (!event.request.url.includes(self.location.origin) || 
      !event.request.url.endsWith('/') && 
      !event.request.url.includes('.') && 
      event.request.url.startsWith(self.location.origin)) {
    
    // For SPA navigation to routes that don't have file extensions
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).catch(() => {
          return caches.match('/index.html');
        });
      })
    );
  }
});
