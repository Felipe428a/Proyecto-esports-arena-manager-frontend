/**
 * Validación y lógica de inscripción de participantes a torneos.
 */

export function yaEstaInscrito(torneoId, tipo, participanteId, inscripciones = []) {
  return inscripciones.some(
    (i) =>
      i.torneoId === Number(torneoId) &&
      i.participanteTipo === tipo &&
      i.participanteId === Number(participanteId)
  )
}

export function tieneSancionActiva(jugador) {
  if (!jugador || !Array.isArray(jugador.sanciones)) return false
  return jugador.sanciones.some((s) => s.activa)
}

export function equipoTieneSancionActiva(equipo, todosJugadores = []) {
  if (!equipo || !Array.isArray(equipo.integrantes)) return false
  return equipo.integrantes.some((integrante) => {
    const jugador = todosJugadores.find((j) => j.id === integrante.jugadorId)
    return tieneSancionActiva(jugador)
  })
}

export function validarInscripcion({
  torneo,
  tipo,
  participanteId,
  inscripciones = [],
  todosJugadores = [],
  todosEquipos = [],
  juegos = [],
  fechaActual = new Date(),
}) {
  if (!torneo) {
    return { valido: false, campo: 'campo-torneo', mensaje: 'Selecciona un torneo válido.' }
  }

  const fechaCierre = new Date(torneo.fechaCierreInscripcion)
  // Establecer fin del día para la fecha de cierre si sólo es string YYYY-MM-DD
  fechaCierre.setHours(23, 59, 59, 999)
  if (fechaActual > fechaCierre) {
    return { valido: false, general: 'El plazo de inscripción para este torneo ya cerró.' }
  }

  if (torneo.cupoOcupado >= torneo.cupoMax) {
    return { valido: false, general: 'Este torneo alcanzó su cupo máximo de inscripciones.' }
  }

  if (!participanteId) {
    return {
      valido: false,
      campo: tipo === 'jugador' ? 'campo-jugador' : 'campo-equipo',
      mensaje: `Selecciona un ${tipo === 'jugador' ? 'jugador' : 'equipo'} válido.`,
    }
  }

  if (tipo === 'jugador') {
    const jugador = todosJugadores.find((j) => j.id === Number(participanteId))
    if (!jugador) {
      return { valido: false, campo: 'campo-jugador', mensaje: 'Jugador no encontrado.' }
    }

    if (yaEstaInscrito(torneo.id, 'jugador', jugador.id, inscripciones)) {
      return { valido: false, general: 'Este jugador ya está inscrito en este torneo.' }
    }

    if (tieneSancionActiva(jugador)) {
      return {
        valido: false,
        general: 'Este jugador tiene una sanción vigente y no puede inscribirse hasta que se cumpla.',
      }
    }

    return { valido: true }
  }

  // Validación para equipo
  const equipo = todosEquipos.find((e) => e.id === Number(participanteId))
  if (!equipo) {
    return { valido: false, campo: 'campo-equipo', mensaje: 'Selecciona un equipo válido.' }
  }

  if (!equipo.activo) {
    return { valido: false, campo: 'campo-equipo', mensaje: 'Este equipo está inactivo y no puede inscribirse.' }
  }

  const juego = juegos.find((j) => j.id === torneo.juegoId)
  if (juego && juego.modalidad === 'Equipos' && equipo.integrantes.length < juego.integrantesPorEquipo) {
    return {
      valido: false,
      campo: 'campo-equipo',
      mensaje: `El equipo necesita al menos ${juego.integrantesPorEquipo} integrantes para este juego (tiene ${equipo.integrantes.length}).`,
    }
  }

  if (yaEstaInscrito(torneo.id, 'equipo', equipo.id, inscripciones)) {
    return { valido: false, general: 'Este equipo ya está inscrito en este torneo.' }
  }

  if (equipoTieneSancionActiva(equipo, todosJugadores)) {
    return {
      valido: false,
      general: 'Un integrante del equipo tiene una sanción vigente y bloquea la inscripción del equipo.',
    }
  }

  return { valido: true }
}
