import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../auth/useAuth'
import { notificacionesService } from '../../services/arena'
import { NOMBRE_ROL } from '../../auth/permisos'
import EstadoCarga from '../ui/EstadoCarga'
import MensajeEstado from '../ui/MensajeEstado'
import { formatearFecha, calcularEfectividad } from '../../logica/formato'
import { validarApodo, obtenerHistorialJugador } from '../../logica/perfil'

export default function Perfil() {
  const { usuarios, equipos, torneos, inscripciones, actualizarApodo, cargando, errores, recargar } = useApp()
  const { usuario, puede } = useAuth()
  const esStaff = puede('inscribirOtros')
  const esAdmin = puede('gestionarUsuarios')
  // Un jugador ve su propio perfil; organizadores y administradores pueden consultar cualquiera
  const jugadores = useMemo(
    () => (esStaff ? usuarios : usuarios.filter((u) => u.id === usuario?.id)),
    [esStaff, usuarios, usuario]
  )

  const [jugadorId, setJugadorId] = useState(usuario?.id ? String(usuario.id) : '')
  const [notificaciones, setNotificaciones] = useState([])
  const [errorNotificaciones, setErrorNotificaciones] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [nuevoApodo, setNuevoApodo] = useState('')
  const [errorApodo, setErrorApodo] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')

  useEffect(() => {
    if (jugadores.length > 0 && !jugadorId) {
      setJugadorId(String(jugadores[0].id))
    }
  }, [jugadores, jugadorId])

  const jugador = jugadores.find((j) => j.id === Number(jugadorId))
  const esMiPerfil = jugador && jugador.id === usuario?.id
  const puedeEditar = esMiPerfil || esAdmin

  // Notificaciones: endpoint protegido (requiere token). useEffect con limpieza (AbortController).
  useEffect(() => {
    const control = new AbortController()
    notificacionesService
      .listar({ signal: control.signal })
      .then((lista) => setNotificaciones(Array.isArray(lista) ? lista : []))
      .catch((e) => {
        if (e.name !== 'AbortError') setErrorNotificaciones(e.message)
      })
    return () => control.abort()
  }, [])

  const equiposDelJugador = useMemo(() => {
    if (!jugador) return []
    return jugador.equipos.map((id) => equipos.find((e) => e.id === id)).filter(Boolean)
  }, [jugador, equipos])

  const historial = useMemo(() => {
    if (!jugador) return []
    return obtenerHistorialJugador(jugador.id, inscripciones, equipos)
  }, [jugador, inscripciones, equipos])

  const sancionesActivas = jugador?.sanciones?.filter((s) => s.activa) || []
  const sancionesCumplidas = jugador?.sanciones?.filter((s) => !s.activa) || []

  const handleGuardarApodo = async (e) => {
    e.preventDefault()
    setErrorApodo('')
    setMensajeExito('')

    const validacion = validarApodo(nuevoApodo)
    if (!validacion.valido) {
      setErrorApodo(validacion.mensaje)
      return
    }

    setGuardando(true)
    try {
      await actualizarApodo(jugador.id, nuevoApodo)
      setMensajeExito(`¡Apodo actualizado con éxito a "${nuevoApodo.trim()}"!`)
      setNuevoApodo('')
    } catch (err) {
      setErrorApodo(err.message) // p. ej. "Nickname ya registrado" (validación del backend)
    } finally {
      setGuardando(false)
    }
  }

  const dato = (etiqueta, valor) => (
    <div className="d-flex justify-content-between gap-3 mb-1">
      <span className="text-secondary">{etiqueta}</span>
      <span className="text-end">{valor}</span>
    </div>
  )

  return (
    <main>
      <section>
        <div className="container">
          <h1>{esStaff ? 'Perfiles de la arena' : 'Mi perfil'}</h1>
          <p>Consulta la ficha competitiva {esStaff ? 'de cualquier participante' : 'de tu cuenta'}.</p>
          <EstadoCarga cargando={cargando} errores={errores} onReintentar={recargar} />

          {esStaff && (
          <div className="row mb-4">
            <div className="col-12 col-md-6 col-lg-4">
              <label htmlFor="selector-jugador" className="form-label">Jugador</label>
              <select
                id="selector-jugador"
                className="form-select"
                value={jugadorId}
                onChange={(e) => {
                  setJugadorId(e.target.value)
                  setErrorApodo('')
                  setMensajeExito('')
                  setNuevoApodo('')
                }}
              >
                {jugadores.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nombre} ({j.apodo}){j.rol !== 'JUGADOR' ? ` · ${NOMBRE_ROL[j.rol] || j.rol}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          )}

          <div id="contenido-perfil">
            {!jugador ? (
              <MensajeEstado tipo="vacio">
                {cargando ? 'Cargando perfil…' : 'No se encontró información para este jugador.'}
              </MensajeEstado>
            ) : (
              <>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="tarjeta-info card card-body h-100">
                      <h3>Datos de contacto</h3>
                      {dato('Nombre', jugador.nombre)}
                      {dato('Apodo', jugador.apodo)}
                      {dato('Correo', jugador.email)}
                      {dato('Rol', NOMBRE_ROL[jugador.rol] || jugador.rol)}
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="tarjeta-info card card-body h-100">
                      <h3>Estadísticas</h3>
                      {dato('Victorias', jugador.estadisticas.victorias)}
                      {dato('Derrotas', jugador.estadisticas.derrotas)}
                      {dato('Efectividad', `${calcularEfectividad(jugador.estadisticas)}%`)}
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="tarjeta-info card card-body h-100">
                      <h3>Equipos</h3>
                      {equiposDelJugador.length > 0 ? (
                        <ul className="mb-0 ps-3">
                          {equiposDelJugador.map((e) => (
                            <li key={e.id}>{e.nombre}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mb-0">Este jugador aún no integra ningún equipo.</p>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="tarjeta-info card card-body h-100">
                      <h3>Sanciones</h3>
                      <div className="d-flex flex-wrap gap-2">
                        {sancionesActivas.map((s, idx) => (
                          <span key={idx} className="badge rounded-pill border border-warning text-warning chip chip--sancion">
                            {s.motivo} · hasta {formatearFecha(s.fechaFin)}
                          </span>
                        ))}
                        {sancionesCumplidas.map((s, idx) => (
                          <span key={idx} className="badge rounded-pill border border-secondary text-secondary chip chip--cumplida">
                            {s.motivo} (cumplida)
                          </span>
                        ))}
                      </div>
                      {jugador.sanciones.length === 0 && (
                        <p className="mb-0">Sin sanciones registradas.</p>
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="mt-4">Historial de torneos</h3>
                {historial.length > 0 ? (
                  <ul className="list-group list-group-flush mb-0">
                    {historial.map((i) => {
                      const torneo = torneos.find((t) => t.id === i.torneoId)
                      return (
                        <li key={i.id} className="list-group-item bg-transparent text-reset">
                          {torneo ? torneo.nombre : 'Torneo no disponible'} — inscrito el{' '}
                          {formatearFecha(i.fecha)} ({i.participanteTipo === 'equipo' ? 'Equipo' : 'Individual'})
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <div className="alert alert-secondary mensaje-estado mensaje-estado--vacio">
                    Este jugador aún no participa en ningún torneo.
                  </div>
                )}
              </>
            )}
          </div>

          <div className="row mt-5 g-4">
            {puedeEditar && jugador && (
            <div className="col-12 col-lg-6">
              <h2>Editar apodo</h2>
              <form id="formulario-apodo" className="row g-3" onSubmit={handleGuardarApodo} noValidate>
                <div className="col-12">
                  <label htmlFor="campo-apodo" className="form-label">Nuevo apodo</label>
                  <input
                    type="text"
                    id="campo-apodo"
                    name="apodo"
                    className={`form-control ${errorApodo ? 'is-invalid' : ''}`}
                    autoComplete="nickname"
                    maxLength={16}
                    placeholder="Ej: camro"
                    value={nuevoApodo}
                    onChange={(e) => {
                      setNuevoApodo(e.target.value)
                      setErrorApodo('')
                      setMensajeExito('')
                    }}
                    aria-invalid={errorApodo ? 'true' : 'false'}
                  />
                  <div className="form-text">Sin espacios, entre 3 y 16 caracteres.</div>
                  {errorApodo && (
                    <div id="error-campo-apodo" className="invalid-feedback d-block" role="alert">
                      {errorApodo}
                    </div>
                  )}
                </div>
                {mensajeExito && (
                  <div className="col-12">
                    <MensajeEstado tipo="exito">{mensajeExito}</MensajeEstado>
                  </div>
                )}
                <div className="col-12">
                  <button type="submit" className="boton boton-primario btn" disabled={guardando}>
                    {guardando ? 'Guardando…' : 'Guardar apodo'}
                  </button>
                </div>
              </form>
            </div>
            )}
            <div className="col-12 col-lg-6">
              <h2>{esStaff ? 'Notificaciones del sistema' : 'Mis notificaciones'}</h2>
              {errorNotificaciones ? (
                <MensajeEstado tipo="error">{errorNotificaciones}</MensajeEstado>
              ) : notificaciones.length === 0 ? (
                <MensajeEstado tipo="vacio">No tienes notificaciones.</MensajeEstado>
              ) : (
                <ul id="lista-notificaciones" className="list-group list-group-flush">
                  {notificaciones.map((n) => (
                    <li key={n.id} className="list-group-item bg-transparent text-reset">
                      <span className="badge text-bg-secondary me-2">{n.tipo}</span>
                      {n.mensaje}
                      <br />
                      <small className="text-secondary">{formatearFecha(n.fecha, true)}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
