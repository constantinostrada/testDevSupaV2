# architecture

How the system is put together — layers, boundaries, and how data flows.

## Las dos vistas se pintan siempre en el mismo `render()`; cambiar de pestaña solo alterna `hidden`

What: `render()` pinta la vista Gastos (totales + lista) y la vista Resumen (`renderReport()`) en cada llamada, a partir del mismo `listExpenses()`; `renderNav()` solo decide cuál sección se ve. · Why: el resumen ya está al día cuando aparece y nunca puede mostrar un total distinto al de la lista; el rollover de mes sale gratis del mismo timer de medianoche + recheck en focus/visibilitychange que ya existía para "Hoy". · Where: js/app.js render(), renderReport(), renderNav().

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

## El total del día y el total del mes se derivan los dos del mismo `listExpenses()` dentro…

What: El total del día y el total del mes se derivan los dos del mismo `listExpenses()` dentro de `renderSummary()`, en cada render, sin agregados guardados; "hoy" se define comparando `expense.date` con `todayISO()` (fecha local del dispositivo, el mismo criterio con el que se guarda la fecha del gasto). · Why: alta, edición y baja ya pasan todas por `render()`, así que los dos totales se actualizan al instante sin ningún estado extra que pueda quedar desfasado. · Where: js/app.js. <!-- id: af8afe85-caa3-40b6-b28e-990e529f7dc8-0 -->

## La navegación principal entre las vistas Gastos y Resumen se resuelve por `location.hash`…

What: La navegación principal entre las vistas Gastos y Resumen se resuelve por `location.hash` (`#gastos` / `#resumen`), no por estado JS en memoria. · Why: así el botón atrás del navegador y una recarga de página respetan la vista actual, sin lógica adicional de historial. · Where: index.html (tabs), js/app.js (listener de hashchange). <!-- id: ca111ac1-4681-445a-9a27-42fcd0cb24b7-2 -->

## El desglose por categoría se sacó de la tarjeta "Hoy / Este mes" de la vista Gastos y se…

What: El desglose por categoría se sacó de la tarjeta "Hoy / Este mes" de la vista Gastos y se movió íntegramente a la nueva vista Resumen, sin duplicarlo en ambas. · Why: evitar dos fuentes visuales del mismo dato en pantallas distintas; la tarjeta de Gastos queda solo con los dos totales (hoy/mes). <!-- id: ca111ac1-4681-445a-9a27-42fcd0cb24b7-3 -->

## El cambio de período (fin de mes) en la vista Resumen reutiliza el mecanismo ya existente…

What: El cambio de período (fin de mes) en la vista Resumen reutiliza el mecanismo ya existente de re-render a medianoche más el chequeo en `visibilitychange`/`focus`, en vez de un temporizador o lógica nueva. · Why: el cambio de mes es un caso particular del mismo cambio de día que ya disparaba el re-render de la tarjeta "Hoy/Este mes"; reutilizarlo evita duplicar lógica de reloj/foco. <!-- id: ca111ac1-4681-445a-9a27-42fcd0cb24b7-5 -->

## El botón fijo "+ Nuevo gasto" permanece visible y funcional en ambas vistas (Gastos y Res…

What: El botón fijo "+ Nuevo gasto" permanece visible y funcional en ambas vistas (Gastos y Resumen), no solo en la vista Gastos. · Why: alta rápida de un gasto disponible desde cualquier pantalla, incluida la de análisis, sin tener que volver a la lista primero. <!-- id: ca111ac1-4681-445a-9a27-42fcd0cb24b7-13 -->
