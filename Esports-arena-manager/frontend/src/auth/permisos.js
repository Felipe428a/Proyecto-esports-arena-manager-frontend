/**
 * Permisos del frontend según el rol que viene en la sesión.
 * Es el "candado de la interfaz": oculta vistas y botones. La protección real la hace
 * cada microservicio con Spring Security (401/403), aunque alguien se salte esto con DevTools.
 */
export const ROLES = {
  JUGADOR: 'JUGADOR',
  ORGANIZADOR: 'ORGANIZADOR',
  ADMINISTRADOR: 'ADMINISTRADOR',
}

export const NOMBRE_ROL = {
  JUGADOR: 'Jugador',
  ORGANIZADOR: 'Organizador',
  ADMINISTRADOR: 'Administrador',
}

/** Qué roles pueden hacer cada acción de la interfaz. */
export const PERMISOS = {
  inscribirse: [ROLES.JUGADOR, ROLES.ORGANIZADOR, ROLES.ADMINISTRADOR],
  gestionarEquipo: [ROLES.JUGADOR, ROLES.ORGANIZADOR, ROLES.ADMINISTRADOR],
  inscribirOtros: [ROLES.ORGANIZADOR, ROLES.ADMINISTRADOR],
  verPanel: [ROLES.ORGANIZADOR, ROLES.ADMINISTRADOR],
  gestionarTorneos: [ROLES.ORGANIZADOR, ROLES.ADMINISTRADOR],
  gestionarPartidas: [ROLES.ORGANIZADOR, ROLES.ADMINISTRADOR],
  gestionarSanciones: [ROLES.ORGANIZADOR, ROLES.ADMINISTRADOR],
  eliminarTorneos: [ROLES.ADMINISTRADOR],
  gestionarJuegos: [ROLES.ADMINISTRADOR],
  gestionarUsuarios: [ROLES.ADMINISTRADOR],
}

export function tieneRol(usuario, roles) {
  if (!usuario) return false
  const lista = Array.isArray(roles) ? roles : [roles]
  return lista.includes(usuario.rol)
}

export function puede(usuario, accion) {
  return tieneRol(usuario, PERMISOS[accion] || [])
}

/** El capitán de un equipo (o un organizador/administrador) puede administrarlo. */
export function puedeAdministrarEquipo(usuario, equipo) {
  if (!usuario || !equipo) return false
  return equipo.capitanId === usuario.id || puede(usuario, 'inscribirOtros')
}
