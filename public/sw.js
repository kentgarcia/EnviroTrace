
// Service Worker using Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Custom debug flag to help with development
const DEBUG = false;
const log = (...args) => DEBUG && console.log('[ServiceWorker]', ...args);

// Set up precaching for core app shell
workbox.precaching.precacheAndRoute([
  { url: '/', revision: '1' },
  { url: '/manifest.json', revision: '1' },
  { url: '/install-pwa', revision: '1' },
  { url: '/offline.html', revision: '1' }
]);

// Explicitly handle JavaScript files with appropriate MIME type
workbox.routing.registerRoute(
  ({ request, url }) => {
    return request.destination === 'script' || url.pathname.endsWith('.js');
  },
  new workbox.strategies.CacheFirst({
    cacheName: 'js-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
      {
        // Make sure JS files are returned with correct MIME type
        cacheWillUpdate: async ({ response }) => {
          if (!response.headers.get('Content-Type')?.includes('javascript')) {
            const clonedResponse = response.clone();
            const newHeaders = new Headers(clonedResponse.headers);
            newHeaders.set('Content-Type', 'application/javascript');
            return new Response(await clonedResponse.blob(), {
              status: clonedResponse.status,
              statusText: clonedResponse.statusText,
              headers: newHeaders
            });
          }
          return response;
        }
      }
    ],
  })
);

// Explicitly handle CSS files with appropriate MIME type
workbox.routing.registerRoute(
  ({ request, url }) => {
    return request.destination === 'style' || url.pathname.endsWith('.css');
  },
  new workbox.strategies.CacheFirst({
    cacheName: 'css-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
      {
        // Make sure CSS files are returned with correct MIME type
        cacheWillUpdate: async ({ response }) => {
          if (!response.headers.get('Content-Type')?.includes('css')) {
            const clonedResponse = response.clone();
            const newHeaders = new Headers(clonedResponse.headers);
            newHeaders.set('Content-Type', 'text/css');
            return new Response(await clonedResponse.blob(), {
              status: clonedResponse.status,
              statusText: clonedResponse.statusText,
              headers: newHeaders
            });
          }
          return response;
        }
      }
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

// Improved catch handler that respects MIME types
workbox.routing.setCatchHandler(async ({ request, event }) => {
  log('Catch handler for:', request.url, 'destination:', request.destination);
  
  // Check the request's destination/type and return appropriate error response
  switch (request.destination) {
    case 'document':
      // Return the offline page for document/navigation requests
      return caches.match('/offline.html');
      
    case 'image':
      // Return a placeholder image
      return caches.match('/placeholder.svg');
      
    case 'script':
    case 'style':
      // For scripts and styles, return a network error to prevent MIME type issues
      // This is important - do NOT return HTML for these types
      return Response.error();
      
    default:
      // For all other requests, also return an error
      return Response.error();
  }
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
