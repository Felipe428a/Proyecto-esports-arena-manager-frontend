import { validarApodo, obtenerHistorialJugador } from './perfil'

describe('Módulo de perfil', () => {
  describe('validarApodo', () => {
    it('acepta apodos válidos de 3 a 16 caracteres sin espacios', () => {
      expect(validarApodo('camro').valido).toBeTrue()
      expect(validarApodo('abc').valido).toBeTrue()
      expect(validarApodo('1234567890123456').valido).toBeTrue()
    })

    it('falla si está vacío', () => {
      const res = validarApodo('')
      expect(res.valido).toBeFalse()
      expect(res.mensaje).toContain('obligatorio')
    })

    it('falla si contiene espacios', () => {
      const res = validarApodo('cam ro')
      expect(res.valido).toBeFalse()
      expect(res.mensaje).toContain('no puede contener espacios')
    })

    it('falla si tiene menos de 3 o más de 16 caracteres', () => {
      expect(validarApodo('ab').valido).toBeFalse()
      expect(validarApodo('12345678901234567').valido).toBeFalse()
    })
  })

  describe('obtenerHistorialJugador', () => {
    it('obtiene inscripciones individuales y las de los equipos del jugador', () => {
      const equipos = [
        { id: 10, integrantes: [{ jugadorId: 1 }] },
        { id: 20, integrantes: [{ jugadorId: 2 }] },
      ]
      const inscripciones = [
        { id: 1, torneoId: 1, participanteTipo: 'jugador', participanteId: 1 },
        { id: 2, torneoId: 2, participanteTipo: 'equipo', participanteId: 10 },
        { id: 3, torneoId: 3, participanteTipo: 'equipo', participanteId: 20 },
      ]

      const historial = obtenerHistorialJugador(1, inscripciones, equipos)
      expect(historial.length).toBe(2)
      expect(historial.map((h) => h.id)).toEqual([1, 2])
    })
  })
})
