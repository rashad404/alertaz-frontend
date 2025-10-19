// Service Worker for Alert.az Push Notifications

self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
    event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);

    let data = {};

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = {
                title: 'Alert.az Notification',
                body: event.data.text(),
            };
        }
    }

    const options = {
        body: data.body || 'You have a new alert',
        icon: data.icon || '/icon-192.png',
        badge: data.badge || '/badge-72.png',
        vibrate: data.vibrate || [200, 100, 200],
        timestamp: data.timestamp || Date.now(),
        tag: data.tag || 'alert-' + Date.now(),
        renotify: data.renotify !== false,
        silent: data.silent || false,
        requireInteraction: data.requireInteraction || false,
        data: data.data || {},
        actions: data.actions || [
            {
                action: 'view',
                title: 'View',
                icon: '/icons/view.png',
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/icons/dismiss.png',
            },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Alert.az', options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    const data = event.notification.data || {};
    let url = '/';

    if (event.action === 'view' && data.url) {
        url = data.url;
    } else if (data.alertId) {
        url = `/dashboard/alerts/${data.alertId}`;
    } else if (data.url) {
        url = data.url;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if there's already a window/tab open with our site
                for (let client of windowClients) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.navigate(url);
                        return client.focus();
                    }
                }
                // If no window is open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// Handle background sync for offline notifications
self.addEventListener('sync', (event) => {
    if (event.tag === 'alert-sync') {
        event.waitUntil(syncAlerts());
    }
});

async function syncAlerts() {
    try {
        // Fetch any pending alerts from the server
        const response = await fetch('/api/alerts/pending', {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (response.ok) {
            const alerts = await response.json();
            console.log('Synced alerts:', alerts);
        }
    } catch (error) {
        console.error('Failed to sync alerts:', error);
    }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-alerts') {
        event.waitUntil(checkForNewAlerts());
    }
});

async function checkForNewAlerts() {
    try {
        // Check for new alerts in the background
        const response = await fetch('/api/alerts/check', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (response.ok) {
            console.log('Background alert check completed');
        }
    } catch (error) {
        console.error('Background alert check failed:', error);
    }
}

// Cache management for offline support
const CACHE_NAME = 'alert-az-v1';
const urlsToCache = [
    '/',
    '/icon-192.png',
    '/icon-512.png',
    '/badge-72.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    // Only cache GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                return fetch(event.request).then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            // Only cache assets and images
                            if (event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
                                cache.put(event.request, responseToCache);
                            }
                        });

                    return response;
                });
            })
    );
});