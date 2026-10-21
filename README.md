# eSports Arena Manager — Frontend (React)

Aplicación web en **React 19 + Vite** con **Bootstrap 5** (diseño responsivo, paleta «Táctico Rojo»),
enrutamiento con **react-router**, lógica de negocio en funciones puras y pruebas unitarias con
**Jasmine + Karma** (con reporte de cobertura). Evaluación Parcial 2 — DSY1104 Desarrollo FullStack II.

## Integrantes

- Sebastián Cortés — `seb.cortesg@duocuc.cl`
- Felipe Vargas — `fe.vargasi@duocuc.cl`
- Aníbal Romero — `ani.romeroc@duocuc.cl`

## Requisitos previos

- **Node.js 20.19 o superior** (o 22.12+) — comprobar con `node -v`
- **Google Chrome** instalado (Karma lo usa para ejecutar las pruebas). Si Karma no lo encuentra,
  definir la variable `CHROME_BIN` con la ruta del ejecutable.

## Comandos

| Comando | Descripción |
| :-- | :-- |
| `npm install` | Instala las dependencias. |
| `npm run dev` | Servidor de desarrollo con recarga en caliente. |
| `npm run build` | Genera la versión de producción en `dist/`. |
| `npm run preview` | Sirve `dist/` localmente. |
| `npm test` | Corre las pruebas una vez (Jasmine + Karma, Chrome headless). |
| `npm run test:watch` | Corre las pruebas y queda escuchando cambios. |
| `npm run test:coverage` | Corre las pruebas y genera la cobertura (`coverage/index.html`). |

## Rutas (enrutamiento de cliente con HashRouter)

`#/inicio` · `#/torneos` · `#/detalle-torneo?id=N` · `#/inscripcion?torneo=N` · `#/equipo` · `#/perfil`

## Arquitectura

```text
src/
├── main.jsx                  HashRouter + AppProvider + App
├── App.jsx                   Encabezado, <Routes> y pie; conecta el enrutador con los componentes
├── rutas.js                  Rutas y menú centralizados
├── data/datos.js             Datos de demostración (fechas relativas a hoy)
├── context/AppContext.jsx    Datos y acciones (sin navegación)
├── logica/                   Funciones puras (+ .spec.js)
│   ├── fechas.js             finDelDia (corrige el desfase de zona horaria)
│   ├── formato.js · torneos.js · ranking.js · inscripcion.js · equipo.js · perfil.js
├── pruebas/montar.js         Ayudas para probar componentes (montar, clic, escribir, elegir)
└── components/
    ├── layout/               Encabezado, PiePagina            (reciben props)
    ├── torneos/              TarjetaTorneo, BarraCupos, EtiquetaEstado,
    │                         LlaveTorneo, ListaPartidas, TablaRanking
    ├── inscripcion/          FormularioInscripcion
    ├── equipo/               FormularioEquipo, PanelEquipo
    ├── ui/                   MensajeEstado
    └── vistas/               Inicio, Torneos, DetalleTorneo, Inscripcion, Equipo, Perfil, NoEncontrada
```

**Flujo de datos:** solo las *vistas* leen el contexto (`useApp`) y le entregan datos y funciones a
los *componentes de presentación* por **props**. Los componentes avisan hacia arriba con funciones
(`onVerDetalle`, `onEnviar`, `onNavegar`...). Por eso se pueden probar sin Provider.

**Estilos:** Bootstrap (grilla, formularios, botones, navbar) + `index.css` con variables de la
paleta. El único estilo en línea es el ancho de `BarraCupos` (valor calculado en ejecución).

## Pruebas

Las 10 pruebas obligatorias del caso están cubiertas:

| # | Prueba | Archivo |
| :-- | :-- | :-- |
| 1 | `ordenarRanking` (puntos, desempate por diferencia) | `logica/ranking.spec.js` |
| 2 | `calcularPuntos` | `logica/ranking.spec.js` |
| 3 | `cuposDisponibles` | `logica/torneos.spec.js` |
| 4 | `inscripcionFueraDePlazo` | `logica/inscripcion.spec.js` |
| 5 | `tieneSancionActiva` | `logica/inscripcion.spec.js` |
| 6 | `equipoCompleto` | `logica/inscripcion.spec.js` |
| 7 | `TarjetaTorneo` (nombre, juego, estado) | `components/torneos/TarjetaTorneo.spec.js` |
| 8 | `TablaRanking` | `components/torneos/TablaRanking.spec.js` |
| 9 | `FormularioInscripcion` (espía + envío deshabilitado) | `components/inscripcion/FormularioInscripcion.spec.js` |
| 10 | `LlaveTorneo` con «Por definir» | `components/torneos/LlaveTorneo.spec.js` |

Además hay pruebas de integración de las seis vistas y la navegación (`src/App.spec.js`).
**Mocks:** espías con `jasmine.createSpy` (callbacks de componentes) y reloj simulado con
`jasmine.clock().mockDate()` (plazos de inscripción). Informe de cobertura: `docs/COBERTURA_TESTING.md`.

> Convención: las pruebas de componentes se llaman `*.spec.js` (no `.jsx`), porque karma-esbuild no
> resuelve bien los `.spec.jsx`; el JSX funciona igual dentro de `.js`.
