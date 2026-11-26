import { puede, tieneRol, puedeAdministrarEquipo } from './permisos'
import { enlacesVisibles, ENLACES_MENU } from '../rutas'

describe('permisos por rol (restricciones de la interfaz)', () => {
  const jugador = { id: 5, rol: 'JUGADOR' }
  const organizador = { id: 2, rol: 'ORGANIZADOR' }
  const admin = { id: 1, rol: 'ADMINISTRADOR' }

  it('sin sesión no se puede nada', () => {
    expect(puede(null, 'inscribirse')).toBeFalse()
    expect(tieneRol(null, 'JUGADOR')).toBeFalse()
  })

  it('un jugador se inscribe y gestiona su equipo, pero no entra al panel', () => {
    expect(puede(jugador, 'inscribirse')).toBeTrue()
    expect(puede(jugador, 'gestionarEquipo')).toBeTrue()
    expect(puede(jugador, 'verPanel')).toBeFalse()
    expect(puede(jugador, 'inscribirOtros')).toBeFalse()
  })

  it('un organizador gestiona torneos y partidas, pero no juegos ni usuarios', () => {
    expect(puede(organizador, 'gestionarTorneos')).toBeTrue()
    expect(puede(organizador, 'gestionarPartidas')).toBeTrue()
    expect(puede(organizador, 'gestionarJuegos')).toBeFalse()
    expect(puede(organizador, 'gestionarUsuarios')).toBeFalse()
    expect(puede(organizador, 'eliminarTorneos')).toBeFalse()
  })

  it('un administrador puede todo', () => {
    ;['verPanel', 'gestionarJuegos', 'gestionarUsuarios', 'eliminarTorneos'].forEach((accion) =>
      expect(puede(admin, accion)).withContext(accion).toBeTrue()
    )
  })

  it('solo el capitán (o el staff) administra un equipo', () => {
    const equipo = { id: 1, capitanId: 5 }
    expect(puedeAdministrarEquipo(jugador, equipo)).toBeTrue()
    expect(puedeAdministrarEquipo({ id: 6, rol: 'JUGADOR' }, equipo)).toBeFalse()
    expect(puedeAdministrarEquipo(organizador, equipo)).toBeTrue()
  })

  it('el menú muestra enlaces según la sesión y el rol', () => {
    const ids = (u) => enlacesVisibles(u, ENLACES_MENU).map((e) => e.id)
    expect(ids(null)).toEqual(['inicio', 'torneos'])
    expect(ids(jugador)).toEqual(['inicio', 'torneos', 'inscripcion', 'equipo', 'perfil'])
    expect(ids(organizador)).toContain('admin')
    expect(ids(admin)).toContain('admin')
  })
})
