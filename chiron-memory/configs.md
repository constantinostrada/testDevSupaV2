# config

Setup and configuration — env vars, flags, how to run the project.

## El service worker (sw.js) exige HTTPS para funcionar; localhost está exceptuado pero abri…

What: El service worker (sw.js) exige HTTPS para funcionar; localhost está exceptuado pero abrir la app desde el celular contra una IP de LAN por HTTP plano no lo está — en ese caso la app funciona pero sin caché offline · Why: — · Where: README.md, sw.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-10 -->

## `sw.js`'s `CACHE_VERSION` constant must be bumped (e.g

What: `sw.js`'s `CACHE_VERSION` constant must be bumped (e.g. `gastos-v1` → `gastos-v2`) whenever cached app-shell files (index.html, styles.css, js/*.js) change. · Why: the service worker serves cache-first, so devices keep running stale JS/HTML after a deploy if the version string isn't bumped. · Where: sw.js. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-12 -->

## sw.js has a `CACHE_VERSION` constant (e.g

What: sw.js has a `CACHE_VERSION` constant (e.g. `gastos-v2` → `gastos-v3`) that must be bumped whenever any app-shell file (index.html, styles.css, js/app.js) changes. · Why: otherwise devices with the service worker installed keep serving the previously cached shell files indefinitely. · Where: sw.js. <!-- id: 653a9deb-e8b8-4e9a-87b5-be2d1ab48d56-3 -->
