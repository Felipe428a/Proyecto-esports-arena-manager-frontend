import { calcularRanking } from './ranking'

describe('Módulo de ranking', () => {
  it('calcula victorias, derrotas y diferencia de puntos correctamente', () => {
    const partidas = [
      {
        participanteA: { nombre: 'Equipo Alfa' },
        participanteB: { nombre: 'Equipo Beta' },
        resultado: { puntajeA: 3, puntajeB: 1 },
      },
      {
        participanteA: { nombre: 'Equipo Alfa' },
        participanteB: { nombre: 'Equipo Gamma' },
        resultado: { puntajeA: 2, puntajeB: 3 },
      },
    ]

    const ranking = calcularRanking(partidas)

    expect(ranking.length).toBe(3)
    const alfa = ranking.find((r) => r.nombre === 'Equipo Alfa')
    expect(alfa.victorias).toBe(1)
    expect(alfa.derrotas).toBe(1)
    expect(alfa.diferencia).toBe(1) // +2 en el primer match, -1 en el segundo = +1
  })

  it('ordena primero por victorias y luego por diferencia de puntaje', () => {
    const partidas = [
      {
        participanteA: { nombre: 'Equipo A' },
        participanteB: { nombre: 'Equipo B' },
        resultado: { puntajeA: 2, puntajeB: 0 },
      },
      {
        participanteA: { nombre: 'Equipo C' },
        participanteB: { nombre: 'Equipo D' },
        resultado: { puntajeA: 3, puntajeB: 0 },
      },
    ]

    const ranking = calcularRanking(partidas)
    // Equipo C tiene 1 victoria y +3 dif, Equipo A tiene 1 victoria y +2 dif
    expect(ranking[0].nombre).toBe('Equipo C')
    expect(ranking[1].nombre).toBe('Equipo A')
  })

  it('ignora partidas sin resultado o no disputadas', () => {
    const partidas = [
      {
        participanteA: { nombre: 'Equipo A' },
        participanteB: { nombre: 'Por definir' },
        resultado: null,
      },
    ]

    const ranking = calcularRanking(partidas)
    expect(ranking.length).toBe(0)
  })
})
