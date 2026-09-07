# eSports Arena Manager — Frontend (EP1)
## Integrantes

- Sebastian Cortes / seb.cortesg@duocuc.cl
- Felipe Vargas   / fe.vargasi@duocuc.cl

## Cómo ejecutar el proyecto
El proyecto es 100 % estático y no requiere instalación de dependencias.

**abrir directamente**
Haz doble clic en `index.html` (o ábrelo con "Abrir con → navegador").



## Estructura de carpetas

```
├── index.html              Vista 1 · Inicio
├── torneos.html             Vista 2 · Listado de torneos (filtros y buscador)
├── detalle-torneo.html      Vista 3 · Detalle de torneo (llaves, ranking, premios)
├── inscripcion.html         Vista 4 · Inscripción a torneo
├── equipo.html               Vista 5 · Gestión de equipo
├── perfil.html               Vista 6 · Perfil de jugador
├── css/
│   └── estilos.css          Hoja de estilos externa única, con variables de color
├── assets/
│   └── adelanto-esports.mp4   Video embebido para reproducirse en la pagina del inicio
├── js/
│   ├── datos.js              Arreglos simulados: juegos, torneos, equipos, jugadores…
│   ├── comun.js              Utilidades compartidas (fechas, mensajes, navegación)
│   ├── inicio.js
│   ├── torneos.js
│   ├── detalle-torneo.js
│   ├── inscripcion.js
│   ├── equipo.js
│   └── perfil.js
└── README.md
```

## Notas de la entrega (EP1)

- Todas las vistas están interconectadas por hipervínculos desde un menú de
  navegación común (`header > nav`).
- El catálogo de juegos, torneos, equipos, jugadores, inscripciones y partidas se
  carga desde arreglos JavaScript (`js/datos.js`) y se renderiza con manipulación
  del DOM; no hay listas escritas a mano en el HTML.
- Los formularios (filtros de torneos, inscripción, creación de equipo, gestión de
  integrantes y edición de apodo) validan en el cliente antes de enviar, con
  mensajes propios junto al campo que falla, y bloquean el envío mientras existan
  errores.
- La paleta de color "Táctico rojo" se declara una sola vez como variables CSS en
  `css/estilos.css` y se referencia desde toda la hoja de estilos.
- Este entregable corresponde solo al alcance de EP1: no incluye React, Bootstrap,
  pruebas unitarias (EP2) ni integración con el backend de microservicios vía API
  REST/JWT (EP3). El backend de referencia (Spring Boot) se entrega aparte y no es
  necesario para ejecutar este frontend.
