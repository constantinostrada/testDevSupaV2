# config

Setup and configuration — env vars, flags, how to run the project.

## El service worker (sw.js) exige HTTPS para funcionar; localhost está exceptuado pero abri…

What: El service worker (sw.js) exige HTTPS para funcionar; localhost está exceptuado pero abrir la app desde el celular contra una IP de LAN por HTTP plano no lo está — en ese caso la app funciona pero sin caché offline · Why: — · Where: README.md, sw.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-10 -->

## `sw.js`'s `CACHE_VERSION` constant must be bumped (e.g

What: `sw.js`'s `CACHE_VERSION` constant must be bumped (e.g. `gastos-v1` → `gastos-v2`) whenever cached app-shell files (index.html, styles.css, js/*.js) change. · Why: the service worker serves cache-first, so devices keep running stale JS/HTML after a deploy if the version string isn't bumped. · Where: sw.js. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-12 -->

## Cada vez que cambia algún archivo listado en PRECACHE del service worker hay que subir ma…

What: Cada vez que cambia algún archivo listado en PRECACHE del service worker hay que subir manualmente el valor de `CACHE_VERSION` en sw.js (ej. de 'gastos-v3' a 'gastos-v4'). · Why: si no se sube, los dispositivos que ya cachearon la app siguen sirviendo la versión vieja del shell aunque el código fuente haya cambiado. · Where: sw.js. <!-- id: ca111ac1-4681-445a-9a27-42fcd0cb24b7-6 -->

## El proyecto no tiene tests automatizados ni build; la verificación de cambios se hace man…

What: El proyecto no tiene tests automatizados ni build; la verificación de cambios se hace manualmente sirviendo los archivos con un servidor HTTP local con `Cache-Control: no-store` y con el service worker desregistrado antes de probar en el navegador. · Why: sin este paso el caché del service worker o del navegador puede seguir mostrando el shell viejo aunque el código fuente ya haya cambiado, dando falsos negativos/positivos en la verificación. <!-- id: ca111ac1-4681-445a-9a27-42fcd0cb24b7-10 -->
