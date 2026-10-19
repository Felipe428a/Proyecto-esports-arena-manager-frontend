import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import MensajeEstado from '../ui/MensajeEstado'
import { formatearFecha } from '../../logica/formato'
import { obtenerEstadoTorneoInfo } from '../../logica/torneos'
import { validarInscripcion } from '../../logica/inscripcion'

export default function Inscripcion() {
  const {
    torneos,
    juegos,
    jugadores,
    equipos,
    inscripciones,
    parametrosVista,
    agregarInscripcion,
  } = useApp()

  const [torneoId, setTorneoId] = useState('')
  const [tipoParticipante, setTipoParticipante] = useState('jugador')
  const [jugadorId, setJugadorId] = useState('')
  const [equipoId, setEquipoId] = useState('')

  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [confirmacion, setConfirmacion] = useState(null)

  // Preseleccionar torneo desde parámetros de navegación si existe
  useEffect(() => {
    if (parametrosVista.torneo) {
      setTorneoId(String(parametrosVista.torneo))
    } else if (torneos.length > 0 && !torneoId) {
      setTorneoId(String(torneos[0].id))
    }
  }, [parametrosVista, torneos, torneoId])

  // Preseleccionar primer jugador y primer equipo
  useEffect(() => {
    if (jugadores.length > 0 && !jugadorId) {
      setJugadorId(String(jugadores[0].id))
    }
    if (equipos.length > 0 && !equipoId) {
      setEquipoId(String(equipos[0].id))
    }
  }, [jugadores, equipos, jugadorId, equipoId])

  const torneoSeleccionado = torneos.find((t) => t.id === Number(torneoId))
  const juegoSeleccionado = torneoSeleccionado
    ? juegos.find((j) => j.id === torneoSeleccionado.juegoId)
    : null

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrores({})
    setErrorGeneral('')
    setConfirmacion(null)

    const participanteId = tipoParticipante === 'jugador' ? jugadorId : equipoId

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
      if (resultado.general) {
        setErrorGeneral(resultado.general)
      }
      if (resultado.campo) {
        setErrores({ [resultado.campo]: resultado.mensaje })
      }
      return
    }

    // Registrar inscripción en el estado global
    agregarInscripcion({
      torneoId,
      participanteTipo: tipoParticipante,
      participanteId,
    })

    let nombreParticipante = ''
    if (tipoParticipante === 'jugador') {
      const jug = jugadores.find((j) => j.id === Number(jugadorId))
      nombreParticipante = jug ? `${jug.nombre} (${jug.apodo})` : 'Jugador'
    } else {
      const eq = equipos.find((e) => e.id === Number(equipoId))
      nombreParticipante = eq ? eq.nombre : 'Equipo'
    }

    const cuposRestantes = Math.max(0, torneoSeleccionado.cupoMax - (torneoSeleccionado.cupoOcupado + 1))

    setConfirmacion({
      nombreParticipante,
      nombreTorneo: torneoSeleccionado.nombre,
      cuposRestantes,
      cupoMax: torneoSeleccionado.cupoMax,
    })
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

  return (
    <main>
      <section>
        <div className="container">
          <h1>Inscripción a torneo</h1>
          <p>Registra la participación de un jugador o de un equipo completo en el torneo elegido.</p>

          <div className="row">
            <div className="col-12 col-lg-8 col-xl-6">
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
                      setConfirmacion(null)
                      setErrorGeneral('')
                      setErrores({})
                    }}
                  >
                    {torneos.map((t) => {
                      const estado = obtenerEstadoTorneoInfo(t.estado)
                      return (
                        <option key={t.id} value={t.id}>
                          {t.nombre} ({estado.etiqueta})
                        </option>
                      )
                    })}
                  </select>
                  {mensajeError('error-campo-torneo', errores['campo-torneo'])}
                </div>

                <fieldset className="col-12">
                  <legend className="form-label fs-6 fw-semibold">Tipo de participante</legend>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="tipo-jugador"
                      name="tipoParticipante"
                      value="jugador"
                      checked={tipoParticipante === 'jugador'}
                      onChange={() => {
                        setTipoParticipante('jugador')
                        setConfirmacion(null)
                        setErrorGeneral('')
                      }}
                    />
                    <label className="form-check-label" htmlFor="tipo-jugador">Jugador individual</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="tipo-equipo"
                      name="tipoParticipante"
                      value="equipo"
                      checked={tipoParticipante === 'equipo'}
                      onChange={() => {
                        setTipoParticipante('equipo')
                        setConfirmacion(null)
                        setErrorGeneral('')
                      }}
                    />
                    <label className="form-check-label" htmlFor="tipo-equipo">Equipo</label>
                  </div>
                </fieldset>

                {tipoParticipante === 'jugador' ? (
                  <div className="col-12">
                    <label htmlFor="campo-jugador" className="form-label">Jugador que se inscribe</label>
                    <select
                      id="campo-jugador"
                      name="jugador"
                      className="form-select"
                      value={jugadorId}
                      onChange={(e) => {
                        setJugadorId(e.target.value)
                        setConfirmacion(null)
                        setErrorGeneral('')
                      }}
                    >
                      {jugadores.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.nombre} ({j.apodo})
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      Simula la sesión activa mientras el sistema opera en modo frontend.
                    </div>
                    {mensajeError('error-campo-jugador', errores['campo-jugador'])}
                  </div>
                ) : (
                  <div className="col-12" id="contenedor-equipo">
                    <label htmlFor="campo-equipo" className="form-label">Selecciona tu equipo</label>
                    <select
                      id="campo-equipo"
                      name="equipo"
                      className="form-select"
                      value={equipoId}
                      onChange={(e) => {
                        setEquipoId(e.target.value)
                        setConfirmacion(null)
                        setErrorGeneral('')
                      }}
                    >
                      {equipos.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nombre}
                          {e.activo ? '' : ' (inactivo)'}
                        </option>
                      ))}
                    </select>
                    {mensajeError('error-campo-equipo', errores['campo-equipo'])}
                  </div>
                )}

                <div className="col-12">
                  <div id="resumen-requisitos" className="alert alert-info mb-0" aria-live="polite">
                    {torneoSeleccionado ? (
                      <>
                        <strong>{torneoSeleccionado.nombre}</strong> ·{' '}
                        {juegoSeleccionado ? juegoSeleccionado.nombre : ''}
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
                    <div id="error-general" className="alert alert-danger mb-0" role="alert">
                      {errorGeneral}
                    </div>
                  </div>
                )}

                <div className="col-12">
                  <button type="submit" id="boton-inscribir" className="boton boton-primario btn">
                    Confirmar inscripción
                  </button>
                </div>
              </form>

              {confirmacion && (
                <div id="confirmacion" className="alert alert-success mt-4" aria-live="polite">
                  <strong>Inscripción confirmada.</strong>
                  <br />
                  {confirmacion.nombreParticipante} quedó inscrito/a en{' '}
                  <strong>{confirmacion.nombreTorneo}</strong>.
                  <br />
                  Cupos restantes: {confirmacion.cuposRestantes} de {confirmacion.cupoMax}.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
