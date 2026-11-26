import { useAuth } from '../../auth/useAuth'

/** Muestra el aviso "Tu sesión venció" cuando api.js cerró la sesión por un 401. */
export default function AvisoSesion() {
  const { aviso, limpiarAviso } = useAuth()
  if (!aviso) return null
  return (
    <div className="container mt-3">
      <div id="aviso-sesion" className="alert alert-warning d-flex justify-content-between align-items-center mb-0" role="alert">
        <span>{aviso}</span>
        <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={limpiarAviso}></button>
      </div>
    </div>
  )
}
