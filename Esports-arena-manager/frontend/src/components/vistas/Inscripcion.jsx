import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../auth/useAuth'
import MensajeEstado from '../ui/MensajeEstado'
import EstadoCarga from '../ui/EstadoCarga'
import { formatearFecha } from '../../logica/formato'
import { obtenerEstadoTorneoInfo } from '../../logica/torneos'
import { validarInscripcion } from '../../logica/inscripcion'
import { obtenerHistorialJugador } from '../../logica/perfil'

/**
 * Inscripción a torneos (vista protegida: requiere sesión).
 * - Un JUGADOR solo puede inscribirse a sí mismo o a los equipos donde es capitán.
 * - ORGANIZADOR y ADMINISTRADOR pueden inscribir a cualquier jugador o equipo.
 * La misma regla la aplica registration-service (403 si alguien la salta).
 */
export default function Inscripcion() {
  const {
    torneos, juegos, jugadores, equipos, inscripciones, cargando, errores, recargar,
    agregarInscripcion, cancelarInscripcion,
  } = useApp()
  const { usuario, puede } = useAuth()
  const [parametros] = useSearchParams()
  const esStaff = puede('inscribirOtros')

  const [torneoId, setTorneoId] = useState(parametros.get('torneo') || '')
  const [tipoParticipante, setTipoParticipante] = useState('jugador')
  const [jugadorId, setJugadorId] = useState('')
  const [equipoId, setEquipoId] = useState('')
  const [errores2, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [confirmacion, setConfirmacion] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // Lo que cada rol puede elegir
  const jugadoresElegibles = useMemo(
    () => (esStaff ? jugadores : jugadores.filter((j) => j.id === usuario?.id)),
    [esStaff, jugadores, usuario]
  )
  const equiposElegibles = useMemo(
    () => (esStaff ? equipos : equipos.filter((e) => e.capitanId === usuario?.id)),
    [esStaff, equipos, usuario]
  )
  const torneosVisibles = useMemo(
    () => torneos.filter((t) => t.estado === 'abierto' || String(t.id) === String(torneoId)),
    [torneos, torneoId]
  )

  useEffect(() => {
    if (!torneoId && torneosVisibles.length > 0) setTorneoId(String(torneosVisibles[0].id))
  }, [torneosVisibles, torneoId])

  useEffect(() => {
    if (!jugadorId && jugadoresElegibles.length > 0) setJugadorId(String(jugadoresElegibles[0].id))
    if (!equipoId && equiposElegibles.length > 0) setEquipoId(String(equiposElegibles[0].id))
  }, [jugadoresElegibles, equiposElegibles, jugadorId, equipoId])

  const torneoSeleccionado = torneos.find((t) => t.id === Number(torneoId))
  const juegoSeleccionado = torneoSeleccionado ? juegos.find((j) => j.id === torneoSeleccionado.juegoId) : null

  // La modalidad del juego decide el tipo de participante (igual que el backend)
  useEffect(() => {
    if (juegoSeleccionado) setTipoParticipante(juegoSeleccionado.modalidad === 'Individual' ? 'jugador' : 'equipo')
  }, [juegoSeleccionado])

  const misInscripciones = useMemo(() => {
    if (!usuario) return []
    const lista = esStaff ? inscripciones : obtenerHistorialJugador(usuario.id, inscripciones, equipos)
    return lista.filter((i) => {
      const t = torneos.find((x) => x.id === i.torneoId)
      return t && (t.estado === 'abierto' || t.estado === 'cerrado')
    })
  }, [usuario, esStaff, inscripciones, equipos, torneos])

  const limpiarMensajes = () => {
    setConfirmacion(null)
    setErrorGeneral('')
    setErrores({})
  }

  const nombreParticipante = (tipo, id) => {
    if (tipo === 'jugador') {
      const jug = jugadores.find((j) => j.id === Number(id))
      return jug ? `${jug.nombre} (${jug.apodo})` : 'Jugador'
    }
    return equipos.find((e) => e.id === Number(id))?.nombre ?? 'Equipo'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    limpiarMensajes()
    const participanteId = tipoParticipante === 'jugador' ? jugadorId : equipoId

    // 1. Validación en el cliente (respuesta inmediata)
    const resultado = validarInscripcion({
      torneo: torneoSeleccionado,
      tipo: tipoParticipante,
      participanteId,
      inscripciones,
      todosJugadores: jugadores,
      todosEquipos: equipos,
      juegos,
      fechaActual: new Date(),
    })
    if (!resultado.valido) {
      if (resultado.general) setErrorGeneral(resultado.general)
      if (resultado.campo) setErrores({ [resultado.campo]: resultado.mensaje })
      return
    }

    // 2. El backend valida de nuevo (plazo, cupos, sanciones, capitán) y guarda
    setEnviando(true)
    try {
      await agregarInscripcion({ torneoId, participanteTipo: tipoParticipante, participanteId })
      setConfirmacion({
        nombreParticipante: nombreParticipante(tipoParticipante, participanteId),
        nombreTorneo: torneoSeleccionado.nombre,
        cuposRestantes: Math.max(0, torneoSeleccionado.cupoMax - (torneoSeleccionado.cupoOcupado + 1)),
        cupoMax: torneoSeleccionado.cupoMax,
      })
    } catch (err) {
      setErrorGeneral(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const cancelar = async (inscripcion) => {
    limpiarMensajes()
    try {
      await cancelarInscripcion(inscripcion.id)
    } catch (err) {
      setErrorGeneral(err.message)
    }
  }

  const cuposDisponibles = torneoSeleccionado
    ? Math.max(0, torneoSeleccionado.cupoMax - torneoSeleccionado.cupoOcupado)
    : 0

  const mensajeError = (id, texto) =>
    texto && (
      <div id={id} className="invalid-feedback d-block" role="alert">
        {texto}
      </div>
    )

  const esIndividual = juegoSeleccionado?.modalidad === 'Individual'

  return (
    <main>
      <section>
        <div className="container">
          <h1>Inscripción a torneo</h1>
          <p>
            {esStaff
              ? 'Como organizador puedes inscribir a cualquier jugador o equipo.'
              : 'Inscríbete en torneos individuales o inscribe al equipo donde eres capitán.'}
          </p>
          <EstadoCarga cargando={cargando} errores={errores} onReintentar={recargar} />

          <div className="row g-4">
            <div className="col-12 col-lg-7 col-xl-6">
              <form id="formulario-inscripcion" className="row g-3" onSubmit={handleSubmit} noValidate>
                <div className="col-12">
                  <label htmlFor="campo-torneo" className="form-label">Torneo</label>
                  <select
                    id="campo-torneo"
                    name="torneo"
                    className="form-select"
                    value={torneoId}
                    onChange={(e) => {
                      setTorneoId(e.target.value)
                      limpiarMensajes()
                    }}
                  >
                    {torneosVisibles.length === 0 && <option value="">No hay torneos con inscripción abierta</option>}
                    {torneosVisibles.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} ({obtenerEstadoTorneoInfo(t.estado).etiqueta})
                      </option>
                    ))}
                  </select>
                  {mensajeError('error-campo-torneo', errores2['campo-torneo'])}
                </div>

                <fieldset className="col-12">
                  <legend className="form-label fs-6 fw-semibold">Tipo de participante</legend>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" id="tipo-jugador" name="tipoParticipante"
                      value="jugador" checked={tipoParticipante === 'jugador'} disabled={Boolean(juegoSeleccionado) && !esIndividual}
                      onChange={() => { setTipoParticipante('jugador'); limpiarMensajes() }} />
                    <label className="form-check-label" htmlFor="tipo-jugador">Jugador individual</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" id="tipo-equipo" name="tipoParticipante"
                      value="equipo" checked={tipoParticipante === 'equipo'} disabled={Boolean(juegoSeleccionado) && esIndividual}
                      onChange={() => { setTipoParticipante('equipo'); limpiarMensajes() }} />
                    <label className="form-check-label" htmlFor="tipo-equipo">Equipo</label>
                  </div>
                  <div className="form-text">La modalidad del juego define si se inscriben jugadores o equipos.</div>
                </fieldset>

                {tipoParticipante === 'jugador' ? (
                  <div className="col-12">
                    <label htmlFor="campo-jugador" className="form-label">Jugador que se inscribe</label>
                    <select id="campo-jugador" name="jugador" className="form-select" value={jugadorId}
                      disabled={!esStaff}
                      onChange={(e) => { setJugadorId(e.target.value); limpiarMensajes() }}>
                      {jugadoresElegibles.length === 0 && <option value="">Tu cuenta no tiene perfil de jugador</option>}
                      {jugadoresElegibles.map((j) => (
                        <option key={j.id} value={j.id}>{j.nombre} ({j.apodo})</option>
                      ))}
                    </select>
                    {!esStaff && <div className="form-text">Te inscribes con tu propia cuenta.</div>}
                    {mensajeError('error-campo-jugador', errores2['campo-jugador'])}
                  </div>
                ) : (
                  <div className="col-12" id="contenedor-equipo">
                    <label htmlFor="campo-equipo" className="form-label">Selecciona tu equipo</label>
                    <select id="campo-equipo" name="equipo" className="form-select" value={equipoId}
                      onChange={(e) => { setEquipoId(e.target.value); limpiarMensajes() }}>
                      {equiposElegibles.length === 0 && <option value="">No eres capitán de ningún equipo</option>}
                      {equiposElegibles.map((e) => (
                        <option key={e.id} value={e.id}>{e.nombre}{e.activo ? '' : ' (inactivo)'}</option>
                      ))}
                    </select>
                    {!esStaff && (
                      <div className="form-text">Solo el capitán puede inscribir a su equipo. Puedes crear uno en «Mi equipo».</div>
                    )}
                    {mensajeError('error-campo-equipo', errores2['campo-equipo'])}
                  </div>
                )}

                <div className="col-12">
                  <div id="resumen-requisitos" className="alert alert-info mb-0" aria-live="polite">
                    {torneoSeleccionado ? (
                      <>
                        <strong>{torneoSeleccionado.nombre}</strong> · {juegoSeleccionado ? juegoSeleccionado.nombre : ''}
                        <br />
                        Cupos disponibles: {cuposDisponibles} de {torneoSeleccionado.cupoMax}
                        <br />
                        Cierre de inscripción: {formatearFecha(torneoSeleccionado.fechaCierreInscripcion)}
                        <br />
                        {juegoSeleccionado && juegoSeleccionado.modalidad === 'Equipos'
                          ? `Integrantes exigidos por equipo: ${juegoSeleccionado.integrantesPorEquipo}`
                          : 'Modalidad individual'}
                      </>
                    ) : (
                      'Elige un torneo para ver sus requisitos.'
                    )}
                  </div>
                </div>

                {errorGeneral && (
                  <div className="col-12">
                    <div id="error-general" className="alert alert-danger mb-0" role="alert">{errorGeneral}</div>
                  </div>
                )}

                <div className="col-12">
                  <button type="submit" id="boton-inscribir" className="boton boton-primario btn" disabled={enviando || !torneoSeleccionado}>
                    {enviando ? 'Inscribiendo…' : 'Confirmar inscripción'}
                  </button>
                </div>
              </form>

              {confirmacion && (
                <div id="confirmacion" className="alert alert-success mt-4" aria-live="polite">
                  <strong>Inscripción confirmada.</strong>
                  <br />
                  {confirmacion.nombreParticipante} quedó inscrito/a en <strong>{confirmacion.nombreTorneo}</strong>.
                  <br />
                  Cupos restantes: {confirmacion.cuposRestantes} de {confirmacion.cupoMax}.
                </div>
              )}
            </div>

            <div className="col-12 col-lg-5 col-xl-6">
              <h2>{esStaff ? 'Inscripciones vigentes' : 'Mis inscripciones'}</h2>
              {misInscripciones.length === 0 ? (
                <MensajeEstado tipo="vacio">No hay inscripciones en torneos abiertos.</MensajeEstado>
              ) : (
                <ul id="lista-mis-inscripciones" className="list-group list-group-flush">
                  {misInscripciones.map((i) => {
                    const t = torneos.find((x) => x.id === i.torneoId)
                    return (
                      <li key={i.id} className="list-group-item bg-transparent text-reset d-flex justify-content-between align-items-center gap-2 flex-wrap">
                        <span>
                          <strong>{t?.nombre}</strong> — {nombreParticipante(i.participanteTipo, i.participanteId)}
                          <br />
                          <small className="text-secondary">Inscrito el {formatearFecha(i.fecha)}</small>
                        </span>
                        {t?.estado === 'abierto' && (
                          <button type="button" className="boton boton-pequeno boton-secundario btn btn-sm" onClick={() => cancelar(i)}>
                            Cancelar
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
