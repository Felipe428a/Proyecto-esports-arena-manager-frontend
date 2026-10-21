import {
  fechaRelativa,
  JUEGOS_INICIALES,
  TORNEOS_INICIALES,
  EQUIPOS_INICIALES,
  JUGADORES_INICIALES,
  INSCRIPCIONES_INICIALES,
} from './datos'

describe('fechaRelativa', () => {
  it('devuelve la fecha de hoy con 0 días', () => {
    expect(fechaRelativa(0, new Date(2026, 9, 20))).toBe('2026-10-20')
  })

  it('suma días cruzando de mes y de año', () => {
    expect(fechaRelativa(15, new Date(2026, 9, 20))).toBe('2026-11-04')
    expect(fechaRelativa(15, new Date(2026, 11, 25))).toBe('2027-01-09')
  })

  it('resta días con números negativos', () => {
    expect(fechaRelativa(-1, new Date(2026, 9, 1))).toBe('2026-09-30')
  })

  it('rellena con ceros el mes y el día', () => {
    expect(fechaRelativa(0, new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('datos iniciales de demostración', () => {
  const hoy = fechaRelativa(0)

  it('los torneos abiertos aún permiten inscribirse (cierre hoy o después)', () => {
    // Regresión: antes las fechas eran fijas y toda inscripción decía "plazo cerrado"
    TORNEOS_INICIALES.filter((t) => t.estado === 'abierto').forEach((t) => {
      expect(t.fechaCierreInscripcion >= hoy).toBeTrue()
    })
  })

  it('los torneos abiertos tienen cupos libres para la demostración', () => {
    TORNEOS_INICIALES.filter((t) => t.estado === 'abierto').forEach((t) => {
      expect(t.cupoOcupado).toBeLessThan(t.cupoMax)
    })
  })

  it('ningún torneo tiene más inscritos que cupos', () => {
    TORNEOS_INICIALES.forEach((t) => expect(t.cupoOcupado).toBeLessThanOrEqual(t.cupoMax))
  })

  it('los ids de cada colección son únicos', () => {
    ;[JUEGOS_INICIALES, TORNEOS_INICIALES, EQUIPOS_INICIALES, JUGADORES_INICIALES].forEach(
      (coleccion) => {
        const ids = coleccion.map((e) => e.id)
        expect(new Set(ids).size).toBe(ids.length)
      }
    )
  })

  it('cada torneo y equipo apunta a un juego que existe', () => {
    const idsJuegos = JUEGOS_INICIALES.map((j) => j.id)
    TORNEOS_INICIALES.forEach((t) => expect(idsJuegos).toContain(t.juegoId))
    EQUIPOS_INICIALES.forEach((e) => expect(idsJuegos).toContain(e.juegoId))
  })

  it('cada inscripción apunta a un torneo que existe', () => {
    const idsTorneos = TORNEOS_INICIALES.map((t) => t.id)
    INSCRIPCIONES_INICIALES.forEach((i) => expect(idsTorneos).toContain(i.torneoId))
  })

  it('al menos un jugador tiene una sanción vigente (para mostrar el bloqueo)', () => {
    const vigente = JUGADORES_INICIALES.some((j) =>
      j.sanciones.some((s) => s.activa && s.fechaFin >= hoy)
    )
    expect(vigente).toBeTrue()
  })
})
