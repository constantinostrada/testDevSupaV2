# convention

A rule the codebase follows — naming, patterns, and where things live.

## El color de una categoría en el Resumen es fijo por id (`--cat-<id>`), nunca por puesto en el ranking

What: Cada categoría tiene su custom property `--cat-<id>` en :root (con pasos distintos para tema claro y oscuro) y el JS pinta `var(--cat-${id}, var(--cat-fallback))`; "Sin categoría" es gris a propósito. · Why: el color sigue a la entidad, no al puesto: la misma categoría se ve igual aunque cambie de lugar de un mes a otro; al agregar una categoría en storage.js hay que agregar su token en styles.css o cae al gris de fallback. · Where: styles.css :root, js/app.js renderReport().

## Un gasto sin categoría válida se muestra como el bucket `UNCATEGORIZED` ("❔ Sin categoría"), nunca como "Otros"

What: `getCategory()` devuelve `UNCATEGORIZED` (id `sin-categoria`, no elegible en el formulario) para `categoryId` nulo, vacío o desconocido, e `isValidExpense()` acepta `categoryId == null`. · Why: antes un id desconocido se disfrazaba de "Otros" y un `categoryId` nulo se descartaba del store, o sea desaparecía del total; ahora suma al total y se ve agrupado; al editar uno, ningún chip queda marcado y guardar exige elegir categoría con el mensaje existente. · Where: js/storage.js UNCATEGORIZED, getCategory(), isValidExpense().

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

## Los dos totales del resumen (hoy y mes) comparten cuerpo tipográfico, calculado en CSS co…

What: Los dos totales del resumen (hoy y mes) comparten cuerpo tipográfico, calculado en CSS contra el ancho de la columna (`100cqw`) y el largo del más largo de los dos, que `renderSummary()` publica en la custom property `--total-chars`. · Why: un monto de millones baja de cuerpo en vez de partirse a mitad de número o desbordar la tarjeta en una pantalla de 320px, y los dos totales siguen midiendo igual aunque uno sea más corto. · Where: styles.css (.summary__total), js/app.js. <!-- id: 8fec4991-75d9-42c1-b96b-de8d5e579b79-0 -->

## Los porcentajes por categoría en el resumen se calculan con el método de mayor resto (lar…

What: Los porcentajes por categoría en el resumen se calculan con el método de mayor resto (largest remainder), no con redondeo simple por categoría. · Why: el redondeo simple puede hacer que la suma de porcentajes no dé exactamente 100; el mayor resto lo garantiza en todos los casos, incluyendo empates y categorías con montos iguales. · Where: js/app.js (función de cálculo de porcentajes del resumen). <!-- id: ca111ac1-4681-445a-9a27-42fcd0cb24b7-4 -->

## La representación visual del desglose por categoría (barra apilada al 100% + ranking con…

What: La representación visual del desglose por categoría (barra apilada al 100% + ranking con barra proporcional por fila) se implementó en HTML/CSS puro, sin librería de gráficos, con paleta validada para daltonismo en tema claro y oscuro. · Why: coherente con la decisión de proyecto de no agregar dependencias externas; se usó el skill `dataviz` para validar la paleta antes de escribir el CSS. <!-- id: ca111ac1-4681-445a-9a27-42fcd0cb24b7-7 -->

## La barra apilada al 100% y las barras del ranking por categoría en la vista Resumen sigue…

What: La barra apilada al 100% y las barras del ranking por categoría en la vista Resumen siguen el spec de marcas del skill `dataviz`: grosor máximo 24px (nunca llenan el carril), esquinas redondeadas de 4px solo en el extremo del dato, cuadradas en la base. · Why: consistencia visual validada por el skill en vez de un estilo de barra inventado ad-hoc. · Where: styles.css. <!-- id: ca111ac1-4681-445a-9a27-42fcd0cb24b7-11 -->

## La etiqueta de período mostrada en el Resumen (ej

What: La etiqueta de período mostrada en el Resumen (ej. "Septiembre de 2026") se calcula con la misma función `currentMonthPrefix()` que ya usaba la tarjeta "Este mes" para su total. · Why: garantiza por construcción que la etiqueta de período y el total mostrado nunca queden desincronizados, en vez de mantener dos cálculos de "mes actual" independientes. · Where: js/app.js. <!-- id: ca111ac1-4681-445a-9a27-42fcd0cb24b7-14 -->

## El estado vacío del período en curso muestra un botón "Registrar el primer gasto" que abr…

What: El estado vacío del período en curso muestra un botón "Registrar el primer gasto" que abre directamente el formulario de alta, en vez de mostrar un total en cero con gráfico vacío. · Why: invitar a la acción en lugar de mostrar datos que parecerían un bug o desincentivarían el uso. <!-- id: ca111ac1-4681-445a-9a27-42fcd0cb24b7-8 -->

## Al editar un gasto cuyo categoryId es desconocido o vacío (bucket "Sin categoría"), el fo…

What: Al editar un gasto cuyo categoryId es desconocido o vacío (bucket "Sin categoría"), el formulario de edición no preselecciona ningún chip de categoría, y el guardado sigue exigiendo elegir una categoría explícita (mismo mensaje de validación de antes) antes de aceptar. · Why: evita crear un chip "Sin categoría" seleccionable en el formulario, manteniendo la regla existente de que todo alta/edición debe declarar una categoría real; "sin categoría" solo se genera por datos legacy o importados, no por elección del usuario en el formulario. · Where: js/app.js (formulario de edición). <!-- id: ca111ac1-4681-445a-9a27-42fcd0cb24b7-9 -->
