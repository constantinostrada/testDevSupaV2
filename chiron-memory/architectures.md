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

## `renderSummary()` (js/app.js) computes both the daily and monthly totals by filtering/red…

What: `renderSummary()` (js/app.js) computes both the daily and monthly totals by filtering/reducing the full result of `listExpenses()` on every render, with no separate stored/cached total state. · Why: since every render already re-derives the month total from scratch, adding a same-render filter for the day total makes add/edit/delete update both totals instantly for free, with no extra state to keep in sync. · Where: js/app.js renderSummary(). <!-- id: 653a9deb-e8b8-4e9a-87b5-be2d1ab48d56-0 -->

## Deleting an expense shows a toast with an undo ("Deshacer") action that restores the dele…

What: Deleting an expense shows a toast with an undo ("Deshacer") action that restores the deleted expense if tapped, rather than requiring a confirmation step before deletion. · Why: gives users a fast recovery path after an accidental delete; confirmed by manual testing during this session (delete then undo both worked and both totals reverted correctly). · Where: js/app.js delete flow. <!-- id: 653a9deb-e8b8-4e9a-87b5-be2d1ab48d56-9 -->

## Las dos vistas se pintan siempre en el mismo `render()`; cambiar de pestaña solo alterna `hidden`

What: `render()` pinta la vista Gastos (totales + lista) y la vista Resumen (`renderReport()`) en cada llamada, a partir del mismo `listExpenses()`; `renderNav()` solo decide cuál sección se ve. · Why: el resumen ya está al día cuando aparece y nunca puede mostrar un total distinto al de la lista; el rollover de mes sale gratis del mismo timer de medianoche + recheck en focus/visibilitychange que ya existía para "Hoy". · Where: js/app.js render(), renderReport(), renderNav().
