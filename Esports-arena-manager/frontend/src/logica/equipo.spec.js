import { validarCreacionEquipo, obtenerJugadoresDisponibles } from './equipo'

describe('Módulo de equipo', () => {
  const equiposExistentes = [
    { id: 1, nombre: 'Escuadrón Nocturno' },
    { id: 2, nombre: 'Runas del Alba' },
  ]

  describe('validarCreacionEquipo', () => {
    it('valida correctamente un equipo con datos válidos', () => {
      const res = validarCreacionEquipo('Nuevo Equipo', 1, 2, equiposExistentes)
      expect(res.valido).toBeTrue()
    })

    it('falla si el nombre está vacío', () => {
      const res = validarCreacionEquipo('   ', 1, 2, equiposExistentes)
      expect(res.valido).toBeFalse()
      expect(res.mensaje).toContain('obligatorio')
    })

    it('falla si ya existe un equipo con ese nombre (ignorando mayúsculas)', () => {
      const res = validarCreacionEquipo('escuadrón nocturno', 1, 2, equiposExistentes)
      expect(res.valido).toBeFalse()
      expect(res.mensaje).toContain('Ya existe un equipo')
    })

    it('falla si no se selecciona capitán', () => {
      const res = validarCreacionEquipo('Equipo Tres', 1, null, equiposExistentes)
      expect(res.valido).toBeFalse()
      expect(res.campo).toBe('campo-capitan')
    })
  })

  describe('obtenerJugadoresDisponibles', () => {
    it('excluye a los jugadores que ya forman parte del equipo', () => {
      const jugadores = [
        { id: 1, nombre: 'Jugador 1' },
        { id: 2, nombre: 'Jugador 2' },
        { id: 3, nombre: 'Jugador 3' },
      ]
      const integrantes = [{ jugadorId: 2, rol: 'Capitán' }]

      const disponibles = obtenerJugadoresDisponibles(jugadores, integrantes)
      expect(disponibles.length).toBe(2)
      expect(disponibles.map((j) => j.id)).toEqual([1, 3])
    })
  })
})
