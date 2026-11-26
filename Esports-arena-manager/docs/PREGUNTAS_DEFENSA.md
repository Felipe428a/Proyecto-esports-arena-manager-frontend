# Banco de preguntas para la defensa · eSports Arena Manager

Preguntas que el profesor podría hacer en la presentación, agrupadas por tema. Cada una trae una **respuesta corta**
(lo que conviene decir) y **dónde mostrarlo** en el código o en la aplicación. Las rutas del backend se abrevian:
`auth/…` = `backend/auth-service/src/main/java/com/example/authservice/…`, y lo mismo para cada servicio.

> **Cómo usarlo:** primero responde con una frase, después muestra el archivo. Si no sabes algo, explica
> qué harías para averiguarlo (log, Swagger, DevTools). Eso también suma.

---

## 1. Arquitectura y estructura del proyecto

**1.1 ¿Cómo está organizado el proyecto?**
Dos carpetas: `backend/` (12 microservicios Spring Boot + API Gateway + servidor Eureka, con un `pom.xml` padre)
y `frontend/` (React + Vite). Además, `docs/` con la documentación y `backend/postman/` con las colecciones de prueba.
*Mostrar:* el árbol del proyecto en el IDE y el `README.md` de la raíz.

**1.2 ¿Por qué microservicios y no un solo backend (monolito)?**
Porque cada parte del negocio (torneos, equipos, inscripciones…) se puede desarrollar, probar, desplegar y escalar por separado.
Si un servicio se cae, el resto sigue funcionando. La contra: es más complejo (red entre servicios, más configuración).
Vienen del proyecto de Fullstack I y aquí se integraron con el frontend.

**1.3 ¿Cuáles son los microservicios y en qué puerto corre cada uno?**

| Servicio | Puerto | Responsabilidad |
|---|---|---|
| api-gateway | 8070 | Única entrada del frontend, CORS, Swagger unificado |
| discovery-server (Eureka) | 8761 | Registro y descubrimiento de servicios |
| auth-service | 8080 | Login, registro, JWT, refresh tokens, cuentas |
| user-service | 8081 | Perfiles de jugadores |
| team-service | 8082 | Equipos e integrantes |
| tournament-service | 8083 | Torneos |
| registration-service | 8084 | Inscripciones |
| sanction-service | 8085 | Sanciones |
| match-service | 8086 | Partidas |
| game-service | 8087 | Catálogo de juegos |
| result-service | 8088 | Resultados |
| ranking-service | 8089 | Rankings |
| prize-service | 8090 | Premios |
| notification-service | 8091 | Notificaciones |

**1.4 ¿Qué capas tiene cada microservicio?**
`controller` (recibe HTTP y responde) → `service` (reglas de negocio) → `repository` (JPA, acceso a la BD) → `model` (entidades).
Además: `dto` (lo que entra y sale por la API), `client` (Feign hacia otros servicios), `security` (JWT y reglas de acceso),
`config` (Swagger, Feign, datos iniciales) y `exception` (`ApiExceptionHandler`).
*Mostrar:* el paquete de `registration-service`.

**1.5 ¿Para qué sirve el API Gateway?**
Es la **única URL** que conoce el frontend (`http://localhost:8070/api/v1`). Recibe todo y lo reenvía al servicio correcto
según la ruta (`/api/v1/torneos/**` → tournament-service). Además resuelve **CORS** en un solo lugar y publica un **Swagger unificado**.
*Mostrar:* `backend/api-gateway/src/main/resources/application.yml` (sección `routes` y `globalcors`).

**1.6 ¿Y Eureka?**
Es el registro de servicios: cada microservicio se anota al arrancar y el Gateway los encuentra por nombre (`lb://tournament-service`)
sin escribir IPs. En la nube (Render) no se usa Eureka: se define la URL de cada servicio con variables `*_SERVICE_URL`.

**1.7 ¿Cómo se comunican los microservicios entre sí?**
Por HTTP con **OpenFeign** (interfaces en el paquete `client`). Ejemplo: registration-service le pregunta a tournament-service
si el torneo está abierto. `FeignAuthConfig` **reenvía el mismo token** del usuario, para que el servicio de destino también aplique sus reglas.
*Mostrar:* `registration/client/TournamentClient.java` y `registration/config/FeignAuthConfig.java`.

**1.8 ¿Cómo se maneja la base de datos? ¿Una por servicio?**
Una base PostgreSQL con **un esquema por microservicio** (`torneos`, `equipos`, `inscripciones`, `auth`…). Ningún servicio lee
las tablas de otro: si necesita un dato, lo pide por la API. Es el patrón *base de datos por servicio*, pero más barato de desplegar
(una sola instancia en Supabase).
*Mostrar:* `DB_ESQUEMA` en cualquier `application.yml` y `hibernate.default_schema`.

**1.9 ¿Dónde está la configuración sensible (contraseñas, secretos)?**
En **variables de entorno**: `DB_URL`, `DB_USUARIO`, `DB_CLAVE`, `JWT_SECRETO`, `CORS_ORIGENES`. El `application.yml` solo tiene
valores por defecto para desarrollo local. En producción se definen en Render y Vercel. Nada sensible va en el código del frontend
(las variables `VITE_` quedan públicas en el JavaScript).

**1.10 ¿Cómo está organizado el frontend?**

- `services/`: comunicación con la API (`api.js` con `solicitar()`, `sesion.js`, `auth.js`, `arena.js`, `adaptadores.js`).
- `auth/`: sesión y permisos (`AuthProvider`, `useAuth`, `RutaProtegida`, `permisos.js`).
- `context/AppContext.jsx`: datos de la app (torneos, equipos…).
- `components/vistas/`: páginas; `components/admin/`: panel de gestión; `components/layout/` y `ui/`: piezas reutilizables.
- `logica/`: funciones puras (ranking, inscripción, fechas) con sus pruebas `.spec.js`.

**1.11 ¿Por qué separar `services/` de los componentes?**
Para que los componentes no sepan de URLs, headers ni tokens. Si cambia el backend, se cambia un solo archivo.
Es lo que pide la sesión 1 (capa de servicios + función base `solicitar()`).

---

## 2. Backend: modelos y lógica de negocio

**2.1 ¿Qué entidades tiene el sistema?**
`CuentaAcceso` y `RefreshToken` (auth), `Usuario` (user), `Equipo` + `MiembroEquipo` (team), `Torneo` (tournament),
`Inscripcion` (registration), `Sancion`, `Partida`, `Juego`, `Resultado`, `Ranking`, `Premio`/`PremioAsignado`, `Notificacion`.
*Mostrar:* el diagrama `backend/Modelo Relacional de Base de Datos.png`.

**2.2 Muestra una relación entre entidades.**
`Equipo` tiene muchos `MiembroEquipo`: `@OneToMany(mappedBy = "equipo", cascade = CascadeType.ALL, orphanRemoval = true)`.
Al borrar un equipo se borran sus integrantes; al quitar un integrante de la lista, se borra su fila.
*Mostrar:* `team/model/Equipo.java` y `MiembroEquipo.java` (`@ManyToOne`).

**2.3 ¿Por qué entre servicios se guardan IDs y no relaciones JPA?**
Porque cada servicio tiene su propio esquema: `Inscripcion` guarda `torneoId` y `equipoId` como números, no `@ManyToOne Torneo`.
La validación de que existen se hace llamando al otro servicio con Feign.

**2.4 Explica las reglas al crear una inscripción.**
En `InscripcionService.crear`:

1. Busca el torneo real en tournament-service.
2. Debe estar `ABIERTO` y antes de la fecha de cierre → si no, 400 "No inscribir fuera de plazo".
3. No superar el cupo (cuenta las inscripciones no canceladas).
4. La modalidad debe coincidir (torneo por equipos solo recibe equipos).
5. Individual: el jugador puede competir (user-service), no tiene sanción bloqueante (sanction-service) y un jugador **solo se inscribe a sí mismo**.
6. Por equipos: el equipo tiene integrantes suficientes, no está sancionado, **solo el capitán** lo inscribe y el equipo juega el mismo juego del torneo.
7. No se permite inscribir dos veces al mismo participante.

**2.5 ¿Qué significa "los datos del cliente solo pueden endurecer la regla"?**
El request trae campos opcionales (`torneoAbierto`, `cupoMaximo`, `fechaCierreInscripcion`) que venían del EP2.
El servidor usa siempre el dato real del torneo y solo acepta el del cliente si es **más estricto**
(por ejemplo, `Math.min` del cupo). Así nadie se inscribe en un torneo cerrado enviando `"torneoAbierto": true`.

**2.6 ¿Cómo sabe la lógica de negocio quién está haciendo la petición?**
Con `UsuarioActual` (`security/UsuarioActual.java`): lee el usuario que dejó el `JwtFiltro` en el `SecurityContext`.
Tiene atajos como `esStaff()` (organizador o administrador) y `esUsuario(id)` (es el dueño).

**2.7 ¿Qué validaciones hay en equipos?**
Un jugador solo crea equipos donde él es el capitán (el capitán se agrega solo como integrante); solo el capitán (o staff)
agrega o quita integrantes; el capitán no se puede quitar; no se repiten jugadores; un equipo inactivo no acepta integrantes;
cada integrante debe poder competir (consulta a user-service). Para inscribirse, el equipo debe estar activo y tener integrantes activos.
La cantidad exacta que exige el juego se muestra y valida en el frontend.
*Mostrar:* `team/service/EquipoService.java`.

**2.8 ¿Cómo se actualiza la tabla de posiciones?**
En el panel, "Registrar resultado" hace dos llamadas: `POST /resultados` (result-service, con puntajes y ganador)
y `PUT /partidas/{id}` con estado `FINALIZADA` (match-service). Después `recargar()` trae los datos nuevos. La tabla (victorias, empates, derrotas, diferencia y puntos)
la calcula el frontend con una **función pura** a partir de las partidas: `frontend/src/logica/ranking.js`, que tiene sus pruebas.

**2.9 ¿Qué pasa si se registra un resultado de una partida que no existe?**
`ResultadoService.crear` llama a match-service con Feign. Si la partida no existe, match-service responde 404 y el error se propaga.
Un resultado `VALIDADO` solo lo puede modificar un organizador o un administrador (403 para el resto).

**2.10 ¿Cómo se cargan los datos de ejemplo?**
`config/DatosIniciales.java` en cada servicio (un `CommandLineRunner`) inserta datos coherentes entre servicios si la tabla está vacía.
Se controla con `APP_DATOS_INICIALES`.

---

## 3. API REST y Swagger

**3.1 ¿Qué es una API REST? ¿Qué verbos usan?**
Recursos identificados por URL y operaciones con verbos HTTP: `GET` (leer), `POST` (crear), `PUT` (reemplazar),
`PATCH` (cambio parcial, por ejemplo el estado), `DELETE` (eliminar). Responden JSON con códigos de estado.

**3.2 ¿Qué códigos de estado devuelven?**
200 OK, 201 Created (al crear), 204 No Content (al eliminar), 400 (validación o regla de negocio),
401 (sin sesión o token inválido), 403 (sin permiso), 404 (no existe), 500 (error del servidor).

**3.3 ¿Cómo se manejan los errores?**
`ApiExceptionHandler` (`@RestControllerAdvice`) captura las excepciones y responde siempre con el mismo formato,
que incluye `{ "mensaje": "..." }`. El frontend muestra ese mensaje tal cual. Los 401/403 los arma `SeguridadConfig` con el mismo formato.

**3.4 ¿Cómo validan los datos de entrada?**
Con Bean Validation (`@Valid`, `@NotBlank`, `@Email`, `@Size`) en los DTO → 400 con el detalle del campo.
Las reglas que dependen de otros datos (cupo, plazo) están en el `service`.

**3.5 ¿Cómo se documenta la API?**
Con **springdoc-openapi** (Swagger). Cada servicio expone `/v3/api-docs` y el Gateway los junta en `http://localhost:8070/swagger-ui.html`
con un selector por servicio. `SwaggerConfig` declara el esquema `bearerAuth`, que habilita el botón **Authorize**.

**3.6 Demuestra un CRUD completo en Swagger.**
Login como organizador → copiar `token` → Authorize → en *tournament-service*: `POST /api/v1/torneos` (201), `GET /{id}` (200),
`PUT /{id}` (200), `DELETE /{id}` (403 como organizador; 204 como administrador).

**3.7 ¿Por qué `/api/v1`?**
Versionado de la API: si mañana cambia el contrato, se publica `/api/v2` sin romper a los clientes que usan v1.

---

## 4. Seguridad: autenticación con JWT y roles

**4.1 ¿Qué es un JWT y qué partes tiene?**
Un token firmado con tres partes en Base64URL separadas por puntos: **header** (algoritmo), **payload** (datos: `sub`, `rol`, `exp`…)
y **firma**. El payload se puede leer, pero no modificar sin invalidar la firma.

**4.2 ¿Dónde se genera el token?**
Solo en **auth-service**: `auth/security/JwtService.emitir()`. Payload: `sub` (email), `cuentaId`, `usuarioId`, `nombre`, `rol`,
`iss`, `iat` y `exp` (15 minutos). Firma HMAC con `JWT_SECRETO`. La librería jjwt elige el algoritmo según el largo del secreto
(con el secreto de desarrollo, de 68 bytes, usa HS512). Si el secreto tiene menos de 32 bytes, el servicio no arranca.

**4.3 ¿Cómo se verifica en los demás microservicios?**
Cada servicio tiene `JwtFiltro` (`OncePerRequestFilter`):

1. ¿Viene `Authorization: Bearer …`?
2. Verifica la firma y el vencimiento con el mismo secreto.
3. Si es válido, pone el usuario en el `SecurityContext` con la autoridad `ROLE_<rol>`.

Si el token es inválido **no lanza error**: la petición sigue sin usuario y `SeguridadConfig` decide (401 o 403).

**4.4 ¿Por qué todos los servicios verifican y no solo el Gateway?**
Defensa en profundidad: si alguien llama directo a un microservicio saltándose el Gateway, igual se valida el token.
Además, la lógica de negocio necesita saber quién es el usuario (dueño, capitán).

**4.5 ¿Cuál es la diferencia entre 401 y 403?**
**401**: no sé quién eres (sin token, token alterado o vencido). **403**: sé quién eres, pero tu rol no tiene permiso.

**4.6 ¿Cómo se definen las reglas por rol en el backend?**
En `SeguridadConfig`, con `requestMatchers` que se revisan **de arriba hacia abajo** (gana la primera que coincide). Ejemplo de tournament-service:

```java
.requestMatchers(HttpMethod.GET, "/api/v1/torneos/**").permitAll()
.requestMatchers(HttpMethod.DELETE, "/api/v1/torneos/{id}").hasRole("ADMINISTRADOR")
.requestMatchers("/api/v1/torneos/**").hasAnyRole("ORGANIZADOR", "ADMINISTRADOR")
```
Por eso la regla del `DELETE` va **antes** que la general: si estuviera después, un organizador podría eliminar.

**4.7 ¿Por qué `STATELESS` y CSRF desactivado?**
No hay sesión en el servidor ni cookies: cada petición trae su token. CSRF ataca sesiones basadas en cookies,
así que no aplica. CORS se desactiva en los servicios porque lo resuelve el Gateway.

**4.8 ¿Cómo se guardan las contraseñas?**
Con **BCrypt** (hash con sal). Nunca en texto plano, nunca en el token y nunca en el frontend.
`CuentaAcceso.passwordHash` tiene `@JsonIgnore` para que no salga en ninguna respuesta.

**4.9 ¿Qué pasa si alguien modifica el rol en el token (por ejemplo, en jwt.io)?**
La firma deja de coincidir → `JwtFiltro` lo descarta → **401**. Está probado en `JwtServiceTest` y en la colección de Postman (carpeta 2).

**4.10 ¿Qué es el refresh token y cómo funciona la renovación?**
El access token dura 15 minutos. El **refresh token** es un texto aleatorio de 48 bytes guardado en la tabla `auth.refresh_tokens`
que dura 7 días. `POST /auth/refresh` lo valida (existe, no revocado, no vencido, cuenta activa), **lo revoca** y entrega un par nuevo
(**rotación**: cada refresh sirve una sola vez).
*Mostrar:* `auth/service/SesionService.renovar()`.

**4.11 ¿Por qué no hacer que el access token dure 7 días y listo?**
Un JWT no se puede "borrar": es válido hasta que vence. Si dura poco, un token robado sirve poco tiempo.
El refresh token sí se puede revocar porque está en la BD.

**4.12 ¿Qué hace el logout en el backend?**
`POST /auth/logout` revoca el refresh token. El access token sigue siendo válido hasta su vencimiento (máximo 15 minutos),
pero el frontend lo borra de inmediato. Al **desactivar una cuenta**, `revocarTodas()` revoca todas sus sesiones.

**4.13 Si se cambia el rol de un usuario, ¿cuándo se nota?**
En la siguiente renovación (máximo 15 minutos), porque el token nuevo se emite con el rol actualizado.
Además, al recargar la página el frontend llama a `GET /auth/me` y actualiza los datos de la sesión.

**4.14 ¿Cómo llega el token de un servicio a otro?**
`FeignAuthConfig` toma el header `Authorization` de la petición original y lo agrega a la llamada Feign.

**4.15 ¿Quién puede crear un administrador?**
Solo un administrador. `POST /auth/registro` siempre crea un **JUGADOR**. Las cuentas con otros roles se crean o cambian en
`/auth/cuentas/**`, que exige `hasRole("ADMINISTRADOR")`.

---

## 5. Integración frontend ↔ backend

**5.1 Explica el recorrido de una petición, desde el clic hasta la pantalla.**
Componente (`Inscripcion.jsx`, `onSubmit`) → acción del `AppContext` → servicio (`inscripcionesService` en `arena.js`) →
`solicitar()` en `api.js` (agrega el token y la URL) → **Gateway** → **registration-service** (`JwtFiltro` → controller → service →
Feign a otros servicios → repository → PostgreSQL) → respuesta 201 con JSON → `recargar()` → React vuelve a renderizar.

**5.2 ¿Qué hace exactamente `solicitar()`?**

1. Lee la sesión; si el token vence en menos de 10 segundos, lo renueva antes de pedir.
2. Arma la URL con `VITE_API_URL` y agrega `Authorization: Bearer …` (salvo que la petición sea `publica`).
3. Si llega 401 con token, intenta renovar **una vez** y repite la petición. Si no puede, cierra la sesión y dispara `sesion-expirada`.
4. Si la respuesta no es 2xx, lanza un `ErrorApi` con el `mensaje` del backend y el código de estado.
5. Si no hay conexión, lanza "No se pudo conectar con el servidor".

**5.3 ¿Qué pasa si varias peticiones necesitan renovar el token al mismo tiempo?**
Se hace **una sola renovación**: la variable `renovacionEnCurso` guarda la promesa y las demás peticiones la reutilizan.
Así no se gastan varios refresh tokens (que además rotan).

**5.4 ¿Dónde se configura la URL del backend?**
En `VITE_API_URL` (`.env.development` en local, variable de Vercel en producción). Si no existe, usa `http://localhost:8070/api/v1`.
Ningún componente escribe una URL.

**5.5 ¿Qué es CORS y dónde lo resolvieron?**
El navegador bloquea las peticiones a otro origen (5173 → 8070) salvo que el servidor lo permita. Se resolvió en el **Gateway**
(`globalcors`, con orígenes permitidos en `CORS_ORIGENES`). En DevTools se ve el **preflight** `OPTIONS` antes del `POST`.

**5.6 ¿Cómo cargan los datos al entrar a la app?**
`AppContext` hace todas las peticiones **en paralelo** con `Promise.allSettled` dentro de un `useEffect`.
A diferencia de `Promise.all`, si un servicio falla los demás datos igual se muestran y se avisa qué servicio falló.

**5.7 ¿Para qué el `AbortController`?**
Para cancelar las peticiones si el componente se desmonta (y por el doble montaje de `StrictMode` en desarrollo).
Se aborta en la función de limpieza del `useEffect`.

**5.8 ¿Qué son los adaptadores?**
Funciones puras en `services/adaptadores.js` que transforman el JSON del backend al formato que ya usaban los componentes del EP2.
Así no hubo que reescribir las vistas ni la lógica, y las pruebas anteriores siguieron sirviendo.

**5.9 ¿Por qué se validan los datos en el frontend si el backend igual valida?**
El frontend valida por **experiencia de usuario** (respuesta inmediata, sin viaje al servidor). El backend valida por **seguridad**
(el frontend se puede saltar). Las dos son necesarias.

**5.10 ¿Cómo se muestran los estados de carga y error?**
Cada vista tiene tres estados: cargando (`EstadoCarga`), error (con botón **Reintentar**) y datos.
Los errores de las acciones se muestran con `MensajeEstado` usando el `mensaje` del backend.

---

## 6. Sesión en el frontend

**6.1 ¿Dónde se guarda la sesión y qué se guarda?**
En `localStorage`, clave `sesion`: `{ token, refreshToken, expiraEn, refreshExpiraEn, usuario }`. Nunca la contraseña.
Solo `services/sesion.js` toca `localStorage` (una sola puerta).

**6.2 ¿Por qué la sesión sobrevive al F5?**
`AuthProvider` hace `useState(leerSesion)`: la **función inicializadora** lee `localStorage` una sola vez en el primer render.
Al recargar, la sesión se recupera desde ahí.

**6.3 ¿Por qué `useState(leerSesion)` y no `useState(leerSesion())`?**
Con la referencia a la función, React la ejecuta **solo en el primer render**. Con los paréntesis, se ejecutaría en cada render
aunque el valor se ignore.

**6.4 ¿Qué es el Context y por qué lo usaron?**
`AuthContext` comparte la sesión con toda la app sin pasar props por cada nivel. `AuthProvider` lo provee y `useAuth()` lo consume
(`usuario`, `autenticado`, `login`, `logout`, `puede`, `tieneRol`). Si se usa fuera del proveedor, lanza un error claro.

**6.5 ¿Cómo sabe la app que la sesión venció?**

- `leerSesion()` descarta la sesión si venció el refresh token.
- `solicitar()` renueva el access token automáticamente; si no puede, dispara el evento `sesion-expirada`.
- `AuthProvider` escucha el evento, borra la sesión y muestra "Tu sesión venció. Inicia sesión de nuevo."

**6.6 ¿Qué pasa al cerrar sesión?**
Se borra `localStorage`, se actualiza el estado (el menú cambia al instante) y se llama a `POST /auth/logout` para revocar el refresh token.
Si hay otras pestañas abiertas, el evento `storage` las cierra también.

**6.7 ¿Qué pasa si el administrador desactiva una cuenta que tiene sesión abierta?**
Se revocan sus refresh tokens. Cuando su access token vence, la renovación falla → se cierra la sesión con el aviso.
Al recargar, `GET /auth/me` también la invalida.

**6.8 ¿No es inseguro guardar el token en `localStorage`?**
Es accesible desde JavaScript, así que un ataque **XSS** podría leerlo. Mitigaciones aplicadas: access token de vida corta,
refresh rotativo y revocable, React escapa todo el contenido y **no** se usa `dangerouslySetInnerHTML`.
La alternativa más segura sería guardar el refresh en una **cookie `HttpOnly`**, pero exige manejar CSRF; para este alcance
se eligió `localStorage`, que es lo que propone la sesión 2.

**6.9 ¿El frontend verifica la firma del token?**
No. `leerPayload()` solo **lee** el payload (para saber cuándo vence). Verificar requiere el secreto, que nunca debe estar
en el navegador. La verificación real la hace el backend en cada petición.

**6.10 ¿Qué pasa después del login?**
Si el usuario venía de una ruta protegida (`state.desde`), vuelve a esa página. Si no, va al inicio.

---

## 7. Restricciones por rol en el frontend

**7.1 ¿Cómo protegen una página?**
Con `RutaProtegida` en `App.jsx`:

- Sin sesión → `<Navigate to="/login" state={{ desde }} />`.
- Con sesión pero sin el rol → muestra "No tienes permiso para ver esta página".
- Con sesión y rol → muestra la página.

**7.2 ¿Qué rutas son públicas, cuáles requieren sesión y cuáles un rol?**
Públicas: inicio, torneos, detalle de torneo, login y registro. Con sesión: inscripción, mi equipo y mi perfil.
Con rol organizador o administrador: `/admin` (panel de gestión).

**7.3 ¿Cómo ocultan botones según el rol?**
`permisos.js` define una tabla `PERMISOS` (acción → roles). En los componentes se usa `puede('eliminarTorneos')`
para mostrar u ocultar botones, pestañas y opciones del menú.

**7.4 Si el frontend oculta el botón, ¿alguien podría igual llamar a la API?**
Sí, con Postman o DevTools. Por eso la protección real está en el backend: responde 403. Frase clave:
"**la interfaz oculta, el backend protege**".

**7.5 Da ejemplos concretos de restricciones por rol.**

- Visitante: solo Inicio y Torneos en el menú.
- Jugador: en Inscripción el selector de jugador está bloqueado (solo se inscribe a sí mismo); solo ve sus equipos; en `/admin` ve el aviso de permiso.
- Organizador: panel sin las pestañas *Juegos* ni *Usuarios* y sin el botón *Eliminar* torneo.
- Administrador: todo.

**7.6 ¿Por qué mostrar "No tienes permiso" en vez de redirigir?**
Para que el usuario entienda por qué no ve la página (sí tiene sesión, le falta rol). Redirigir al login lo confundiría.

---

## 8. Pruebas

**8.1 ¿Qué pruebas hicieron?**

| Tipo | Herramienta | Resultado |
|---|---|---|
| Unitarias + integración backend | JUnit 5, Mockito, MockMvc, H2 | 139 pruebas OK |
| Unitarias + componentes frontend | Jasmine + Karma | 150 pruebas OK |
| API a través del Gateway | Postman / Newman | 34 verificaciones OK |
| Extremo a extremo | Navegador real | Login, recarga, roles, inscripción, CRUD, sesión vencida |

**8.2 ¿Por qué H2 en las pruebas del backend?**
Es una base en memoria: las pruebas corren rápido y sin depender de que PostgreSQL esté levantado
(`src/test/resources/application.properties`).

**8.3 ¿Qué prueba `SeguridadIntegracionTest`?**
Con MockMvc: sin token → 401; token alterado → 401; token vencido → 401; rol incorrecto → 403; rol correcto → OK.

**8.4 ¿Cómo prueban la sesión en el frontend?**
`sesion.spec.js` (guardar, leer, vencimiento), `api.spec.js` (header Bearer, renovación ante 401, evento de expiración, mensajes de error),
`RutaProtegida.spec.js` y `permisos.spec.js`.

**8.5 ¿Cómo se ejecutan?**
Backend: `mvnw test` en `backend/`. Frontend: `npm test` en `frontend/`. Postman: importar la colección y ejecutarla con el entorno local.

---

## 9. Despliegue y ejecución

**9.1 ¿Cómo se levanta todo en local?**
`docker compose up -d postgres` → `scripts\levantar-backend.ps1` (o `docker compose up -d` para todo) → `npm install` y `npm run dev` en `frontend/`.

**9.2 ¿Para qué sirve Docker aquí?**
Para tener PostgreSQL sin instalarlo y empaquetar cada microservicio en una imagen (`Dockerfile` en dos etapas: compila con Maven
y ejecuta con un JRE liviano). Render usa esos mismos Dockerfiles.

**9.3 ¿Dónde se desplegaría cada parte?**
Base de datos en **Supabase** (PostgreSQL), microservicios en **Render** (Web Service con Docker), frontend en **Vercel**.
Detalle en `docs/DESPLIEGUE.md`.

**9.4 ¿Para qué sirve `vercel.json`?**
Redirige todas las rutas a `index.html`. Sin eso, al recargar `/torneos/3` Vercel buscaría un archivo que no existe (404),
porque las rutas las maneja React Router en el navegador.

**9.5 ¿Qué cambia entre local y producción?**
Solo variables de entorno: `DB_URL` (Supabase), `JWT_SECRETO` (uno largo y secreto), `CORS_ORIGENES` (URL de Vercel),
`*_SERVICE_URL` (URLs de Render) y `VITE_API_URL` (URL del Gateway). El código es el mismo.

---

## 10. Preguntas difíciles: limitaciones y mejoras

Conviene reconocer las limitaciones con calma y decir cómo se mejorarían.

**10.1 ¿Qué pasa si dos personas se inscriben al mismo tiempo en el último cupo?**
Podrían pasar las dos (condición de carrera): se cuenta y después se guarda, sin bloqueo.
*Mejora:* bloqueo optimista con `@Version` en el torneo, una restricción única en la BD o una transacción con bloqueo.

**10.2 ¿`findAll().stream().filter(...)` no es ineficiente?**
Sí, con muchos datos trae toda la tabla a memoria. Se dejó así por simplicidad y porque viene del proyecto anterior.
*Mejora:* consultas derivadas en el repositorio, por ejemplo `countByTorneoIdAndEstadoNot(...)`, y paginación con `Pageable`.

**10.3 Si se cae un microservicio, ¿qué pasa?**
El frontend sigue mostrando los demás datos (`Promise.allSettled`) e indica qué servicio falló, con botón Reintentar.
En el backend, una llamada Feign a un servicio caído produce un error.
*Mejora:* circuit breaker con Resilience4j y *timeouts*.

**10.4 ¿Por qué un secreto compartido (HMAC) y no claves pública/privada (RS256)?**
Es más simple y suficiente para un sistema donde todos los servicios son nuestros. El riesgo es que cualquier servicio
que tenga el secreto podría firmar tokens. *Mejora:* RS256, donde solo auth-service tiene la clave privada y el resto solo la pública.

**10.5 Después del logout, ¿el access token sigue sirviendo?**
Sí, hasta que vence (máximo 15 minutos), porque los JWT no tienen estado. El frontend lo borra de inmediato y el refresh queda revocado.
*Mejora:* una lista negra de tokens revocados (por ejemplo en Redis) o tokens aún más cortos.

**10.6 ¿Por qué la tabla de posiciones se calcula en el frontend?**
Porque esa lógica (pura y con pruebas) ya existía en el EP2 y se reutilizó con los datos reales de match-service.
*Mejora:* que ranking-service la calcule y la guarde al registrar cada resultado.

**10.7 ¿Por qué un esquema por servicio y no una base de datos por servicio?**
Logra lo mismo a nivel lógico (aislamiento de datos) con una sola instancia de PostgreSQL, que es lo que permite el plan gratuito de Supabase.
Para separarlas en el futuro basta con cambiar `DB_URL` en cada servicio.

**10.8 ¿Cómo evitan que un jugador inscriba a otro jugador?**
Doble candado: en el frontend el selector está bloqueado con su propio perfil, y en el backend `InscripcionService`
responde 403 "Solo puedes inscribirte a ti mismo" si el `jugadorId` no es el del token.

**10.9 ¿Qué agregarías si tuvieras más tiempo?**
Paginación, circuit breaker, RS256, refresh en cookie `HttpOnly`, notificaciones en tiempo real (WebSocket),
CI/CD con GitHub Actions que ejecute las pruebas en cada *push*, y monitoreo con Actuator + Prometheus.

---

## 11. "Explícame esta línea": fragmentos típicos

**`.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))`**
Spring no crea sesión en el servidor: la identidad llega en el token de cada petición.

**`.addFilterBefore(jwtFiltro, UsernamePasswordAuthenticationFilter.class)`**
Ejecuta nuestro filtro JWT antes del filtro estándar de Spring, para que el usuario ya esté autenticado cuando se evalúan las reglas.

**`new SimpleGrantedAuthority("ROLE_" + rol)`**
Spring Security espera el prefijo `ROLE_` para que `hasRole("ADMINISTRADOR")` funcione.

**`@JsonIgnore private String passwordHash;`**
Evita que el hash de la contraseña salga en cualquier respuesta JSON.

**`` headers.Authorization = `Bearer ${token}` ``**
Formato estándar para enviar un JWT: el backend busca el prefijo `Bearer ` y toma lo que viene después.

**`return () => control.abort()`**
Limpieza del `useEffect`: cancela las peticiones pendientes cuando el componente se desmonta.

**`<Navigate to="/login" replace state={{ desde }} />`**
Redirige al login reemplazando la entrada del historial (el botón Atrás no vuelve a la página protegida) y recuerda adónde volver.

**`if (renovacionEnCurso) return renovacionEnCurso`**
Si ya hay una renovación en curso, se reutiliza la misma promesa en vez de pedir otra.

**`useMemo(() => ({ usuario, autenticado, ... }), [sesion, ...])`**
Evita crear un objeto nuevo en cada render, para no re-renderizar todos los consumidores del contexto sin necesidad.

**`lb://tournament-service`**
Para el Gateway significa: busca en Eureka las instancias de `tournament-service` y reparte la carga entre ellas (*load balancer*).

---

## 12. Conceptos de las sesiones que podrían preguntar

- **`useEffect`**: efectos secundarios (pedir datos) después del render; el arreglo de dependencias controla cuándo se repite y la función que retorna limpia.
- **`useState` vs `useContext`**: estado local de un componente vs estado compartido por un árbol de componentes.
- **Hook personalizado (`useAuth`)**: función que usa otros hooks para reutilizar lógica; debe empezar con `use`.
- **Promesas y `async/await`**: `fetch` devuelve una promesa; `await` espera su resultado; los errores se capturan con `try/catch`.
- **REST stateless**: el servidor no recuerda nada entre peticiones; cada una trae todo lo necesario (el token).
- **Hash vs cifrado**: el hash (BCrypt) no se puede revertir (se compara); el cifrado sí. Las contraseñas se hashean.
- **Firma vs cifrado en JWT**: el JWT está firmado (no se puede alterar) pero **no** cifrado (cualquiera lee el payload). Por eso no lleva datos sensibles.
- **Variables de entorno**: configuración que cambia según el ambiente sin tocar el código.
- **SPA (Single Page Application)**: React cambia la vista sin recargar la página; por eso `vercel.json` necesita el *rewrite* a `index.html`.
