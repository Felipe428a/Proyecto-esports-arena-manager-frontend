// Clases de Bootstrap según el tipo de mensaje
const CLASE_ALERTA = { info: 'info', error: 'danger', exito: 'success', vacio: 'secondary' }

export default function MensajeEstado({ tipo = 'info', children, estilo = {} }) {
  const role = tipo === 'error' ? 'alert' : 'status'
  return (
    <div
      className={`mensaje-estado mensaje-estado--${tipo} alert alert-${CLASE_ALERTA[tipo] || 'info'}`}
      role={role}
      aria-live="polite"
      style={estilo}
    >
      {children}
    </div>
  )
}
