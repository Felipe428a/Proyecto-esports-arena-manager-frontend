import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import MensajeEstado from '../ui/MensajeEstado'
import { formatearFecha, calcularEfectividad } from '../../logica/formato'
import { validarApodo, obtenerHistorialJugador } from '../../logica/perfil'

export default function Perfil() {
  const { jugadores, equipos, torneos, inscripciones, actualizarApodo } = useApp()

  const [jugadorId, setJugadorId] = useState('')
  const [nuevoApodo, setNuevoApodo] = useState('')
  const [errorApodo, setErrorApodo] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')

  useEffect(() => {
    if (jugadores.length > 0 && !jugadorId) {
      setJugadorId(String(jugadores[0].id))
    }
  }, [jugadores, jugadorId])

  const jugador = jugadores.find((j) => j.id === Number(jugadorId))

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

  const handleGuardarApodo = (e) => {
    e.preventDefault()
    setErrorApodo('')
    setMensajeExito('')

    const validacion = validarApodo(nuevoApodo)
    if (!validacion.valido) {
      setErrorApodo(validacion.mensaje)
      return
    }

    actualizarApodo(jugador.id, nuevoApodo)
    setMensajeExito(`¡Apodo actualizado con éxito a "${nuevoApodo.trim()}"!`)
    setNuevoApodo('')
  }

  return (
    <main>
      <section>
        <div className="contenedor">
          <h1>Perfil de jugador</h1>
          <p>Consulta la ficha competitiva de un participante de la arena.</p>

          <div className="campo" style={{ maxWidth: '420px' }}>
            <label htmlFor="selector-jugador">Jugador</label>
            <select
              id="selector-jugador"
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
                  {j.nombre} ({j.apodo})
                </option>
              ))}
            </select>
          </div>

          <div id="contenido-perfil" style={{ marginTop: '1.5rem' }}>
            {!jugador ? (
              <MensajeEstado tipo="vacio">
                No se encontró información para este jugador.
              </MensajeEstado>
            ) : (
              <>
                <div className="rejilla-perfil">
                  <div className="tarjeta-info">
                    <h3>Datos de contacto</h3>
                    <p className="fila-dato">
                      <span>Nombre</span>
                      <span>{jugador.nombre}</span>
                    </p>
                    <p className="fila-dato">
                      <span>Apodo</span>
                      <span>{jugador.apodo}</span>
                    </p>
                    <p className="fila-dato">
                      <span>Correo</span>
                      <span>{jugador.email}</span>
                    </p>
                  </div>

                  <div className="tarjeta-info">
                    <h3>Estadísticas</h3>
                    <p className="fila-dato">
                      <span>Victorias</span>
                      <span>{jugador.estadisticas.victorias}</span>
                    </p>
                    <p className="fila-dato">
                      <span>Derrotas</span>
                      <span>{jugador.estadisticas.derrotas}</span>
                    </p>
                    <p className="fila-dato">
                      <span>Efectividad</span>
                      <span>{calcularEfectividad(jugador.estadisticas)}%</span>
                    </p>
                  </div>

                  <div className="tarjeta-info">
                    <h3>Equipos</h3>
                    {equiposDelJugador.length > 0 ? (
                      <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
                        {equiposDelJugador.map((e) => (
                          <li key={e.id}>{e.nombre}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ margin: 0 }}>Este jugador aún no integra ningún equipo.</p>
                    )}
                  </div>

                  <div className="tarjeta-info">
                    <h3>Sanciones</h3>
                    {sancionesActivas.length > 0 &&
                      sancionesActivas.map((s, idx) => (
                        <span key={idx} className="chip chip--sancion">
                          {s.motivo} · hasta {formatearFecha(s.fechaFin)}
                        </span>
                      ))}
                    {sancionesCumplidas.length > 0 &&
                      sancionesCumplidas.map((s, idx) => (
                        <span key={idx} className="chip chip--cumplida">
                          {s.motivo} (cumplida)
                        </span>
                      ))}
                    {jugador.sanciones.length === 0 && (
                      <p style={{ margin: 0 }}>Sin sanciones registradas.</p>
                    )}
                  </div>
                </div>

                <h3 style={{ marginTop: '1.5rem' }}>Historial de torneos</h3>
                {historial.length > 0 ? (
                  <ul style={{ paddingLeft: '1.1rem' }}>
                    {historial.map((i) => {
                      const torneo = torneos.find((t) => t.id === i.torneoId)
                      return (
                        <li key={i.id}>
                          {torneo ? torneo.nombre : 'Torneo no disponible'} — inscrito el{' '}
                          {formatearFecha(i.fecha)} ({i.participanteTipo === 'equipo' ? 'Equipo' : 'Individual'})
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="mensaje-estado mensaje-estado--vacio">
                    Este jugador aún no participa en ningún torneo.
                  </p>
                )}
              </>
            )}
          </div>

          <h2 style={{ marginTop: '2.5rem' }}>Editar apodo</h2>
          <form id="formulario-apodo" className="formulario" onSubmit={handleGuardarApodo} noValidate>
            <div className="campo">
              <label htmlFor="campo-apodo">Nuevo apodo</label>
              <input
                type="text"
                id="campo-apodo"
                name="apodo"
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
              <span className="ayuda">Sin espacios, entre 3 y 16 caracteres.</span>
              {errorApodo && (
                <span id="error-campo-apodo" className="mensaje-error" role="alert">
                  {errorApodo}
                </span>
              )}
            </div>
            {mensajeExito && (
              <MensajeEstado tipo="exito">
                {mensajeExito}
              </MensajeEstado>
            )}
            <div className="acciones-formulario">
              <button type="submit" className="boton boton-primario">
                Guardar apodo
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
