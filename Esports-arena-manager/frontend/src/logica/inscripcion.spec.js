import {
  validarInscripcion,
  inscripcionFueraDePlazo,
  equipoCompleto,
  tieneSancionActiva,
  sancionVigente,
} from './inscripcion'

describe('Módulo de inscripción', () => {
  let torneoAbierto
  let jugadorLimpio
  let jugadorSancionado
  let equipoConTodos
  let equipoIncompleto
  let equipoSancionado
  let juegoTactico

  beforeEach(() => {
    juegoTactico = { id: 1, nombre: 'Cripta Cero', modalidad: 'Equipos', integrantesPorEquipo: 3 }
    torneoAbierto = {
      id: 1,
      nombre: 'Copa Apertura',
      juegoId: 1,
      estado: 'abierto',
      cupoMax: 8,
      cupoOcupado: 2,
      fechaCierreInscripcion: '2026-12-31',
    }

    jugadorLimpio = { id: 1, nombre: 'Camila', apodo: 'camro', sanciones: [] }
    jugadorSancionado = {
      id: 2,
      nombre: 'Benjamín',
      sanciones: [{ motivo: 'Falta', activa: true, fechaFin: '2026-12-31' }],
    }

    equipoConTodos = {
      id: 1,
      nombre: 'Escuadrón Alfa',
      juegoId: 1,
      activo: true,
      integrantes: [{ jugadorId: 1 }, { jugadorId: 3 }, { jugadorId: 4 }],
    }

    equipoIncompleto = {
      id: 2,
      nombre: 'Dúo Incompleto',
      juegoId: 1,
      activo: true,
      integrantes: [{ jugadorId: 1 }, { jugadorId: 3 }],
    }

    equipoSancionado = {
      id: 3,
      nombre: 'Equipo con Sancionado',
      juegoId: 1,
      activo: true,
      integrantes: [{ jugadorId: 1 }, { jugadorId: 2 }, { jugadorId: 3 }],
    }
  })

  it('permite la inscripción válida de un jugador sin sanciones', () => {
    const res = validarInscripcion({
      torneo: torneoAbierto,
      tipo: 'jugador',
      participanteId: 1,
      inscripciones: [],
      todosJugadores: [jugadorLimpio],
      fechaActual: new Date('2026-09-01'),
    })
    expect(res.valido).toBeTrue()
  })

  it('rechaza la inscripción si el jugador tiene sanción activa', () => {
    const res = validarInscripcion({
      torneo: torneoAbierto,
      tipo: 'jugador',
      participanteId: 2,
      inscripciones: [],
      todosJugadores: [jugadorSancionado],
      fechaActual: new Date('2026-09-01'),
    })
    expect(res.valido).toBeFalse()
    expect(res.general).toContain('sanción vigente')
  })

  it('rechaza la inscripción si el jugador ya está inscrito en el torneo', () => {
    const res = validarInscripcion({
      torneo: torneoAbierto,
      tipo: 'jugador',
      participanteId: 1,
      inscripciones: [{ torneoId: 1, participanteTipo: 'jugador', participanteId: 1 }],
      todosJugadores: [jugadorLimpio],
      fechaActual: new Date('2026-09-01'),
    })
    expect(res.valido).toBeFalse()
    expect(res.general).toContain('ya está inscrito')
  })

  it('rechaza la inscripción si el torneo ya superó la fecha de cierre', () => {
    const res = validarInscripcion({
      torneo: torneoAbierto,
      tipo: 'jugador',
      participanteId: 1,
      inscripciones: [],
      todosJugadores: [jugadorLimpio],
      fechaActual: new Date(2027, 0, 1, 0, 0, 1), // hora local: ya pasó el 31-dic
    })
    expect(res.valido).toBeFalse()
    expect(res.general).toContain('ya cerró')
  })

  it('rechaza la inscripción si el equipo no cumple con el mínimo de integrantes', () => {
    const res = validarInscripcion({
      torneo: torneoAbierto,
      tipo: 'equipo',
      participanteId: 2,
      inscripciones: [],
      todosEquipos: [equipoIncompleto],
      todosJugadores: [jugadorLimpio],
      juegos: [juegoTactico],
      fechaActual: new Date('2026-09-01'),
    })
    expect(res.valido).toBeFalse()
    expect(res.mensaje).toContain('al menos 3 integrantes')
  })

  it('rechaza la inscripción si un integrante del equipo tiene sanción activa', () => {
    const res = validarInscripcion({
      torneo: torneoAbierto,
      tipo: 'equipo',
      participanteId: 3,
      inscripciones: [],
      todosEquipos: [equipoSancionado],
      todosJugadores: [jugadorLimpio, jugadorSancionado],
      juegos: [juegoTactico],
      fechaActual: new Date('2026-09-01'),
    })
    expect(res.valido).toBeFalse()
    expect(res.general).toContain('bloquea la inscripción del equipo')
  })

  // ---------------------------------------------------------------------------
  // Reglas extraídas como funciones puras (pruebas obligatorias #4, #5 y #6)
  // ---------------------------------------------------------------------------
  describe('inscripcionFueraDePlazo', () => {
    const torneo = { fechaCierreInscripcion: '2026-09-15' }

    it('permite inscribirse antes de la fecha de cierre', () => {
      expect(inscripcionFueraDePlazo(torneo, new Date(2026, 8, 1))).toBeFalse()
    })

    it('permite inscribirse el MISMO día de cierre, incluso al mediodía', () => {
      // Regresión del bug de zona horaria: antes decía "ya cerró" a las 12:00 del último día
      expect(inscripcionFueraDePlazo(torneo, new Date(2026, 8, 15, 12, 0))).toBeFalse()
      expect(inscripcionFueraDePlazo(torneo, new Date(2026, 8, 15, 23, 59))).toBeFalse()
    })

    it('rechaza desde el primer segundo del día siguiente', () => {
      expect(inscripcionFueraDePlazo(torneo, new Date(2026, 8, 16, 0, 0, 1))).toBeTrue()
    })

    it('no bloquea si el torneo no tiene fecha de cierre', () => {
      expect(inscripcionFueraDePlazo({}, new Date())).toBeFalse()
      expect(inscripcionFueraDePlazo(null, new Date())).toBeFalse()
    })

    describe('con reloj simulado (mock de Date)', () => {
      beforeEach(() => jasmine.clock().install())
      afterEach(() => jasmine.clock().uninstall())

      it('usa la fecha actual cuando no se entrega fechaActual', () => {
        jasmine.clock().mockDate(new Date(2026, 8, 14, 10, 0))
        expect(inscripcionFueraDePlazo(torneo)).toBeFalse()

        jasmine.clock().mockDate(new Date(2026, 8, 16, 10, 0))
        expect(inscripcionFueraDePlazo(torneo)).toBeTrue()
      })

      it('validarInscripcion también respeta el reloj simulado', () => {
        jasmine.clock().mockDate(new Date(2026, 8, 20))
        const res = validarInscripcion({
          torneo,
          tipo: 'jugador',
          participanteId: 1,
          todosJugadores: [{ id: 1, sanciones: [] }],
        })
        expect(res.valido).toBeFalse()
        expect(res.general).toContain('ya cerró')
      })
    })
  })

  describe('equipoCompleto', () => {
    const juegoEquipos = { modalidad: 'Equipos', integrantesPorEquipo: 3 }
    const juegoIndividual = { modalidad: 'Individual', integrantesPorEquipo: 1 }

    it('es verdadero cuando alcanza los integrantes exigidos', () => {
      expect(equipoCompleto({ integrantes: [{}, {}, {}] }, juegoEquipos)).toBeTrue()
    })

    it('es verdadero si supera el mínimo', () => {
      expect(equipoCompleto({ integrantes: [{}, {}, {}, {}] }, juegoEquipos)).toBeTrue()
    })

    it('es falso si falta un integrante', () => {
      expect(equipoCompleto({ integrantes: [{}, {}] }, juegoEquipos)).toBeFalse()
    })

    it('es falso para un equipo vacío', () => {
      expect(equipoCompleto({ integrantes: [] }, juegoEquipos)).toBeFalse()
    })

    it('en juegos individuales no exige mínimo', () => {
      expect(equipoCompleto({ integrantes: [{}] }, juegoIndividual)).toBeTrue()
    })

    it('es falso si no hay equipo', () => {
      expect(equipoCompleto(null, juegoEquipos)).toBeFalse()
    })
  })

  describe('tieneSancionActiva / sancionVigente', () => {
    const hoy = new Date(2026, 9, 20) // 20 de octubre de 2026

    it('es verdadero con sanción activa y fecha de término futura', () => {
      const jugador = { sanciones: [{ activa: true, fechaFin: '2026-12-31' }] }
      expect(tieneSancionActiva(jugador, hoy)).toBeTrue()
    })

    it('es verdadero el mismo día en que termina la sanción', () => {
      const jugador = { sanciones: [{ activa: true, fechaFin: '2026-10-20' }] }
      expect(tieneSancionActiva(jugador, hoy)).toBeTrue()
    })

    it('es falso si la sanción ya cumplió su fecha de término', () => {
      // Aunque la bandera "activa" siga en true, ya no debe bloquear
      const jugador = { sanciones: [{ activa: true, fechaFin: '2026-09-20' }] }
      expect(tieneSancionActiva(jugador, hoy)).toBeFalse()
    })

    it('es falso si la sanción está marcada como inactiva', () => {
      const jugador = { sanciones: [{ activa: false, fechaFin: '2027-01-01' }] }
      expect(tieneSancionActiva(jugador, hoy)).toBeFalse()
    })

    it('es verdadero si está activa y no tiene fecha de término', () => {
      expect(sancionVigente({ activa: true }, hoy)).toBeTrue()
    })

    it('es falso para jugadores sin sanciones o inexistentes', () => {
      expect(tieneSancionActiva({ sanciones: [] }, hoy)).toBeFalse()
      expect(tieneSancionActiva(null, hoy)).toBeFalse()
      expect(tieneSancionActiva({}, hoy)).toBeFalse()
    })
  })

  describe('cupos y plazo en validarInscripcion', () => {
    it('rechaza cuando el torneo no tiene cupos', () => {
      const res = validarInscripcion({
        torneo: { ...torneoAbierto, cupoOcupado: 8 },
        tipo: 'jugador',
        participanteId: 1,
        todosJugadores: [jugadorLimpio],
        fechaActual: new Date('2026-09-01'),
      })
      expect(res.valido).toBeFalse()
      expect(res.general).toContain('cupo máximo')
    })

    it('acepta la inscripción el último día del plazo', () => {
      const res = validarInscripcion({
        torneo: { ...torneoAbierto, fechaCierreInscripcion: '2026-09-15' },
        tipo: 'jugador',
        participanteId: 1,
        todosJugadores: [jugadorLimpio],
        fechaActual: new Date(2026, 8, 15, 12, 0),
      })
      expect(res.valido).toBeTrue()
    })
  })
})

