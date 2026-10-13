/**
 * Cálculo puro de la tabla de posiciones a partir de partidas.
 */

export function calcularRanking(partidasTorneo) {
  if (!Array.isArray(partidasTorneo)) return []

  const tabla = {}

  const asegurarParticipante = (nombre) => {
    if (!nombre) return null
    if (!tabla[nombre]) {
      tabla[nombre] = {
        nombre,
        victorias: 0,
        derrotas: 0,
        diferencia: 0,
      }
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
    }
  })

  return Object.values(tabla).sort((a, b) => {
    if (b.victorias !== a.victorias) {
      return b.victorias - a.victorias
    }
    return b.diferencia - a.diferencia
  })
}
