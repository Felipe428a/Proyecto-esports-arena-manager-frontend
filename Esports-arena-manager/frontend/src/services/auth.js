/** Servicio de autenticación: habla con auth-service a través del API Gateway. */
import { api } from './api'

export const authService = {
  /** POST /auth/login → { token, refreshToken, expiraEn, refreshExpiraEn, usuario } */
  login: (credenciales) => api.post('/auth/login', credenciales, { publica: true }),
  /** POST /auth/registro → crea un JUGADOR y devuelve la sesión ya iniciada */
  registro: (datos) => api.post('/auth/registro', datos, { publica: true }),
  /** POST /auth/logout → revoca el refresh token en el backend */
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }, { publica: true }),
  /** GET /auth/me → el usuario del token actual (sirve para validar la sesión al recargar) */
  yo: (opciones) => api.get('/auth/me', opciones),
}
