import {
  formatearFecha,
  formatearPesos,
  calcularPorcentajeCupos,
  calcularEfectividad,
} from './formato'

describe('Módulo de formato y cálculos', () => {
  describe('formatearFecha', () => {
    it('formatea correctamente una fecha ISO estándar', () => {
      const resultado = formatearFecha('2026-09-15')
      expect(resultado).toContain('2026')
      expect(resultado.toLowerCase()).toContain('septiembre')
    })

    it('devuelve "Sin definir" cuando la fecha es nula o vacía', () => {
      expect(formatearFecha(null)).toBe('Sin definir')
      expect(formatearFecha('')).toBe('Sin definir')
      expect(formatearFecha(undefined)).toBe('Sin definir')
    })

    it('devuelve "Fecha inválida" si el texto no es una fecha', () => {
      expect(formatearFecha('no-es-fecha')).toBe('Fecha inválida')
    })
  })

  describe('formatearPesos', () => {
    it('agrega el signo peso y formatea miles', () => {
      expect(formatearPesos(300000)).toBe('$300.000')
      expect(formatearPesos(0)).toBe('$0')
    })

    it('maneja valores no numéricos devolviendo $0', () => {
      expect(formatearPesos(null)).toBe('$0')
      expect(formatearPesos(undefined)).toBe('$0')
      expect(formatearPesos('abc')).toBe('$0')
    })
  })

  describe('calcularPorcentajeCupos', () => {
    it('calcula el porcentaje exacto de ocupación', () => {
      expect(calcularPorcentajeCupos(5, 10)).toBe(50)
      expect(calcularPorcentajeCupos(3, 12)).toBe(25)
    })

    it('limita el valor entre 0 y 100%', () => {
      expect(calcularPorcentajeCupos(20, 10)).toBe(100)
      expect(calcularPorcentajeCupos(-5, 10)).toBe(0)
    })

    it('evita divisiones por cero', () => {
      expect(calcularPorcentajeCupos(5, 0)).toBe(0)
    })
  })

  describe('calcularEfectividad', () => {
    it('calcula la efectividad en base a victorias y derrotas', () => {
      expect(calcularEfectividad({ victorias: 14, derrotas: 6 })).toBe(70)
      expect(calcularEfectividad({ victorias: 3, derrotas: 1 })).toBe(75)
    })

    it('retorna 0 si no hay partidas jugadas', () => {
      expect(calcularEfectividad({ victorias: 0, derrotas: 0 })).toBe(0)
      expect(calcularEfectividad(null)).toBe(0)
    })
  })
})
