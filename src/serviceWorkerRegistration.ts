
// This is the service worker registration file

// Check if service workers are supported
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';
      
      // Add a cache-busting query parameter to ensure we get the latest version
      //const swUrlWithCacheBust = `${swUrl}?v=${Date.now()}`;
      
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          // Registration was successful
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          
          // Check for updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // At this point, the updated precached content has been fetched,
                  // but the previous service worker will still serve the older
                  // content until all client tabs are closed.
                  console.log('New content is available and will be used when all tabs for this page are closed.');
                  
                  // Execute callback if set
                  // if (window.confirm('New version available! Reload to update?')) {
                  //   window.location.reload();
                  // }
                } else {
                  // At this point, everything has been precached.
                  console.log('Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('Error during service worker registration:', error);
        });
      
      // Listen for controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated.');
      });
      
      // Check if we need to reload for an update
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'RELOAD_PAGE') {
          window.location.reload();
        }
      });
    });

    // Set up offline event handlers for the page
    window.addEventListener('online', () => {
      document.dispatchEvent(new CustomEvent('app-online', { detail: true }));
    });
    
    window.addEventListener('offline', () => {
      document.dispatchEvent(new CustomEvent('app-offline', { detail: false }));
    });
  }
};

export const unregisterServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
};

// Update service worker (force skip waiting)
export const updateServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }
};
