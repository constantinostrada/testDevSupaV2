# architecture

A structural/design choice: layers, module boundaries, where things live.

## Storage y UI separados: `js/storage.js` es la única puerta a los datos

**What** · `js/storage.js` expone el modelo, las categorías y el CRUD
(`listExpenses`, `addExpense`, `removeExpense`) más los helpers de monto y
fecha. `js/app.js` es solo render y eventos: nunca toca `localStorage` ni
`amountCents` directamente.
**Why** · Las funciones que siguen (alta rápida, lista por mes, resumen
mensual) van a sumar vistas sobre los mismos datos. Con la lectura y validación
en un solo lugar, cada vista nueva es UI y nada más, y la exportación a archivo
tiene un único punto del que colgarse.
**Where** · `js/storage.js`, `js/app.js`.
**Learned** · 2026-08-31.

## La UI actual es un andamio deliberado

**What** · El formulario desplegable y la lista plana de `js/app.js` existen
para que la base sea verificable de punta a punta, no como diseño final. Las
tareas de alta en dos toques, lista filtrable por mes y resumen mensual las
reemplazan.
**Why** · Evita que alguien más adelante trate esta UI como una decisión de
producto a preservar.
**Where** · `js/app.js` (comentario de cabecera).
**Learned** · 2026-08-31.
