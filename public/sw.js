
// Service Worker using Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Custom debug flag to help with development
const DEBUG = false;
const log = (...args) => DEBUG && console.log('[ServiceWorker]', ...args);

// Set up precaching for core app shell
workbox.precaching.precacheAndRoute([
  { url: '/', revision: '1' },
  //{ url: '/index.html', revision: '1' },
  { url: '/manifest.json', revision: '1' },
  { url: '/install-pwa', revision: '1' },
  { url: '/offline.html', revision: '1' }
]);

// Cache CSS, JS, and Web Worker requests with a Cache First strategy
workbox.routing.registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
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

// Specific file extension matching for JS and CSS files (in case destination isn't enough)
workbox.routing.registerRoute(
  ({ url }) => url.pathname.endsWith('.js') || url.pathname.endsWith('.css'),
  new workbox.strategies.CacheFirst({
    cacheName: 'static-assets-extensions',
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

// Fallback for navigation requests - but NOT for static assets
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

// Custom catch handler that respects MIME types
workbox.routing.setCatchHandler(({ event, request }) => {
  log('Catch handler for:', request.url, 'destination:', request.destination);
  
  // Don't try to return HTML for JS/CSS requests
  if (request.destination === 'script') {
    return Response.error();
  }
  
  if (request.destination === 'style') {
    return Response.error();
  }
  
  // For navigation requests, return the offline page
  if (request.mode === 'navigate') {
    return caches.match('/offline.html');
  }
  
  // Check the file extension as a fallback
  const url = new URL(request.url);
  if (url.pathname.endsWith('.js')) {
    return Response.error();
  }
  
  if (url.pathname.endsWith('.css')) {
    return Response.error();
  }
  
  // For other requests, just return an error
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

// Remove the custom fetch handler that was causing issues
// The Workbox routing system will handle most cases automatically
