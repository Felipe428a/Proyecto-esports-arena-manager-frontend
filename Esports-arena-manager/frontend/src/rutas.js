/**
 * Menú principal centralizado. `roles`: quién ve el enlace (sin `roles` = público; `sesion: true` = cualquier usuario con sesión).
 * Ocultar un enlace no protege la vista: para eso está <RutaProtegida> en App.jsx y, sobre todo, el backend.
 */
export const ENLACES_MENU = [
  { id: 'inicio', ruta: '/inicio', texto: 'Inicio' },
  { id: 'torneos', ruta: '/torneos', texto: 'Torneos' },
  { id: 'inscripcion', ruta: '/inscripcion', texto: 'Inscripción', sesion: true },
  { id: 'equipo', ruta: '/equipo', texto: 'Mi equipo', sesion: true },
  { id: 'perfil', ruta: '/perfil', texto: 'Mi perfil', sesion: true },
  { id: 'admin', ruta: '/admin', texto: 'Panel de gestión', roles: ['ORGANIZADOR', 'ADMINISTRADOR'] },
]

/** Filtra el menú según la sesión y el rol del usuario. */
export function enlacesVisibles(usuario, enlaces = ENLACES_MENU) {
  return enlaces.filter((e) => {
    if (e.roles) return Boolean(usuario) && e.roles.includes(usuario.rol)
    if (e.sesion) return Boolean(usuario)
    return true
  })
}
