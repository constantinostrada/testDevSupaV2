# decision

A technical decision that was made and WHY (which alternatives were discarded).

## Se eligió HTML + CSS + JS vanilla con ES modules, sin build ni dependencias, para la app…

What: Se eligió HTML + CSS + JS vanilla con ES modules, sin build ni dependencias, para la app de gastos · Why: el offline es trivial sin bundle que versionar, no hay toolchain que mantener para una app mono-usuario, y un service worker sobre archivos planos es la capa de caché más chica posible · Where: index.html, styles.css, js/app.js, js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-0 -->

## Los montos de gasto se guardan como enteros en centavos (amountCents), no como floats

What: Los montos de gasto se guardan como enteros en centavos (amountCents), no como floats · Why: el resumen mensual va a sumar muchos montos y sumar floats arrastra error de precisión · Where: js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-1 -->

## La exportación a archivo se dejó fuera de esta tarea, para 'más adelante'

What: La exportación a archivo se dejó fuera de esta tarea, para 'más adelante' · Why: acordado explícitamente con el usuario como fuera de alcance; el campo schemaVersion en el storage deja el terreno preparado para implementarla sin romper datos existentes · Where: js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-2 -->

## Borrar un gasto es baja logica con `deletedAt`, no borrado fisico

**What** · `deleteExpense(id)` marca el gasto con `deletedAt` y lo deja fuera
de `listExpenses()`; `restoreExpense(id)` quita la marca. El registro nunca se
saca del array. Se descarto el borrado fisico con el gasto sostenido en
memoria durante la ventana de deshacer.
**Why** · Con el gasto en memoria, cerrar la app durante esos segundos lo
resucitaba o lo perdia segun el orden de las escrituras. Con la marca
persistida desde el primer momento, el estado en disco siempre es el que se
ve en pantalla, y "deshacer" es una escritura mas, no una excepcion.
**Where** · `js/storage.js` (`deleteExpense`, `restoreExpense`, `isActive`).
**Learned** · 2026-09-04.

## La ventana de deshacer dura 5 s y solo hay una viva a la vez

**What** · Borrar muestra un toast con "Deshacer" durante 5 s. Un borrado
nuevo cierra el toast anterior, dejando esa baja firme. No hay `confirm()`.
**Why** · Un modal del navegador corta el flujo en mobile. Y sostener varias
ventanas abiertas obligaria a una cola de deshacer que nadie pidio: la unica
recuperacion que importa es la del error recien cometido.
**Where** · `js/app.js` (`UNDO_MS`, `removeWithUndo`, `hideUndo`).
**Learned** · 2026-09-04.
