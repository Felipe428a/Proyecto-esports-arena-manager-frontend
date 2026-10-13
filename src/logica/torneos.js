/**
 * Funciones puras para listado, filtrado y resumen de torneos.
 */

export function obtenerEstadoTorneoInfo(estado) {
  const mapa = {
    abierto: { etiqueta: 'Inscripciones abiertas', clase: 'estado-abierto' },
    en_curso: { etiqueta: 'En curso', clase: 'estado-en-curso' },
    finalizado: { etiqueta: 'Finalizado', clase: 'estado-finalizado' },
  }
  return mapa[estado] || { etiqueta: estado || 'Desconocido', clase: '' }
}

export function validarRangoFechas(fechaDesde, fechaHasta) {
  if (fechaDesde && fechaHasta) {
    if (new Date(fechaDesde) > new Date(fechaHasta)) {
      return {
        valido: false,
        error: 'La fecha inicial no puede ser posterior a la fecha final.',
      }
    }
  }
  return { valido: true, error: '' }
}

export function torneoCoincideFiltros(torneo, filtros) {
  if (!torneo) return false
  const { buscar = '', juego = '', estado = '', fechaDesde = '', fechaHasta = '' } = filtros || {}

  if (buscar.trim()) {
    const texto = buscar.trim().toLowerCase()
    if (!torneo.nombre.toLowerCase().includes(texto)) {
      return false
    }
  }

  if (juego) {
    if (torneo.juegoId !== Number(juego)) {
      return false
    }
  }

  if (estado) {
    if (torneo.estado !== estado) {
      return false
    }
  }

  if (fechaDesde) {
    if (new Date(torneo.fechaCierreInscripcion) < new Date(fechaDesde)) {
      return false
    }
  }

  if (fechaHasta) {
    if (new Date(torneo.fechaCierreInscripcion) > new Date(fechaHasta)) {
      return false
    }
  }

  return true
}

export function filtrarTorneos(torneos, filtros) {
  if (!Array.isArray(torneos)) return []
  return torneos.filter((torneo) => torneoCoincideFiltros(torneo, filtros))
}

export function obtenerTorneosDestacados(torneos) {
  if (!Array.isArray(torneos)) return []
  return torneos.filter((t) => t.estado === 'abierto' || t.estado === 'en_curso')
}

export function obtenerProximosCierres(torneos, limite = 4) {
  if (!Array.isArray(torneos)) return []
  return torneos
    .filter((t) => t.estado === 'abierto')
    .sort((a, b) => new Date(a.fechaCierreInscripcion) - new Date(b.fechaCierreInscripcion))
    .slice(0, limite)
}
