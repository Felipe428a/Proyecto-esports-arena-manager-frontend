import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { validarApodo } from '../logica/perfil'

/** Valida el formulario antes de enviarlo (el backend vuelve a validar con @Valid). */
export function validarRegistro({ nombre, nickname, email, password, confirmacion }) {
  const errores = {}
  if (!nombre.trim()) errores.nombre = 'El nombre es obligatorio.'
  const apodo = validarApodo(nickname)
  if (!apodo.valido) errores.nickname = apodo.mensaje
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errores.email = 'Ingresa un email válido.'
  if (password.length < 6) errores.password = 'La contraseña debe tener al menos 6 caracteres.'
  if (password !== confirmacion) errores.confirmacion = 'Las contraseñas no coinciden.'
  return errores
}

/** Registro público: crea una cuenta con rol JUGADOR y deja la sesión iniciada. */
export default function Registro() {
  const { registrar, autenticado } = useAuth()
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const vacio = { nombre: '', nickname: '', email: '', password: '', confirmacion: '' }
  const [form, setForm] = useState(vacio)
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const destino = ubicacion.state?.desde ?? '/perfil'
  if (autenticado && !enviando) return <Navigate to={destino} replace />

  const cambiar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrores((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  async function enviar(e) {
    e.preventDefault()
    setError(null)
    const encontrados = validarRegistro(form)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return
    setEnviando(true)
    try {
      await registrar({
        nombre: form.nombre.trim(),
        nickname: form.nickname.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      navigate(destino, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const campo = (nombre, etiqueta, tipo = 'text', autoComplete = 'off') => (
    <div className="col-12">
      <label htmlFor={`registro-${nombre}`} className="form-label">{etiqueta}</label>
      <input
        id={`registro-${nombre}`}
        name={nombre}
        type={tipo}
        autoComplete={autoComplete}
        className={`form-control ${errores[nombre] ? 'is-invalid' : ''}`}
        value={form[nombre]}
        onChange={cambiar}
        aria-invalid={errores[nombre] ? 'true' : 'false'}
      />
      {errores[nombre] && <div className="invalid-feedback d-block" role="alert">{errores[nombre]}</div>}
    </div>
  )

  return (
    <main>
      <section>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-5">
              <h1>Crear cuenta</h1>
              <p>Tu cuenta se crea con rol <strong>Jugador</strong>. Un administrador puede asignarte otro rol.</p>
              <form id="formulario-registro" className="row g-3" onSubmit={enviar} noValidate>
                {campo('nombre', 'Nombre completo', 'text', 'name')}
                {campo('nickname', 'Apodo (3 a 16 caracteres, sin espacios)', 'text', 'nickname')}
                {campo('email', 'Email', 'email', 'email')}
                {campo('password', 'Contraseña', 'password', 'new-password')}
                {campo('confirmacion', 'Repite la contraseña', 'password', 'new-password')}
                {error && (
                  <div className="col-12">
                    <div id="error-registro" className="alert alert-danger mb-0" role="alert">{error}</div>
                  </div>
                )}
                <div className="col-12 d-flex flex-wrap gap-2 align-items-center">
                  <button type="submit" className="boton boton-primario btn" disabled={enviando}>
                    {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
                  </button>
                  <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login', { state: ubicacion.state }) }}>
                    Ya tengo cuenta
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
