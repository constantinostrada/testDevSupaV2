# config

Configuration knowledge: env vars, dependencies, build/deploy, where data lives.

## Los gastos viven en localStorage bajo `gastos.v1`, con schemaVersion

**What** · Única clave de persistencia: `gastos.v1`, con la forma
`{ schemaVersion: 1, expenses: [{ id, amountCents, categoryId, date, createdAt }] }`.
`date` es `YYYY-MM-DD` en horario local. No hay backend ni sincronización.
**Why** · El `schemaVersion` explícito deja lugar para la exportación a archivo
(pedida como trabajo futuro) y para migraciones, sin tener que adivinar el
formato de datos ya guardados en el teléfono del usuario.
**Where** · `js/storage.js` (`STORAGE_KEY`, `SCHEMA_VERSION`).
**Learned** · 2026-08-31.

## El service worker exige subir CACHE_VERSION al tocar cualquier archivo

**What** · `sw.js` precachea el app shell bajo el nombre de caché
`gastos-v1`. Si se edita un archivo de `PRECACHE` sin subir `CACHE_VERSION`,
los dispositivos siguen sirviendo la versión vieja indefinidamente.
**Why** · La estrategia de assets es cache-first, que es lo que hace que la app
abra instantánea y sin conexión; el precio es que el cache no se invalida solo.
**Where** · `sw.js`.
**Learned** · 2026-08-31.
