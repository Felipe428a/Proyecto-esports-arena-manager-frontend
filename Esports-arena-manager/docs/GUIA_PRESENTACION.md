# Guía para la presentación (60 %, individual)

Para cada indicador: **qué decir**, **qué mostrar** y **dónde está en el código**. Tener abiertos: la app
(`localhost:5173`), Swagger (`localhost:8070/swagger-ui.html`), DevTools (Application + Network) y el IDE.

## IE3.1.2 · Backend con base de datos, lógica de negocio y modelos (12 %)

- **Decir:** 12 microservicios Spring Boot; cada uno con su **esquema** en PostgreSQL (base de datos por servicio);
  se comunican por **Feign**; un **API Gateway** es la única entrada. Capas: Controller → Service (reglas) → Repository (JPA).
- **Mostrar:** `docker compose up -d postgres` y las tablas por esquema; `InscripcionService.crear` (plazo, cupo,
  modalidad, juego del equipo, sanción, capitán); `Torneo.java` / `Equipo.java` (relación 1:N con `MiembroEquipo`).
- **Frase clave:** “los datos que llegan del cliente solo pueden endurecer una regla, nunca saltársela”.

## IE3.2.3 · API REST CRUD documentada en Swagger (12 %)

- **Mostrar:** Swagger unificado → *tournament-service*: GET (200), POST (201), PUT (200), `DELETE /{id}` (204), 404 y 400 con `{ mensaje }`.
- **Demostrar en vivo:** *Authorize* con el token del login como organizador → crear un torneo; luego intentar borrarlo → 403; como administrador → 204.
- **Código:** `TorneoController`, `ApiExceptionHandler`, `config/SwaggerConfig` (bearerAuth).

## IE3.2.4 · Integración backend ↔ frontend (10 %)

- **Decir el recorrido:** componente → servicio (`arena.js`) → `solicitar()` (`api.js`) → Gateway → microservicio → BD → respuesta → `recargar()` → render.
- **Mostrar en Network:** `POST /api/v1/inscripciones` con `Authorization: Bearer …` y respuesta 201; el preflight `OPTIONS` (CORS en el Gateway).
- **Eficiencia:** URL única en `VITE_API_URL`; `Promise.allSettled` (si cae un servicio, el resto sigue); `AbortController`;
  validación en el cliente + en el servidor; adaptadores puros que mantuvieron la lógica y las pruebas del EP2.

## IE3.3.4 · Autenticación con roles y JWT (10 %)

- **Generación:** `auth-service/security/JwtService.emitir` (sub, rol, usuarioId, exp 15 min, firma HMAC con `JWT_SECRETO`); BCrypt para contraseñas.
- **Verificación:** `JwtFiltro` (Bearer → firma → vencimiento → `ROLE_<rol>`) y `SeguridadConfig` (reglas + 401/403 JSON) en **cada** servicio.
- **Renovación:** `SesionService.renovar` (refresh aleatorio en BD, **rotación** y **revocación** en logout/desactivación).
- **Mostrar:** pegar el token en jwt.io (se lee el payload, pero al cambiar el rol la firma no coincide → 401 en Postman, carpeta 2).
- **Pruebas:** `JwtServiceTest`, `SesionServiceTest`, `SeguridadIntegracionTest`.

## IE3.3.5 · Gestión de sesiones en el frontend (8 %)

- **Mostrar:** login → DevTools › Application › Local storage › `sesion` (token, refreshToken, usuario) → **F5**: sigue la sesión.
- **Explicar:** `AuthProvider` con `useState(leerSesion)`; `sesion.js` como única puerta; renovación automática en `solicitar()`
  (antes de pedir si el token venció y tras un 401); evento `sesion-expirada`; `GET /auth/me` al recargar; logout revoca el refresh y cierra otras pestañas.
- **Demostrar expiración:** en Application, editar el token (cambiar un carácter) y el refresh → recargar → “Tu sesión venció”.
- **Seguridad:** token de vida corta, sin contraseña en el almacenamiento, sin `dangerouslySetInnerHTML` (XSS).

## IE3.3.6 · Restricciones de acceso en el frontend (8 %)

- **Mostrar con tres usuarios:**
  - Visitante: menú solo Inicio/Torneos; `/perfil` → redirige a `/login` y vuelve después.
  - Jugador (`fernanda.soto`): selector de jugador bloqueado en Inscripción; solo su equipo; `/admin` → “No tienes permiso”.
  - Organizador: panel sin *Juegos* ni *Usuarios*; sin botón *Eliminar*. Administrador: todo.
- **Código:** `auth/RutaProtegida.jsx`, `auth/permisos.js`, `rutas.js`, `App.jsx`.
- **Frase clave:** “la interfaz oculta; el backend protege: si alguien se salta React, Spring Security responde 403”.

## Demo sugerida (5 minutos)

1. Inicio sin sesión → Torneos → detalle (datos reales de 8 microservicios).
2. `/perfil` sin sesión → login con clave mala (401) → login correcto → vuelve a `/perfil` → F5.
3. Inscripción como jugadora (Network: Bearer + 201) → Mi equipo: agregar integrante.
4. `/admin` como jugadora → sin permiso. Cerrar sesión.
5. Organizador: crear torneo, programar partida, registrar resultado → ver la tabla de posiciones actualizada.
6. Swagger: Authorize, DELETE como organizador (403) y como administrador (204).
