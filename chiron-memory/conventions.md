# convention

A rule the codebase follows — naming, patterns, and where things live.

## When adding the additive `deletedAt` field, `SCHEMA_VERSION` was bumped from 1 to 2 even…

What: When adding the additive `deletedAt` field, `SCHEMA_VERSION` was bumped from 1 to 2 even though old v1 data is still valid as-is (no migration needed). · Why: makes the shape change explicit in the data even when backward compatibility means no transform is required. · Where: js/storage.js. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-3 -->

## `updateExpense()` (editing monto/categoría) reuses the exact same `parseAmount()` functio…

What: `updateExpense()` (editing monto/categoría) reuses the exact same `parseAmount()` function and the same category validation against `DEFAULT_CATEGORIES` as the original expense-creation path, including identical error messages. · Why: edit and create must enforce identical validation rules per spec; sharing the code guarantees that instead of risking parallel logic drifting apart. · Where: js/storage.js. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-5 -->

## Deleting an expense applies immediately (no confirm dialog, per earlier project decision)…

What: Deleting an expense applies immediately (no confirm dialog, per earlier project decision) and shows a 5s 'Deshacer' undo toast; only one undo toast can be active at a time — deleting a second expense while a toast is showing closes/replaces the previous one. · Why: — · Where: js/app.js. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-7 -->

## js/storage.js expone una API pública mínima y cerrada: getCategories(), listExpenses(), a…

What: js/storage.js expone una API pública mínima y cerrada: getCategories(), listExpenses(), addExpense(), removeExpense() · Why: son las únicas funciones que js/app.js llama, reforzando que storage.js es la única puerta de acceso a los datos · Where: js/storage.js, js/app.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-12 -->

## parseAmount rechaza montos cero o negativos, exigiendo un monto mayor a cero, y ese error…

What: parseAmount rechaza montos cero o negativos, exigiendo un monto mayor a cero, y ese error se muestra tal cual al usuario ('Ingresá un monto mayor a cero.') · Why: — · Where: js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-13 -->

## El layout usa <meta viewport-fit=cover> junto con CSS env(safe-area-inset-*) para respeta…

What: El layout usa <meta viewport-fit=cover> junto con CSS env(safe-area-inset-*) para respetar el notch y el home indicator del celular · Why: — · Where: index.html, styles.css <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-14 -->

## Las acciones principales (abrir el formulario de alta, confirmar) quedan ancladas a la pa…

What: Las acciones principales (abrir el formulario de alta, confirmar) quedan ancladas a la parte inferior de la pantalla, en la zona del pulgar, con targets táctiles de al menos 48px · Why: — · Where: index.html, styles.css <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-15 -->

## styles.css soporta tema claro y oscuro automáticamente según preferencia del sistema, sin…

What: styles.css soporta tema claro y oscuro automáticamente según preferencia del sistema, sin selector manual en la UI · Why: — · Where: styles.css <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-16 -->

## El modelo de gasto es { id, amountCents, categoryId, date (YYYY-MM-DD local), createdAt }…

What: El modelo de gasto es { id, amountCents, categoryId, date (YYYY-MM-DD local), createdAt } y se persiste en localStorage bajo una clave versionada con schemaVersion (ej. 'gastos-v1', schemaVersion:1) · Why: permite migraciones futuras y una exportación a archivo sin romper datos ya cargados · Where: js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-4 -->

## Las categorías por defecto (comida, transporte, super, salidas, servicios, otros) están e…

What: Las categorías por defecto (comida, transporte, super, salidas, servicios, otros) están embebidas en código y disponibles desde el primer arranque, sin que el usuario tenga que crearlas · Why: — · Where: js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-5 -->

## La lectura de storage es defensiva: si el JSON está corrupto o el storage no está disponi…

What: La lectura de storage es defensiva: si el JSON está corrupto o el storage no está disponible, la app cae a estado vacío + aviso, nunca a pantalla en blanco · Why: — · Where: js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-6 -->

## The 'Deshacer' (undo) toast for a deleted expense is anchored visually above the composer…

What: The 'Deshacer' (undo) toast for a deleted expense is anchored visually above the composer (bottom input area), not elsewhere on screen. · Why: — · Where: js/app.js, styles.css. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-14 -->

## Each expense row in the list is a full-width `<button>` that opens edit on tap; the delet…

What: Each expense row in the list is a full-width `<button>` that opens edit on tap; the delete (✕) control is a separate 48×48px element placed outside that row button, not nested inside it. · Why: keeps 'open edit' and 'delete' as physically distinct tap targets so one can never be accidentally triggered instead of the other. · Where: js/app.js, styles.css. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-8 -->

## "Today" is defined via `todayISO()` in js/storage.js (device-local date as YYYY-MM-DD) —…

What: "Today" is defined via `todayISO()` in js/storage.js (device-local date as YYYY-MM-DD) — the same date source used by `currentMonthPrefix()` for month filtering. · Why: guarantees the day and month boundaries use one consistent local-date definition instead of two independently-computed dates that could drift. · Where: js/storage.js todayISO(), js/app.js renderSummary(). <!-- id: 653a9deb-e8b8-4e9a-87b5-be2d1ab48d56-1 -->

## All currency display in the UI goes through the single `formatAmount()` helper, reused as…

What: All currency display in the UI goes through the single `formatAmount()` helper, reused as-is for both the day and month totals. · Why: keeps formatting/decimals consistent across every money value shown, per the app's existing convention of one formatter for all amounts. · Where: js/app.js. <!-- id: 653a9deb-e8b8-4e9a-87b5-be2d1ab48d56-7 -->

## When a summary section's visible `<h2>` title is replaced by multiple labeled sub-blocks,…

What: When a summary section's visible `<h2>` title is replaced by multiple labeled sub-blocks, the section's accessible name moves from `aria-labelledby="summary-title"` to a direct `aria-label`, and any nested list that relied on that removed title for context (e.g. the category breakdown) needs its own explicit `aria-label` naming what it covers (the month). · Why: — · Where: index.html summary section. <!-- id: 653a9deb-e8b8-4e9a-87b5-be2d1ab48d56-8 -->
