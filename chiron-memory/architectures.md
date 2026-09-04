# architecture

How the system is put together — layers, boundaries, and how data flows.

## `js/storage.js` is the sole gateway to `localStorage` for the expenses app (key `gastos.v…

What: `js/storage.js` is the sole gateway to `localStorage` for the expenses app (key `gastos.v1`); amounts are stored as integer cents. · Why: — · Where: js/storage.js. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-0 -->

## The monthly summary (total + per-category totals) is computed by deriving from `listExpen…

What: The monthly summary (total + per-category totals) is computed by deriving from `listExpenses()` fresh on every render, with no separate stored/cached aggregate. · Why: avoids a duplicated total that can drift out of sync with the underlying list; single source of truth. · Where: js/app.js. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-4 -->

## sw.js hace precache del app shell (index.html, styles.css, js/app.js, js/storage.js, mani…

What: sw.js hace precache del app shell (index.html, styles.css, js/app.js, js/storage.js, manifest.webmanifest, icon.svg) con estrategia cache-first para los assets propios, sin ningún prompt de instalación ni llamadas a servidor propio · Why: — · Where: sw.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-11 -->

## js/storage.js es la única puerta de acceso a los datos persistidos; js/app.js nunca toca…

What: js/storage.js es la única puerta de acceso a los datos persistidos; js/app.js nunca toca localStorage directamente · Why: mantener la capa de persistencia aislada y testeable, y dejar el terreno listo para futuras migraciones o cambios de storage · Where: js/storage.js, js/app.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-3 -->
