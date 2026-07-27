// Service worker for "The Line" — caches the app shell so it opens instantly
// and works offline once it's been loaded at least once.
// Place this file (sw.js) in the SAME folder as index.html when you host it.

const CACHE_NAME = 'the-line-v9';
const APP_SHELL = [
  './',
  './index.html',
  './recipes.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL).catch(function () {
        // If a file is named differently, caching still proceeds for what matches.
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

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);

  // recipes.json is the source of truth: always try the network first so a
  // freshly committed edit shows up immediately, but fall back to whatever's
  // cached (from the last successful load) when there's no signal.
  if (url.pathname.endsWith('/recipes.json')) {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
          }
          return response;
        })
        .catch(function () { return caches.match(event.request); })
    );
    return;
  }

  // Everything else (app shell: HTML/CSS/JS) rarely changes -- cache-first so
  // it opens instantly, falling back to network, then to the cached page itself.
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
