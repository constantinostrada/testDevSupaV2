# contradiction

Something that contradicts or supersedes a previous decision/approach.

## `removeExpense()` ya no existe: la API de storage crecio

**What** · La API publica de `js/storage.js` era `getCategories()`,
`listExpenses()`, `addExpense()`, `removeExpense()`. `removeExpense()` (borrado
fisico) fue reemplazada por `updateExpense()`, `deleteExpense()` (baja logica) y
`restoreExpense()`. Sigue valiendo que `storage.js` es la unica puerta a los
datos y que la API es cerrada; lo que cambio es su contenido.
**Why** · Editar monto/categoria y deshacer un borrado necesitan operaciones
que el borrado fisico no podia dar.
**Where** · `js/storage.js`, `js/app.js`.
**Learned** · 2026-09-04.

## El store pasa a `schemaVersion: 2`

**What** · La clave sigue siendo `gastos.v1`, pero el contenido se escribe con
`schemaVersion: 2`. v2 agrega el campo opcional `deletedAt` al gasto. Es
aditivo: un store v1 se lee como v2 sin transformar, no hay migracion.
**Why** · El numero deja explicito el cambio de forma, aunque no haya codigo
de migracion que correr.
**Where** · `js/storage.js` (`SCHEMA_VERSION`).
**Learned** · 2026-09-04.
