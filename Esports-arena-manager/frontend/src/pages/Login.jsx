import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'

/** Usuarios de prueba (datos iniciales del backend) para la demostración. */
export const CUENTAS_DEMO = [
  { rol: 'Administrador', email: 'admin@arena.cl', password: 'admin123' },
  { rol: 'Organizador', email: 'organizador@arena.cl', password: 'organiza123' },
  { rol: 'Jugador (capitana)', email: 'fernanda.soto@arena.cl', password: 'jugador123' },
]

/**
 * Página de login (sesión 2). Llama a login() del contexto: si sale bien, vuelve a la página
 * que se había pedido (state.desde que dejó RutaProtegida) con replace, para no ensuciar el historial.
 */
export default function Login() {
  const { login, autenticado } = useAuth()
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const destino = ubicacion.state?.desde ?? '/inicio'
  if (autenticado && !enviando) return <Navigate to={destino} replace />

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function entrar(e) {
    e.preventDefault()
    setError(null)
    if (!form.email.trim() || !form.password) {
      setError('Ingresa tu email y tu contraseña.')
      return
    }
    setEnviando(true)
    try {
      await login({ email: form.email.trim(), password: form.password })
      navigate(destino, { replace: true })
    } catch (err) {
      setError(err.message) // 401 → "Email o contraseña incorrectos" (mensaje del backend)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main>
      <section>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-5">
              <h1>Iniciar sesión</h1>
              <p>Ingresa con tu cuenta para inscribirte en torneos y administrar tu equipo.</p>
              <form id="formulario-login" className="row g-3" onSubmit={entrar} noValidate>
                <div className="col-12">
                  <label htmlFor="campo-email" className="form-label">Email</label>
                  <input id="campo-email" name="email" type="email" className="form-control" autoComplete="username"
                    value={form.email} onChange={cambiar} required />
                </div>
                <div className="col-12">
                  <label htmlFor="campo-password" className="form-label">Contraseña</label>
                  <input id="campo-password" name="password" type="password" className="form-control"
                    autoComplete="current-password" value={form.password} onChange={cambiar} required />
                </div>
                {error && (
                  <div className="col-12">
                    <div id="error-login" className="alert alert-danger mb-0" role="alert">{error}</div>
                  </div>
                )}
                <div className="col-12 d-flex flex-wrap gap-2 align-items-center">
                  <button type="submit" id="boton-entrar" className="boton boton-primario btn" disabled={enviando}>
                    {enviando ? 'Entrando…' : 'Entrar'}
                  </button>
                  <a href="/registro" onClick={(e) => { e.preventDefault(); navigate('/registro', { state: ubicacion.state }) }}>
                    ¿No tienes cuenta? Crea una
                  </a>
                </div>
              </form>

              <div className="tarjeta-info card card-body mt-4">
                <h2 className="h6 mb-2">Cuentas de prueba</h2>
                <ul className="mb-0 ps-3 small">
                  {CUENTAS_DEMO.map((c) => (
                    <li key={c.email}>
                      <button type="button" className="btn btn-link btn-sm p-0 align-baseline"
                        onClick={() => setForm({ email: c.email, password: c.password })}>
                        {c.rol}
                      </button>{' '}
                      — {c.email} / {c.password}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
