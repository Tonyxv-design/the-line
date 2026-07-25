// Service worker for "The Line" — caches the app shell so it opens instantly
// and works offline once it's been loaded at least once.
// Place this file (sw.js) in the SAME folder as index.html (the-line.html) when you host it.

const CACHE_NAME = 'the-line-v4';
const APP_SHELL = [
  './',
  './index.html'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL).catch(function () {
        // If index.html is named differently, caching still proceeds for what matches.
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Cache-first for same-origin GET requests, falling back to network, then to
// whatever's cached for the page itself if fully offline.
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request)
        .then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
          }
          return response;
        })
        .catch(function () {
          return caches.match('./index.html');
        });
    })
  );
});
