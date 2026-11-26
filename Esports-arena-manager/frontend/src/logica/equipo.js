/**
 * Funciones puras para creación y gestión de equipos e integrantes.
 */

export function validarCreacionEquipo(nombre, juegoId, capitanId, equiposExistentes = []) {
  const nombreLimpio = (nombre || '').trim()

  if (!nombreLimpio) {
    return {
      valido: false,
      campo: 'campo-nombre-equipo',
      mensaje: 'El nombre del equipo es obligatorio.',
    }
  }

  const yaExiste = equiposExistentes.some(
      (e) => e.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase()
  )
  if (yaExiste) {
    return {
      valido: false,
      campo: 'campo-nombre-equipo',
      mensaje: 'Ya existe un equipo con ese nombre.',
    }
  }

  if (!juegoId) {
    return {
      valido: false,
      campo: 'campo-juego-equipo',
      mensaje: 'Debes seleccionar un juego principal.',
    }
  }

  if (!capitanId) {
    return {
      valido: false,
      campo: 'campo-capitan',
      mensaje: 'Debes seleccionar un capitán.',
    }
  }

  return { valido: true }
}

export function obtenerJugadoresDisponibles(todosJugadores = [], integrantesActuales = []) {
  const idsEnEquipo = integrantesActuales.map((i) => i.jugadorId)
  return todosJugadores.filter((j) => !idsEnEquipo.includes(j.id))
}
