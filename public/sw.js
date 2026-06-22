/* Service worker basique : cache de l'app shell + stratégie réseau-d'abord pour l'API.
   Objectif portfolio : démontrer une PWA installable et fonctionnelle hors-ligne. */

const CACHE_VERSION = 'meteo-v1';
const APP_SHELL = ['./', './index.html', './manifest.json', './icons/icon.svg'];

// Installation : on pré-cache l'app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting(); // active immédiatement le nouveau SW
});

// Activation : on supprime les anciens caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

// Interception des requêtes.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // On ne gère que le GET.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isApi = url.hostname.endsWith('open-meteo.com');

  if (isApi) {
    // API météo : réseau d'abord, puis fallback cache si hors-ligne.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // App shell / assets : cache d'abord, puis réseau.
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});
