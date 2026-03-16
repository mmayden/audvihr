// Audwihr Service Worker — Phase 11 Alerts
// Scope: /
// No fetch handler — all API caching is handled by sessionStorage in the main thread.
// This SW exists to satisfy the browser requirement for push notification registration.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
