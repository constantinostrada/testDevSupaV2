# convention

A rule, pattern or convention this project follows (naming, formats, repeated approach).

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
