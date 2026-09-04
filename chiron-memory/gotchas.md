# gotcha

Something non-obvious that failed or must be kept in mind to avoid repeating (bugs, surprises, lessons).

## `display` en una clase pisa al atributo `hidden`

**What** · `.composer__form { display: grid }` hacía que el formulario se viera
aun con el atributo `hidden` puesto, mostrándose a la vez que el botón que lo
abre. La regla `[hidden] { display: none !important }` en `styles.css` lo
arregla globalmente.
**Why** · `hidden` solo aporta un `display:none` de hoja de estilos del
navegador, que cualquier regla de autor con `display` supera. El código de
`js/app.js` toggle-a visibilidad con `el.hidden`, así que la regla es necesaria
para que ese patrón funcione en todo el proyecto.
**Where** · `styles.css` (arriba de todo), `js/app.js`.
**Learned** · 2026-08-31.

## `new Date('YYYY-MM-DD')` se parsea como UTC y muestra el día anterior

**What** · Las fechas de los gastos se guardan como `YYYY-MM-DD` local. Para
formatearlas hay que partir el string y usar `new Date(y, m-1, d)`; pasarle el
ISO directo al constructor lo interpreta como medianoche UTC y en Argentina
(UTC-3) muestra el día de antes.
**Why** · Es la diferencia entre el formato date-only y el date-time del spec
de ECMAScript. Mismo motivo por el que `todayISO()` arma la fecha a mano en vez
de usar `toISOString()`.
**Where** · `js/app.js` (`formatDate`), `js/storage.js` (`todayISO`).
**Learned** · 2026-08-31.

## Inputs con menos de 16px hacen que iOS haga zoom al enfocarlos

**What** · Todo `input` del formulario tiene `font-size: 16px` como mínimo.
Por debajo de eso, Safari en iPhone hace zoom automático al enfocar el campo y
la app queda descuadrada y con scroll horizontal.
**Why** · Rompe el criterio de "se ve bien en pantalla de celular sin zoom ni
scroll horizontal" de una forma que no se nota probando en desktop.
**Where** · `styles.css`, regla `.field input`.
**Learned** · 2026-08-31.

## Probar cambios de JS contra `python3 -m http.server` engaña por caché

**What** · `python3 -m http.server` no manda `Cache-Control`, así que Chrome
cachea heurísticamente los ES modules: se editaba `js/storage.js`, se recargaba,
y el navegador seguía corriendo el código viejo. Costó varias iteraciones de
depuración de un bug ya arreglado. Para probar, servir con
`Cache-Control: no-store` o hacer hard reload.
**Why** · Con ES modules no hay bundle con hash que delate la versión vieja, y
un `?v=` en la URL de la página no busta los módulos que esa página importa.
**Where** · Desarrollo local.
**Learned** · 2026-08-31.

## `offsetLeft` de los chips no mide contra el carrusel

**What** · Para centrar el chip de categoria elegido hay que calcularlo con
`getBoundingClientRect()`, no con `offsetLeft`. El `offsetParent` de los chips
es `.composer` (`position: fixed`), asi que `offsetLeft` da una coordenada que
no sirve para setear el `scrollLeft` de `.chips`.
**Why** · Sin centrarlo, al corregir un gasto de una categoria de las ultimas
(Servicios, Otros) el chip marcado queda fuera de la parte visible del
carrusel y parece que no hubiera ninguna elegida.
**Where** · `js/app.js` (`revealSelectedChip`).
**Learned** · 2026-09-04.

## Un `input` con `required` oculto bloquea el submit del formulario

**What** · En modo correccion la fecha no se edita, asi que `#date-field` se
oculta. Hay que sacarle tambien el `required` al input: un control invalido
que no es focuseable aborta el submit sin mostrar nada.
**Why** · El navegador intenta enfocar el campo invalido para mostrar el
globo de validacion; si esta en `display:none` no puede, y cancela en
silencio.
**Where** · `js/app.js` (`openForm`), `index.html` (`#date-field`).
**Learned** · 2026-09-04.

## Al probar en el navegador, el service worker se re-registra en cada carga

**What** · Desregistrar el SW una vez no alcanza: `js/app.js` lo vuelve a
registrar en cada `load`, y con la estrategia cache-first sigue sirviendo la
version vieja de los modulos aunque el server mande `Cache-Control: no-store`.
Al iterar hay que desregistrar y `caches.delete()` despues de cada recarga, o
subir `CACHE_VERSION`.
**Why** · Se perdio bastante rato depurando un fix ya aplicado que el
navegador no estaba corriendo. Es el mismo sintoma que el gotcha de la cache
de `python3 -m http.server`, pero con otra causa encima.
**Where** · Desarrollo local, `sw.js`, `js/app.js`.
**Learned** · 2026-09-04.
