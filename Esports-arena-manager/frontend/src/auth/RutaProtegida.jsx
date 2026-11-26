import { Navigate, useLocation } from 'react-router'
import { useAuth } from './useAuth'
import { NOMBRE_ROL } from './permisos'

/**
 * Protege una vista (sesión 2):
 * 1. Sin sesión → redirige a /login y recuerda la página pedida (state.desde).
 * 2. Con sesión pero sin el rol → muestra "No tienes permiso" (sin redirigir).
 * 3. Todo bien → muestra la vista.
 *
 * Props: roles (opcional) = lista de roles permitidos, por ejemplo ['ORGANIZADOR', 'ADMINISTRADOR'].
 */
export default function RutaProtegida({ children, roles }) {
  const { autenticado, usuario } = useAuth()
  const ubicacion = useLocation()

  if (!autenticado) {
    const desde = ubicacion.pathname + ubicacion.search
    return <Navigate to="/login" replace state={{ desde }} />
  }

  if (roles && !roles.includes(usuario?.rol)) {
    return (
      <main>
        <section>
          <div className="container">
            <div id="sin-permiso" className="alert alert-warning" role="alert">
              <h1 className="h4">No tienes permiso para ver esta página</h1>
              <p className="mb-0">
                Tu rol es <strong>{NOMBRE_ROL[usuario?.rol] || usuario?.rol}</strong>. Esta sección es solo
                para: {roles.map((r) => NOMBRE_ROL[r] || r).join(', ')}.
              </p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return children
}
