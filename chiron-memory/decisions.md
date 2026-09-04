# decision

A choice made and the reasoning behind it — the path taken over the alternatives.

## Se eligió HTML + CSS + JS vanilla con ES modules, sin build ni dependencias, para la app…

What: Se eligió HTML + CSS + JS vanilla con ES modules, sin build ni dependencias, para la app de gastos · Why: el offline es trivial sin bundle que versionar, no hay toolchain que mantener para una app mono-usuario, y un service worker sobre archivos planos es la capa de caché más chica posible · Where: index.html, styles.css, js/app.js, js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-0 -->

## Los montos de gasto se guardan como enteros en centavos (amountCents), no como floats

What: Los montos de gasto se guardan como enteros en centavos (amountCents), no como floats · Why: el resumen mensual va a sumar muchos montos y sumar floats arrastra error de precisión · Where: js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-1 -->

## La exportación a archivo se dejó fuera de esta tarea, para 'más adelante'

What: La exportación a archivo se dejó fuera de esta tarea, para 'más adelante' · Why: acordado explícitamente con el usuario como fuera de alcance; el campo schemaVersion en el storage deja el terreno preparado para implementarla sin romper datos existentes · Where: js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-2 -->

## The monthly summary feature did not exist before this work order; it was added with delib…

What: The monthly summary feature did not exist before this work order; it was added with deliberately minimal scope — only the current calendar month, no navigation between months. · Why: 6 of the 11 acceptance criteria for edit/delete could only be verified by observing month/category totals, so the summary had to be built as an enabler; scope was kept minimal (current month only) rather than building full month navigation. · Where: js/app.js. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-13 -->

## `.summary__totals` uses a CSS Grid with `auto-fit`/`minmax` columns so the two totals sit…

What: `.summary__totals` uses a CSS Grid with `auto-fit`/`minmax` columns so the two totals sit side by side at normal widths and collapse to one stacked column automatically on very narrow screens, instead of a manually tuned media-query breakpoint. · Why: keeps the block from overflowing or overlapping across the tested mobile width range (320–414px) with a single layout rule. · Where: styles.css .summary__totals. <!-- id: 653a9deb-e8b8-4e9a-87b5-be2d1ab48d56-11 -->

## The two summary totals' font size is computed against the column's container width and th…

What: The two summary totals' font size is computed against the column's container width and the length of the longest formatted amount (published from JS as a `--total-chars` custom property), rather than scaled with `vw` units. · Why: a `vw`-based approach let large amounts (millions) wrap mid-digit (e.g. "1.234.567,8 / 9"), which technically didn't overflow but was unreadable; sizing off container width + digit count keeps long amounts intact or breaks cleanly at the currency symbol instead. · Where: styles.css, js/app.js renderSummary(). <!-- id: 653a9deb-e8b8-4e9a-87b5-be2d1ab48d56-5 -->
