# eSports Arena Manager — Frontend (React)

Aplicación web desarrollada en **React 19** con **Vite**, basada en la guía oficial del curso (`guia_react.pdf`). Cuenta con arquitectura por componentes, estado reactivo mediante Hooks (`useState`, `useEffect`, Context API), funciones de lógica pura desacopladas y suite de pruebas unitarias con **Jasmine** y **Karma**.

---

##  Integrantes

- Sebastian Cortes / `seb.cortesg@duocuc.cl`
- Felipe Vargas / `fe.vargasi@duocuc.cl`
- Anibal Romero / `ani.romeroc@duocuc.cl`

---

##  Comandos disponibles

En la raíz del proyecto, ejecuta:

| Comando | Descripción |
| :--- | :--- |
| `npm install` | Instala todas las dependencias del proyecto. |
| `npm run dev` | Inicia el servidor de desarrollo local con recarga en caliente (HMR). |
| `npm run build` | Compila y empaqueta la aplicación optimizada para producción en `dist/`. |
| `npm run preview` | Sirve localmente la compilación de producción para verificarla. |
| `npm test` | Ejecuta la suite completa de pruebas unitarias con Jasmine y Karma en modo headless. |
| `npm run test:watch` | Ejecuta las pruebas en modo observador (re-ejecuta al guardar cambios). |

---

##  Estructura del proyecto

```text
├── index.html                   Página HTML raíz con <div id="root"></div>
├── vite.config.js               Configuración del empaquetador Vite con plugin de React
├── karma.conf.cjs               Configuración del ejecutor Karma con Jasmine y esbuild
├── package.json                 Scripts y dependencias (React 19, Jasmine, Karma, Vite)
├── public/
│   └── assets/                  Recursos multimedia estáticos (video adelanto-esports.mp4)
├── src/
│   ├── main.jsx                 Punto de entrada de React con StrictMode y createRoot
│   ├── App.jsx                  Componente principal y enrutador de vistas
│   ├── index.css                Estilos globales, variables CSS y diseño "Táctico Rojo"
│   ├── data/
│   │   └── datos.js             Datos iniciales (juegos, torneos, equipos, jugadores, partidas)
│   ├── context/
│   │   └── AppContext.jsx       Proveedor de estado global y acciones reactivas
│   ├── logica/                  Funciones puras desacopladas de la interfaz
│   │   ├── formato.js           Formato de fechas, moneda, cálculos de cupos y efectividad
│   │   ├── formato.spec.js      Pruebas unitarias de formato y cálculos
│   │   ├── torneos.js           Filtros avanzados, validación de fechas y cierres
│   │   ├── torneos.spec.js      Pruebas unitarias de torneos
│   │   ├── ranking.js           Cálculo de tabla de posiciones por partidas y rondas
│   │   ├── ranking.spec.js      Pruebas unitarias de ranking
│   │   ├── inscripcion.js       Reglas de negocio y validación de inscripciones
│   │   ├── inscripcion.spec.js  Pruebas unitarias de inscripciones
│   │   ├── equipo.js            Validación de creación de equipos y filtro de disponibles
│   │   ├── equipo.spec.js       Pruebas unitarias de gestión de equipos
│   │   ├── perfil.js            Validación de apodo y cálculo de historial
│   │   └── perfil.spec.js       Pruebas unitarias de perfil
│   └── components/
│       ├── layout/
│       │   ├── Encabezado.jsx   Barra de navegación principal con estado activo
│       │   └── PiePagina.jsx    Pie de página con enlaces y derechos
│       ├── torneos/
│       │   ├── TarjetaTorneo.jsx   Tarjeta interactiva de torneo con barra de progreso
│       │   ├── BarraCupos.jsx      Barra de cupos ocupados vs disponibles
│       │   ├── EtiquetaEstado.jsx  Insignia visual del estado del torneo
│       │   └── EtiquetaEstado.spec.js Pruebas de componente para EtiquetaEstado
│       ├── ui/
│       │   ├── MensajeEstado.jsx   Mensajes de estado accesibles (éxito, error, vacío, info)
│       │   └── MensajeEstado.spec.js Pruebas de componente para MensajeEstado
│       └── vistas/
│           ├── Inicio.jsx          Vista 1 · Portada, estadísticas en vivo, destacados y video
│           ├── Torneos.jsx         Vista 2 · Buscador y filtros de torneos en tiempo real
│           ├── DetalleTorneo.jsx   Vista 3 · Detalle, inscritos, llaves por ronda y ranking
│           ├── Inscripcion.jsx     Vista 4 · Formulario controlado de inscripción
│           ├── Equipo.jsx          Vista 5 · Creación de equipos y administración de integrantes
│           └── Perfil.jsx          Vista 6 · Ficha competitiva y edición reactiva de apodo
└── guia_react.pdf               Guía de referencia del curso
```

---

##  Pruebas unitarias

El proyecto cuenta con **43 pruebas unitarias y de componentes** que validan la lógica de negocio y componentes clave:

- Formateo de fechas, moneda y cálculos de rendimiento.
- Filtrado y búsqueda multicriterio de torneos.
- Cálculo automático de tablas de posiciones según rondas y marcadores.
- Validaciones de inscripción (bloqueo por sanciones activas, cupos agotados, fechas vencidas, requisitos mínimos de integrantes).
- Validación de nombres únicos de equipos y asignación de capitanes.
- Validación de apodos (longitud, caracteres y espacios).
- Renderizado y accesibilidad de componentes UI (`MensajeEstado`, `EtiquetaEstado`).
