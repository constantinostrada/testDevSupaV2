# decision

A choice made and the reasoning behind it — the path taken over the alternatives.

## Expense deletion is a soft delete (tombstone): `deleteExpense()` sets a `deletedAt` field…

What: Expense deletion is a soft delete (tombstone): `deleteExpense()` sets a `deletedAt` field on the record instead of removing it, and `listExpenses()` filters out anything with `deletedAt` set. · Why: the delete-with-5s-undo UX needs the deletion to already be persisted the instant the user taps ✕ (so it survives an app close during the undo window); `restoreExpense()` simply clears `deletedAt` again. · Where: js/storage.js. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-1 -->

## Se eligió HTML + CSS + JS vanilla con ES modules, sin build ni dependencias, para la app…

What: Se eligió HTML + CSS + JS vanilla con ES modules, sin build ni dependencias, para la app de gastos · Why: el offline es trivial sin bundle que versionar, no hay toolchain que mantener para una app mono-usuario, y un service worker sobre archivos planos es la capa de caché más chica posible · Where: index.html, styles.css, js/app.js, js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-0 -->

## Los montos de gasto se guardan como enteros en centavos (amountCents), no como floats

What: Los montos de gasto se guardan como enteros en centavos (amountCents), no como floats · Why: el resumen mensual va a sumar muchos montos y sumar floats arrastra error de precisión · Where: js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-1 -->

## La exportación a archivo se dejó fuera de esta tarea, para 'más adelante'

What: La exportación a archivo se dejó fuera de esta tarea, para 'más adelante' · Why: acordado explícitamente con el usuario como fuera de alcance; el campo schemaVersion en el storage deja el terreno preparado para implementarla sin romper datos existentes · Where: js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-2 -->

## The monthly summary feature did not exist before this work order; it was added with delib…

What: The monthly summary feature did not exist before this work order; it was added with deliberately minimal scope — only the current calendar month, no navigation between months. · Why: 6 of the 11 acceptance criteria for edit/delete could only be verified by observing month/category totals, so the summary had to be built as an enabler; scope was kept minimal (current month only) rather than building full month navigation. · Where: js/app.js. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-13 -->
