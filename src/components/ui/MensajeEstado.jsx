export default function MensajeEstado({ tipo = 'info', children, estilo = {} }) {
  const role = tipo === 'error' ? 'alert' : 'status'
  return (
    <div
      className={`mensaje-estado mensaje-estado--${tipo}`}
      role={role}
      aria-live="polite"
      style={estilo}
    >
      {children}
    </div>
  )
}
