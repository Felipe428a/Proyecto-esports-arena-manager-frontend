import { useState } from 'react'

/**
 * Hook para acciones contra la API desde el panel: maneja "ocupado", el mensaje de éxito y el error.
 * ejecutar(fn, textoExito) llama a fn (que devuelve una promesa) y luego recarga los datos.
 */
export function useAccion(recargar) {
  const [ocupado, setOcupado] = useState(false)
  const [exito, setExito] = useState('')
  const [error, setError] = useState('')

  const ejecutar = async (fn, textoExito = 'Cambios guardados.') => {
    setOcupado(true)
    setExito('')
    setError('')
    try {
      const resultado = await fn()
      if (recargar) await recargar()
      setExito(textoExito)
      return resultado
    } catch (e) {
      // 401 → api.js cierra la sesión · 403 → "Sin permiso para esta acción" · 400 → regla de negocio
      setError(e.message)
      return null
    } finally {
      setOcupado(false)
    }
  }

  return { ejecutar, ocupado, exito, error, limpiar: () => { setExito(''); setError('') } }
}

/** Mensajes de resultado bajo cada formulario del panel. */
export function Resultado({ exito, error }) {
  if (error) return <div className="alert alert-danger py-2 mb-0" role="alert">{error}</div>
  if (exito) return <div className="alert alert-success py-2 mb-0" role="status">{exito}</div>
  return null
}
