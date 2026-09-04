# architecture

A structural/design choice: layers, module boundaries, where things live.

## sw.js hace precache del app shell (index.html, styles.css, js/app.js, js/storage.js, mani…

What: sw.js hace precache del app shell (index.html, styles.css, js/app.js, js/storage.js, manifest.webmanifest, icon.svg) con estrategia cache-first para los assets propios, sin ningún prompt de instalación ni llamadas a servidor propio · Why: — · Where: sw.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-11 -->

## js/storage.js es la única puerta de acceso a los datos persistidos; js/app.js nunca toca…

What: js/storage.js es la única puerta de acceso a los datos persistidos; js/app.js nunca toca localStorage directamente · Why: mantener la capa de persistencia aislada y testeable, y dejar el terreno listo para futuras migraciones o cambios de storage · Where: js/storage.js, js/app.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-3 -->

## El resumen del mes es una cuenta derivada, no un estado guardado

**What** · `render()` en `js/app.js` llama una sola vez a `listExpenses()` y
de ahi salen tanto la lista como el total del mes y los totales por
categoria. No hay totales persistidos ni cacheados.
**Why** · Es lo que hace imposible que editar o borrar un gasto deje el
resumen desfasado: no hay dos fuentes que puedan discrepar. Con montos en
centavos enteros la suma es exacta, asi que recalcular no cuesta precision.
**Where** · `js/app.js` (`render`, `renderSummary`).
**Learned** · 2026-09-04.

## Toda escritura pasa por `patchExpense`, que solo toca el store si el write sale bien

**What** · `updateExpense`, `deleteExpense` y `restoreExpense` delegan en
`patchExpense(id, mutate)`: lee el store, arma la version nueva sobre una
copia y recien ahi escribe. Si `writeStore` lanza, se propaga el error y no
queda nada a medias.
**Why** · Es lo que sostiene "si la persistencia falla, el gasto queda en su
estado anterior, nunca en un estado intermedio". Como cada operacion relee el
store desde cero, tampoco hay copia en memoria que revertir.
**Where** · `js/storage.js` (`patchExpense`).
**Learned** · 2026-09-04.
