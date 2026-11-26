import {
  adaptarJuego,
  adaptarTorneo,
  adaptarEquipo,
  adaptarInscripcion,
  adaptarSancion,
  adaptarPartida,
  calcularEstadisticas,
  construirModelo,
  soloFecha,
} from './adaptadores'

describe('adaptadores (JSON de los microservicios → modelo del frontend)', () => {
  const juegoApi = { id: 1, nombre: 'Cripta Cero', genero: 'Shooter', modalidad: 'EQUIPOS', jugadoresPorEquipo: 3, estado: 'ACTIVO' }
  const torneoApi = {
    id: 7, nombre: 'Copa', juegoId: 1, estado: 'EN_CURSO', modalidad: 'EQUIPOS', cupoMaximo: 8,
    fechaCierreInscripcion: '2026-09-15T23:59:00', fechaInicio: '2026-09-22T18:00:00', descripcion: 'Final',
  }
  const equipoApi = {
    id: 3, nombre: 'Runas', capitanId: 10, juegoPrincipalId: 1, estado: 'ACTIVO',
    integrantes: [{ usuarioId: 10, rolDentroEquipo: 'CAPITAN' }, { usuarioId: 11, rolDentroEquipo: 'Soporte' }],
  }

  it('soloFecha recorta la hora', () => {
    expect(soloFecha('2026-09-15T23:59:00')).toBe('2026-09-15')
    expect(soloFecha(null)).toBeNull()
  })

  it('adapta un juego (modalidad e integrantes)', () => {
    const j = adaptarJuego(juegoApi)
    expect(j.modalidad).toBe('Equipos')
    expect(j.integrantesPorEquipo).toBe(3)
    expect(j.categoria).toBe('Shooter')
    expect(adaptarJuego({ ...juegoApi, modalidad: 'INDIVIDUAL' }).modalidad).toBe('Individual')
  })

  it('adapta un torneo: estado en minúscula, cupos ocupados y premios ordenados', () => {
    const inscripciones = [
      { torneoId: 7, estado: 'aceptada' }, { torneoId: 7, estado: 'aceptada' },
      { torneoId: 7, estado: 'cancelada' }, { torneoId: 8, estado: 'aceptada' },
    ]
    const premios = [
      { torneoId: 7, posicion: 2, descripcion: 'Medalla', valor: 0 },
      { torneoId: 7, posicion: 1, descripcion: 'Trofeo', valor: 300000 },
    ]
    const t = adaptarTorneo(torneoApi, inscripciones, premios)
    expect(t.estado).toBe('en_curso')
    expect(t.cupoMax).toBe(8)
    expect(t.cupoOcupado).toBe(2)
    expect(t.fechaCierreInscripcion).toBe('2026-09-15')
    expect(t.premios.map((p) => p.posicion)).toEqual([1, 2])
    expect(t.premios[0].premio).toContain('Trofeo')
    expect(t.premios[0].premio).toContain('300.000')
  })

  it('adapta un equipo: integrantes con jugadorId y capitán legible', () => {
    const e = adaptarEquipo(equipoApi)
    expect(e.juegoId).toBe(1)
    expect(e.activo).toBeTrue()
    expect(e.integrantes[0]).toEqual({ jugadorId: 10, rol: 'Capitán/a' })
  })

  it('adapta inscripciones individuales y por equipo', () => {
    expect(adaptarInscripcion({ id: 1, torneoId: 7, tipoParticipante: 'INDIVIDUAL', jugadorId: 5, estado: 'ACEPTADA' }))
      .toEqual(jasmine.objectContaining({ participanteTipo: 'jugador', participanteId: 5, estado: 'aceptada' }))
    expect(adaptarInscripcion({ id: 2, torneoId: 7, tipoParticipante: 'EQUIPO', equipoId: 3 }).participanteTipo).toBe('equipo')
  })

  it('una sanción ACTIVA está vigente solo hasta su fecha de fin', () => {
    const hoy = new Date(2026, 8, 10)
    expect(adaptarSancion({ estado: 'ACTIVA', fechaFin: '2026-09-20' }, hoy).activa).toBeTrue()
    expect(adaptarSancion({ estado: 'ACTIVA', fechaFin: '2026-09-01' }, hoy).activa).toBeFalse()
    expect(adaptarSancion({ estado: 'CERRADA', fechaFin: '2026-09-20' }, hoy).activa).toBeFalse()
  })

  it('una partida resuelve los nombres según la modalidad y toma el resultado no anulado', () => {
    const p = adaptarPartida(
      { id: 1, torneoId: 7, ronda: 1, estado: 'FINALIZADA', participanteAId: 3, participanteBId: 99, fechaHora: '2026-09-22T18:00:00' },
      {
        torneosCrudos: [torneoApi],
        equipos: [adaptarEquipo(equipoApi)],
        resultados: [
          { partidaId: 1, ganadorId: 99, puntajeA: 0, puntajeB: 1, estadoValidacion: 'ANULADO' },
          { partidaId: 1, ganadorId: 3, puntajeA: 2, puntajeB: 1, estadoValidacion: 'VALIDADO' },
        ],
      }
    )
    expect(p.estado).toBe('jugada')
    expect(p.participanteA).toEqual({ tipo: 'equipo', id: 3, nombre: 'Runas' })
    expect(p.participanteB.nombre).toBe('Por definir')
    expect(p.resultado.puntajeA).toBe(2)
    expect(p.resultado.ganadorNombre).toBe('Runas')
  })

  it('calcula victorias y derrotas de un jugador por sus partidas y las de su equipo', () => {
    const equipos = [adaptarEquipo(equipoApi)]
    const partidas = [
      { participanteA: { tipo: 'equipo', id: 3 }, participanteB: { tipo: 'equipo', id: 4 }, resultado: { ganadorId: 3 } },
      { participanteA: { tipo: 'equipo', id: 4 }, participanteB: { tipo: 'equipo', id: 3 }, resultado: { ganadorId: 4 } },
      { participanteA: { tipo: 'jugador', id: 11 }, participanteB: { tipo: 'jugador', id: 12 }, resultado: { ganadorId: 11 } },
      { participanteA: { tipo: 'jugador', id: 11 }, participanteB: { tipo: 'jugador', id: 12 }, resultado: null },
    ]
    expect(calcularEstadisticas(11, partidas, equipos)).toEqual({ victorias: 2, derrotas: 1 })
    expect(calcularEstadisticas(50, partidas, equipos)).toEqual({ victorias: 0, derrotas: 0 })
  })

  it('construirModelo arma todo el modelo y separa jugadores del resto de roles', () => {
    const modelo = construirModelo({
      juegos: [juegoApi],
      torneos: [torneoApi],
      usuarios: [
        { id: 10, nombre: 'Vale', nickname: 'vale', rol: 'JUGADOR' },
        { id: 1, nombre: 'Admin', nickname: 'admin', rol: 'ADMINISTRADOR' },
      ],
      equipos: [equipoApi],
      inscripciones: [{ id: 1, torneoId: 7, tipoParticipante: 'EQUIPO', equipoId: 3, estado: 'CANCELADA' }],
      sanciones: [{ id: 1, usuarioId: 10, estado: 'ACTIVA', fechaFin: '2999-01-01', motivo: 'x' }],
    })
    expect(modelo.jugadores.length).toBe(1)
    expect(modelo.usuarios.length).toBe(2)
    expect(modelo.inscripciones.length).toBe(0) // las canceladas no cuentan
    expect(modelo.jugadores[0].equipos).toEqual([3])
    expect(modelo.jugadores[0].sanciones[0].activa).toBeTrue()
    expect(modelo.torneos[0].cupoOcupado).toBe(0)
  })

  it('construirModelo sin datos devuelve listas vacías (backend sin responder)', () => {
    const vacio = construirModelo({})
    expect(vacio.torneos).toEqual([])
    expect(vacio.jugadores).toEqual([])
  })
})
