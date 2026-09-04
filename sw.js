/**
 * Capa minima de cache para que la app abra y sea usable sin conexion.
 *
 * No hay backend: todo lo que se cachea son los archivos propios del app
 * shell. Los datos del usuario NO pasan por aca, viven en localStorage.
 *
 * Al tocar cualquier archivo de PRECACHE hay que subir CACHE_VERSION, si no
 * los dispositivos siguen sirviendo la version vieja desde el cache.
 */

const CACHE_VERSION = 'gastos-v2';

const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './js/app.js',
  './js/storage.js',
  './manifest.webmanifest',
  './icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

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

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Solo GET del mismo origen: no hay nada de terceros que valga la pena cachear.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // Navegaciones: la red primero para tomar una version nueva si hay, con el
  // index cacheado como red de contencion cuando no hay conexion.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html').then((r) => r || Response.error()))
    );
    return;
  }

  // Assets: cache primero, que es lo que hace la apertura offline instantanea.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => Response.error());
    })
  );
});
