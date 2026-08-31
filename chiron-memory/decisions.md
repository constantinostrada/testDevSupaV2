# decision

A technical decision that was made and WHY (which alternatives were discarded).

## Sin build, sin dependencias: HTML + CSS + JS vanilla con ES modules

**What** · La app son archivos estáticos servidos tal cual (`index.html`,
`styles.css`, `js/*.js` como ES modules nativos). No hay bundler, ni paso de
build, ni `package.json`.
**Why** · Es una app mono-usuario de pocas pantallas cuyo requisito duro es
abrir sin conexión. Sin bundle no hay hashes de assets que versionar en el
service worker: la lista de precache son las rutas reales de los archivos.
Se descartaron Vite+vanilla y Vite+React por sumar toolchain y complicar el
offline sin resolver ningún problema que la app tenga.
**Where** · Todo el repo; ver `README.md`.
**Learned** · 2026-08-31, al armar la base de la app.

## Los montos se guardan como enteros en centavos

**What** · Un gasto guarda `amountCents` (entero), no un float en pesos.
`parseAmount()` convierte lo tipeado a centavos y `formatAmount()` lo muestra;
la UI nunca manipula centavos a mano.
**Why** · El próximo trabajo es un resumen mensual, o sea sumar muchos montos.
Sumar floats arrastra error de punto flotante; sumar enteros no. También hace
el formato exportable sin ambigüedad.
**Where** · `js/storage.js`.
**Learned** · 2026-08-31.

## Las categorías por defecto viven en código, no en storage

**What** · `DEFAULT_CATEGORIES` es un array en `js/storage.js`; no se siembran
en `localStorage` en el primer arranque.
**Why** · Un dispositivo nuevo ya las tiene sin que el usuario cree nada
(criterio de aceptación), y agregar una categoría en el futuro no exige migrar
los datos guardados. Los gastos guardan solo el `categoryId`.
**Where** · `js/storage.js`; `getCategory()` cae a "Otros" ante un id
desconocido, para que un dato viejo nunca rompa el render.
**Learned** · 2026-08-31.
