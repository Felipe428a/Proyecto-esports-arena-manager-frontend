import MensajeEstado from './MensajeEstado'

/**
 * Los tres estados de una carga de datos (sesión 1): cargando, error y datos.
 * Componente de presentación: recibe `cargando` y `errores` por props.
 */
export default function EstadoCarga({ cargando = false, errores = [], onReintentar }) {
  if (cargando) {
    return (
      <div className="d-flex align-items-center gap-2 my-3" role="status" aria-live="polite" id="estado-cargando">
        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span>Cargando datos de la arena…</span>
      </div>
    )
  }
  if (errores.length === 0) return null
  return (
    <MensajeEstado tipo="error">
      <strong>Algunos servicios no respondieron.</strong> El resto de la aplicación sigue disponible.
      <ul className="mb-2 mt-1 small">
        {errores.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
      {onReintentar && (
        <button type="button" className="btn btn-sm btn-outline-light" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </MensajeEstado>
  )
}
