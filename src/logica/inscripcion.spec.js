import { validarInscripcion } from './inscripcion'

describe('Módulo de inscripción', () => {
  let torneoAbierto
  let jugadorLimpio
  let jugadorSancionado
  let equipoCompleto
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

    equipoCompleto = {
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
      fechaActual: new Date('2027-01-01'),
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
})
