# architecture

A structural/design choice: layers, module boundaries, where things live.

## sw.js hace precache del app shell (index.html, styles.css, js/app.js, js/storage.js, mani…

What: sw.js hace precache del app shell (index.html, styles.css, js/app.js, js/storage.js, manifest.webmanifest, icon.svg) con estrategia cache-first para los assets propios, sin ningún prompt de instalación ni llamadas a servidor propio · Why: — · Where: sw.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-11 -->

## js/storage.js es la única puerta de acceso a los datos persistidos; js/app.js nunca toca…

What: js/storage.js es la única puerta de acceso a los datos persistidos; js/app.js nunca toca localStorage directamente · Why: mantener la capa de persistencia aislada y testeable, y dejar el terreno listo para futuras migraciones o cambios de storage · Where: js/storage.js, js/app.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-3 -->
