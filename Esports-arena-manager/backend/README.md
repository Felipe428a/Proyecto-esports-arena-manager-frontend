# eSports Arena Manager — Backend (microservicios)

Asignatura: Desarrollo Fullstack II (DSY1104) · DuocUC
Arquitectura: microservicios con **Spring Boot 3.2.5 + Java 21**, **Spring Cloud Gateway**, **Eureka**, **OpenFeign**,
**Spring Security + JWT** y **PostgreSQL** (local en Docker o Supabase en la nube).

## Integrantes

| Nombre | Rol | GitHub |
|--------|-----|--------|
| Aníbal Romero | Backend Dev | @ItsTuki |


## Qué cambió en la Evaluación Parcial 3

| Antes (Parcial 2) | Ahora (Parcial 3) |
| :-- | :-- |
| MySQL (XAMPP), una base por servicio | **PostgreSQL** (Docker local / Supabase), **un esquema por servicio** dentro de una base |
| JWT hecho a mano, secreto fijo en el código, sin validar vencimiento | **jjwt 0.12** (HS512), secreto en `JWT_SECRETO`, vencimiento de 15 min |
| `SecurityConfig` con `permitAll()` en todo | **`SeguridadConfig` + `JwtFiltro` en cada microservicio**: reglas por rol, 401/403 en JSON |
| Login devolvía solo `{ token, rol }` | Login devuelve `{ token, refreshToken, expiraEn, usuario }` + **renovación** (`/refresh`) y **logout** |
| Flags del cliente decidían reglas (`rolOrganizador`, `autorizado`, `torneoAbierto`) | Las reglas usan el **rol del token** y los datos reales del otro microservicio |
| Eliminación solo lógica (`/desactivar`) | Además **`DELETE /{id}` → 204** en todos los recursos (CRUD completo en Swagger) |
| Sin CORS | **CORS en el API Gateway** con `CORS_ORIGENES` |
| Swagger por servicio | Swagger por servicio **+ Swagger unificado en el Gateway** con botón *Authorize* (Bearer) |
| — | **Datos iniciales** coherentes entre servicios, **Dockerfile** por servicio, **docker-compose** y perfil **prod** |

## Mapa de servicios

| Servicio | Puerto | Esquema | Recurso | Lectura | Escritura |
|---|---|---|---|---|---|
| `discovery-server` | 8761 | — | Eureka | — | — |
| `api-gateway` | 8070 | — | `/api/v1/**`, `/swagger-ui.html` | — | — |
| `auth-service` | 8080 | `auth` | `/api/v1/auth` | login/registro/refresh públicos | `/cuentas/**` ADMINISTRADOR |
| `user-service` | 8081 | `usuarios` | `/api/v1/usuarios` | público | PUT dueño o admin · DELETE admin |
| `team-service` | 8082 | `equipos` | `/api/v1/equipos` | público | con sesión, solo **capitán** o staff |
| `tournament-service` | 8083 | `torneos` | `/api/v1/torneos` | público | ORGANIZADOR/ADMIN · DELETE admin |
| `registration-service` | 8084 | `inscripciones` | `/api/v1/inscripciones` | público | con sesión: a sí mismo o a su equipo |
| `sanction-service` | 8085 | `sanciones` | `/api/v1/sanciones` | público | ORGANIZADOR/ADMIN |
| `match-service` | 8086 | `partidas` | `/api/v1/partidas` | público | ORGANIZADOR/ADMIN |
| `game-service` | 8087 | `juegos` | `/api/v1/juegos` | público | ADMINISTRADOR |
| `result-service` | 8088 | `resultados` | `/api/v1/resultados` | público | ORGANIZADOR/ADMIN |
| `ranking-service` | 8089 | `rankings` | `/api/v1/rankings` | público | ORGANIZADOR/ADMIN |
| `prize-service` | 8090 | `premios` | `/api/v1/premios` | público | ORGANIZADOR/ADMIN |
| `notification-service` | 8091 | `notificaciones` | `/api/v1/notificaciones` | con sesión (propias) | ORGANIZADOR/ADMIN |

## Autenticación con JWT

```text
POST /api/v1/auth/login     { email, password }        → 200 { token, refreshToken, tipo, expiraEn, refreshExpiraEn, usuario } · 401
POST /api/v1/auth/registro  { nombre, nickname, email, password } → 201 (crea perfil en user-service + cuenta JUGADOR)
POST /api/v1/auth/refresh   { refreshToken }            → 200 par nuevo (el refresh usado queda revocado) · 401
POST /api/v1/auth/logout    { refreshToken }            → 204 (revoca el refresh token)
GET  /api/v1/auth/me        Authorization: Bearer …     → 200 usuario del token · 401
```

- El **access token** (JWT, 15 min) lleva `sub` (email), `cuentaId`, `usuarioId`, `nombre`, `rol`, `iat`, `exp`. Nunca la contraseña.
- La contraseña se guarda con **BCrypt**. El login responde el mismo mensaje si el correo o la clave fallan.
- El **refresh token** es un texto aleatorio de 384 bits guardado en la tabla `auth.refresh_tokens`: se **rota** en cada uso y se **revoca** al cerrar sesión o al desactivar la cuenta.
- Cada microservicio tiene `security/JwtFiltro` (lee `Authorization: Bearer`, verifica firma y vencimiento y deja el rol como `ROLE_<rol>`) y `security/SeguridadConfig` (reglas por ruta y método).
- Cuando un servicio llama a otro con **Feign**, `config/FeignAuthConfig` reenvía el mismo token.

## Ejecutar

### Opción A · Todo en Docker (más simple)

```bash
cd backend
docker compose up --build         # PostgreSQL + 12 microservicios + Gateway (~6 GB de RAM)
```

### Opción B · PostgreSQL en Docker y servicios con Maven (para desarrollar)

```powershell
cd backend
docker compose up -d postgres
powershell -ExecutionPolicy Bypass -File .\scripts\levantar-backend.ps1            # con Eureka
powershell -ExecutionPolicy Bypass -File .\scripts\levantar-backend.ps1 -SinEureka # como en la nube
```

O desde IntelliJ: ejecutar `DiscoveryServerApplication`, luego cada `*ServiceApplication` y al final `ApiGatewayApplication`.

> Sin Docker: instala PostgreSQL 16, crea la base `esports_arena` (usuario `postgres` / clave `postgres`) o
> define `DB_URL`, `DB_USUARIO` y `DB_CLAVE`. Hibernate crea los esquemas y las tablas al arrancar.

### URLs

| Qué | URL |
| :-- | :-- |
| API (para el frontend) | `http://localhost:8070/api/v1` |
| Swagger unificado | `http://localhost:8070/swagger-ui.html` |
| Swagger de un servicio | `http://localhost:8083/doc/swagger-ui/index.html` (cambia el puerto) |
| Eureka | `http://localhost:8761` |
| Salud | `http://localhost:8070/actuator/health` |

## Variables de entorno

| Variable | Local (valor por defecto) | Producción |
| :-- | :-- | :-- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/esports_arena` | Supabase pooler + `?sslmode=require&prepareThreshold=0` |
| `DB_USUARIO` / `DB_CLAVE` | `postgres` / `postgres` | datos de Supabase |
| `JWT_SECRETO` | clave de desarrollo | `openssl rand -base64 48` (**el mismo en todos los servicios**) |
| `CORS_ORIGENES` (Gateway) | `http://localhost:5173,…` | `https://tu-app.vercel.app` |
| `SPRING_PROFILES_ACTIVE` | — | `prod` (exige las variables, sin valores de reserva) |
| `EUREKA_ENABLED` | `true` | `false` |
| `*_SERVICE_URL` | `http://localhost:<puerto>` / `lb://…` en el Gateway | URL pública de cada servicio en Render |
| `APP_DATOS_INICIALES` | `true` | `true` la primera vez |
| `JWT_DURACION_MS` / `JWT_REFRESH_DURACION_MS` | `900000` / `604800000` | igual |

Guía paso a paso: [`../docs/DESPLIEGUE.md`](../docs/DESPLIEGUE.md).

## Pruebas

```bash
./mvnw test          # 139 pruebas (H2 en memoria, no necesita PostgreSQL)
```

- `auth-service`: `JwtServiceTest` (claims, payload alterado, token vencido, otro secreto), `SesionServiceTest` (rotación, revocado, vencido, cuenta desactivada), `AuthServiceTest`.
- `game-service`: `SeguridadIntegracionTest` (MockMvc + H2): GET público, 401 sin token / token alterado / vencido, 403 como jugador y CRUD completo como administrador.
- Cada servicio: pruebas unitarias de reglas de negocio con Mockito y `contextLoads`.
- Postman: `postman/esports-arena-parcial3.postman_collection.json` (ejecutar en orden; guarda los tokens en variables).

## Datos iniciales

Con la base vacía, cada servicio carga datos coherentes con los demás (mismos ids): 15 usuarios, 4 juegos,
6 torneos (fechas relativas a hoy), 4 equipos, inscripciones, partidas con resultados, ranking, premios,
sanciones y notificaciones. Cuentas: `admin@arena.cl / admin123`, `organizador@arena.cl / organiza123`
y jugadores `<nombre>@arena.cl / jugador123` (por ejemplo `fernanda.soto@arena.cl`).
