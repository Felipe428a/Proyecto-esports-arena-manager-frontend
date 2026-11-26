/**
 * Funciones puras de formateo y cálculos generales.
 */

import { esSoloFecha } from './fechas'

export function formatearFecha(iso, conHora = false) {
  if (!iso) return 'Sin definir'
  const fecha = new Date(iso)
  if (isNaN(fecha.getTime())) return 'Fecha inválida'
  const opciones = { day: '2-digit', month: 'long', year: 'numeric' }
  if (esSoloFecha(iso)) opciones.timeZone = 'UTC'
  if (conHora) {
    opciones.hour = '2-digit'
    opciones.hour12 = false
    opciones.minute = '2-digit'
  }
  return fecha.toLocaleDateString('es-CL', opciones)
}

export function formatearPesos(valor) {
  if (typeof valor !== 'number' || isNaN(valor)) return '$0'
  return '$' + valor.toLocaleString('es-CL')
}

export function calcularPorcentajeCupos(cupoOcupado = 0, cupoMax = 1) {
  if (!cupoMax || cupoMax <= 0) return 0
  const porcentaje = Math.round((cupoOcupado / cupoMax) * 100)
  return Math.min(100, Math.max(0, porcentaje))
}

export function calcularEfectividad(estadisticas) {
  if (!estadisticas) return 0
  const total = (estadisticas.victorias || 0) + (estadisticas.derrotas || 0)
  if (total === 0) return 0
  return Math.round(((estadisticas.victorias || 0) / total) * 100)
}
