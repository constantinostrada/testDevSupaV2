# gotcha

A non-obvious pitfall or trap, learned the hard way.

## Each storage mutation (`patchExpense` and friends) reads the store, builds the fully-upda…

What: Each storage mutation (`patchExpense` and friends) reads the store, builds the fully-updated version in memory, and only calls `writeStore` once at the very end. · Why: if `writeStore` throws (persistence failure), nothing on disk has changed yet and there is no partially-applied in-memory state to roll back — guarantees the record stays in its prior state on failure, never an intermediate one. · Where: js/storage.js. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-6 -->

## Una regla CSS con `display: grid` sobre una clase pisaba al atributo HTML `hidden`, hacie…

What: Una regla CSS con `display: grid` sobre una clase pisaba al atributo HTML `hidden`, haciendo que el formulario de alta apareciera visible junto al botón que debía abrirlo · Why: display:grid tiene mayor especificidad/orden que el estilo por defecto de [hidden]; hay que anular explícitamente display cuando el elemento tiene hidden · Where: styles.css (.composer__form) <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-7 -->

## parseAmount (js/storage.js) rechazaba montos con separador de miles en formato es-AR, com…

What: parseAmount (js/storage.js) rechazaba montos con separador de miles en formato es-AR, como '12.400,00' · Why: — · Where: js/storage.js · Learned: al parsear montos ingresados por el usuario hay que tolerar tanto coma decimal como punto de miles del formato es-AR sin volverse ambiguo con el formato en-US <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-8 -->

## Durante la verificación manual en el navegador, la caché HTTP servía módulos JS viejos pe…

What: Durante la verificación manual en el navegador, la caché HTTP servía módulos JS viejos pese a editar el código fuente, dando falsos negativos en las pruebas · Why: — · Where: verificación manual con python3 -m http.server · Learned: para probar cambios de código en un servidor estático local hay que servir con Cache-Control: no-store (o similar) y forzar recarga sin caché, si no las pruebas manuales miden código desactualizado <!-- id: 83afad12-5141-4760-a11c-9e88082688d0-9 -->

## The selected-category chip's position/visibility inside the horizontally-scrolling chip c…

What: The selected-category chip's position/visibility inside the horizontally-scrolling chip carousel must be computed from `getBoundingClientRect()` on the chip and the carousel, not from `chip.offsetLeft`. · Why: `offsetLeft` was resolving relative to `.composer`, which has `position: fixed`, so when editing an expense whose category (e.g. 'Servicios') was scrolled out of view, the selected chip appeared unmarked/off-screen instead of being scrolled into view. · Where: js/app.js. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-10 -->

## A hidden `<input required>` silently blocks native form submission (no visible error, sub…

What: A hidden `<input required>` silently blocks native form submission (no visible error, submit just no-ops). · Why: the Date field is hidden when the composer is in edit mode, so its `required` attribute must be removed/toggled off whenever the field is hidden, or saving edits fails silently. · Where: js/app.js, index.html. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-11 -->

## Tap-vs-scroll on the list is disambiguated with a `pointerdown`/`pointermove` guard: a ta…

What: Tap-vs-scroll on the list is disambiguated with a `pointerdown`/`pointermove` guard: a tap only registers if the finger moved less than ~10px and no `scroll` event fired in between; the guard is applied to both the row-edit button and the delete button. · Why: without it, scrolling the expense list on mobile can accidentally fire row-open or delete actions. · Where: js/app.js. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-9 -->

## If the app is left open across local midnight, `render()` never re-fires on its own, so t…

What: If the app is left open across local midnight, `render()` never re-fires on its own, so the "today" total silently keeps showing yesterday's data. · Why: there's no timer driving re-render on date change by default. · Where: js/app.js render(). · Learned: schedule a timeout to the next local midnight computed from date components (not `+24h`, which breaks across DST transitions), and add a fallback recheck on `visibilitychange`/`focus` because backgrounded tabs throttle timers and the midnight timeout alone can't be trusted. <!-- id: 653a9deb-e8b8-4e9a-87b5-be2d1ab48d56-2 -->

## When manually verifying UI changes in the browser, a previously-installed service worker…

What: When manually verifying UI changes in the browser, a previously-installed service worker can keep serving stale cached index.html/styles.css/app.js even after a reload, producing false negatives during verification. · Why: — · Where: sw.js precache. · Learned: unregister the service worker / clear its caches (or serve with Cache-Control: no-store) before trusting any DOM/style measurement taken while testing local changes. <!-- id: 653a9deb-e8b8-4e9a-87b5-be2d1ab48d56-4 -->

## The edit-expense form has no date field — editing an expense can only change its amount/c…

What: The edit-expense form has no date field — editing an expense can only change its amount/category, never its date, so an edited expense always keeps the day it was originally created on. · Why: this is why editing a prior day's expense always moves the month total but never the "today" total; there's no UI path to retarget an expense's date via edit, only via delete + re-add. · Where: js/app.js expense edit form. <!-- id: 653a9deb-e8b8-4e9a-87b5-be2d1ab48d56-10 -->

## The two-total layout uses `container-type: inline-size` and `cqw` container-query units,…

What: The two-total layout uses `container-type: inline-size` and `cqw` container-query units, the project's first CSS feature with a real browser-support floor (Chrome 105+ / Safari 16+). · Why: on unsupported browsers the declaration is simply invalid and the total falls back to its inherited 1rem font-size — smaller but still legible and non-overflowing, so the dependency degrades gracefully rather than breaking. · Where: styles.css .summary__totals. <!-- id: 653a9deb-e8b8-4e9a-87b5-be2d1ab48d56-6 -->
