/* Service worker : PWA installable + fonctionnement hors-ligne basique.

   Stratégies :
   - Navigation (HTML)      -> réseau d'abord (toujours la dernière version),
                               fallback cache si hors-ligne.
   - API météo (open-meteo) -> réseau d'abord, fallback cache.
   - Assets hashés (JS/CSS) -> cache d'abord (immuables car le hash change à
                               chaque build → l'index.html frais demande les bons).

   ⚠️ Le HTML DOIT être en réseau-d'abord : les noms de fichiers CSS/JS changent
   à chaque build (CSS Modules), donc un index.html périmé pointerait vers des
   assets qui n'existent plus → styles cassés. */

const CACHE_VERSION = 'meteo-v3';
const APP_SHELL = ['./', './index.html', './manifest.json', './icons/icon.svg'];

// Installation : on pré-cache l'app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting(); // active immédiatement le nouveau SW
});

// Activation : on supprime les anciens caches (dont meteo-v1).
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord, avec mise en cache de la réponse et fallback cache hors-ligne.
async function networkFirst(request, fallbackToShell = false) {
  try {
    const response = await fetch(request);
    const copy = response.clone();
    caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // En dernier recours pour une navigation hors-ligne : l'app shell.
    if (fallbackToShell) return caches.match('./index.html');
    throw new Error('Hors-ligne et aucune copie en cache.');
  }
}

// Cache d'abord, fallback réseau (pour les assets immuables).
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const copy = response.clone();
  caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isApi = url.hostname.endsWith('open-meteo.com');
  const isNavigation =
    request.mode === 'navigate' || request.destination === 'document';

  if (isNavigation) {
    // HTML : toujours frais quand on est en ligne.
    event.respondWith(networkFirst(request, true));
  } else if (isApi) {
    // API météo : réseau d'abord.
    event.respondWith(networkFirst(request));
  } else {
    // JS/CSS/icônes hashés : cache d'abord.
    event.respondWith(cacheFirst(request));
  }
});
