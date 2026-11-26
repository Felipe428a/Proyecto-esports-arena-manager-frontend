/**
 * Funciones puras para perfil de jugador, historial y validación de apodo.
 */

export function validarApodo(valor) {
  const apodo = (valor || '').trim()

  if (!apodo) {
    return { valido: false, mensaje: 'El apodo es obligatorio.' }
  }
  if (/\s/.test(apodo)) {
    return { valido: false, mensaje: 'El apodo no puede contener espacios.' }
  }
  if (apodo.length < 3 || apodo.length > 16) {
    return { valido: false, mensaje: 'El apodo debe tener entre 3 y 16 caracteres.' }
  }

  return { valido: true, mensaje: '' }
}

export function obtenerHistorialJugador(jugadorId, inscripciones = [], equipos = []) {
  if (!jugadorId) return []

  const idsEquiposDelJugador = equipos
      .filter((e) => e.integrantes?.some((i) => i.jugadorId === Number(jugadorId)))
      .map((e) => e.id)

  return inscripciones.filter(
      (i) =>
        (i.participanteTipo === 'jugador' && i.participanteId === Number(jugadorId)) ||
        (i.participanteTipo === 'equipo' && idsEquiposDelJugador.includes(i.participanteId))
  )
}
