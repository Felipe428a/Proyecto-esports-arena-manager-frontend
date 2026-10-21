/**
 * Cálculo puro de la tabla de posiciones a partir de partidas.
 */

export const PUNTOS_VICTORIA = 3
export const PUNTOS_EMPATE = 1

export function calcularPuntos(victorias = 0, empates = 0) {
  return (Number(victorias) || 0) * PUNTOS_VICTORIA + (Number(empates) || 0) * PUNTOS_EMPATE
}

/** Ordena filas por puntos (desc), luego diferencia (desc), luego nombre. No modifica el original. */
export function ordenarRanking(filas) {
  if (!Array.isArray(filas)) return []
  return [...filas].sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos
    if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia
    return String(a.nombre).localeCompare(String(b.nombre), 'es')
  })
}

export function calcularRanking(partidasTorneo) {
  if (!Array.isArray(partidasTorneo)) return []

  const tabla = {}

  const asegurarParticipante = (nombre) => {
    if (!tabla[nombre]) {
      tabla[nombre] = { nombre, victorias: 0, empates: 0, derrotas: 0, diferencia: 0, puntos: 0 }
    }
    return tabla[nombre]
  }

  partidasTorneo.forEach((partida) => {
    if (!partida || !partida.resultado) return

    const nombreA = partida.participanteA?.nombre
    const nombreB = partida.participanteB?.nombre

    if (!nombreA || !nombreB || nombreB === 'Por definir') return

    const filaA = asegurarParticipante(nombreA)
    const filaB = asegurarParticipante(nombreB)

    const puntajeA = Number(partida.resultado.puntajeA) || 0
    const puntajeB = Number(partida.resultado.puntajeB) || 0

    filaA.diferencia += puntajeA - puntajeB
    filaB.diferencia += puntajeB - puntajeA

    if (puntajeA > puntajeB) {
      filaA.victorias += 1
      filaB.derrotas += 1
    } else if (puntajeB > puntajeA) {
      filaB.victorias += 1
      filaA.derrotas += 1
    } else {
      filaA.empates += 1
      filaB.empates += 1
    }
  })

  const filas = Object.values(tabla).map((fila) => ({
    ...fila,
    puntos: calcularPuntos(fila.victorias, fila.empates),
  }))

  return ordenarRanking(filas)
}
