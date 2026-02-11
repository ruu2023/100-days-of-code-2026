// sw.js
const CACHE_NAME = 'ai-news-v1';
const urlsToCache = [
  './index.html',
  './icon-192.png',
  './icon-512.png'
  // 他にCSSやJSファイルがあればここに追加します
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});