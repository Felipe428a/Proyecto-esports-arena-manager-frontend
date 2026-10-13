import {
  obtenerEstadoTorneoInfo,
  validarRangoFechas,
  filtrarTorneos,
  obtenerTorneosDestacados,
  obtenerProximosCierres,
} from './torneos'

describe('Módulo de torneos', () => {
  let torneosPrueba

  beforeEach(() => {
    torneosPrueba = [
      { id: 1, nombre: 'Copa Apertura', juegoId: 1, estado: 'abierto', fechaCierreInscripcion: '2026-09-15' },
      { id: 2, nombre: 'Liga de Runas', juegoId: 2, estado: 'en_curso', fechaCierreInscripcion: '2026-08-20' },
      { id: 3, nombre: 'Torneo Invierno', juegoId: 4, estado: 'finalizado', fechaCierreInscripcion: '2026-06-01' },
      { id: 4, nombre: 'Copa Flash', juegoId: 1, estado: 'abierto', fechaCierreInscripcion: '2026-09-05' },
    ]
  })

  describe('obtenerEstadoTorneoInfo', () => {
    it('retorna etiqueta y clase correctas para abierto', () => {
      const info = obtenerEstadoTorneoInfo('abierto')
      expect(info.etiqueta).toBe('Inscripciones abiertas')
      expect(info.clase).toBe('estado-abierto')
    })

    it('retorna etiqueta y clase correctas para en_curso', () => {
      const info = obtenerEstadoTorneoInfo('en_curso')
      expect(info.etiqueta).toBe('En curso')
      expect(info.clase).toBe('estado-en-curso')
    })

    it('retorna etiqueta y clase correctas para finalizado', () => {
      const info = obtenerEstadoTorneoInfo('finalizado')
      expect(info.etiqueta).toBe('Finalizado')
      expect(info.clase).toBe('estado-finalizado')
    })
  })

  describe('validarRangoFechas', () => {
    it('es válido cuando desde es menor que hasta', () => {
      const res = validarRangoFechas('2026-01-01', '2026-02-01')
      expect(res.valido).toBeTrue()
      expect(res.error).toBe('')
    })

    it('falla cuando desde es posterior a hasta', () => {
      const res = validarRangoFechas('2026-05-10', '2026-05-01')
      expect(res.valido).toBeFalse()
      expect(res.error).toContain('La fecha inicial no puede ser posterior')
    })
  })

  describe('filtrarTorneos', () => {
    it('filtra por búsqueda de texto sin distinguir mayúsculas', () => {
      const res = filtrarTorneos(torneosPrueba, { buscar: 'copa' })
      expect(res.length).toBe(2)
      expect(res[0].nombre).toBe('Copa Apertura')
    })

    it('filtra por juego y estado simultáneamente', () => {
      const res = filtrarTorneos(torneosPrueba, { juego: '1', estado: 'abierto' })
      expect(res.length).toBe(2)
    })

    it('filtra por rango de fechas de cierre', () => {
      const res = filtrarTorneos(torneosPrueba, { fechaDesde: '2026-09-01', fechaHasta: '2026-09-30' })
      expect(res.length).toBe(2)
    })
  })

  describe('obtenerTorneosDestacados', () => {
    it('incluye solo torneos abiertos y en curso', () => {
      const destacados = obtenerTorneosDestacados(torneosPrueba)
      expect(destacados.length).toBe(3)
      expect(destacados.every((t) => t.estado === 'abierto' || t.estado === 'en_curso')).toBeTrue()
    })
  })

  describe('obtenerProximosCierres', () => {
    it('ordena por fecha de cierre ascendente y limita resultados', () => {
      const cierres = obtenerProximosCierres(torneosPrueba, 1)
      expect(cierres.length).toBe(1)
      expect(cierres[0].id).toBe(4) // 2026-09-05 es antes de 2026-09-15
    })
  })
})
