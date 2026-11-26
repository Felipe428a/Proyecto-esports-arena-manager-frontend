# eSports Arena Manager — Frontend (React)

**React 19 + Vite + react-router 7 + Bootstrap 5**, conectado al backend de microservicios por el API Gateway.
Login con **JWT**, **sesión persistente** (sobrevive a F5), **renovación automática** del token y
**vistas/acciones restringidas por rol**. Evaluación Parcial 3 — DSY1104 Desarrollo Fullstack II.

## Integrantes

- Sebastián Cortés — `seb.cortesg@duocuc.cl`
- Felipe Vargas — `fe.vargasi@duocuc.cl`
- Aníbal Romero — `ani.romeroc@duocuc.cl`

## Requisitos y comandos

- Node.js 20.19+ (o 22.12+) y Google Chrome (Karma). Backend corriendo (ver `../backend`).

| Comando | Descripción |
| :-- | :-- |
| `npm install` | Instala dependencias |
| `npm run dev` | `http://localhost:5173` (usa `VITE_API_URL` de `.env.development`) |
| `npm run build` | Versión de producción en `dist/` |
| `npm test` | 150 pruebas con Jasmine + Karma (Chrome headless) |
| `npm run test:coverage` | Pruebas + cobertura en `coverage/index.html` |

`VITE_API_URL` apunta al **API Gateway** (`http://localhost:8070/api/v1` en local). En Vercel se define en
*Settings → Environment Variables*. Es pública: nunca contiene secretos.

## Rutas

| Ruta | Acceso |
| :-- | :-- |
| `/inicio`, `/torneos`, `/torneos/:id` | Público |
| `/login`, `/registro` | Público (si ya hay sesión, redirige) |
| `/inscripcion`, `/equipo`, `/perfil` | Requiere sesión (`<RutaProtegida>`) |
| `/admin` | ORGANIZADOR o ADMINISTRADOR. Dentro, *Juegos* y *Usuarios y roles* solo ADMINISTRADOR |

`vercel.json` responde `index.html` en cualquier ruta para que recargar `/admin` no dé 404.

## Arquitectura

```text
src/
├── main.jsx                 <AuthProvider> → <BrowserRouter> → <AppProvider> → <App>
├── App.jsx                  Rutas públicas, protegidas y por rol
├── rutas.js                 Menú centralizado y filtrado por rol
├── services/
│   ├── api.js               solicitar(): URL base, Bearer token, renovación con refresh, errores { mensaje }
│   ├── sesion.js            leer/guardar/borrar sesión en localStorage + vencimiento (exp)
│   ├── auth.js              login, registro, logout, me
│   ├── arena.js             un servicio por microservicio (juegos, torneos, equipos, inscripciones…)
│   └── adaptadores.js       JSON del backend → modelo que usan las vistas (funciones puras)
├── auth/
│   ├── useAuth.js           AuthContext + hook useAuth()
│   ├── AuthProvider.jsx     sesión compartida, eventos sesion-expirada/renovada, sincroniza pestañas
│   ├── RutaProtegida.jsx    sin sesión → /login (recuerda la página) · sin rol → "No tienes permiso"
│   └── permisos.js          qué rol puede hacer cada acción
├── context/AppContext.jsx   carga los datos de 9 microservicios (Promise.allSettled) y expone acciones
├── pages/                   Login, Registro
├── components/
│   ├── vistas/              Inicio, Torneos, DetalleTorneo, Inscripcion, Equipo, Perfil, Admin, NoEncontrada
│   ├── admin/               AdminTorneos, AdminPartidas, AdminSanciones, AdminJuegos, AdminUsuarios
│   ├── layout/              Encabezado (usuario + rol + cerrar sesión), PiePagina, AvisoSesion
│   ├── torneos/ · ui/       Componentes de presentación (props)
└── logica/                  Funciones puras de negocio (sin cambios: siguen probadas)
```

**Flujo de una petición protegida:** componente → `inscripcionesService.crear()` → `solicitar()` agrega
`Authorization: Bearer <token>` → API Gateway → registration-service (`JwtFiltro` valida firma y rol) →
PostgreSQL → `201` → `recargar()` actualiza el contexto → React vuelve a dibujar.

## Seguridad de la sesión

- Se guarda `{ token, refreshToken, expiraEn, refreshExpiraEn, usuario }` en `localStorage` (clave `sesion`), nunca la contraseña.
- Access token de 15 min: si venció, `solicitar()` lo **renueva** con el refresh token antes de pedir; ante un 401 renueva una vez y repite.
- Si no se puede renovar: borra la sesión, dispara `sesion-expirada` y se muestra “Tu sesión venció”.
- Al recargar, la sesión se confirma con `GET /auth/me` (rol actualizado o cuenta desactivada).
- Cerrar sesión revoca el refresh token en el backend y se refleja en todas las pestañas (`storage` event).
- No se usa `dangerouslySetInnerHTML` (mitiga XSS); el backend vuelve a validar todo (401/403).

## Pruebas (150)

Lógica pura (ranking, torneos, inscripción, equipo, perfil, formato, fechas), componentes (TarjetaTorneo,
Encabezado con y sin sesión, BarraCupos, EtiquetaEstado, MensajeEstado), **`api.spec.js`** (Bearer, públicas,
204, errores, 403, sin conexión, renovación previa y tras 401, sesión expirada), **`sesion.spec.js`**,
**`adaptadores.spec.js`**, **`permisos.spec.js`** y **`RutaProtegida.spec.js`** (con `MemoryRouter`).
