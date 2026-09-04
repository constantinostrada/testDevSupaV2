# Gastos

Registro personal de gastos. Web que se abre desde una URL en el navegador del
celular: sin instalación, sin login, sin backend. Los gastos se guardan en el
almacenamiento del propio dispositivo.

## Correrla

Son archivos estáticos, no hay build ni dependencias. Alcanza con servirlos por
HTTP (el service worker no funciona sobre `file://`):

```sh
python3 -m http.server 8000
# después, en el celular: http://<ip-de-la-compu>:8000
```

Para publicarla, subir el directorio tal cual a cualquier hosting estático.

> El service worker exige HTTPS en producción. `localhost` está exceptuado, pero
> una IP de red local servida por HTTP plano no lo está: ahí la app abre igual,
> solo que sin la capa de caché offline.

## Estructura

| Archivo | Qué hace |
| --- | --- |
| `index.html` | Marcado del app shell |
| `styles.css` | Layout mobile-first, una sola columna |
| `js/storage.js` | Modelo de gasto, categorías por defecto y persistencia en `localStorage` |
| `js/app.js` | Resumen del mes, render de la lista, alta/edición/baja de gastos |
| `sw.js` | Caché del app shell para que abra sin conexión |
| `manifest.webmanifest` | Nombre, colores e ícono |

## Dónde viven los datos

En `localStorage` del navegador, bajo la clave `gastos.v1` (formato `schemaVersion: 2`). No salen del
dispositivo y no hay copia en ningún servidor: **borrar los datos de navegación,
cambiar de navegador o perder el teléfono es perder el historial.** El formato
guardado lleva un `schemaVersion` para que una exportación a archivo y futuras
migraciones se puedan agregar sin romper lo ya cargado.

Borrar un gasto es una **baja lógica**: el gasto queda guardado con un campo
`deletedAt` y sale de la lista y de los totales. Eso es lo que permite ofrecer
"deshacer" durante unos segundos sin sostener nada en memoria, y que la baja
sobreviva a cerrar la app aunque la ventana de deshacer siguiera abierta.
