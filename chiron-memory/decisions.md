# decision

A technical decision that was made and WHY (which alternatives were discarded).

## Se eligió HTML + CSS + JS vanilla con ES modules, sin build ni dependencias, para la app…

What: Se eligió HTML + CSS + JS vanilla con ES modules, sin build ni dependencias, para la app de gastos · Why: el offline es trivial sin bundle que versionar, no hay toolchain que mantener para una app mono-usuario, y un service worker sobre archivos planos es la capa de caché más chica posible · Where: index.html, styles.css, js/app.js, js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-0 -->

## Los montos de gasto se guardan como enteros en centavos (amountCents), no como floats

What: Los montos de gasto se guardan como enteros en centavos (amountCents), no como floats · Why: el resumen mensual va a sumar muchos montos y sumar floats arrastra error de precisión · Where: js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-1 -->

## La exportación a archivo se dejó fuera de esta tarea, para 'más adelante'

What: La exportación a archivo se dejó fuera de esta tarea, para 'más adelante' · Why: acordado explícitamente con el usuario como fuera de alcance; el campo schemaVersion en el storage deja el terreno preparado para implementarla sin romper datos existentes · Where: js/storage.js <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-2 -->
