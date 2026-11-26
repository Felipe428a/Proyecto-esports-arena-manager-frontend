/**
 * Servicios de cada microservicio. Todos pasan por solicitar() (api.js), que agrega el token,
 * renueva la sesión y convierte los errores en mensajes. Los componentes nunca usan fetch directo.
 *
 * Rutas: API Gateway (VITE_API_URL) + /<recurso>  →  microservicio correspondiente.
 */
import { api } from './api'

const crud = (recurso) => ({
  listar: (opciones) => api.get(`/${recurso}`, opciones),
  obtener: (id, opciones) => api.get(`/${recurso}/${id}`, opciones),
  crear: (datos) => api.post(`/${recurso}`, datos),
  actualizar: (id, datos) => api.put(`/${recurso}/${id}`, datos),
  eliminar: (id) => api.delete(`/${recurso}/${id}`),
})

/** game-service · juegos habilitados */
export const juegosService = {
  ...crud('juegos'),
  listar: (opciones) => api.get('/juegos?todos=true', opciones),
  desactivar: (id) => api.patch(`/juegos/${id}/desactivar`),
}

/** tournament-service · torneos */
export const torneosService = {
  ...crud('torneos'),
  cambiarEstado: (id, nuevoEstado) =>
    api.patch(`/torneos/${id}/estado?nuevoEstado=${encodeURIComponent(nuevoEstado)}`),
}

/** user-service · perfiles de jugadores */
export const usuariosService = crud('usuarios')

/** team-service · equipos e integrantes */
export const equiposService = {
  ...crud('equipos'),
  agregarMiembro: (id, usuarioId, rolDentroEquipo = 'Jugador/a') =>
    api.post(`/equipos/${id}/miembros`, { usuarioId, rolDentroEquipo }),
  quitarMiembro: (id, usuarioId) => api.delete(`/equipos/${id}/miembros/${usuarioId}`),
  desactivar: (id) => api.patch(`/equipos/${id}/desactivar`),
}

/** registration-service · inscripciones */
export const inscripcionesService = {
  ...crud('inscripciones'),
  cancelar: (id) => api.patch(`/inscripciones/${id}/cancelar`),
}

/** match-service · partidas */
export const partidasService = {
  ...crud('partidas'),
  cancelar: (id) => api.patch(`/partidas/${id}/cancelar`),
}

/** result-service · resultados */
export const resultadosService = crud('resultados')

/** prize-service · premios */
export const premiosService = crud('premios')

/** sanction-service · sanciones */
export const sancionesService = {
  ...crud('sanciones'),
  cerrar: (id) => api.patch(`/sanciones/${id}/cerrar`),
}

/** notification-service · notificaciones del usuario */
export const notificacionesService = {
  ...crud('notificaciones'),
  marcarLeida: (id) => api.patch(`/notificaciones/${id}/leer`),
}

/** auth-service · administración de cuentas (solo ADMINISTRADOR) */
export const cuentasService = {
  listar: (opciones) => api.get('/auth/cuentas', opciones),
  actualizar: (id, datos) => api.put(`/auth/cuentas/${id}`, datos),
  eliminar: (id) => api.delete(`/auth/cuentas/${id}`),
}
