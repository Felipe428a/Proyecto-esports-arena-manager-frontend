import { calcularRanking, calcularPuntos, ordenarRanking } from './ranking'

describe('Módulo de ranking', () => {
  describe('calcularPuntos', () => {
    it('da 3 puntos por victoria', () => {
      expect(calcularPuntos(2)).toBe(6)
    })

    it('da 1 punto por empate y 0 por derrota', () => {
      expect(calcularPuntos(1, 2)).toBe(5)
      expect(calcularPuntos(0, 0)).toBe(0)
    })

    it('trata valores inválidos como cero', () => {
      expect(calcularPuntos(undefined, null)).toBe(0)
      expect(calcularPuntos('x', 'y')).toBe(0)
    })
  })

  describe('ordenarRanking', () => {
    it('ordena por puntos de mayor a menor', () => {
      const filas = [
        { nombre: 'A', puntos: 3, diferencia: 5 },
        { nombre: 'B', puntos: 6, diferencia: 0 },
      ]
      expect(ordenarRanking(filas).map((f) => f.nombre)).toEqual(['B', 'A'])
    })

    it('desempata por diferencia de puntaje', () => {
      const filas = [
        { nombre: 'A', puntos: 3, diferencia: 1 },
        { nombre: 'B', puntos: 3, diferencia: 4 },
      ]
      expect(ordenarRanking(filas).map((f) => f.nombre)).toEqual(['B', 'A'])
    })

    it('si todo es igual, ordena alfabéticamente', () => {
      const filas = [
        { nombre: 'Zeta', puntos: 3, diferencia: 1 },
        { nombre: 'Alfa', puntos: 3, diferencia: 1 },
      ]
      expect(ordenarRanking(filas).map((f) => f.nombre)).toEqual(['Alfa', 'Zeta'])
    })

    it('no modifica el arreglo original', () => {
      const filas = [
        { nombre: 'A', puntos: 0, diferencia: 0 },
        { nombre: 'B', puntos: 9, diferencia: 0 },
      ]
      ordenarRanking(filas)
      expect(filas[0].nombre).toBe('A')
    })

    it('devuelve un arreglo vacío si no recibe un arreglo', () => {
      expect(ordenarRanking(null)).toEqual([])
    })
  })

  describe('calcularRanking', () => {
    it('calcula victorias, derrotas, diferencia y puntos', () => {
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
      expect(alfa.diferencia).toBe(1) // +2 en el primer match, -1 en el segundo
      expect(alfa.puntos).toBe(3)
    })

    it('ordena por puntos y desempata por diferencia', () => {
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
      // A y C tienen 3 puntos; C gana el desempate con diferencia +3 contra +2
      expect(ranking[0].nombre).toBe('Equipo C')
      expect(ranking[1].nombre).toBe('Equipo A')
    })

    it('un participante con más victorias queda sobre uno con mejor diferencia', () => {
      const partidas = [
        // X gana dos partidos por la mínima: 6 puntos, diferencia +2
        { participanteA: { nombre: 'X' }, participanteB: { nombre: 'P' }, resultado: { puntajeA: 1, puntajeB: 0 } },
        { participanteA: { nombre: 'X' }, participanteB: { nombre: 'Q' }, resultado: { puntajeA: 1, puntajeB: 0 } },
        // Y gana uno por goleada: 3 puntos, diferencia +10
        { participanteA: { nombre: 'Y' }, participanteB: { nombre: 'R' }, resultado: { puntajeA: 10, puntajeB: 0 } },
      ]
      const ranking = calcularRanking(partidas)
      expect(ranking[0].nombre).toBe('X')
    })

    it('cuenta los empates con 1 punto cada uno', () => {
      const partidas = [
        { participanteA: { nombre: 'A' }, participanteB: { nombre: 'B' }, resultado: { puntajeA: 1, puntajeB: 1 } },
      ]
      const ranking = calcularRanking(partidas)
      expect(ranking.every((f) => f.empates === 1 && f.puntos === 1)).toBeTrue()
    })

    it('ignora partidas sin resultado o con rival por definir', () => {
      const partidas = [
        {
          participanteA: { nombre: 'Equipo A' },
          participanteB: { nombre: 'Por definir' },
          resultado: null,
        },
      ]

      expect(calcularRanking(partidas).length).toBe(0)
    })

    it('devuelve un arreglo vacío si no recibe partidas', () => {
      expect(calcularRanking(undefined)).toEqual([])
    })
  })
})
